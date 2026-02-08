"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumericInput } from "@/components/ui/numeric-input";
import { GroupedList } from "@/components/ui/grouped-list";
import { useConfigHogar } from "@/hooks/use-config-hogar";
import { getNombrePagador } from "@/types/config";
import type { SaldosIniciales } from "@/types/config";

export default function ConfigSaldosPage() {
  const router = useRouter();
  const {
    config,
    loading,
    error: hookError,
    updateSaldosIniciales,
  } = useConfigHogar();

  // Estado del formulario
  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [saldos, setSaldos] = useState<SaldosIniciales>({
    m1: { efectivo: 0, digital: 0 },
    m2: { efectivo: 0, digital: 0 },
    conjunta: { efectivo: 0, digital: 0 },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Cargar datos existentes
  useEffect(() => {
    if (config?.saldos_iniciales) {
      setSaldos(config.saldos_iniciales);
    }
    if (config?.fecha_saldos_iniciales) {
      setFecha(config.fecha_saldos_iniciales);
    }
  }, [config]);

  // Nombres
  const nombreM1 = getNombrePagador(config, "m1");
  const nombreM2 = getNombrePagador(config, "m2");

  // Handler para cambio de saldos
  const handleSaldoChange = (
    persona: "m1" | "m2" | "conjunta",
    tipo: "efectivo" | "digital",
    valor: number,
  ) => {
    setSaldos((prev) => ({
      ...prev,
      [persona]: {
        ...prev[persona],
        [tipo]: valor,
      },
    }));
  };

  // Guardar
  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setSaveError(null);
    const success = await updateSaldosIniciales(saldos, fecha);
    setSaving(false);

    if (success) {
      setSaved(true);
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      setSaveError(
        hookError || "Error al guardar los saldos. Inténtalo de nuevo.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-accent font-medium -ml-2 px-2 py-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="sr-only">Volver</span>
          </button>

          {/* Título */}
          <h1 className="text-lg font-semibold">Saldos Iniciales</h1>

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-sm",
              saving || saved
                ? "bg-[var(--border)] text-[var(--text-muted)]"
                : "bg-accent text-white active:bg-accent/80",
            )}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {/* Instrucciones */}
          <div className="text-sm text-[var(--text-secondary)] px-1">
            Introduce los saldos que tenéis a día de hoy. Esto sirve como punto
            de partida para calcular el patrimonio.
          </div>

          {/* Error */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {saveError}
            </div>
          )}

          {/* Fecha de referencia */}
          <GroupedList title="Fecha de referencia">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-[17px]">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={cn(
                  "bg-transparent text-[var(--text-secondary)] text-[17px]",
                  "focus:outline-none",
                )}
              />
            </div>
          </GroupedList>

          {/* Saldos de Vicente */}
          <GroupedList title={nombreM1}>
            <div className="px-4 py-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Efectivo (físico)
              </label>
              <NumericInput
                value={saldos.m1.efectivo}
                onChange={(v) => handleSaldoChange("m1", "efectivo", v)}
                placeholder="0,00"
              />
            </div>
            <div className="px-4 py-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Digital (cuenta bancaria)
              </label>
              <NumericInput
                value={saldos.m1.digital}
                onChange={(v) => handleSaldoChange("m1", "digital", v)}
                placeholder="0,00"
              />
            </div>
          </GroupedList>

          {/* Saldos de Irene */}
          <GroupedList title={nombreM2}>
            <div className="px-4 py-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Efectivo (físico)
              </label>
              <NumericInput
                value={saldos.m2.efectivo}
                onChange={(v) => handleSaldoChange("m2", "efectivo", v)}
                placeholder="0,00"
              />
            </div>
            <div className="px-4 py-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Digital (cuenta bancaria)
              </label>
              <NumericInput
                value={saldos.m2.digital}
                onChange={(v) => handleSaldoChange("m2", "digital", v)}
                placeholder="0,00"
              />
            </div>
          </GroupedList>

          {/* Saldos Conjunta */}
          <GroupedList title="Cuenta Conjunta">
            <div className="px-4 py-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Efectivo (físico)
              </label>
              <NumericInput
                value={saldos.conjunta.efectivo}
                onChange={(v) => handleSaldoChange("conjunta", "efectivo", v)}
                placeholder="0,00"
              />
            </div>
            <div className="px-4 py-3">
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                Digital (cuenta conjunta)
              </label>
              <NumericInput
                value={saldos.conjunta.digital}
                onChange={(v) => handleSaldoChange("conjunta", "digital", v)}
                placeholder="0,00"
              />
            </div>
          </GroupedList>

          {/* Nota */}
          <div className="text-xs text-[var(--text-muted)] px-1">
            Estos saldos se usan como punto de partida. A partir de esta fecha,
            el patrimonio se calcula sumando ingresos y restando gastos.
          </div>

          {/* Safe area */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      )}
    </div>
  );
}
