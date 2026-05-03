"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingRow({
  value,
  max = 5,
  size = "md",
  className,
}: {
  /** 0–5 (pode ser média com decimais; arredonda para exibição). */
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const filled = Math.min(max, Math.max(0, Math.round(Number(value)) || 0));
  const sz =
    size === "sm"
      ? "h-4 w-4"
      : size === "lg"
        ? "h-8 w-8"
        : "h-5 w-5";

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
