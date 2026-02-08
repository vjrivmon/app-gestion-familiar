"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/providers/supabase-provider";
import type {
  ConfigHogar,
  SaldosIniciales,
  ConfigCompraPiso,
} from "@/types/config";
import type { Pagador } from "@/types/finanzas";

interface UseConfigHogarReturn {
  config: ConfigHogar;
  hogarId: string | null;
  miembroActual: "m1" | "m2";
  loading: boolean;
  error: string | null;
  hasHogar: boolean;

  // Funciones
  updateSaldosIniciales: (
    saldos: SaldosIniciales,
    fecha?: string,
  ) => Promise<boolean>;
  updateConfigCompraPiso: (config: ConfigCompraPiso) => Promise<boolean>;
  crearHogar: () => Promise<string | null>;
  refetch: () => Promise<void>;
}

const DEFAULT_CONFIG: ConfigHogar = {
  nombres: {
    m1: "Vicente",
    m2: "Irene",
  },
  preferencias: {
    moneda: "EUR",
    primer_dia_semana: 1,
    notificaciones: true,
  },
};

export function useConfigHogar(): UseConfigHogarReturn {
  const { user } = useSupabase();
  const [config, setConfig] = useState<ConfigHogar>(DEFAULT_CONFIG);
  const [hogarId, setHogarId] = useState<string | null>(null);
  const [miembro1Id, setMiembro1Id] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Fetch hogar_id del usuario y luego su config
  const fetchConfig = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primero obtener el hogar_id del perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("hogar_id")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 = no rows returned, eso es OK
        throw profileError;
      }

      let currentHogarId = profile?.hogar_id;

      // Fallback: buscar en hogares si el perfil no tiene hogar_id
      // (puede pasar si el miembro 2 fue añadido al hogar pero no se actualizó su perfil)
      if (!currentHogarId) {
        const { data: hogarByMember } = await supabase
          .from("hogares")
          .select("id")
          .or(`miembro_1_id.eq.${user.id},miembro_2_id.eq.${user.id}`)
          .single();

        if (hogarByMember?.id) {
          currentHogarId = hogarByMember.id;
          // Actualizar el perfil para que no pase por este fallback otra vez
          await supabase
            .from("profiles")
            .update({ hogar_id: currentHogarId })
            .eq("id", user.id);
        }
      }

      if (!currentHogarId) {
        // Usuario sin hogar - usar defaults
        setHogarId(null);
        setConfig(DEFAULT_CONFIG);
        setLoading(false);
        return;
      }

      setHogarId(currentHogarId);

      // Obtener config del hogar y miembro_1_id
      const { data: hogar, error: hogarError } = await supabase
        .from("hogares")
        .select("config, miembro_1_id")
        .eq("id", currentHogarId)
        .single();

      if (hogarError) throw hogarError;

      setMiembro1Id(hogar?.miembro_1_id || null);

      // Merge con defaults
      const mergedConfig: ConfigHogar = {
        ...DEFAULT_CONFIG,
        ...(hogar?.config || {}),
      };

      setConfig(mergedConfig);
    } catch (err) {
      // No loguear error si es simplemente que no hay hogar
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "PGRST116"
      ) {
        setConfig(DEFAULT_CONFIG);
      } else {
        console.error("Error fetching config:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar configuración",
        );
      }
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Cargar al montar o cuando cambie el usuario
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Crear hogar para el usuario
  const crearHogar = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      // Crear hogar
      const { data: nuevoHogar, error: createError } = await supabase
        .from("hogares")
        .insert({
          nombre: "Mi Hogar",
          miembro_1_id: user.id,
          config: DEFAULT_CONFIG,
        })
        .select("id")
        .single();

      if (createError) throw createError;

      // Actualizar perfil del usuario con hogar_id
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ hogar_id: nuevoHogar.id })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setHogarId(nuevoHogar.id);
      await fetchConfig();

      return nuevoHogar.id;
    } catch (err) {
      console.error("Error creando hogar:", err);
      setError(err instanceof Error ? err.message : "Error al crear hogar");
      return null;
    }
  }, [supabase, user, fetchConfig]);

  // Helper para actualizar config en BD
  const updateConfig = useCallback(
    async (updates: Partial<ConfigHogar>): Promise<boolean> => {
      let targetHogarId = hogarId;

      if (!targetHogarId) {
        // Crear hogar primero
        const newHogarId = await crearHogar();
        if (!newHogarId) return false;
        targetHogarId = newHogarId;
      }

      try {
        const newConfig = { ...config, ...updates };

        // Asegurar que profiles.hogar_id está seteado (necesario para RLS)
        if (user) {
          await supabase
            .from("profiles")
            .update({ hogar_id: targetHogarId })
            .eq("id", user.id);
        }

        // Usar .select() para verificar que el update realmente afectó filas
        const { data, error: updateError } = await supabase
          .from("hogares")
          .update({ config: newConfig })
          .eq("id", targetHogarId)
          .select("id")
          .single();

        if (updateError) throw updateError;

        if (!data) {
          throw new Error(
            "No se pudo guardar la configuración. Verifica tu conexión.",
          );
        }

        setConfig(newConfig);
        return true;
      } catch (err) {
        console.error("Error updating config:", err);
        setError(err instanceof Error ? err.message : "Error al guardar");
        return false;
      }
    },
    [supabase, hogarId, config, crearHogar, user],
  );

  // Actualizar saldos iniciales
  const updateSaldosIniciales = useCallback(
    async (saldos: SaldosIniciales, fecha?: string): Promise<boolean> => {
      return updateConfig({
        saldos_iniciales: saldos,
        fecha_saldos_iniciales: fecha || new Date().toISOString().split("T")[0],
      });
    },
    [updateConfig],
  );

  // Actualizar config compra piso
  const updateConfigCompraPiso = useCallback(
    async (configPiso: ConfigCompraPiso): Promise<boolean> => {
      return updateConfig({
        compra_piso: configPiso,
      });
    },
    [updateConfig],
  );

  // Determinar si el usuario actual es m1 o m2
  const miembroActual: "m1" | "m2" =
    user && miembro1Id && user.id === miembro1Id ? "m1" : "m2";

  return {
    config,
    hogarId,
    miembroActual,
    loading,
    error,
    hasHogar: !!hogarId,
    updateSaldosIniciales,
    updateConfigCompraPiso,
    crearHogar,
    refetch: fetchConfig,
  };
}

/**
 * Hook para obtener los nombres de los miembros desde la config.
 * Reemplaza los NOMBRES_MAP hardcodeados en componentes.
 */
export function useNombres(): Record<Pagador, string> {
  const { config } = useConfigHogar();
  return useMemo(
    () => ({
      m1: config?.nombres?.m1 || "Vicente",
      m2: config?.nombres?.m2 || "Irene",
      conjunta: "Conjunta",
    }),
    [config?.nombres?.m1, config?.nombres?.m2],
  );
}
