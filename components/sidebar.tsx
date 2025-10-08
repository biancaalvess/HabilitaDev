"use client";

import { Home, BookOpen, Users, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CATEGORY_LABELS } from "@/lib/types";

interface SidebarProps {
  selectedCategory?: string;
  onCategorySelect: (category: string | undefined) => void;
}

export function Sidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: "Início", id: "home" },
    { icon: BookOpen, label: "Todas as Questões", id: "all" },
    { icon: Users, label: "Contribuir", id: "contribute" },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-sm">
              TI
            </span>
          </div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            TechInterview
          </h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="p-6 flex-1">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-3">
          Categorias
        </h3>
        <nav className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => onCategorySelect(undefined)}
            className={`w-full justify-start text-sm ${
              !selectedCategory
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            Todas
          </Button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <Button
              key={key}
              variant="ghost"
              onClick={() => onCategorySelect(key)}
              className={`w-full justify-start text-sm ${
                selectedCategory === key
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {label}
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <HelpCircle className="h-4 w-4 mr-3" />
          Ajuda
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4 mr-3" />
          Configurações
        </Button>
      </div>
    </aside>
  );
}
