import { useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';
import { createError, ERROR_CODES } from '@/lib/error-handler';

interface UseErrorHandlerOptions {
  onError?: (error: Error) => void;
  logErrors?: boolean;
  context?: string;
}

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string | null;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { onError, logErrors = true, context = 'UNKNOWN' } = options;
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: null,
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    let appError: Error;
    
    if (error instanceof Error) {
      appError = error;
    } else if (typeof error === 'string') {
      appError = createError('UNKNOWN_ERROR', error);
    } else {
      appError = createError('UNKNOWN_ERROR', 'Erro desconhecido');
    }

    const errorMessage = customMessage || appError.message;

    setErrorState({
      error: appError,
      isError: true,
      errorMessage,
    });

    if (logErrors) {
      logger.error(errorMessage, context, { error: appError });
    }

    if (onError) {
      onError(appError);
    }
  }, [onError, logErrors, context]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: null,
    });
  }, []);

  const reset = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    ...errorState,
    handleError,
    clearError,
    reset,
  };
}

// Hook específico para operações assíncronas
export function useAsyncErrorHandler<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseErrorHandlerOptions = {}
) {
  const errorHandler = useErrorHandler(options);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setIsLoading(true);
      errorHandler.clearError();
      
      const result = await asyncFn(...args);
      return result;
    } catch (error) {
      errorHandler.handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [asyncFn, errorHandler]);

  return {
    ...errorHandler,
    execute,
    isLoading,
  };
}

// Hook para retry automático
export function useRetryableErrorHandler<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseErrorHandlerOptions & {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onRetry, ...errorOptions } = options;
  const errorHandler = useErrorHandler(errorOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const executeWithRetry = useCallback(async (...args: any[]): Promise<T | null> => {
    const attempt = async (currentRetry: number): Promise<T | null> => {
      try {
        setIsLoading(true);
        errorHandler.clearError();
        
        const result = await asyncFn(...args);
        setRetryCount(0);
        return result;
      } catch (error) {
        if (currentRetry < maxRetries) {
          setRetryCount(currentRetry + 1);
          
          if (onRetry) {
            onRetry(currentRetry + 1);
          }
          
          // Aguardar antes de tentar novamente
          await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, retryDelay);
          });
          
          return attempt(currentRetry + 1);
        } else {
          errorHandler.handleError(error);
          setRetryCount(0);
          return null;
        }
      } finally {
        setIsLoading(false);
      }
    };

    return attempt(0);
  }, [asyncFn, maxRetries, retryDelay, onRetry, errorHandler]);

  const cancelRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setIsLoading(false);
    setRetryCount(0);
  }, []);

  return {
    ...errorHandler,
    executeWithRetry,
    cancelRetry,
    isLoading,
    retryCount,
  };
}

// Hook para debounce de erros
export function useDebouncedErrorHandler(
  options: UseErrorHandlerOptions & {
    debounceMs?: number;
  } = {}
) {
  const { debounceMs = 500, ...errorOptions } = options;
  const errorHandler = useErrorHandler(errorOptions);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  const handleErrorDebounced = useCallback((error: unknown, customMessage?: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      errorHandler.handleError(error, customMessage);
    }, debounceMs);
  }, [errorHandler, debounceMs]);

  return {
    ...errorHandler,
    handleError: handleErrorDebounced,
  };
}
