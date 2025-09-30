"use client"

import { useState, createContext, useContext, type ReactNode } from "react"
import type { Comment } from "./types"

interface CommentsContextType {
  comments: Comment[]
  addComment: (questionId: number, authorName: string, commentType: Comment["comment_type"], content: string) => Promise<boolean>
  getCommentsForQuestion: (questionId: number) => Comment[]
  loading: boolean
}

const CommentsContext = createContext<CommentsContextType | undefined>(undefined)

// Mock comments for demonstration
const mockComments: Comment[] = [
  {
    id: 1,
    question_id: 1,
    author_name: "Maria Silva",
    comment_type: "correction",
    content: "A complexidade temporal está incorreta. Deveria ser O(n log n) em vez de O(n²).",
    created_at: "2024-01-15T14:30:00Z",
  },
  {
    id: 2,
    question_id: 1,
    author_name: "João Santos",
    comment_type: "suggestion",
    content: "Sugiro adicionar um exemplo prático de uso do algoritmo para melhor compreensão.",
    created_at: "2024-01-14T10:15:00Z",
  },
  {
    id: 3,
    question_id: 2,
    author_name: "Ana Costa",
    comment_type: "correction",
    content: "Há um erro na linha 3 do código. O operador deveria ser '==' em vez de '='.",
    created_at: "2024-01-13T16:45:00Z",
  },
]

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [loading, setLoading] = useState(false)

  const addComment = async (
    questionId: number,
    authorName: string,
    commentType: Comment["comment_type"],
    content: string,
  ): Promise<boolean> => {
    setLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newComment: Comment = {
      id: comments.length + 1,
      question_id: questionId,
      author_name: authorName.trim(),
      comment_type: commentType,
      content: content.trim(),
      created_at: new Date().toISOString(),
    }

    setComments((prev) => [newComment, ...prev])
    setLoading(false)
    return true
  }

  const getCommentsForQuestion = (questionId: number): Comment[] => {
    return comments.filter((comment) => comment.question_id === questionId)
  }

  return (
    <CommentsContext.Provider value={{ comments, addComment, getCommentsForQuestion, loading }}>
      {children}
    </CommentsContext.Provider>
  )
}

export function useComments() {
  const context = useContext(CommentsContext)
  if (context === undefined) {
    throw new Error("useComments must be used within a CommentsProvider")
  }
  return context
}
