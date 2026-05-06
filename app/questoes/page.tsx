"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestoesHeader } from "@/components/questoes-header";
import { QuestoesSidebar } from "@/components/questoes-sidebar";
import { QuestionCard } from "@/components/question-card";
import { QuestionFilters } from "@/components/question-filters";
import { QuestionDetail } from "@/components/question-detail";
import { useOptimizedQuestions } from "@/hooks/use-optimized-questions";
import { apiService } from "@/lib/api";
import { mergeQuestionWireFields } from "@/lib/normalize-question";
import type { QuestionFilter, Question } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Filter } from "lucide-react";
import { ParticlesBackground } from "@/components/particles-background";

function QuestaoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-blue-400/10 bg-slate-800/30 p-4 sm:p-6 space-y-3"
        >
          <Skeleton className="h-5 w-3/4 bg-slate-600/50" />
          <Skeleton className="h-4 w-full bg-slate-600/40" />
          <Skeleton className="h-4 w-5/6 bg-slate-600/40" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 bg-slate-600/50" />
            <Skeleton className="h-6 w-20 bg-slate-600/50" />
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestoesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<QuestionFilter>({});
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { questions, loading, error, isOffline, refresh } =
    useOptimizedQuestions({
      enableCache: true,
    });

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

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
    if (!Array.isArray(questions)) {
      return;
    }
    const question = questions.find((q) => q.id === id);
    if (!question) {
      return;
    }
    setSelectedQuestion(mergeQuestionWireFields(question));
    void (async () => {
      try {
        const res = await apiService.getQuestion(id);
        if (res.success && res.data) {
          setSelectedQuestion(
            mergeQuestionWireFields({
              ...question,
              ...res.data,
            } as Question)
          );
        }
      } catch (e) {
        console.error("Falha ao carregar detalhe da questão:", e);
      }
    })();
  };

  const handleBack = () => {
    setSelectedQuestion(null);
  };

  // Combine search query with filters for the filter component
  const combinedFilters = { ...filters, search: searchQuery };

  const categoryTitle = selectedCategory
    ? CATEGORY_LABELS[
        selectedCategory as keyof typeof CATEGORY_LABELS
      ] ?? selectedCategory
    : null;

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
                  onClick={() => void refresh()}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Tentar novamente
                </Button>
                <Button
                  onClick={() => router.push("/")}
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
      <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <QuestoesHeader />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <QuestionDetail question={selectedQuestion} onBack={handleBack} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 md:h-dvh md:max-h-dvh md:overflow-hidden">
      {/* Particles Background */}
      <ParticlesBackground
        particleCount={40}
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

      <div className="relative z-20 flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        {/* Sidebar — desktop: altura do ecrã, sem scroll próprio */}
        <div className="hidden h-full min-h-0 shrink-0 overflow-hidden md:flex md:max-h-dvh">
          <QuestoesSidebar
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isMinimized={isSidebarMinimized}
            onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          />
        </div>

        <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden md:w-auto">
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
                    onCategorySelect={setSelectedCategory}
                    onCategoryNavigate={() => setMobileMenuOpen(false)}
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

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {categoryTitle
                  ? `Questões de ${categoryTitle}`
                  : "Treine para Entrevistas Técnicas"}
              </h2>
              <p className="text-blue-300/80 text-base sm:text-lg md:text-xl max-w-3xl">
                Questões reais de empresas como Itaú, Meta, X (Twitter) e outras
                 techs.
              </p>
            </div>

            <QuestionFilters
              filters={combinedFilters}
              onFilterChange={setFilters}
              totalQuestions={filteredQuestions.length}
            />

            {loading ? (
              <QuestaoGridSkeleton />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function QuestoesPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <QuestoesHeader />
      <div className="container mx-auto px-4 py-8">
        <QuestaoGridSkeleton />
      </div>
    </div>
  );
}

export default function QuestoesPage() {
  return (
    <Suspense fallback={<QuestoesPageFallback />}>
      <QuestoesPageContent />
    </Suspense>
  );
}
