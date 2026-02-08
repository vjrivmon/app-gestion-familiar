"use client";

import { cn } from "@/lib/utils";
import {
  type Pagador,
  PAGADORES,
  PAGADORES_INDIVIDUALES,
} from "@/types/finanzas";
import { useNombres } from "@/hooks/use-config-hogar";

interface PersonaPickerProps {
  value: Pagador;
  onChange: (persona: Pagador) => void;
  includeConjunta?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "segmented" | "pills" | "buttons";
}

/**
 * Selector de persona (Vicente/Irene/Conjunta)
 * Estilo segmented control de iOS
 */
export function PersonaPicker({
  value,
  onChange,
  includeConjunta = true,
  className,
  size = "md",
  variant = "segmented",
}: PersonaPickerProps) {
  const nombres = useNombres();
  const opciones = includeConjunta ? PAGADORES : PAGADORES_INDIVIDUALES;

  const sizeClasses = {
    sm: {
      container: "h-8 text-sm",
      padding: "px-3",
    },
    md: {
      container: "h-10 text-base",
      padding: "px-4",
    },
    lg: {
      container: "h-12 text-lg",
      padding: "px-5",
    },
  };

  const s = sizeClasses[size];

  // Variante: Segmented Control (iOS style)
  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex rounded-lg bg-[var(--border)] p-[3px]",
          className,
        )}
      >
        {opciones.map((pagador) => (
          <button
            key={pagador}
            type="button"
            onClick={() => onChange(pagador)}
            className={cn(
              "relative rounded-md transition-all duration-150",
              s.container,
              s.padding,
              value === pagador
                ? 'bg-surface text-primary shadow-sm font-medium'
                : 'text-[var(--text-secondary)]'
            )}
          >
            {nombres[pagador]}
          </button>
        ))}
      </div>
    );
  }

  // Variante: Pills (botones redondeados separados)
  if (variant === "pills") {
    return (
      <div className={cn("flex gap-2", className)}>
        {opciones.map((pagador) => (
          <button
            key={pagador}
            type="button"
            onClick={() => onChange(pagador)}
            className={cn(
              "rounded-full border-2 transition-all duration-150",
              s.container,
              s.padding,
              value === pagador
                ? 'border-accent bg-accent/10 text-accent font-medium'
                : 'border-[var(--separator)] text-[var(--text-secondary)]'
            )}
          >
            {nombres[pagador]}
          </button>
        ))}
      </div>
    );
  }

  // Variante: Buttons (botones cuadrados en grid)
  return (
    <div
      className={cn(
        "grid gap-2",
        includeConjunta ? "grid-cols-3" : "grid-cols-2",
        className,
      )}
    >
      {opciones.map((pagador) => (
        <button
          key={pagador}
          type="button"
          onClick={() => onChange(pagador)}
          className={cn(
            "rounded-lg border-2 transition-all duration-150",
            "min-h-[44px] py-2 px-3",
            value === pagador
              ? 'border-accent bg-accent/10 text-accent font-medium'
              : 'border-[var(--separator)] text-[var(--text-secondary)]'
          )}
        >
          {nombres[pagador]}
        </button>
      ))}
    </div>
  );
}

/**
 * Badge de persona (solo lectura)
 */
interface PersonaBadgeProps {
  persona: Pagador;
  size?: "sm" | "md";
  className?: string;
}

export function PersonaBadge({
  persona,
  size = "md",
  className,
}: PersonaBadgeProps) {
  const nombres = useNombres();
  const colors: Record<Pagador, string> = {
    m1: 'bg-blue-100 text-blue-700',
    m2: 'bg-pink-100 text-pink-700',
    conjunta: 'bg-purple-100 text-purple-700'
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        colors[persona],
        sizeClasses[size],
        className,
      )}
    >
      {nombres[persona]}
    </span>
  );
}

/**
 * Avatar/iniciales de persona
 */
interface PersonaAvatarProps {
  persona: Pagador;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PersonaAvatar({
  persona,
  size = "md",
  className,
}: PersonaAvatarProps) {
  const colors: Record<Pagador, string> = {
    m1: "bg-blue-500",
    m2: "bg-pink-500",
    conjunta: "bg-purple-500",
  };

  const initials: Record<Pagador, string> = {
    m1: "V",
    m2: "I",
    conjunta: "∞",
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-white font-medium",
        colors[persona],
        sizeClasses[size],
        className,
      )}
    >
      {initials[persona]}
    </span>
  );
}
