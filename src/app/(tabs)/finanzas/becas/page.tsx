"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/money";
import { useBecas } from "@/hooks/use-becas";
import { BecaForm } from "@/components/finanzas/beca-form";
import { BecaItem, BecaItemSkeleton } from "@/components/finanzas/beca-item";
import { useNombres } from "@/hooks/use-config-hogar";
import type { Beca, EstadoBeca, Pagador } from "@/types/finanzas";

type FiltroEstado = EstadoBeca | "todas";

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "mensual", label: "Mensuales" },
  { value: "cobrada", label: "Cobradas" },
];

export default function BecasPage() {
  const router = useRouter();
  const NOMBRES_MAP = useNombres();
  const [filtro, setFiltro] = useState<FiltroEstado>("todas");
  const [showForm, setShowForm] = useState(false);
  const [editingBeca, setEditingBeca] = useState<Beca | undefined>();

  const {
    becas,
    loading,
    crearBeca,
    actualizarBeca,
    eliminarBeca,
    cobrarBeca,
    filtrarPorEstado,
    agruparPorPersona,
    totalPendiente,
    totalMensual,
  } = useBecas();

  // Becas filtradas
  const becasFiltradas = useMemo(
    () => filtrarPorEstado(filtro),
    [filtro, filtrarPorEstado],
  );

  // Agrupar por persona
  const becasAgrupadas = useMemo(
    () => agruparPorPersona(becasFiltradas),
    [becasFiltradas, agruparPorPersona],
  );

  // Personas con becas
  const personasConBecas = useMemo(
    () =>
      (["m1", "m2", "conjunta"] as Pagador[]).filter(
        (p) => becasAgrupadas[p].length > 0,
      ),
    [becasAgrupadas],
  );

  const handleSave = async (data: Parameters<typeof crearBeca>[0]) => {
    if (editingBeca) {
      await actualizarBeca(editingBeca.id, data);
    } else {
      await crearBeca(data);
    }
  };

  const handleEdit = (beca: Beca) => {
    setEditingBeca(beca);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingBeca(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface dark:bg-surface p-4 pt-2 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 -ml-2 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-[24px] font-bold flex items-center gap-2">
            <GraduationCap className="w-7 h-7" />
            Becas y Ayudas
          </h1>
        </div>

        {/* Filtro por estado */}
        <div className="flex bg-[var(--border)] rounded-[9px] p-[2px]">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={cn(
                "flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all",
                filtro === f.value
                  ? "bg-surface text-primary shadow-sm"
                  : "text-[var(--text-secondary)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resumen */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface dark:bg-surface rounded-xl p-4">
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              Pendiente
            </p>
            <p className="text-xl font-bold text-yellow-600">
              {formatMoney(totalPendiente)}
            </p>
          </div>
          <div className="bg-surface dark:bg-surface rounded-xl p-4">
            <p className="text-sm text-[var(--text-secondary)] mb-1">Mensual</p>
            <p className="text-xl font-bold text-blue-600">
              {formatMoney(totalMensual)}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-surface dark:bg-surface rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
            {[1, 2, 3].map((i) => (
              <BecaItemSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && becasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <span className="text-3xl"></span>
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filtro === "todas"
                ? "Sin becas registradas"
                : `Sin becas ${filtro}s`}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {filtro === "todas"
                ? "Registra tus becas y ayudas para hacer seguimiento"
                : "No hay becas con este estado"}
            </p>
          </div>
        )}

        {/* Lista agrupada por persona */}
        {!loading &&
          personasConBecas.map((persona) => (
            <div key={persona} className="mb-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] px-1 mb-2">
                {NOMBRES_MAP[persona]}
              </h3>
              <div className="bg-surface dark:bg-surface rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-700">
                {becasAgrupadas[persona].map((beca) => (
                  <BecaItem
                    key={beca.id}
                    beca={beca}
                    onEdit={() => handleEdit(beca)}
                    onDelete={() => eliminarBeca(beca.id)}
                    onCobrar={() => cobrarBeca(beca)}
                  />
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className={cn(
          "fixed bottom-24 right-4 z-30",
          "w-14 h-14 rounded-full",
          "bg-purple-500 text-white shadow-lg",
          "flex items-center justify-center",
          "active:scale-95 transition-transform",
        )}
        aria-label="Añadir beca"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Formulario */}
      <BecaForm
        open={showForm}
        onClose={handleClose}
        beca={editingBeca}
        onSave={handleSave}
      />
    </div>
  );
}
