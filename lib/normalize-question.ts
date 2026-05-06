import type { Question } from "@/lib/types";

export type QuestionWithFormat = Question & { question_format?: string };

/** Resolve o texto do gabarito a partir de vários nomes de campo (Spring / DTOs). */
export function resolveQuestionAnswer(q: unknown): string {
  if (q == null || typeof q !== "object") return "";
  const o = q as Record<string, unknown>;
  const keys = [
    "answer",
    "correct_answer",
    "correctAnswer",
    "gabarito",
    "official_answer",
    "officialAnswer",
    "solution",
    "expected_answer",
    "expectedAnswer",
  ];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

/**
 * MCQ na API pública: `answer` traz o texto de explicação/correção (sem linhas só de gabarito A–D).
 * Fica vazio se na BD existir apenas a linha do gabarito, sem explicação.
 */
export function isMcqPublicAnswerEmpty(q: QuestionWithFormat): boolean {
  if ((q.question_format ?? "").toLowerCase() !== "multiple_choice") {
    return false;
  }
  return !(q.answer ?? "").trim();
}

/** Normaliza campos vindos do wire (snake_case / camelCase) sem alterar o resto do objeto. */
export function mergeQuestionWireFields(q: Question): QuestionWithFormat {
  const w = q as unknown as Record<string, unknown>;
  const resolved = resolveQuestionAnswer(q).trim();
  const fmtRaw = w.question_format ?? w.questionFormat;
  const question_format =
    typeof fmtRaw === "string" && fmtRaw.trim() ? fmtRaw.trim() : undefined;
  const answer =
    resolved || (typeof q.answer === "string" ? q.answer : "") || "";

  return {
    ...q,
    answer,
    ...(question_format ? { question_format } : {}),
  };
}
