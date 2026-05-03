export type McOption = { letter: string; text: string };

export type ParsedMultipleChoice = {
  stem: string;
  options: McOption[];
};

const NORM = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

/** Linhas do tipo `A) texto` … `H) texto` (mín. 2 alternativas). */
export function parseMultipleChoiceFromDescription(
  description: string
): ParsedMultipleChoice | null {
  if (!description?.trim()) return null;
  const lines = description.split(/\r?\n/);
  const options: McOption[] = [];
  let firstIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const m = trimmed.match(/^([A-H])\)\s*(.+)$/i);
    if (m && m[2].trim().length > 0) {
      if (firstIdx < 0) firstIdx = i;
      options.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
      continue;
    }
    if (options.length > 0) break;
  }

  if (options.length < 2) return null;

  const stem =
    firstIdx > 0 ? lines.slice(0, firstIdx).join("\n").trim() : "";

  return { stem, options };
}

/** Descobre a letra correta a partir do campo `answer` da API. */
export function extractExpectedLetter(
  correctAnswer: string,
  options: McOption[]
): string | null {
  const t = correctAnswer.trim();
  if (!t) return null;

  const one = t.match(/^([A-H])(?:\)|\.|\s)?$/i);
  if (one) return one[1].toUpperCase();

  const lead = t.match(/^([A-H])\)\s*/i);
  if (lead) return lead[1].toUpperCase();

  const verbal = t.match(
    /(?:^|[\s,;])(?:letra|alternativa|opcao|opção|resposta)\s*[:\-]?\s*([A-H])\b/i
  );
  if (verbal) return verbal[1].toUpperCase();

  const nt = NORM(t);
  for (const o of options) {
    const line = NORM(`${o.letter}) ${o.text}`);
    if (nt === line || nt === NORM(o.text)) return o.letter;
    if (nt.length >= 8 && (nt.includes(NORM(o.text)) || NORM(o.text).includes(nt)))
      return o.letter;
  }

  let best: { letter: string; len: number } | null = null;
  for (const o of options) {
    const ot = NORM(o.text);
    if (ot.length >= 6 && nt.includes(ot)) {
      if (!best || ot.length > best.len) best = { letter: o.letter, len: ot.length };
    }
  }
  return best?.letter ?? null;
}

/** Compara a letra escolhida com `answer` (vários formatos da API). */
export function quizSelectionIsCorrect(
  selectedLetter: string,
  correctAnswer: string,
  options: McOption[]
): boolean {
  const letter = selectedLetter.trim().toUpperCase();
  if (!letter) return false;
  const expected = extractExpectedLetter(correctAnswer, options);
  if (expected) return letter === expected;
  const sel = options.find((o) => o.letter === letter);
  if (!sel) return false;
  const nt = NORM(correctAnswer);
  const line = NORM(`${sel.letter}) ${sel.text}`);
  return (
    nt === line ||
    nt === NORM(sel.text) ||
    (nt.length > 8 && nt.includes(NORM(sel.text)))
  );
}
