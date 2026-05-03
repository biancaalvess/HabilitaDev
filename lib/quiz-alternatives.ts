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

function firstLine(s: string): string {
  return s.trim().split(/\r?\n/)[0]?.trim() ?? "";
}

/** Remove markdown comum no início da resposta (ex.: **B)**). */
function stripLeadingNoise(s: string): string {
  return s
    .trim()
    .replace(/^[\s`*_#]+/g, "")
    .trim();
}

/** Remove prefixos de lista markdown / numerada no início da linha. */
function stripMcqLinePrefix(line: string): string {
  let s = line.trim().replace(/^\uFEFF/, "");
  s = s.replace(/^(?:[-*+]\s+)+/, "");
  s = s.replace(/^\d{1,2}\s*[.)]\s+/, "");
  s = s.replace(/^\*\*?|\*\*?$/g, "").trim();
  return s;
}

/**
 * Tenta ler uma linha de alternativa: A) B) A. A: A - texto …
 */
function tryParseMcLine(trimmed: string): { letter: string; text: string } | null {
  const s = stripMcqLinePrefix(trimmed);
  if (!s) return null;

  const patterns: RegExp[] = [
    /^\*{0,2}([A-H])\s*\)\s*\*{0,2}\s*(.+)$/i,
    /^([A-H])\s*\.\s+(.+)$/i,
    /^([A-H])\s*:\s*(.+)$/i,
    /^([A-H])\s*[-–—]\s*(.+)$/i,
  ];

  for (const re of patterns) {
    const m = s.match(re);
    if (m && m[2].trim().length > 0) {
      return { letter: m[1].toUpperCase(), text: m[2].trim() };
    }
  }
  return null;
}

/** Bloco de alternativas `A) …` … `H) …` (mín. 2). Aceita listas, `A.`, linhas em branco entre itens. */
export function parseMultipleChoiceFromDescription(
  description: string
): ParsedMultipleChoice | null {
  if (!description?.trim()) return null;
  const lines = description.split(/\r?\n/);
  const options: McOption[] = [];
  let firstIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (trimmed.length === 0) {
      if (options.length > 0) continue;
      continue;
    }

    const parsed = tryParseMcLine(trimmed);
    if (parsed) {
      if (firstIdx < 0) firstIdx = i;
      options.push({ letter: parsed.letter, text: parsed.text });
      continue;
    }

    if (options.length > 0) break;
  }

  if (options.length < 2) return null;

  const stem =
    firstIdx > 0 ? lines.slice(0, firstIdx).join("\n").trim() : "";

  return { stem, options };
}

/**
 * Descobre a letra correta a partir do campo `answer` da API.
 * Ordem: formatos explícitos na 1.ª linha → etiquetas tipo "Gabarito: B" →
 * igualdade com texto da opção → maior sobreposição de texto (evita
 * devolver a primeira alternativa por engano).
 */
export function extractExpectedLetter(
  correctAnswer: string,
  options: McOption[]
): string | null {
  const raw = correctAnswer.trim();
  if (!raw) return null;

  const fl = stripLeadingNoise(firstLine(raw));

  if (/^[A-H]$/i.test(fl)) return fl.toUpperCase();
  if (/^[A-H][\)\.]$/i.test(fl)) return fl[0].toUpperCase();

  const leadParen = fl.match(/^([A-H])\)\s*/i);
  if (leadParen) return leadParen[1].toUpperCase();

  const verbal = raw.match(
    /(?:^|[\n\r])(?:gabarito|resposta\s+correta|alternativa\s+correta|op[cç][aã]o\s+correta|correta)\s*[:\-]\s*([A-H])\b/i
  );
  if (verbal) return verbal[1].toUpperCase();

  const verbal2 = raw.match(
    /\b(?:letra|alternativa|opcao|opção)\s*[:\-]?\s*([A-H])\b(?![a-z])/i
  );
  if (verbal2) return verbal2[1].toUpperCase();

  const nt = NORM(raw);
  const exact: { letter: string; len: number }[] = [];
  for (const o of options) {
    const lineParen = NORM(`${o.letter}) ${o.text}`);
    const lineDot = NORM(`${o.letter}. ${o.text}`);
    if (nt === lineParen || nt === lineDot || nt === NORM(o.text)) {
      exact.push({
        letter: o.letter,
        len: Math.max(lineParen.length, NORM(o.text).length),
      });
    }
  }
  if (exact.length === 1) return exact[0].letter;
  if (exact.length > 1) {
    exact.sort((a, b) => b.len - a.len);
    return exact[0].letter;
  }

  const partial: { letter: string; len: number }[] = [];
  for (const o of options) {
    const ot = NORM(o.text);
    if (ot.length < 4) continue;
    if (nt.includes(ot)) partial.push({ letter: o.letter, len: ot.length });
  }
  if (partial.length === 0) return null;
  partial.sort((a, b) => b.len - a.len);
  return partial[0].letter;
}

/** Compara a letra escolhida com `answer` (vários formatos da API). */
export function quizSelectionIsCorrect(
  selectedLetter: string,
  correctAnswer: string,
  options: McOption[]
): boolean {
  const letter = selectedLetter.trim().toUpperCase();
  if (!letter) return false;

  const sel = options.find((o) => o.letter === letter);
  if (!sel) return false;

  const expected = extractExpectedLetter(correctAnswer, options);
  if (expected) return letter === expected;

  const nt = NORM(correctAnswer);
  const lineParen = NORM(`${sel.letter}) ${sel.text}`);
  const lineDot = NORM(`${sel.letter}. ${sel.text}`);
  if (nt === lineParen || nt === lineDot || nt === NORM(sel.text)) return true;

  if (nt.length >= 10 && nt.includes(NORM(sel.text)) && NORM(sel.text).length >= 6) {
    const overlaps = options
      .map((o) => ({
        letter: o.letter,
        len: nt.includes(NORM(o.text)) && NORM(o.text).length >= 6 ? NORM(o.text).length : 0,
      }))
      .filter((x) => x.len > 0)
      .sort((a, b) => b.len - a.len);
    if (overlaps.length && overlaps[0].letter === letter) return true;
  }

  return false;
}
