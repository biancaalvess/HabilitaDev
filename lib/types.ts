export interface Question {
  id: number
  title: string
  description: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
  category: "algorithms" | "data_structures" | "system_design" | "databases" | "frontend" | "backend" | "devops"
  company?: string
  tags?: string[]
  created_at: string
  approved: boolean
}

export interface QuestionFilter {
  difficulty?: string
  category?: string
  company?: string
  search?: string
}

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface Feedback {
  id: number
  question_id: number
  user_id?: number
  feedback_type: "correction" | "suggestion" | "improvement" | "deletion"
  content: string
  status: "pending" | "reviewed" | "implemented"
  created_at: string
}

export interface Comment {
  id: number
  question_id: number
  author_name: string
  comment_type: "correction" | "suggestion"
  content: string
  created_at: string
}

export interface Answer {
  id: number
  question_id: number
  author_name: string
  content: string
  created_at: string
  is_solution: boolean
}

export const DIFFICULTY_COLORS = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
} as const

export const CATEGORY_LABELS = {
  algorithms: "Algoritmos",
  data_structures: "Estruturas de Dados",
  system_design: "Design de Sistema",
  databases: "Bancos de Dados",
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
} as const

export interface Contact {
  id: number
  name: string
  email: string
  contact_type: "complaint" | "suggestion" | "bug" | "feature" | "other"
  subject: string
  message: string
  status: "pending" | "read" | "in_progress" | "resolved" | "archived"
  admin_notes?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}
