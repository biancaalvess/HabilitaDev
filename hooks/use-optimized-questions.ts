"use client";

import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { config } from '@/lib/config-simple';
import type { Question } from '@/lib/api';

const API_BASE_URL = config.api.baseUrl;

interface UseOptimizedQuestionsOptions {
  enableCache?: boolean;
  cacheTimeout?: number;
}

export function useOptimizedQuestions(options: UseOptimizedQuestionsOptions = {}) {
  // SWR configuration
  const { data, error, isLoading, mutate } = useSWR<Question[]>(
    `${API_BASE_URL}/proxy/questions`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // 2 segundos - evitar requisições duplicadas
      refreshInterval: 0, // Desabilitar refresh automático (pode ser habilitado se necessário)
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Memoizar questões (SWR já faz cache, mas mantemos para compatibilidade)
  const questions = useMemo(() => {
    return data || [];
  }, [data]);

  // Memoizar estatísticas
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

  // Função para forçar refresh (usando mutate do SWR)
  const refresh = () => {
    mutate();
  };

  // Função para invalidar cache (usando mutate do SWR)
  const invalidateCache = () => {
    mutate(undefined, { revalidate: true });
  };

  // Detectar se está offline
  const isOffline = error?.message?.includes('Failed to fetch') || 
                   error?.message?.includes('NetworkError') ||
                   error?.message?.includes('network') ||
                   error?.message?.includes('Network request failed');

  return {
    questions,
    loading: isLoading,
    error: error ? (error.message || 'Erro ao carregar questões') : null,
    isOffline: !!isOffline,
    stats,
    refresh,
    invalidateCache,
  };
}
