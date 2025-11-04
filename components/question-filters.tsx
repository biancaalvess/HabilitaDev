"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type QuestionFilter, CATEGORY_LABELS } from "@/lib/types";

interface QuestionFiltersProps {
  filters: QuestionFilter;
  onFilterChange: (filters: QuestionFilter) => void;
  totalQuestions: number;
}

export function QuestionFilters({
  filters,
  onFilterChange,
  totalQuestions,
}: QuestionFiltersProps) {
  const handleFilterChange = (key: keyof QuestionFilter, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm sm:text-base">Filtros</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-7 sm:h-8"
            >
              <X className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Dificuldade
            </label>
            <Select
              value={filters.difficulty || "all"}
              onValueChange={(value) => handleFilterChange("difficulty", value)}
            >
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Categoria
            </label>
            <Select
              value={filters.category || "all"}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="bg-muted/50">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Buscar
            </label>
            <input
              type="text"
              placeholder="Buscar questões..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {totalQuestions} questão{totalQuestions !== 1 ? "ões" : ""}{" "}
            encontrada{totalQuestions !== 1 ? "s" : ""}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
