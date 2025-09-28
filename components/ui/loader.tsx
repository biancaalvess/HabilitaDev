"use client";

import React from "react";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({ className = "", size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-16 h-5",
    md: "w-24 h-7",
    lg: "w-32 h-10",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`loader-spanne-20 relative ${sizeClasses[size]} p-0`}>
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-1" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-2" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-3" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-4" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-5" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-6" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-7" />
      </div>
    </div>
  );
}

// Componente de loader com animação personalizada
export function AnimatedLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className="loader-spanne-20 relative w-24 h-7 p-0">
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-1" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-2" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-3" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-4" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-5" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-6" />
        <span className="absolute right-0 w-0.5 h-full bg-[var(--primary)] block rounded-sm origin-bottom animate-move-7" />
      </div>
    </div>
  );
}
