"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Star, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnswerValidationProps {
  userAnswer: string;
  correctAnswer: string;
  onValidationComplete: (isCorrect: boolean) => void;
}

export function AnswerValidation({
  userAnswer,
  correctAnswer,
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
    // Simular validação (em um sistema real, isso seria feito no backend)
    const validateAnswer = async () => {
      setIsValidating(true);

      // Simular delay de validação
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = validateUserAnswer(userAnswer, correctAnswer);
      setValidationResult(result);
      setIsValidating(false);
      onValidationComplete(result.isCorrect);
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
              Validando sua resposta...
            </span>
          </div>
          <p className="text-muted-foreground">
            Analisando sua solução e comparando com a resposta esperada.
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
      <CardHeader className={`${
        isCorrect ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
      }`}>
        <div className="flex items-center justify-between">
          <CardTitle
            className={`flex items-center gap-3 text-2xl font-bold ${
              isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle className="h-8 w-8 text-green-600" />
                ✅ RESPOSTA CORRETA!
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-red-600" />
                ❌ RESPOSTA INCORRETA
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
          <AlertCircle className={`h-5 w-5 ${isCorrect ? "text-green-600" : "text-red-600"}`} />
          <AlertDescription
            className={`text-base font-medium ${isCorrect ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}`}
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
                <li key={index} className="text-base flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="text-lg">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`pt-4 border-t-2 ${isCorrect ? "border-green-200" : "border-red-200"}`}>
          <p className={`text-lg font-medium ${isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
            {isCorrect
              ? "🎉 PARABÉNS! Sua resposta está CORRETA! Você demonstrou domínio do conceito. A solução oficial está disponível abaixo."
              : "💪 NÃO DESISTA! Sua resposta precisa de ajustes. Estude a solução oficial abaixo e tente novamente."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Função de validação simulada
function validateUserAnswer(userAnswer: string, correctAnswer: string) {
  const userLower = userAnswer.toLowerCase();
  const correctLower = correctAnswer.toLowerCase();

  // Critérios obrigatórios para uma resposta correta
  const requiredElements = {
    algorithm: false,
    complexity: false,
    concept: false,
    explanation: false
  };

  let score = 0;
  let details: string[] = [];
  let feedback = "";

  // 1. VERIFICAR ALGORITMO ESPECÍFICO (Critério principal - 40 pontos)
  if (userLower.includes("quicksort")) {
    requiredElements.algorithm = true;
    score += 40;
    details.push("✅ Algoritmo correto: Quicksort identificado");
  } else if (userLower.includes("mergesort")) {
    requiredElements.algorithm = true;
    score += 35;
    details.push("✅ Algoritmo eficiente: Mergesort identificado");
  } else if (userLower.includes("heapsort")) {
    requiredElements.algorithm = true;
    score += 35;
    details.push("✅ Algoritmo eficiente: Heapsort identificado");
  } else {
    details.push("❌ Algoritmo: Não especificou um algoritmo de ordenação eficiente");
  }

  // 2. VERIFICAR COMPLEXIDADE TEMPORAL (Critério obrigatório - 30 pontos)
  if (userLower.includes("o(n log n)") || userLower.includes("o(n²)")) {
    requiredElements.complexity = true;
    score += 30;
    if (userLower.includes("o(n log n)")) {
      details.push("✅ Complexidade: O(n log n) mencionada corretamente");
    }
    if (userLower.includes("o(n²)")) {
      details.push("✅ Complexidade: O(n²) no pior caso mencionada");
    }
  } else {
    details.push("❌ Complexidade: Não mencionou a complexidade temporal");
  }

  // 3. VERIFICAR CONCEITO DE DIVISÃO E CONQUISTA (Critério importante - 20 pontos)
  if (userLower.includes("pivô") || userLower.includes("particiona")) {
    requiredElements.concept = true;
    score += 20;
    details.push("✅ Conceito: Explicou o funcionamento com pivô/particionamento");
  } else if (userLower.includes("divisão") && userLower.includes("conquista")) {
    requiredElements.concept = true;
    score += 15;
    details.push("✅ Conceito: Mencionou divisão e conquista");
  } else {
    details.push("❌ Conceito: Não explicou como o algoritmo funciona");
  }

  // 4. VERIFICAR QUALIDADE DA EXPLICAÇÃO (Critério complementar - 10 pontos)
  if (userAnswer.length > 100) {
    requiredElements.explanation = true;
    score += 10;
    details.push("✅ Explicação: Resposta detalhada e bem estruturada");
  } else if (userAnswer.length > 50) {
    score += 5;
    details.push("⚠️ Explicação: Resposta adequada, mas pode ser mais detalhada");
  } else {
    details.push("❌ Explicação: Resposta muito breve, precisa de mais detalhes");
  }

  // DETERMINAR SE ESTÁ CORRETO
  // Para estar correto, deve ter: algoritmo + complexidade + conceito básico
  const isCorrect = requiredElements.algorithm && requiredElements.complexity && requiredElements.concept;

  // FEEDBACK ESPECÍFICO BASEADO NA CORREÇÃO
  if (isCorrect) {
    feedback = "🎉 RESPOSTA CORRETA! Você demonstrou compreensão completa do algoritmo de ordenação, incluindo sua complexidade e funcionamento.";
  } else {
    const missingElements = [];
    if (!requiredElements.algorithm) missingElements.push("especificar o algoritmo");
    if (!requiredElements.complexity) missingElements.push("mencionar a complexidade");
    if (!requiredElements.concept) missingElements.push("explicar como funciona");
    
    feedback = `❌ RESPOSTA INCORRETA. Sua resposta está incompleta. Faltou: ${missingElements.join(", ")}.`;
  }

  // Adicionar pontuação final
  details.push(`\n📊 Pontuação final: ${score}/100 pontos`);

  return {
    isCorrect,
    score: Math.min(score, 100),
    feedback,
    details,
  };
}
