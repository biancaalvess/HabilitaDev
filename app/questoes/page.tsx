"use client";

import { useState, useMemo } from "react";
import { QuestoesHeader } from "@/components/questoes-header";
import { QuestoesSidebar } from "@/components/questoes-sidebar";
import { QuestionCard } from "@/components/question-card";
import { QuestionFilters } from "@/components/question-filters";
import { QuestionDetail } from "@/components/question-detail";
import { useQuestions } from "@/hooks/use-api";
import type { QuestionFilter, Question } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function QuestoesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<QuestionFilter>({});
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const { questions, loading, error } = useQuestions();

  const filteredQuestions = useMemo(() => {
    // Verificar se questions é um array válido
    if (!Array.isArray(questions)) {
      return [];
    }

    return questions.filter((question) => {
      const matchesSearch =
        !searchQuery ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        question.company?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        !filters.difficulty || question.difficulty === filters.difficulty;
      const matchesCategory =
        !filters.category || question.category === filters.category;
      const matchesSidebarCategory =
        !selectedCategory || question.category === selectedCategory;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesCategory &&
        matchesSidebarCategory
      );
    });
  }, [questions, searchQuery, filters, selectedCategory]);

  const handleViewDetails = (id: number) => {
    const question = questions.find((q) => q.id === id);
    if (question) {
      setSelectedQuestion(question);
    }
  };

  const handleBack = () => {
    setSelectedQuestion(null);
  };

  const handleFeedback = () => {
    setShowFeedback(true);
  };

  // Combine search query with filters for the filter component
  const combinedFilters = { ...filters, search: searchQuery };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <QuestoesHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-white/80">Carregando questões...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <QuestoesHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <p className="text-red-400 text-xl mb-2">
                Erro ao carregar questões
              </p>
              <p className="text-white/60">{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <QuestoesHeader />
        <main className="container mx-auto px-6 py-8">
          <QuestionDetail question={selectedQuestion} onBack={handleBack} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-ping opacity-40" />
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-blue-300 rounded-full animate-pulse opacity-50" />
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-white rounded-full animate-ping opacity-30" />

      <div className="relative z-10 flex">
        <QuestoesSidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          isMinimized={isSidebarMinimized}
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />

        <div className="flex-1 flex flex-col">
          <QuestoesHeader />

          <main className="flex-1 p-6">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                {selectedCategory
                  ? `Questões de ${selectedCategory}`
                  : "Treine para Entrevistas Técnicas"}
              </h2>
              <p className="text-blue-300/80 text-lg sm:text-xl max-w-3xl">
                Questões reais de empresas como Itaú, Meta, X (Twitter) e outras
                grandes techs.
              </p>

              {isUsingMockData && (
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <p className="text-amber-300 text-sm">
                      <strong>Modo Demonstração:</strong> Usando dados de
                      exemplo. A API do backend não está disponível no momento.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <QuestionFilters
              filters={combinedFilters}
              onFilterChange={setFilters}
              totalQuestions={filteredQuestions.length}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-blue-400/20">
                  <p className="text-white/80 text-lg">
                    Nenhuma questão encontrada com os filtros aplicados.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
