"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/money";
import {
  useGraficosData,
  COLORES_GRAFICO,
  type DatoBalanceMensual,
} from "@/hooks/use-graficos-data";
import { useNombres } from "@/hooks/use-config-hogar";

interface GraficoBalanceMensualProps {
  meses?: number;
  altura?: number;
  mostrarLeyenda?: boolean;
  className?: string;
}

/**
 * Gráfico de barras del balance mensual por persona
 * Verde si positivo, rojo si negativo
 */
export function GraficoBalanceMensual({
  meses = 6,
  altura = 220,
  mostrarLeyenda = true,
  className,
}: GraficoBalanceMensualProps) {
  const { getBalanceMensual } = useGraficosData();
  const nombres = useNombres();
  const [datos, setDatos] = useState<DatoBalanceMensual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getBalanceMensual(meses)
      .then(setDatos)
      .finally(() => setLoading(false));
  }, [getBalanceMensual, meses]);

  if (loading) {
    return (
      <div
        className={cn(
          "animate-pulse bg-[var(--border)] dark:bg-surface rounded-lg",
          className,
        )}
        style={{ height: altura }}
      />
    );
  }

  if (datos.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[var(--text-muted)]",
          className,
        )}
        style={{ height: altura }}
      >
        Sin datos
      </div>
    );
  }

  // Preparar datos para el gráfico agrupado
  const datosTransformados = datos.map((d) => ({
    ...d,
    vicenteColor:
      d.vicente >= 0 ? COLORES_GRAFICO.positivo : COLORES_GRAFICO.negativo,
    ireneColor:
      d.irene >= 0 ? COLORES_GRAFICO.positivo : COLORES_GRAFICO.negativo,
  }));

  return (
    <div className={cn("w-full", className)} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={datosTransformados}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barCategoryGap="15%"
        >
          <XAxis
            dataKey="mes"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickFormatter={(value) => {
              if (value === 0) return "0";
              const absValue = Math.abs(value);
              if (absValue >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value.toFixed(0);
            }}
            width={40}
          />

          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface, #fff)",
              border: "none",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "12px",
            }}
            labelStyle={{ fontWeight: 600, marginBottom: 8 }}
            formatter={(value: number, name: string) => {
              const prefix = value >= 0 ? "+" : "";
              return [
                <span
                  key="value"
                  style={{
                    color:
                      value >= 0
                        ? COLORES_GRAFICO.positivo
                        : COLORES_GRAFICO.negativo,
                  }}
                >
                  {prefix}
                  {formatMoney(value * 100)}
                </span>,
                name === "vicente" ? nombres.m1 : nombres.m2,
              ];
            }}
            cursor={{ fill: "rgba(0,0,0,0.05)" }}
          />

          {mostrarLeyenda && (
            <Legend
              iconType="rect"
              iconSize={10}
              wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
              payload={[
                {
                  value: nombres.m1,
                  type: "rect",
                  color: COLORES_GRAFICO.vicente,
                },
                {
                  value: nombres.m2,
                  type: "rect",
                  color: COLORES_GRAFICO.irene,
                },
              ]}
            />
          )}

          {/* Barras de Vicente */}
          <Bar dataKey="vicente" radius={[4, 4, 0, 0]} maxBarSize={30}>
            {datosTransformados.map((entry, index) => (
              <Cell
                key={`cell-vicente-${index}`}
                fill={entry.vicente >= 0 ? COLORES_GRAFICO.vicente : "#93c5fd"}
                opacity={entry.vicente >= 0 ? 1 : 0.5}
              />
            ))}
          </Bar>

          {/* Barras de Irene */}
          <Bar dataKey="irene" radius={[4, 4, 0, 0]} maxBarSize={30}>
            {datosTransformados.map((entry, index) => (
              <Cell
                key={`cell-irene-${index}`}
                fill={entry.irene >= 0 ? COLORES_GRAFICO.irene : "#f9a8d4"}
                opacity={entry.irene >= 0 ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
