"use client";

import { useState, useMemo } from "react";
import { QuestoesHeader } from "@/components/questoes-header";
import { QuestoesSidebar } from "@/components/questoes-sidebar";
import { QuestionCard } from "@/components/question-card";
import { QuestionFilters } from "@/components/question-filters";
import { QuestionDetail } from "@/components/question-detail";
import { useOptimizedQuestions } from "@/hooks/use-optimized-questions";
import type { QuestionFilter, Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Filter } from "lucide-react";
import { ParticlesBackground } from "@/components/particles-background";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { questions, loading, error, isOffline, refresh } =
    useOptimizedQuestions({
      enableCache: true,
    });

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
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-white/80 text-sm sm:text-base">
                Carregando questões...
              </p>
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
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-2xl px-4">
              <div className="mb-4 flex justify-center">
                {isOffline ? (
                  <div className="w-32 h-32 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <img
                    src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTE5cmV3aTV2bmRkYzFua2cwamg3cHNxc2NqeTlocGs0NHYyMTd3MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/IKsO37j6PoslBVHSG3/giphy.gif"
                    alt="Erro"
                    className="w-32 h-32 object-contain"
                    style={{
                      filter: "none",
                      mixBlendMode: "normal",
                    }}
                  />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                {isOffline ? "Modo Offline" : "Erro ao carregar questões"}
              </h2>
              <p className="text-white/60 mb-6 text-lg leading-relaxed">
                {isOffline
                  ? "Você está offline. Usando dados de exemplo para demonstração."
                  : error}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={refresh}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Tentar novamente
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
                  Voltar ao início
                </Button>
              </div>
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
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <QuestionDetail question={selectedQuestion} onBack={handleBack} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Particles Background */}
      <ParticlesBackground
        particleCount={60}
        speed={0.3}
        color="rgba(59, 130, 246, 0.3)"
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)] z-0" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60 z-10" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-ping opacity-40 z-10" />
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-blue-300 rounded-full animate-pulse opacity-50 z-10" />
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-white rounded-full animate-ping opacity-30 z-10" />

      <div className="relative z-20 flex">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden md:block">
          <QuestoesSidebar
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isMinimized={isSidebarMinimized}
            onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          />
        </div>

        <div className="flex-1 flex flex-col w-full md:w-auto">
          <QuestoesHeader />

          {/* Mobile Menu Button */}
          <div className="md:hidden px-4 pt-4 flex items-center justify-between">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-slate-800/50 border-blue-400/20 text-white"
                >
                  <Menu className="h-4 w-4 mr-2" />
                  <Filter className="h-4 w-4 mr-2" />
                  Categorias
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="bg-slate-900/95 backdrop-blur-sm border-blue-400/20 w-72 p-0"
              >
                <SheetHeader className="p-6 pb-4 border-b border-blue-400/20">
                  <SheetTitle className="text-white text-lg">
                    Categorias
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto">
                  <QuestoesSidebar
                    selectedCategory={selectedCategory}
                    onCategorySelect={(cat) => {
                      setSelectedCategory(cat);
                      setMobileMenuOpen(false);
                    }}
                    isMinimized={false}
                    onToggleMinimize={() => {}}
                  />
                </div>
              </SheetContent>
            </Sheet>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className="text-white/80 hover:text-white"
              >
                Limpar filtro
              </Button>
            )}
          </div>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {selectedCategory
                  ? `Questões de ${selectedCategory}`
                  : "Treine para Entrevistas Técnicas"}
              </h2>
              <p className="text-blue-300/80 text-base sm:text-lg md:text-xl max-w-3xl">
                Questões reais de empresas como Itaú, Meta, X (Twitter) e outras
                grandes techs.
              </p>
            </div>

            <QuestionFilters
              filters={combinedFilters}
              onFilterChange={setFilters}
              totalQuestions={filteredQuestions.length}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
