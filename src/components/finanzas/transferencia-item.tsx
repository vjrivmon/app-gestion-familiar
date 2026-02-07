"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/utils/money";
import { type Pagador } from "@/types/finanzas";
import { useNombres } from "@/hooks/use-config-hogar";
import type { Transferencia } from "@/hooks/use-transferencias";

interface TransferenciaItemProps {
  transferencia: Transferencia;
  onClick?: () => void;
  className?: string;
}

/**
 * Item mostrando una transferencia: "Vicente → Conjunta: 500€"
 */
export function TransferenciaItem({
  transferencia,
  onClick,
  className,
}: TransferenciaItemProps) {
  const nombres = useNombres();
  const { de, a, importe, concepto, fecha } = transferencia;

  // Formatear fecha
  const fechaFormateada = new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });

  // Colores por persona
  const getColor = (persona: Pagador): string => {
    switch (persona) {
      case "m1":
        return "text-blue-600 dark:text-blue-400";
      case "m2":
        return "text-pink-600 dark:text-pink-400";
      case "conjunta":
        return "text-purple-600 dark:text-purple-400";
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "card flex items-center gap-3 py-3",
        onClick && "active:bg-gray-50 dark:active:bg-gray-800 cursor-pointer",
        className,
      )}
    >
      {/* Icono */}
      <div className="w-10 h-10 rounded-full bg-[var(--border)] dark:bg-surface-elevated flex items-center justify-center shrink-0">
        <ArrowRight className="w-5 h-5 text-[var(--text-secondary)]" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Línea principal: Origen → Destino */}
        <div className="flex items-center gap-1 font-medium text-base">
          <span className={getColor(de)}>{nombres[de]}</span>
          <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
          <span className={getColor(a)}>{nombres[a]}</span>
        </div>

        {/* Subtítulo: Concepto y fecha */}
        <p className="text-sm text-[var(--text-secondary)] truncate">
          {concepto} • {fechaFormateada}
        </p>
      </div>

      {/* Importe */}
      <div className="text-right shrink-0">
        <p className="font-semibold text-base">{formatMoney(importe)}</p>
      </div>
    </div>
  );
}

/**
 * Versión compacta para listas
 */
interface TransferenciaItemCompactProps {
  de: Pagador;
  a: Pagador;
  importe: number;
  fecha?: string;
  className?: string;
}

export function TransferenciaItemCompact({
  de,
  a,
  importe,
  fecha,
  className,
}: TransferenciaItemCompactProps) {
  const nombres = useNombres();
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="flex items-center gap-1 text-sm">
        <span className="font-medium">{nombres[de]}</span>
        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="font-medium">{nombres[a]}</span>
        {fecha && (
          <span className="text-[var(--text-muted)] ml-1">
            •{" "}
            {new Date(fecha).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
      </div>
      <span className="font-medium">{formatMoney(importe)}</span>
    </div>
  );
}
