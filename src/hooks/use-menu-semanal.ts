"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useConfigHogar } from "@/hooks/use-config-hogar";

interface MenuDia {
  id: string;
  menu_id: string;
  dia: string;
  tipo: "comida" | "cena";
  receta_id: string | null;
  notas: string | null;
  receta?: Receta | null;
}

interface MenuSemanal {
  id: string;
  hogar_id: string;
  semana_inicio: string;
  created_at: string;
  dias: MenuDia[];
}

export interface Receta {
  id: string;
  hogar_id: string;
  nombre: string;
  descripcion: string | null;
  tiempo_minutos: number | null;
  porciones: number;
  created_at: string;
  ingredientes?: RecetaIngrediente[];
}

interface RecetaIngrediente {
  id: string;
  receta_id: string;
  nombre: string;
  cantidad: string | null;
  categoria: string;
}

export function useMenuSemanal() {
  const { hogarId, loading: hogarLoading } = useConfigHogar();
  const [menu, setMenu] = useState<MenuSemanal | null>(null);
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [semanaActual, setSemanaActual] = useState(() => getMonday(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Obtener lunes de la semana
  function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Formatear fecha para BD (local time, evita desfase UTC)
  function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Cargar menú de la semana
  const cargarMenu = useCallback(async () => {
    if (!hogarId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const semanaInicio = formatDate(semanaActual);

      // Buscar menú existente
      let { data: menuData, error: menuError } = await supabase
        .from("menus_semanales")
        .select(
          `
          *,
          dias:menu_dias(
            *,
            receta:recetas(*)
          )
        `,
        )
        .eq("hogar_id", hogarId!)
        .eq("semana_inicio", semanaInicio)
        .single();

      if (menuError && menuError.code !== "PGRST116") {
        throw menuError;
      }

      // Si no existe, crear nuevo menú
      if (!menuData) {
        const { data: nuevoMenu, error: createError } = await supabase
          .from("menus_semanales")
          .insert({ hogar_id: hogarId!, semana_inicio: semanaInicio })
          .select()
          .single();

        if (createError) throw createError;

        // Crear días vacíos
        const dias: Omit<MenuDia, "id" | "receta">[] = [];
        for (let i = 0; i < 7; i++) {
          const fecha = new Date(semanaActual);
          fecha.setDate(fecha.getDate() + i);
          const fechaStr = formatDate(fecha);

          dias.push({
            menu_id: nuevoMenu.id,
            dia: fechaStr,
            tipo: "comida",
            receta_id: null,
            notas: null,
          });
          dias.push({
            menu_id: nuevoMenu.id,
            dia: fechaStr,
            tipo: "cena",
            receta_id: null,
            notas: null,
          });
        }

        const { error: diasError } = await supabase
          .from("menu_dias")
          .insert(dias);

        if (diasError) throw diasError;

        // Recargar con datos completos
        const { data: menuCompleto, error: reloadError } = await supabase
          .from("menus_semanales")
          .select(`*, dias:menu_dias(*, receta:recetas(*))`)
          .eq("id", nuevoMenu.id)
          .single();

        if (reloadError) throw reloadError;
        if (!menuCompleto) throw new Error("Error al recargar datos del menú");
        menuData = menuCompleto;
      }

      setMenu(menuData as MenuSemanal);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || JSON.stringify(err);
      console.error("Error cargando menú:", msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [semanaActual, supabase, hogarId]);

  // Cargar recetas disponibles
  const cargarRecetas = useCallback(async () => {
    if (!hogarId) return;
    try {
      const { data, error } = await supabase
        .from("recetas")
        .select("*, ingredientes:receta_ingredientes(*)")
        .eq("hogar_id", hogarId)
        .order("nombre");

      if (error) throw error;
      setRecetas(data || []);
    } catch (err) {
      console.error("Error cargando recetas:", err);
    }
  }, [supabase, hogarId]);

  useEffect(() => {
    cargarMenu();
    cargarRecetas();
  }, [cargarMenu, cargarRecetas]);

  // Navegar semanas
  const semanaAnterior = () => {
    const nueva = new Date(semanaActual);
    nueva.setDate(nueva.getDate() - 7);
    setSemanaActual(nueva);
  };

  const semanaSiguiente = () => {
    const nueva = new Date(semanaActual);
    nueva.setDate(nueva.getDate() + 7);
    setSemanaActual(nueva);
  };

  // Asignar receta a un día
  const asignarReceta = async (diaId: string, recetaId: string | null) => {
    try {
      const { error } = await supabase
        .from("menu_dias")
        .update({ receta_id: recetaId })
        .eq("id", diaId);

      if (error) throw error;

      // Actualizar estado local
      setMenu((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          dias: prev.dias.map((d) =>
            d.id === diaId
              ? {
                  ...d,
                  receta_id: recetaId,
                  receta: recetaId
                    ? recetas.find((r) => r.id === recetaId) || null
                    : null,
                }
              : d,
          ),
        };
      });
    } catch (err) {
      console.error("Error asignando receta:", err);
      throw err;
    }
  };

  // Crear receta
  const crearReceta = async (receta: {
    nombre: string;
    descripcion?: string;
    tiempo_minutos?: number;
    porciones?: number;
    ingredientes?: { nombre: string; cantidad?: string; categoria?: string }[];
  }) => {
    try {
      const { data: nuevaReceta, error } = await supabase
        .from("recetas")
        .insert({
          hogar_id: hogarId!,
          nombre: receta.nombre,
          descripcion: receta.descripcion || null,
          tiempo_minutos: receta.tiempo_minutos || null,
          porciones: receta.porciones || 2,
        })
        .select()
        .single();

      if (error) throw error;

      // Insertar ingredientes si hay
      if (receta.ingredientes && receta.ingredientes.length > 0) {
        const ingredientes = receta.ingredientes.map((ing) => ({
          receta_id: nuevaReceta.id,
          nombre: ing.nombre,
          cantidad: ing.cantidad || null,
          categoria: ing.categoria || "general",
        }));

        await supabase.from("receta_ingredientes").insert(ingredientes);
      }

      await cargarRecetas();
      return nuevaReceta;
    } catch (err) {
      console.error("Error creando receta:", err);
      throw err;
    }
  };

  // Eliminar receta
  const eliminarReceta = async (recetaId: string) => {
    try {
      const { error } = await supabase
        .from("recetas")
        .delete()
        .eq("id", recetaId);

      if (error) throw error;
      await cargarRecetas();
    } catch (err) {
      console.error("Error eliminando receta:", err);
      throw err;
    }
  };

  // Generar lista de compra desde menú actual
  const generarListaCompra = async () => {
    if (!menu) return null;

    try {
      // Obtener recetas con ingredientes del menú actual
      const recetaIds = menu.dias
        .filter((d) => d.receta_id)
        .map((d) => d.receta_id!);

      if (recetaIds.length === 0) {
        throw new Error("No hay recetas planificadas esta semana");
      }

      const { data: recetasConIng, error: recError } = await supabase
        .from("recetas")
        .select("*, ingredientes:receta_ingredientes(*)")
        .in("id", recetaIds);

      if (recError) throw recError;

      // Agrupar ingredientes únicos
      const ingredientesMap = new Map<
        string,
        { nombre: string; cantidad: string; categoria: string }
      >();

      recetasConIng?.forEach((receta) => {
        receta.ingredientes?.forEach((ing: RecetaIngrediente) => {
          const key = ing.nombre.toLowerCase();
          if (ingredientesMap.has(key)) {
            // Combinar cantidades (simplificado)
            const existing = ingredientesMap.get(key)!;
            existing.cantidad = `${existing.cantidad}, ${ing.cantidad || "?"}`;
          } else {
            ingredientesMap.set(key, {
              nombre: ing.nombre,
              cantidad: ing.cantidad || "",
              categoria: ing.categoria || "general",
            });
          }
        });
      });

      // Crear lista de compra
      const { data: lista, error: listaError } = await supabase
        .from("listas_compra")
        .insert({
          hogar_id: hogarId!,
          nombre: `Menú ${formatDate(semanaActual)}`,
          estado: "activa",
        })
        .select()
        .single();

      if (listaError) throw listaError;

      // Insertar productos
      const productos = Array.from(ingredientesMap.values()).map((ing, i) => ({
        lista_id: lista.id,
        nombre: ing.nombre,
        cantidad: ing.cantidad || "1",
        categoria: ing.categoria,
        orden: i,
      }));

      if (productos.length > 0) {
        await supabase.from("productos_lista").insert(productos);
      }

      return lista;
    } catch (err) {
      console.error("Error generando lista:", err);
      throw err;
    }
  };

  // Obtener días organizados por fecha
  const diasOrganizados =
    menu?.dias?.reduce(
      (acc, dia) => {
        if (!acc[dia.dia]) acc[dia.dia] = {};
        acc[dia.dia][dia.tipo] = dia;
        return acc;
      },
      {} as Record<string, Record<string, MenuDia>>,
    ) || {};

  return {
    menu,
    diasOrganizados,
    recetas,
    semanaActual,
    loading,
    error,
    semanaAnterior,
    semanaSiguiente,
    asignarReceta,
    crearReceta,
    eliminarReceta,
    generarListaCompra,
    refresh: cargarMenu,
  };
}
