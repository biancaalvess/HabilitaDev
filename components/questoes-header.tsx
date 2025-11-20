"use client";

import Image from "next/image";

export function QuestoesHeader() {
  return (
    <header className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="HabilitaDev"
            width={28}
            height={28}
            className="rounded sm:w-8 sm:h-8"
          />
          <span className="text-lg sm:text-xl font-bold text-white">HabilitaDev</span>
        </div>
      </div>
    </header>
  );
}
