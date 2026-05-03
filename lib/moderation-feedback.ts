/**
 * Mensagens ao utilizador com base na moderação devolvida pelo POST /api/v1/questions
 * (campos snake_case: moderation_status, moderation_motivo, moderation_ajuste_sugerido).
 */

export type ModerationStatusWire =
  | "approved"
  | "rejected"
  | "pending"
  | "human_review"
  | string
  | undefined
  | null;

export type ModerationFields = {
  moderation_status?: ModerationStatusWire;
  moderation_motivo?: string | null;
  moderation_ajuste_sugerido?: string | null;
};

function norm(s: ModerationStatusWire): string {
  if (s == null || typeof s !== "string") return "";
  return s.trim().toLowerCase();
}

/**
 * Título curto + corpo (motivo / ajuste) para alert ou toast.
 */
export function buildModerationFeedbackMessage(
  q: ModerationFields
): { title: string; body: string } {
  const st = norm(q.moderation_status);
  const motivo = (q.moderation_motivo ?? "").trim();
  const ajuste = (q.moderation_ajuste_sugerido ?? "").trim();

  switch (st) {
    case "approved":
      return {
        title: "Questão aprovada",
        body: [
          "A moderação automática classificou a sua questão como aprovada.",
          motivo ? `Nota: ${motivo}` : "",
          ajuste ? `Sugestão opcional: ${ajuste}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    case "rejected":
      return {
        title: "Questão não aprovada",
        body: [
          "A moderação automática reprovou esta submissão.",
          motivo ? `Motivo: ${motivo}` : "Não foi indicado um motivo detalhado.",
          ajuste ? `Pode tentar corrigir: ${ajuste}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    case "pending":
      return {
        title: "Em análise",
        body: [
          "A questão está pendente de moderação. Volte daqui a instantes ou atualize a lista de questões.",
          motivo ? `Estado: ${motivo}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    case "human_review":
      return {
        title: "Revisão humana",
        body: [
          "A questão foi encaminhada para revisão por um moderador. Será notificada quando houver decisão.",
          motivo ? `Contexto: ${motivo}` : "",
          ajuste ? `Sugestão: ${ajuste}` : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    default:
      return {
        title: "Questão recebida",
        body: [motivo || "A sua contribuição foi registada.", ajuste || ""]
          .filter(Boolean)
          .join("\n\n"),
      };
  }
}

/** Uma única string para `alert()` (título + corpo). */
export function formatModerationAlertText(q: ModerationFields): string {
  const { title, body } = buildModerationFeedbackMessage(q);
  return body ? `${title}\n\n${body}` : title;
}
