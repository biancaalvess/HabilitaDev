"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAnswers as useApiAnswers } from "@/hooks/use-api";

interface AnswersContextType {
  answers: any[];
  addAnswer: (
    questionId: number,
    authorName: string,
    content: string
  ) => Promise<boolean>;
  getAnswersForQuestion: (questionId: number) => any[];
  loading: boolean;
}

const AnswersContext = createContext<AnswersContextType | undefined>(undefined);

export function AnswersProvider({ children }: { children: ReactNode }) {
  return (
    <AnswersContext.Provider value={{}}>
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
