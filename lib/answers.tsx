"use client";

import { useState, createContext, useContext, type ReactNode } from "react";
import type { Answer } from "./types";

interface AnswersContextType {
  answers: Answer[];
  addAnswer: (
    questionId: number,
    authorName: string,
    content: string
  ) => Promise<boolean>;
  getAnswersForQuestion: (questionId: number) => Answer[];
  loading: boolean;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

// Mock answers for demonstration
const mockAnswers: Answer[] = [
  {
    id: 1,
    question_id: 1,
    author_name: "Carlos Oliveira",
    content:
      "Aqui está minha solução usando programação dinâmica:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    \n    dp = [0] * (n + 1)\n    dp[1] = 1\n    \n    for i in range(2, n + 1):\n        dp[i] = dp[i-1] + dp[i-2]\n    \n    return dp[n]\n```\n\nComplexidade: O(n) tempo, O(n) espaço",
    created_at: "2024-01-15T14:30:00Z",
    is_solution: true,
  },
  {
    id: 2,
    question_id: 1,
    author_name: "Ana Santos",
    content:
      "Uma abordagem mais eficiente em espaço:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    \n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    \n    return b\n```\n\nComplexidade: O(n) tempo, O(1) espaço",
    created_at: "2024-01-14T10:15:00Z",
    is_solution: false,
  },
  {
    id: 3,
    question_id: 2,
    author_name: "Pedro Costa",
    content:
      "Para este problema de design de sistema, sugiro usar:\n\n1. **Load Balancer** para distribuir requisições\n2. **Cache Redis** para dados frequentemente acessados\n3. **Database sharding** para escalar horizontalmente\n4. **CDN** para conteúdo estático\n\nIsso garante alta disponibilidade e performance.",
    created_at: "2024-01-13T16:45:00Z",
    is_solution: true,
  },
];

export function AnswersProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answer[]>(mockAnswers);
  const [loading, setLoading] = useState(false);

  const addAnswer = async (
    questionId: number,
    authorName: string,
    content: string
  ): Promise<boolean> => {
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newAnswer: Answer = {
      id: answers.length + 1,
      question_id: questionId,
      author_name: authorName.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_solution: false, // New answers are not solutions by default
    };

    setAnswers((prev) => [newAnswer, ...prev]);
    setLoading(false);
    return true;
  };

  const getAnswersForQuestion = (questionId: number): Answer[] => {
    return answers.filter((answer) => answer.question_id === questionId);
  };

  return (
    <AnswersContext.Provider
      value={{ answers, addAnswer, getAnswersForQuestion, loading }}
    >
      {children}
    </AnswersContext.Provider>
  );
}

export function useAnswers() {
  const context = useContext(AnswersContext);
  if (context === undefined) {
    throw new Error("useAnswers must be used within an AnswersProvider");
  }
  return context;
}
