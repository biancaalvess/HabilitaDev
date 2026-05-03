"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingRow({
  value,
  max = 5,
  size = "md",
  fractional = false,
  className,
}: {
  /** 0–5; com `fractional`, decimais preenchem cada estrela gradualmente. */
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  fractional?: boolean;
  className?: string;
}) {
  const sz =
    size === "sm"
      ? "h-4 w-4"
      : size === "lg"
        ? "h-8 w-8"
        : "h-5 w-5";

  const v = Math.min(max, Math.max(0, Number(value) || 0));

  if (fractional) {
    const label =
      v > 0
        ? `Média de ${v.toFixed(1).replace(".", ",")} em ${max} estrelas`
        : `Sem avaliações com estrelas (${max} estrelas vazias)`;
    return (
      <div
        className={cn("flex items-center gap-0.5", className)}
        role="img"
        aria-label={label}
      >
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(1, Math.max(0, v - i));
          return (
            <div key={i} className={cn("relative shrink-0", sz)}>
              <Star
                className={cn(sz, "text-muted-foreground/35")}
                aria-hidden
              />
              <div
                className="absolute left-0 top-0 h-full overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className={cn(sz, "fill-amber-400 text-amber-400")}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const filled = Math.min(max, Math.max(0, Math.round(v)));

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${filled} de ${max} estrelas`}
    >
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            sz,
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}
