"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Star, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnswerValidationProps {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  questionContext?: string;
  onValidationComplete: (isCorrect: boolean) => void;
}

export function AnswerValidation({
  questionId,
  userAnswer,
  correctAnswer,
  questionContext = "Questão de entrevista técnica",
  onValidationComplete,
}: AnswerValidationProps) {
  const [validationResult, setValidationResult] = useState<{
    isCorrect: boolean;
    score: number;
    feedback: string;
    details: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validação usando IA ou backend
    const validateAnswer = async () => {
      setIsValidating(true);

      try {
        console.log(
          "[AnswerValidation] Enviando para validação por IA/backend"
        );

        const response = await fetch(
          `/api/proxy/questions/${questionId}/validate-answer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_answer: userAnswer,
              correct_answer: correctAnswer,
              question_context: questionContext,
            }),
            signal: AbortSignal.timeout(30000), // Timeout de 30 segundos
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("[AnswerValidation] Resultado recebido:", result);

          if (result.success) {
            setValidationResult(result.data);
            setIsValidating(false);
            onValidationComplete(result.data.is_correct);
            return;
          }
        }

        // Mostrar erro se a API falhar
        console.error("[AnswerValidation] API falhou - Não há dados mock");
        setValidationResult({
          isCorrect: false,
          score: 0,
          feedback: '❌ Não foi possível validar sua resposta. O serviço de validação está indisponível. Por favor, tente novamente mais tarde.',
          details: ['⚠️ Backend offline', '⚠️ IA offline', '❌ Validação não disponível']
        });
        setIsValidating(false);
        onValidationComplete(false);
      } catch (error) {
        console.error("[AnswerValidation] Erro na validação:", error);

        // Mostrar erro - sem fallback local
        setValidationResult({
          isCorrect: false,
          score: 0,
          feedback: '❌ Erro ao conectar com o serviço de validação. Por favor, verifique sua conexão e tente novamente.',
          details: ['⚠️ Erro de conexão', '❌ Validação não disponível']
        });
        setIsValidating(false);
        onValidationComplete(false);
      }
    };

    validateAnswer();
  }, [userAnswer, correctAnswer, onValidationComplete]);

  if (isValidating) {
    return (
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-blue-500 animate-spin" />
            <span className="text-lg font-medium text-blue-500">
              🤖 IA Analisando sua resposta...
            </span>
          </div>
          <p className="text-muted-foreground">
            Nossa inteligência artificial está analisando sua solução e
            comparando com a resposta esperada.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!validationResult) return null;

  const { isCorrect, score, feedback, details } = validationResult;

  return (
    <Card
      className={`border-4 shadow-lg ${
        isCorrect
          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
          : "border-red-500 bg-red-50 dark:bg-red-900/20"
      }`}
    >
      <CardHeader
        className={`${
          isCorrect
            ? "bg-green-100 dark:bg-green-900/30"
            : "bg-red-100 dark:bg-red-900/30"
        }`}
      >
        <div className="flex items-center justify-between">
          <CardTitle
            className={`flex items-center gap-3 text-2xl font-bold ${
              isCorrect
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-600" />✅ RESPOSTA
                CORRETA!
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-600" />❌ RESPOSTA
                INCORRETA
              </>
            )}
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-lg px-4 py-2 ${
              isCorrect
                ? "border-green-600 text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-200"
                : "border-red-600 text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-200"
            }`}
          >
            <Star className="h-4 w-4 mr-2" />
            {score}/100 pontos
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert
          className={`${
            isCorrect
              ? "border-green-600 bg-green-100 dark:bg-green-800/50"
              : "border-red-600 bg-red-100 dark:bg-red-800/50"
          }`}
        >
          <AlertCircle
            className={`h-5 w-5 ${
              isCorrect ? "text-green-600" : "text-red-600"
            }`}
          />
          <AlertDescription
            className={`text-base font-medium ${
              isCorrect
                ? "text-green-800 dark:text-green-200"
                : "text-red-800 dark:text-red-200"
            }`}
          >
            {feedback}
          </AlertDescription>
        </Alert>

        {details.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200">
              📋 Análise Detalhada:
            </h4>
            <ul className="space-y-2">
              {details.map((detail, index) => (
                <li
                  key={index}
                  className="text-base flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <span className="text-lg">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div
          className={`pt-4 border-t-2 ${
            isCorrect ? "border-green-200" : "border-red-200"
          }`}
        >
          <p
            className={`text-lg font-medium ${
              isCorrect
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {isCorrect
              ? "🎉 PARABÉNS! Sua resposta está CORRETA! Você demonstrou domínio do conceito. A solução oficial está disponível abaixo."
              : "💪 NÃO DESISTA! Sua resposta precisa de ajustes. Estude a solução oficial abaixo e tente novamente."}
          </p>
          {validationResult && "validation_method" in validationResult && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                {validationResult.validation_method === "ai" &&
                  "🤖 Validado por IA"}
                {validationResult.validation_method === "backend" &&
                  "⚙️ Validado pelo Backend"}
                {validationResult.validation_method === "local_fallback" &&
                  "🔧 Validação Local"}
                {validationResult.validation_method === "emergency_fallback" &&
                  "🚨 Modo Emergência"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Removido: Função validateUserAnswer() - 100% validação por IA ou Backend real
// Sistema agora mostra erro quando serviços estão indisponíveis
