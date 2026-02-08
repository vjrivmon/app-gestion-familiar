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

// Mismo ID que usan todos los demás hooks de la app
const TEMP_HOGAR_ID = "00000000-0000-0000-0000-000000000001";

export function useConfigHogar(): UseConfigHogarReturn {
  const { user } = useSupabase();
  const [config, setConfig] = useState<ConfigHogar>(DEFAULT_CONFIG);
  const [miembro1Id, setMiembro1Id] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasHogar, setHasHogar] = useState(false);

  const supabase = createClient();

  // Fetch config del hogar
  const fetchConfig = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: hogar, error: hogarError } = await supabase
        .from("hogares")
        .select("config, miembro_1_id")
        .eq("id", TEMP_HOGAR_ID)
        .single();

      if (hogarError) {
        if (hogarError.code === "PGRST116") {
          // No existe el hogar todavía
          setHasHogar(false);
          setConfig(DEFAULT_CONFIG);
          setLoading(false);
          return;
        }
        throw hogarError;
      }

      setHasHogar(true);
      setMiembro1Id(hogar?.miembro_1_id || null);

      const mergedConfig: ConfigHogar = {
        ...DEFAULT_CONFIG,
        ...(hogar?.config || {}),
      };

      setConfig(mergedConfig);
    } catch (err) {
      console.error("Error fetching config:", err);
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        err.code === "PGRST116"
      ) {
        setConfig(DEFAULT_CONFIG);
      } else {
        setError(
          err instanceof Error ? err.message : "Error al cargar configuración",
        );
      }
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Crear hogar (usa el ID conocido para consistencia)
  const crearHogar = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    try {
      const { error: createError } = await supabase.from("hogares").insert({
        id: TEMP_HOGAR_ID,
        nombre: "Mi Hogar",
        miembro_1_id: user.id,
        config: DEFAULT_CONFIG,
      });

      if (createError) throw createError;

      // Actualizar perfil con hogar_id
      await supabase
        .from("profiles")
        .update({ hogar_id: TEMP_HOGAR_ID })
        .eq("id", user.id);

      setHasHogar(true);
      await fetchConfig();
      return TEMP_HOGAR_ID;
    } catch (err) {
      console.error("Error creando hogar:", err);
      setError(err instanceof Error ? err.message : "Error al crear hogar");
      return null;
    }
  }, [supabase, user, fetchConfig]);

  // Helper para actualizar config en BD
  const updateConfig = useCallback(
    async (updates: Partial<ConfigHogar>): Promise<boolean> => {
      if (!hasHogar) {
        const newId = await crearHogar();
        if (!newId) return false;
      }

      try {
        // Leer config actual de la BD para no perder datos
        const { data: currentData } = await supabase
          .from("hogares")
          .select("config")
          .eq("id", TEMP_HOGAR_ID)
          .single();

        const newConfig = {
          ...(currentData?.config || {}),
          ...config,
          ...updates,
        };

        const { error: updateError } = await supabase
          .from("hogares")
          .update({ config: newConfig })
          .eq("id", TEMP_HOGAR_ID);

        if (updateError) throw updateError;

        setConfig(newConfig);
        return true;
      } catch (err) {
        console.error("Error updating config:", err);
        setError(err instanceof Error ? err.message : "Error al guardar");
        return false;
      }
    },
    [supabase, hasHogar, config, crearHogar],
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
    hogarId: hasHogar ? TEMP_HOGAR_ID : null,
    miembroActual,
    loading,
    error,
    hasHogar,
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
