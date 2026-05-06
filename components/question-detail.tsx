"use client";

import React from "react";
import {
  ArrowLeft,
  Clock,
  Building2,
  Tag,
  MessageSquare,
  Copy,
  Check,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackForm } from "./feedback/feedback-form";
import { FeedbackList } from "./feedback/feedback-list";
import { QuestionGeneralRating } from "./feedback/question-general-rating";
import { InlineAnswerForm } from "./answers/inline-answer-form";
import {
  type Question,
  type McqCorrectionPayload,
  DIFFICULTY_COLORS,
  CATEGORY_LABELS,
} from "@/lib/types";
import {
  mergeQuestionWireFields,
  isMcqPublicAnswerEmpty,
} from "@/lib/normalize-question";

function mcqCorrectionToPlainText(p: McqCorrectionPayload): string {
  const lines: string[] = [];
  if (p.verdict === "correct") lines.push("Correção: resposta correta.");
  else if (p.verdict === "incorrect") lines.push("Correção: resposta incorreta.");
  else lines.push("Correção: resposta registada.");
  lines.push(`A sua escolha: ${p.selectedLetter}`);
  if (p.chosenLine) lines.push(p.chosenLine);
  if (p.expectedLetter)
    lines.push(`Alternativa correta (oficial): ${p.expectedLetter}`);
  if (p.note) lines.push(p.note);
  return lines.join("\n");
}

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
}

