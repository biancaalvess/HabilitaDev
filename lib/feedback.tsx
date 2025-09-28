"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import type { Feedback } from "./types"

interface FeedbackContextType {
  feedbacks: Feedback[]
  submitFeedback: (questionId: number, type: Feedback["feedback_type"], content: string) => Promise<boolean>
  getFeedbacksForQuestion: (questionId: number) => Feedback[]
  loading: boolean
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

// Mock feedbacks for demonstration
const mockFeedbacks: Feedback[] = [
  {
    id: 1,
    question_id: 1,
    user_id: 1,
    feedback_type: "suggestion",
    content: "Seria interessante adicionar uma explicação sobre a complexidade temporal do algoritmo.",
    status: "pending",
    created_at: "2024-01-15T14:30:00Z",
  },
  {
    id: 2,
    question_id: 1,
    user_id: 2,
    feedback_type: "improvement",
    content: "Poderia incluir uma versão iterativa além da recursiva.",
    status: "reviewed",
    created_at: "2024-01-14T10:15:00Z",
  },
  {
    id: 3,
    question_id: 2,
    feedback_type: "correction",
    content: "Há um erro na explicação sobre consistência eventual.",
    status: "pending",
    created_at: "2024-01-13T16:45:00Z",
  },
]

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks)
  const [loading, setLoading] = useState(false)

  const submitFeedback = async (
    questionId: number,
    type: Feedback["feedback_type"],
    content: string,
  ): Promise<boolean> => {
    setLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newFeedback: Feedback = {
      id: feedbacks.length + 1,
      question_id: questionId,
      user_id: 1, // Would come from auth context
      feedback_type: type,
      content,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    setFeedbacks((prev) => [newFeedback, ...prev])
    setLoading(false)
    return true
  }

  const getFeedbacksForQuestion = (questionId: number): Feedback[] => {
    return feedbacks.filter((feedback) => feedback.question_id === questionId)
  }

  return (
    <FeedbackContext.Provider value={{ feedbacks, submitFeedback, getFeedbacksForQuestion, loading }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export function useFeedback() {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }
  return context
}
