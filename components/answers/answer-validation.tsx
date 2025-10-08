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
      await new Promise(resolve => setTimeout(resolve, 2000));

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
            <span className="text-lg font-medium text-blue-500">Validando sua resposta...</span>
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
    <Card className={`border-2 ${
      isCorrect 
        ? 'border-green-500/20 bg-green-500/5' 
        : 'border-red-500/20 bg-red-500/5'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-3 ${
            isCorrect ? 'text-green-500' : 'text-red-500'
          }`}>
            {isCorrect ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <XCircle className="h-6 w-6" />
            )}
            {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={`${
              isCorrect 
                ? 'border-green-500 text-green-500' 
                : 'border-red-500 text-red-500'
            }`}
          >
            <Star className="h-3 w-3 mr-1" />
            {score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={`${
          isCorrect 
            ? 'border-green-500/20 bg-green-500/10' 
            : 'border-red-500/20 bg-red-500/10'
        }`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={`${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {feedback}
          </AlertDescription>
        </Alert>

        {details.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Detalhes da Avaliação:
            </h4>
            <ul className="space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {isCorrect 
              ? 'Parabéns! Sua solução está correta. Você pode ver a solução oficial abaixo.'
              : 'Não desista! Reveja sua abordagem e tente novamente. A solução oficial está disponível abaixo.'
            }
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

  // Palavras-chave importantes para algoritmos de ordenação
  const keywords = ['quicksort', 'mergesort', 'heapsort', 'o(n log n)', 'o(n²)', 'pivô', 'particiona', 'divisão', 'conquista'];
  
  let score = 0;
  let details: string[] = [];
  let feedback = '';
  
  // Verificar presença de palavras-chave
  const foundKeywords = keywords.filter(keyword => 
    userLower.includes(keyword.toLowerCase())
  );
  
  score += foundKeywords.length * 10;
  
  // Verificar complexidade
  if (userLower.includes('o(n log n)') || userLower.includes('o(n²)')) {
    score += 20;
    details.push('✓ Mencionou a complexidade temporal corretamente');
  } else {
    details.push('✗ Não mencionou a complexidade temporal');
  }
  
  // Verificar algoritmo específico
  if (userLower.includes('quicksort')) {
    score += 30;
    details.push('✓ Identificou corretamente o algoritmo quicksort');
  } else if (userLower.includes('mergesort') || userLower.includes('heapsort')) {
    score += 25;
    details.push('✓ Mencionou um algoritmo de ordenação eficiente');
  } else {
    details.push('✗ Não especificou um algoritmo de ordenação eficiente');
  }
  
  // Verificar conceito de divisão e conquista
  if (userLower.includes('divisão') || userLower.includes('conquista') || userLower.includes('pivô')) {
    score += 20;
    details.push('✓ Explicou o conceito de divisão e conquista');
  } else {
    details.push('✗ Não explicou o conceito de divisão e conquista');
  }
  
  // Verificar explicação da abordagem
  if (userAnswer.length > 50) {
    score += 10;
    details.push('✓ Forneceu uma explicação detalhada');
  } else {
    details.push('✗ Explicação muito breve');
  }
  
  // Determinar se está correto (score >= 70)
  const isCorrect = score >= 70;
  
  if (isCorrect) {
    feedback = 'Excelente! Sua resposta demonstra boa compreensão do algoritmo de ordenação e sua complexidade.';
  } else if (score >= 50) {
    feedback = 'Boa tentativa! Sua resposta está parcialmente correta, mas pode ser melhorada com mais detalhes sobre o algoritmo e complexidade.';
  } else {
    feedback = 'Sua resposta precisa de mais detalhes. Tente explicar melhor o algoritmo escolhido, sua complexidade e como funciona.';
  }
  
  return {
    isCorrect,
    score: Math.min(score, 100),
    feedback,
    details
  };
}
