"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { QuestionCard } from "@/components/question-card"
import { QuestionFilters } from "@/components/question-filters"
import { QuestionDetail } from "@/components/question-detail"
import { mockQuestions } from "@/lib/mock-data"
import type { QuestionFilter, Question } from "@/lib/types"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<QuestionFilter>({})
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter((question) => {
      const matchesSearch =
        !searchQuery ||
        question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        question.company?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDifficulty = !filters.difficulty || question.difficulty === filters.difficulty
      const matchesCategory = !filters.category || question.category === filters.category
      const matchesCompany = !filters.company || question.company?.toLowerCase().includes(filters.company.toLowerCase())
      const matchesSidebarCategory = !selectedCategory || question.category === selectedCategory

      return matchesSearch && matchesDifficulty && matchesCategory && matchesCompany && matchesSidebarCategory
    })
  }, [searchQuery, filters, selectedCategory])

  const handleViewDetails = (id: number) => {
    const question = mockQuestions.find((q) => q.id === id)
    if (question) {
      setSelectedQuestion(question)
    }
  }

  const handleBack = () => {
    setSelectedQuestion(null)
  }

  const handleFeedback = () => {
    setShowFeedback(true)
    console.log("[v0] Opening feedback modal")
  }

  // Combine search query with filters for the filter component
  const combinedFilters = { ...filters, search: searchQuery }

  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
        <main className="container mx-auto px-6 py-8">
          <QuestionDetail question={selectedQuestion} onBack={handleBack} onFeedback={handleFeedback} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />

      <div className="flex-1 flex flex-col">
        <Header onSearch={setSearchQuery} searchQuery={searchQuery} />

        <main className="flex-1 p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-balance mb-2">
              {selectedCategory ? `Questões de ${selectedCategory}` : "Treine para Entrevistas Técnicas"}
            </h2>
            <p className="text-muted-foreground text-lg">
              Questões reais de empresas como Itaú, Meta, X (Twitter) e outras grandes techs.
            </p>
          </div>

          <QuestionFilters
            filters={combinedFilters}
            onFilterChange={setFilters}
            totalQuestions={filteredQuestions.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} onViewDetails={handleViewDetails} />
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma questão encontrada com os filtros aplicados.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
