/** Prefixo no campo `content` do feedback (API) para avaliações 1–5 estrelas. */
export const FEEDBACK_STARS_PREFIX = "__HBD_STARS__:";

export function encodeRatingContent(stars: number, comment: string): string {
  const s = Math.min(5, Math.max(1, Math.round(stars)));
  const rest = (comment.trim() || "Avaliação geral da questão.").slice(0, 2000);
  return `${FEEDBACK_STARS_PREFIX}${s}\n${rest}`;
}

export function parseRatingFromFeedback(
  content: string
): { stars: number; comment: string } | null {
  const t = content.trim();
  if (!t.startsWith(FEEDBACK_STARS_PREFIX)) return null;
  const after = t.slice(FEEDBACK_STARS_PREFIX.length);
  const nl = after.indexOf("\n");
  if (nl === -1) {
    const digit = after.trim();
    if (/^[1-5]$/.test(digit)) return { stars: Number(digit), comment: "" };
    return null;
  }
  const firstLine = after.slice(0, nl).trim();
  if (!/^[1-5]$/.test(firstLine)) return null;
  return {
    stars: Number(firstLine),
    comment: after.slice(nl + 1).trim(),
  };
}

export function averageStarRating(
  entries: { stars: number }[]
): number | null {
  if (!entries.length) return null;
  const sum = entries.reduce((a, e) => a + e.stars, 0);
  return Math.round((sum / entries.length) * 10) / 10;
}
