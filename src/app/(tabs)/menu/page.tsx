"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Plus,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMenuSemanal, Receta } from "@/hooks/use-menu-semanal";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function MenuPage() {
  const router = useRouter();
  const {
    menu,
    diasOrganizados,
    recetas,
    semanaActual,
    loading,
    error,
    semanaAnterior,
    semanaSiguiente,
    asignarReceta,
    generarListaCompra,
  } = useMenuSemanal();

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState<{
    id: string;
    dia: string;
    tipo: string;
  } | null>(null);
  const [generandoLista, setGenerandoLista] = useState(false);

  // Contar recetas planificadas esta semana
  const numRecetas =
    menu?.dias?.filter((d) => d.receta_id !== null).length ?? 0;
  const tieneRecetas = numRecetas > 0;

  // Formatear fecha en hora local (evita desfase UTC)
  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Formatear rango de semana
  const fechaInicio = semanaActual;
  const fechaFin = addDays(semanaActual, 6);
  const rangoSemana = `${format(fechaInicio, "d", { locale: es })} - ${format(fechaFin, "d MMM", { locale: es })}`;

  // Abrir selector de receta
  const abrirSelector = (diaData: {
    id: string;
    dia: string;
    tipo: string;
  }) => {
    setDiaSeleccionado(diaData);
    setSelectorOpen(true);
  };

  // Seleccionar receta
  const handleSeleccionarReceta = async (recetaId: string | null) => {
    if (!diaSeleccionado) return;
    try {
      await asignarReceta(diaSeleccionado.id, recetaId);
      setSelectorOpen(false);
      setDiaSeleccionado(null);
    } catch {
      // Error manejado en hook
    }
  };

  // Generar lista
  const handleGenerarLista = async () => {
    setGenerandoLista(true);
    try {
      const lista = await generarListaCompra();
      if (lista) {
        router.push("/compra");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error generando lista");
    } finally {
      setGenerandoLista(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center pt-2 mb-6">
        <h1 className="text-[28px] font-bold">Menú Semanal</h1>
        <Link
          href="/menu/recetas"
          className="flex items-center gap-1.5 text-accent text-[15px] font-medium p-2 -mr-2"
        >
          <BookOpen className="w-5 h-5" />
          Recetas
        </Link>
      </div>

      {/* Week selector */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={semanaAnterior}
          className="p-2 text-accent flex items-center"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>
        <span className="font-semibold">{rangoSemana}</span>
        <button
          onClick={semanaSiguiente}
          className="p-2 text-accent flex items-center"
        >
          Siguiente
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week grid */}
      <div className="space-y-3">
        {DIAS_SEMANA.map((dia, i) => {
          const fecha = addDays(semanaActual, i);
          const fechaStr = toDateStr(fecha);
          const diaData = diasOrganizados[fechaStr] || {};
          const esHoy = toDateStr(new Date()) === fechaStr;

          return (
            <div
              key={dia}
              className={`card p-3 ${esHoy ? "ring-2 ring-accent" : ""}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`w-10 text-[13px] font-semibold ${esHoy ? "text-accent" : "text-[var(--text-secondary)]"}`}
                >
                  {dia}
                </span>
                <span className="text-[13px] text-[var(--text-muted)]">
                  {format(fecha, "d MMM", { locale: es })}
                </span>
                {esHoy && (
                  <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">
                    Hoy
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Comida */}
                <button
                  onClick={() => {
                    if (diaData.comida) {
                      abrirSelector({
                        id: diaData.comida.id,
                        dia: fechaStr,
                        tipo: "comida",
                      });
                    } else {
                      // Dias aún no cargados - buscar en menu.dias
                      const slot = menu?.dias?.find(
                        (d) => d.dia === fechaStr && d.tipo === "comida",
                      );
                      if (slot)
                        abrirSelector({
                          id: slot.id,
                          dia: fechaStr,
                          tipo: "comida",
                        });
                    }
                  }}
                  className="flex flex-col p-3 bg-background rounded-lg text-left active:bg-[var(--surface-elevated)] transition-colors"
                >
                  <p className="text-[13px] text-[var(--text-muted)]">
                    🍽️ Comida
                  </p>
                  <p
                    className={`text-[15px] truncate ${diaData.comida?.receta ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {diaData.comida?.receta?.nombre || "Sin planificar"}
                  </p>
                </button>
                {/* Cena */}
                <button
                  onClick={() => {
                    if (diaData.cena) {
                      abrirSelector({
                        id: diaData.cena.id,
                        dia: fechaStr,
                        tipo: "cena",
                      });
                    } else {
                      const slot = menu?.dias?.find(
                        (d) => d.dia === fechaStr && d.tipo === "cena",
                      );
                      if (slot)
                        abrirSelector({
                          id: slot.id,
                          dia: fechaStr,
                          tipo: "cena",
                        });
                    }
                  }}
                  className="flex flex-col p-3 bg-background rounded-lg text-left active:bg-[var(--surface-elevated)] transition-colors"
                >
                  <p className="text-[13px] text-[var(--text-muted)]">
                    🌙 Cena
                  </p>
                  <p
                    className={`text-[15px] truncate ${diaData.cena?.receta ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
                  >
                    {diaData.cena?.receta?.nombre || "Sin planificar"}
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate list button */}
      <div className="fixed bottom-[calc(49px+env(safe-area-inset-bottom)+16px)] left-4 right-4">
        <button
          onClick={handleGenerarLista}
          disabled={!tieneRecetas || generandoLista}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generandoLista ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UtensilsCrossed className="w-5 h-5" />
          )}
          {generandoLista
            ? "Generando..."
            : tieneRecetas
              ? `Generar lista de compra (${numRecetas})`
              : "Generar lista de compra"}
        </button>
        {!tieneRecetas && (
          <p className="text-center text-[13px] text-[var(--text-muted)] mt-2">
            Planifica al menos 1 receta para generar la lista
          </p>
        )}
      </div>

      {/* Selector de recetas modal */}
      {selectorOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-[var(--surface-primary)] w-full rounded-t-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold">Seleccionar receta</h2>
              <button onClick={() => setSelectorOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info del día */}
            {diaSeleccionado && (
              <div className="px-4 py-2 bg-[var(--surface-secondary)] text-sm">
                {format(new Date(diaSeleccionado.dia), "EEEE d 'de' MMMM", {
                  locale: es,
                })}{" "}
                - {diaSeleccionado.tipo === "comida" ? "🍽️ Comida" : "🌙 Cena"}
              </div>
            )}

            {/* Lista de recetas */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Opción sin receta */}
              <button
                onClick={() => handleSeleccionarReceta(null)}
                className="w-full p-3 bg-background rounded-lg text-left hover:bg-[var(--surface-secondary)]"
              >
                <p className="text-[var(--text-secondary)]">Sin planificar</p>
              </button>

              {recetas.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay recetas</p>
                  <Link href="/menu/recetas" className="text-accent text-sm">
                    Añadir recetas →
                  </Link>
                </div>
              ) : (
                recetas.map((receta) => (
                  <button
                    key={receta.id}
                    onClick={() => handleSeleccionarReceta(receta.id)}
                    className="w-full p-3 bg-background rounded-lg text-left hover:bg-[var(--surface-secondary)]"
                  >
                    <p className="font-medium">{receta.nombre}</p>
                    <div className="flex gap-3 text-xs text-[var(--text-muted)] mt-1">
                      {receta.tiempo_minutos && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {receta.tiempo_minutos} min
                        </span>
                      )}
                      {receta.porciones && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {receta.porciones} porciones
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Botón añadir receta */}
            <div className="p-4 border-t border-[var(--border)]">
              <Link
                href="/menu/recetas/nueva"
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Crear nueva receta
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
