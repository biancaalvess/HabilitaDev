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

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([])
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
