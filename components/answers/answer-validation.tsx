"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Star, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationResult {
  is_correct?: boolean;
  isCorrect?: boolean;
  score: number;
  feedback: string;
  detailed_feedback?: string;
  suggestions?: string[];
  strengths?: string[];
  weaknesses?: string[];
  details?: string[];
  validation_method?: "ai" | "backend" | "local_fallback" | "emergency_fallback";
  confidence?: number;
  time_taken?: number;
  [key: string]: any; // Para campos adicionais do JSON
}

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
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
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

          if (result.success && result.data) {
            // Normalizar campos do resultado (suportar diferentes formatos)
            const normalizedResult: ValidationResult = {
              ...result.data,
              isCorrect: result.data.is_correct ?? result.data.isCorrect ?? false,
              score: result.data.score ?? 0,
              feedback: result.data.feedback || result.data.detailed_feedback || "Sem feedback disponível",
              detailed_feedback: result.data.detailed_feedback || result.data.feedback,
              suggestions: result.data.suggestions || [],
              strengths: result.data.strengths || [],
              weaknesses: result.data.weaknesses || [],
              details: result.data.details || [],
              validation_method: result.data.validation_method,
              confidence: result.data.confidence,
              time_taken: result.data.time_taken,
            };
            
            setValidationResult(normalizedResult);
            setIsValidating(false);
            onValidationComplete(normalizedResult.isCorrect);
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

  const isCorrect = validationResult.isCorrect ?? validationResult.is_correct ?? false;
  const score = validationResult.score ?? 0;
  const feedback = validationResult.feedback || validationResult.detailed_feedback || "Sem feedback disponível";
  const detailedFeedback = validationResult.detailed_feedback;
  const suggestions = validationResult.suggestions || [];
  const strengths = validationResult.strengths || [];
  const weaknesses = validationResult.weaknesses || [];
  const details = validationResult.details || [];
  const confidence = validationResult.confidence;
  const timeTaken = validationResult.time_taken;

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

        {/* Feedback Detalhado */}
        {detailedFeedback && detailedFeedback !== feedback && (
          <div className="space-y-2">
            <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">
              📝 Feedback Detalhado:
            </h4>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {detailedFeedback}
            </div>
          </div>
        )}

        {/* Pontos Fortes */}
        {strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-base text-green-700 dark:text-green-300">
              ✅ Pontos Fortes:
            </h4>
            <ul className="space-y-1.5">
              {strengths.map((strength, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                >
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pontos Fracos */}
        {weaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-base text-orange-700 dark:text-orange-300">
              ⚠️ Pontos a Melhorar:
            </h4>
            <ul className="space-y-1.5">
              {weaknesses.map((weakness, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200"
                >
                  <span className="text-orange-600 dark:text-orange-400">•</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-base text-blue-700 dark:text-blue-300">
              💡 Sugestões de Melhoria:
            </h4>
            <ul className="space-y-1.5">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                >
                  <span className="text-blue-600 dark:text-blue-400">💡</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Análise Detalhada (fallback para details) */}
        {details.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">
              📋 Análise Detalhada:
            </h4>
            <ul className="space-y-1.5">
              {details.map((detail, index) => (
                <li
                  key={index}
                  className="text-sm flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-gray-500 dark:text-gray-400">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Informações Adicionais */}
        {(confidence !== undefined || timeTaken !== undefined) && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
              {confidence !== undefined && (
                <span>
                  <strong>Confiança:</strong> {Math.round(confidence * 100)}%
                </span>
              )}
              {timeTaken !== undefined && (
                <span>
                  <strong>Tempo de análise:</strong> {timeTaken}ms
                </span>
              )}
            </div>
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
