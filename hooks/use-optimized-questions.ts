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
    // Garantir que sempre retornamos um array válido
    if (!data) {
      return [];
    }
    // Verificar se data é um array
    if (Array.isArray(data)) {
      return data;
    }
    // Se data não é um array, pode ser um objeto de resposta da API
    // Verificar se tem uma propriedade 'data' ou 'questions' que seja um array
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data && typeof data === 'object' && 'questions' in data && Array.isArray(data.questions)) {
      return data.questions;
    }
    // Se nada funcionar, retornar array vazio
    return [];
  }, [data]);

  // Memoizar estatísticas
  const stats = useMemo(() => {
    // Verificar se questions é um array válido antes de usar reduce
    if (!Array.isArray(questions) || questions.length === 0) {
      return {
        total: 0,
        byDifficulty: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
      };
    }

    const total = questions.length;
    const byDifficulty = questions.reduce((acc, q) => {
      if (q && q.difficulty) {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = questions.reduce((acc, q) => {
      if (q && q.category) {
        acc[q.category] = (acc[q.category] || 0) + 1;
      }
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

  // Detectar se está offline ou backend indisponível
  const isOffline = error?.message?.includes('Failed to fetch') || 
                   error?.message?.includes('NetworkError') ||
                   error?.message?.includes('network') ||
                   error?.message?.includes('Network request failed') ||
                   error?.message?.includes('Service Unavailable') ||
                   (error as any)?.status === 503;

  // Mensagem de erro mais amigável
  const errorMessage = useMemo(() => {
    if (!error) return null;
    
    const status = (error as any)?.status;
    if (status === 503) {
      return 'Backend indisponível. Verifique se o BACKEND_URL está configurado ou se o backend está rodando.';
    }
    
    return error.message || 'Erro ao carregar questões';
  }, [error]);

  return {
    questions,
    loading: isLoading,
    error: errorMessage,
    isOffline: !!isOffline,
    stats,
    refresh,
    invalidateCache,
  };
}
