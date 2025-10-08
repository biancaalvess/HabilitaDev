"use client";

import Image from "next/image";

export function QuestoesHeader() {
  return (
    <header className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/icon.png"
            alt="HabilitaDev"
            width={32}
            height={32}
            className="rounded"
          />
          <span className="text-xl font-bold text-white">HabilitaDev</span>
        </div>

        {/* Right side - empty for now */}
        <div className="flex-1"></div>
      </div>
    </header>
  );
}
