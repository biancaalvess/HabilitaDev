"use client";

import {
  Home,
  BookOpen,
  User,
  Code,
  Database,
  Cpu,
  Globe,
  Server,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuestoesSidebarProps {
  selectedCategory?: string;
  onCategorySelect: (category: string | undefined) => void;
}

const categories = [
  { id: "all", name: "Todas", icon: BookOpen },
  { id: "algoritmos", name: "Algoritmos", icon: Code },
  { id: "estruturas-de-dados", name: "Estruturas de Dados", icon: Database },
  { id: "design-sistema", name: "Design de Sistema", icon: Cpu },
  { id: "bancos-dados", name: "Bancos de Dados", icon: Database },
  { id: "frontend", name: "Frontend", icon: Globe },
  { id: "backend", name: "Backend", icon: Server },
  { id: "devops", name: "DevOps", icon: Wrench },
];

export function QuestoesSidebar({
  selectedCategory,
  onCategorySelect,
}: QuestoesSidebarProps) {
  return (
    <div className="w-64 bg-slate-900/80 backdrop-blur-sm border-r border-blue-400/20 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
            <Code className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">HabilitaDev</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="w-full justify-start text-white/80 hover:text-white hover:bg-blue-500/20"
          >
            <Home className="h-4 w-4 mr-3" />
            Início
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-blue-500/20"
          >
            <BookOpen className="h-4 w-4 mr-3" />
            Todas as Questões
          </Button>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/contribuir")}
            className="w-full justify-start text-white/80 hover:text-white hover:bg-blue-500/20"
          >
            <User className="h-4 w-4 mr-3" />
            Contribuir
          </Button>
        </nav>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-blue-300 uppercase tracking-wider mb-4">
            Categorias
          </h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected =
                selectedCategory === category.id ||
                (category.id === "all" && !selectedCategory);

              return (
                <Button
                  key={category.id}
                  variant="ghost"
                  onClick={() =>
                    onCategorySelect(
                      category.id === "all" ? undefined : category.id
                    )
                  }
                  className={`w-full justify-start text-sm ${
                    isSelected
                      ? "bg-blue-500/20 text-white border-l-2 border-blue-400"
                      : "text-white/70 hover:text-white hover:bg-blue-500/10"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
