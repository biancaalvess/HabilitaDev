import { useState, useCallback } from 'react';

interface VerificationResult {
  is_correct: boolean;
  score: number;
  feedback: string;
  details: string[];
  validation_method?: string;
  ai_confidence?: number;
}

interface VerificationError {
  error: string;
  message: string;
  details?: string;
}

interface UseQuestionVerificationOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export const useQuestionVerification = (options: UseQuestionVerificationOptions = {}) => {
  const { maxRetries = 3, retryDelay = 1000 } = options;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyAnswer = useCallback(
    async (
      questionId: number,
      answer: string,
      correctAnswer: string,
      questionContext?: string
    ): Promise<VerificationResult> => {
      if (!answer.trim()) {
        throw new Error('A resposta não pode estar vazia');
      }

      if (answer.trim().length < 10) {
        throw new Error('A resposta deve ter pelo menos 10 caracteres');
      }

      setLoading(true);
      setResult(null);
      setError(null);

      let lastError: Error | null = null;

      // Retry logic com exponential backoff
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(
            `/api/proxy/questions/${questionId}/validate-answer`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                user_answer: answer,
                correct_answer: correctAnswer,
                question_context: questionContext || 'Questão de entrevista técnica',
              }),
              signal: AbortSignal.timeout(30000), // Timeout de 30s
            }
          );

          if (!response.ok) {
            // Se for erro de servidor (5xx), tenta novamente
            if (response.status >= 500) {
              const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
              console.warn(
                `[useQuestionVerification] Tentativa ${attempt + 1}/${maxRetries} falhou. Tentando novamente em ${delay}ms...`
              );
              
              if (attempt < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
              }
            }

            // Erro de cliente (4xx) ou última tentativa
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Erro HTTP: ${response.status}`
            );
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.message || 'Falha na validação');
          }

          const verificationResult = data.data;
          setResult(verificationResult);
          setLoading(false);
          return verificationResult;
        } catch (err) {
          lastError = err as Error;

          // Se for a última tentativa, lança o erro
          if (attempt === maxRetries - 1) {
            const errorMessage = lastError.message || 'Erro ao verificar resposta';
            setError(errorMessage);
            setLoading(false);
            throw lastError;
          }

          // Aguarda antes de tentar novamente
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // Nunca deve chegar aqui, mas TypeScript precisa
      throw lastError || new Error('Erro desconhecido');
    },
    [maxRetries, retryDelay]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    loading,
    result,
    error,
    verifyAnswer,
    reset,
  };
};

