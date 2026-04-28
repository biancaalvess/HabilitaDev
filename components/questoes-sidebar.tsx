"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  User,
  Database,
  Cpu,
  Globe,
  Server,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Code,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface QuestoesSidebarProps {
  selectedCategory?: string;
  onCategorySelect: (category: string | undefined) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const categories = [
  { id: "all", name: "Todas", icon: BookOpen },
  { id: "Algoritmos", name: "Algoritmos", icon: Code },
  { id: "Estruturas de Dados", name: "Estruturas de Dados", icon: Database },
  { id: "Design de Sistema", name: "Design de Sistema", icon: Cpu },
  { id: "Bancos de Dados", name: "Bancos de Dados", icon: Database },
  { id: "Frontend", name: "Frontend", icon: Globe },
  { id: "Backend", name: "Backend", icon: Server },
  { id: "Devops", name: "DevOps", icon: Wrench },
];

export function QuestoesSidebar({
  selectedCategory,
  onCategorySelect,
  isMinimized = false,
  onToggleMinimize,
}: QuestoesSidebarProps) {
  const router = useRouter();
  return (
    <div
      className={`${
        isMinimized ? "w-16 sm:w-18 lg:w-20" : "w-full md:w-56 lg:w-64 xl:w-72"
      } bg-slate-900/80 backdrop-blur-sm md:border-r border-blue-400/20 md:min-h-screen transition-all duration-300`}
    >
      <div className={`${isMinimized ? "p-4 sm:p-5" : "p-3 sm:p-4 lg:p-6"}`}>
        {/* Header com botão de toggle */}
        <div
          className={`flex items-center ${
            isMinimized
              ? "justify-center mb-6 sm:mb-8"
              : "justify-between mb-4 sm:mb-6 lg:mb-8"
          }`}
        >
          {!isMinimized && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 rounded bg-blue-500 flex items-center justify-center overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="HabilitaDev Logo"
                  width={20}
                  height={20}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-white truncate">
                HabilitaDev
              </span>
            </div>
          )}
          {isMinimized && (
            <div className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded bg-blue-500 flex items-center justify-center overflow-hidden">
              <Image
                src="/icon.png"
                alt="HabilitaDev Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {!isMinimized && (
            <div className="flex items-center gap-1">
              {onToggleMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="text-white/80 hover:text-white hover:bg-blue-500/20 p-1 h-6 w-6 sm:h-7 sm:w-7"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              )}
            </div>
          )}
          {isMinimized && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              {onToggleMinimize && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleMinimize}
                  className="text-white/80 hover:text-white hover:bg-blue-500/20 p-1 h-6 w-6"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`${
            isMinimized ? "space-y-3 sm:space-y-4" : "space-y-1 sm:space-y-2"
          } mb-4 sm:mb-6 lg:mb-8`}
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className={`w-full ${
              isMinimized
                ? "justify-center px-2 sm:px-3 h-10 sm:h-11"
                : "justify-start h-8 sm:h-9 lg:h-10"
            } text-white/80 hover:text-white hover:bg-blue-500/20 text-xs sm:text-sm`}
            title="Início"
          >
            <Home
              className={`${
                isMinimized ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 sm:h-4 sm:w-4"
              }`}
            />
            {!isMinimized && (
              <span className="ml-2 sm:ml-3 truncate">Início</span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/contribuir")}
            className={`w-full ${
              isMinimized
                ? "justify-center px-2 sm:px-3 h-10 sm:h-11"
                : "justify-start h-8 sm:h-9 lg:h-10"
            } text-white/80 hover:text-white hover:bg-blue-500/20 text-xs sm:text-sm`}
            title="Contribuir"
          >
            <User
              className={`${
                isMinimized ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 sm:h-4 sm:w-4"
              }`}
            />
            {!isMinimized && (
              <span className="ml-2 sm:ml-3 truncate">Contribuir</span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/solicitar-correcao")}
            className={`w-full ${
              isMinimized
                ? "justify-center px-2 sm:px-3 h-10 sm:h-11"
                : "justify-start h-8 sm:h-9 lg:h-10"
            } text-white/80 hover:text-white hover:bg-blue-500/20 text-xs sm:text-sm`}
            title="Solicitar Correção"
          >
            <AlertCircle
              className={`${
                isMinimized ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 sm:h-4 sm:w-4"
              }`}
            />
            {!isMinimized && (
              <span className="ml-2 sm:ml-3 truncate">Solicitar</span>
            )}
          </Button>
        </nav>

        {/* Categories */}
        {!isMinimized && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-sm font-semibold text-blue-300 uppercase tracking-wider mb-2 sm:mb-4">
              Categorias
            </h3>
            <div className="space-y-0.5 sm:space-y-1">
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
                    className={`w-full justify-start text-xs sm:text-sm h-7 sm:h-8 lg:h-9 ${
                      isSelected
                        ? "bg-blue-500/20 text-white border-l-2 border-blue-400"
                        : "text-white/70 hover:text-white hover:bg-blue-500/10"
                    }`}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-2 sm:mr-3" />
                    <span className="truncate">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Categories minimizadas */}
        {isMinimized && (
          <div className="space-y-2 sm:space-y-3">
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
                  className={`w-full justify-center px-2 sm:px-3 h-9 sm:h-10 ${
                    isSelected
                      ? "bg-blue-500/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-blue-500/10"
                  }`}
                  title={category.name}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
