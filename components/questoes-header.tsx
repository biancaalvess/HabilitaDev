"use client";

import { Code } from "lucide-react";

export function QuestoesHeader() {
  return (
    <header className="border-b border-blue-400/20 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
            <Code className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">HabilitaDev</span>
        </div>

        {/* Right side - empty for now */}
        <div className="flex-1"></div>
      </div>
    </header>
  );
}
