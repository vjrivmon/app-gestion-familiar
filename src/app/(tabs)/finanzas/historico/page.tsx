"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/money";
import { useHistoricoAnual } from "@/hooks/use-historico-anual";
import { useNombres } from "@/hooks/use-config-hogar";
import { TablaAnual, TablaBalance } from "@/components/finanzas/tabla-anual";

const TABS = [
  { id: "ingresos", label: "Ingresos", icon: TrendingUp },
  { id: "gastos", label: "Gastos", icon: TrendingDown },
  { id: "balance", label: "Balance", icon: Wallet },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function HistoricoAnualPage() {
  const router = useRouter();
  const nombres = useNombres();
  const [activeTab, setActiveTab] = useState<TabId>("balance");

  const {
    datos,
    loading,
    error,
    gruposIngresos,
    gruposGastos,
    año,
    setAño,
    añoActual,
  } = useHistoricoAnual();

  const handlePrevYear = () => {
    setAño(año - 1);
  };

  const handleNextYear = () => {
    if (año < añoActual) {
      setAño(año + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-surface dark:bg-surface p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[var(--text-secondary)] active:bg-[var(--border)] rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-bold">Histórico Anual</h1>
          </div>
        </div>

        {/* Selector de año */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handlePrevYear}
            className="p-2 text-[var(--text-secondary)] active:bg-[var(--border)] dark:active:bg-gray-800 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-2xl font-bold min-w-[80px] text-center">
            {año}
          </span>

          <button
            onClick={handleNextYear}
            disabled={año >= añoActual}
            className={cn(
              "p-2 rounded-full",
              año >= añoActual
                ? "text-gray-300 dark:text-[var(--text-secondary)] cursor-not-allowed"
                : "text-[var(--text-secondary)] active:bg-[var(--border)] dark:active:bg-gray-800",
            )}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--border)] rounded-[9px] p-[2px]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 py-[6px] text-[13px] font-medium rounded-[7px] transition-all",
                  "flex items-center justify-center gap-1.5",
                  activeTab === tab.id
                    ? "bg-surface text-primary shadow-sm"
                    : "text-[var(--text-secondary)]",
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="card text-center py-8">
            <p className="text-negative mb-2">Error al cargar datos</p>
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        ) : !datos ? (
          <div className="card text-center py-8">
            <p className="text-[var(--text-secondary)]">
              No hay datos para este año
            </p>
          </div>
        ) : (
          <>
            {/* Resumen rápido */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="card p-3 text-center">
                <TrendingUp className="w-5 h-5 text-positive mx-auto mb-1" />
                <p className="text-xs text-[var(--text-secondary)]">Ingresos</p>
                <p className="font-bold text-positive text-sm">
                  {formatMoney(datos.totalIngresos)}
                </p>
              </div>

              <div className="card p-3 text-center">
                <TrendingDown className="w-5 h-5 text-negative mx-auto mb-1" />
                <p className="text-xs text-[var(--text-secondary)]">Gastos</p>
                <p className="font-bold text-negative text-sm">
                  {formatMoney(datos.totalGastos)}
                </p>
              </div>

              <div className="card p-3 text-center">
                <Wallet className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="text-xs text-[var(--text-secondary)]">Ahorro</p>
                <p
                  className={cn(
                    "font-bold text-sm",
                    datos.balance >= 0 ? "text-positive" : "text-negative",
                  )}
                >
                  {formatMoney(datos.balance)}
                </p>
              </div>
            </div>

            {/* Tablas según tab activo */}
            {activeTab === "ingresos" && (
              <div className="card overflow-hidden">
                <h2 className="font-semibold p-4 pb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-positive" />
                  Ingresos {año}
                </h2>
                <TablaAnual
                  grupos={gruposIngresos}
                  tipo="ingresos"
                  totalAnual={datos.ingresosPorMes}
                />
              </div>
            )}

            {activeTab === "gastos" && (
              <div className="card overflow-hidden">
                <h2 className="font-semibold p-4 pb-2 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-negative" />
                  Gastos {año}
                </h2>
                <TablaAnual
                  grupos={gruposGastos}
                  tipo="gastos"
                  totalAnual={datos.gastosPorMes}
                />
              </div>
            )}

            {activeTab === "balance" && (
              <div className="space-y-4">
                {/* Tabla de balance */}
                <div className="card overflow-hidden">
                  <h2 className="font-semibold p-4 pb-2 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-accent" />
                    Balance {año}
                  </h2>
                  <TablaBalance
                    ingresosPorMes={datos.ingresosPorMes}
                    gastosPorMes={datos.gastosPorMes}
                  />
                </div>

                {/* Balance por persona */}
                <div className="card">
                  <h3 className="font-semibold mb-3">Balance por persona</h3>

                  {(["m1", "m2", "conjunta"] as const).map((persona) => {
                    const nombre = nombres[persona];
                    const ingresos = datos.ingresosPorPersona[persona].reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const gastos = datos.gastosPorPersona[persona].reduce(
                      (a, b) => a + b,
                      0,
                    );
                    const balance = ingresos - gastos;

                    return (
                      <div
                        key={persona}
                        className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <span className="font-medium">{nombre}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-positive tabular-nums">
                            +{formatMoney(ingresos)}
                          </span>
                          <span className="text-negative tabular-nums">
                            -{formatMoney(gastos)}
                          </span>
                          <span
                            className={cn(
                              "font-bold tabular-nums min-w-[80px] text-right",
                              balance >= 0 ? "text-positive" : "text-negative",
                            )}
                          >
                            {balance >= 0 ? "+" : ""}
                            {formatMoney(balance)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Media mensual */}
                <div className="card">
                  <h3 className="font-semibold mb-3">Media mensual</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Ingresos
                      </span>
                      <span className="text-positive font-medium tabular-nums">
                        +{formatMoney(Math.round(datos.totalIngresos / 12))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">
                        Gastos
                      </span>
                      <span className="text-negative font-medium tabular-nums">
                        -{formatMoney(Math.round(datos.totalGastos / 12))}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="font-semibold">Ahorro medio</span>
                      <span
                        className={cn(
                          "font-bold tabular-nums",
                          datos.balance >= 0
                            ? "text-positive"
                            : "text-negative",
                        )}
                      >
                        {datos.balance >= 0 ? "+" : ""}
                        {formatMoney(Math.round(datos.balance / 12))}/mes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