export function QuestionDetail({ question, onBack }: QuestionDetailProps) {
  const [copied, setCopied] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [userHasAnswered, setUserHasAnswered] = useState(false);
  const [answerFromOfficialReply, setAnswerFromOfficialReply] = useState("");
  const [mcqCorrection, setMcqCorrection] = useState<McqCorrectionPayload | null>(
    null
  );

  const handleMcqGraded = useCallback((payload: McqCorrectionPayload) => {
    setMcqCorrection(payload);
  }, []);

  const handleAnswerSuccess = useCallback(() => {
    setUserHasAnswered(true);
  }, []);

  const mergedQuestion = useMemo(
    () => mergeQuestionWireFields(question),
    [question]
  );

  useEffect(() => {
    let cancelled = false;
    if (mergedQuestion.answer?.trim()) {
      setAnswerFromOfficialReply("");
    } else {
      void (async () => {
        try {
          const { apiService } = await import("@/lib/api");
          const res = await apiService.getAnswers(question.id);
          if (!res.success || !Array.isArray(res.data) || cancelled) return;
          for (const row of res.data) {
            const r = row as unknown as Record<string, unknown>;
            const isSol = r.is_solution === true || r.isSolution === true;
            if (!isSol) continue;
            const c = String(r.content ?? "").trim();
            if (c && !cancelled) setAnswerFromOfficialReply(c);
            return;
          }
        } catch {
          /* API opcional */
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [question.id, mergedQuestion.answer]);

  useEffect(() => {
    setUserHasAnswered(false);
    setMcqCorrection(null);
  }, [question.id]);

  const solutionText = (
    mergedQuestion.answer ||
    answerFromOfficialReply ||
    ""
  ).trim();

  const copyableText = (
    solutionText ||
    (mcqCorrection ? mcqCorrectionToPlainText(mcqCorrection) : "")
  ).trim();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copyableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Função para formatar e processar o conteúdo da questão (apenas descrição)
  const formatQuestionContent = () => {
    // Retorna apenas a descrição da questão
    return question.description || "";
  };

  // Função para processar linhas e identificar tabelas
  const processContent = (content: string): React.ReactNode[] => {
    const lines = content.split("\n");
    const processed: React.ReactNode[] = [];
    let currentTable: string[] = [];
    let currentParagraph: string[] = [];
    let foundTableHeader = false;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join("\n");
        if (text.trim()) {
          processed.push(
            <div
              key={processed.length}
              className="text-foreground mb-4 leading-7 whitespace-pre-wrap break-words overflow-x-auto"
            >
              {text.split("\n").map((line, lineIndex, arr) => (
                <React.Fragment key={lineIndex}>
                  <span className="block break-all">{line}</span>
                  {lineIndex < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          );
        }
        currentParagraph = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        const rows = currentTable
          .map((row) => {
            // Detecta separação por múltiplos espaços ou tabs
            const columns = row
              .trim()
              .split(/\s{2,}|\t+/)
              .filter((col) => col.trim());
            return columns;
          })
          .filter((row) => row.length > 0);

        if (rows.length > 0) {
          processed.push(
            <div key={processed.length} className="my-4 overflow-x-auto">
              <table className="min-w-full border-collapse border border-border/30 bg-muted/20 rounded-lg">
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex === 0
                          ? "bg-muted/30 font-semibold"
                          : "border-t border-border/20"
                      }
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 border-r border-border/20 last:border-r-0 text-sm font-mono whitespace-nowrap"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        currentTable = [];
        foundTableHeader = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (trimmedLine === "") {
        // Linha vazia: finaliza o que estiver acumulado
        if (currentTable.length > 0) {
          flushTable();
        }
        flushParagraph();
        currentParagraph.push(line);
        continue;
      }

      // Se contém texto descritivo ou ":", sempre é texto normal
      const hasDescriptiveText =
        /^(Considere|Dada|Como|Qual|O que|Descreva|Implemente|Explique|Crie|Faça|Escreva)/i.test(
          trimmedLine
        );
      const hasColon = trimmedLine.includes(":");

      // Se tiver texto descritivo ou ":", sempre vai para parágrafo (não é tabela)
      if (hasDescriptiveText || hasColon) {
        if (currentTable.length > 0) {
          flushTable();
        }
        currentParagraph.push(line);
        continue;
      }

      // Detecta se é uma linha de tabela (múltiplas colunas separadas por espaços)
      const hasMultipleColumns =
        trimmedLine.split(/\s{2,}|\t+/).filter((col) => col.trim()).length >= 3;

      // Detecta se é uma linha numérica/ID seguida de dados (padrão de tabela de dados)
      const looksLikeTableRow =
        hasMultipleColumns &&
        (/^\d+\s+\d+/.test(trimmedLine) || /^\d+\s+/.test(trimmedLine));

      // Detecta cabeçalho de tabela (palavras como id_venda, id_cliente, etc.)
      // Deve ser uma linha só com nomes de colunas, sem números misturados no início
      const isAllUnderscoreWords = /^[a-z_]+(\s+[a-z_]+)+$/i.test(trimmedLine);
      const looksLikeTableHeader =
        hasMultipleColumns &&
        (isAllUnderscoreWords ||
          (trimmedLine.toLowerCase().includes("id_") &&
            trimmedLine.split(/\s+/).filter((w) => /^[a-z_]+$/i.test(w))
              .length >= 3));

      if (looksLikeTableHeader && !foundTableHeader) {
        // Primeira linha de cabeçalho de tabela encontrada
        flushParagraph();
        foundTableHeader = true;
        currentTable.push(line);
      } else if (
        (looksLikeTableRow || foundTableHeader) &&
        hasMultipleColumns
      ) {
        // Continua a tabela (cabeçalho ou dados)
        if (!foundTableHeader) {
          flushParagraph();
          foundTableHeader = true;
        }
        currentTable.push(line);
      } else {
        // Texto normal - acumula no parágrafo
        if (currentTable.length > 0) {
          flushTable();
        }
        currentParagraph.push(line);
      }
    }

    // Processa o que sobrou
    flushParagraph();
    flushTable();

    // Sempre retorna algo, mesmo que seja o conteúdo original
    if (processed.length > 0) {
      return processed;
    }

    // Fallback: exibe o conteúdo original se nada foi processado
    return [
      <div
        key="default"
        className="text-foreground mb-4 leading-7 whitespace-pre-wrap break-words overflow-x-auto"
      >
        {content.split("\n").map((line, lineIndex, arr) => (
          <React.Fragment key={lineIndex}>
            <span className="block break-all">{line}</span>
            {lineIndex < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>,
    ];
  };

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mb-6 sm:mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 sm:mb-6 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Voltar às questões</span>
          <span className="sm:hidden">Voltar</span>
        </Button>

        {/* Título da Questão no topo - apenas categoria */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight flex-1 pr-2">
              {CATEGORY_LABELS[question.category]}
            </h1>
            <Badge
              variant="outline"
              className={`${
                DIFFICULTY_COLORS[question.difficulty]
              } capitalize shrink-0 w-fit text-sm px-4 py-2 font-semibold`}
            >
              {question.difficulty}
            </Badge>
          </div>
        </div>

        {/* Badge de informações */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8 items-center">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {formatDate(question.created_at)}
            </span>
            <span className="sm:hidden">
              {new Date(question.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })}
            </span>
          </div>

          <Badge variant="secondary" className="text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {CATEGORY_LABELS[question.category]}
          </Badge>

          {question.company && (
            <Badge variant="outline" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              {question.company}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="p-6 sm:p-8 bg-gradient-to-r from-muted/40 to-muted/20 border-b">
            <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
              <MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              Descrição da Questão
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <div className="w-full">
              <div
                className="text-foreground leading-relaxed text-base sm:text-lg font-normal break-words overflow-y-auto overflow-x-auto pr-4 custom-scrollbar"
                style={{
                  maxHeight: "70vh",
                  minHeight: "300px",
                  overflowY: "auto",
                  overflowX: "auto",
                }}
              >
                {/* Descrição COMPLETA da questão formatada - TODO O CONTEÚDO */}
                <div
                  className="whitespace-pre-wrap break-words break-all text-foreground leading-7 w-full"
                  style={{
                    wordBreak: "break-all",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                  }}
                >
                  {(() => {
                    const content =
                      question.description ||
                      question.title ||
                      "Nenhuma descrição disponível.";
                    // Garante que todo o conteúdo seja exibido
                    return content;
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {userHasAnswered ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  {solutionText ? "Solução" : mcqCorrection ? "Correção" : "Solução"}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!copyableText}
                  className="text-xs sm:text-sm"
                >
                  {copied ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  ) : (
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  )}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div
                className={`bg-muted/50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto ${
                  solutionText ? "font-mono" : "font-sans"
                }`}
              >
                {solutionText ? (
                  <pre className="whitespace-pre-wrap text-foreground break-words">
                    {solutionText}
                  </pre>
                ) : mcqCorrection ? (
                  <div className="space-y-4 leading-relaxed">
                    {mcqCorrection.verdict === "correct" ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold text-base">
                        <CheckCircle className="h-6 w-6 shrink-0" />
                        Resposta correta
                      </div>
                    ) : mcqCorrection.verdict === "incorrect" ? (
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-base">
                        <XCircle className="h-6 w-6 shrink-0" />
                        Resposta incorreta
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-blue-500 dark:text-blue-300 font-semibold text-base">
                        <Info className="h-6 w-6 shrink-0" />
                        Resposta registada
                      </div>
                    )}
                    <p className="text-muted-foreground">
                      <span className="text-foreground font-medium">
                        A sua escolha:
                      </span>{" "}
                      {mcqCorrection.selectedLetter}
                      {mcqCorrection.chosenLine
                        ? ` — ${mcqCorrection.chosenLine}`
                        : null}
                    </p>
                    {mcqCorrection.expectedLetter ? (
                      <p className="text-foreground">
                        <span className="font-medium">Alternativa correta:</span>{" "}
                        {mcqCorrection.expectedLetter}
                      </p>
                    ) : null}
                    {mcqCorrection.note ? (
                      <p className="text-muted-foreground whitespace-pre-wrap border-t border-border/40 pt-3">
                        {mcqCorrection.note}
                      </p>
                    ) : null}
                    {mcqCorrection.verdict === "recorded" &&
                    !mcqCorrection.expectedLetter ? (
                      <div className="flex gap-2 text-muted-foreground text-xs sm:text-sm border-t border-border/40 pt-3">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>
                          O servidor não devolveu nesta resposta se acertou ou
                          qual a letra oficial. A escolha foi guardada; quando a API
                          incluir a correção, aparecerá aqui automaticamente.
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : isMcqPublicAnswerEmpty(mergedQuestion) ? (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Questão de{" "}
                    <span className="text-foreground/90">múltipla escolha</span>{" "}
                    sem texto de explicação no campo público{" "}
                    <code className="rounded bg-muted px-1">answer</code> (p.ex.
                    só gabarito na base). Envie a alternativa acima para ver a
                    correção imediata ou complete a explicação na questão.
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Não há texto de solução disponível para esta questão (dados em
                    falta ou resposta oficial ainda não associada).
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <InlineAnswerForm
            questionId={question.id}
            correctAnswer={solutionText}
            questionDescription={question.description}
            onSuccess={handleAnswerSuccess}
            onMcqGraded={handleMcqGraded}
          />
        )}

        {Array.isArray(question.tags) && question.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(question.tags) && question.tags.length > 0 ? (
                  question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Sem tags
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {userHasAnswered ? (
          <QuestionGeneralRating questionId={question.id} />
        ) : null}

        <FeedbackList questionId={question.id} />

        <div className="flex justify-center">
          <Button
            onClick={() => setShowFeedbackForm(true)}
            variant="outline"
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Enviar Feedback
          </Button>
        </div>
      </div>

      <FeedbackForm
        questionId={question.id}
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  );
}
