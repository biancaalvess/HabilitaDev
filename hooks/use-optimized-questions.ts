"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService, type Question } from '@/lib/api';
import { cacheService } from '@/lib/cache';
import { mockQuestions } from '@/lib/mock-data';

interface UseOptimizedQuestionsOptions {
  enableCache?: boolean;
  cacheTimeout?: number;
  enableMockFallback?: boolean;
}

export function useOptimizedQuestions(options: UseOptimizedQuestionsOptions = {}) {
  const {
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutos
    enableMockFallback = true,
  } = options;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Verificar se está offline
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache primeiro
      if (enableCache) {
        const cachedQuestions = cacheService.getQuestions();
        if (cachedQuestions && cachedQuestions.length > 0) {
          console.log('📦 Using cached questions');
          setQuestions(cachedQuestions);
          setLoading(false);
          return;
        }
      }

      // Buscar do backend
      const response = await apiService.getQuestions();
      
      if (response.success) {
        const questionsData = Array.isArray(response.data) ? response.data : [];
        setQuestions(questionsData);
        
        // Armazenar no cache
        if (enableCache) {
          cacheService.setQuestions(questionsData);
        }
      } else {
        throw new Error(response.message || 'Erro ao carregar questões');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      
      // Tentar usar dados mock como fallback
      if (enableMockFallback) {
        console.log('🔄 Using mock data as fallback');
        setQuestions(mockQuestions);
        setError('Modo offline - usando dados de exemplo');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao carregar questões');
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [enableCache, enableMockFallback]);

  // Carregar questões na inicialização
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Memoizar questões filtradas para evitar recálculos desnecessários
  const filteredQuestions = useMemo(() => {
    return questions;
  }, [questions]);

  // Memoizar estatísticas para evitar recálculos
  const stats = useMemo(() => {
    const total = questions.length;
    const byDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byDifficulty,
      byCategory,
    };
  }, [questions]);

  // Função para invalidar cache
  const invalidateCache = useCallback(() => {
    cacheService.delete('questions');
  }, []);

  // Função para forçar refresh
  const refresh = useCallback(() => {
    invalidateCache();
    fetchQuestions();
  }, [invalidateCache, fetchQuestions]);

  return {
    questions: filteredQuestions,
    loading,
    error,
    isOffline,
    stats,
    refresh,
    invalidateCache,
  };
}
