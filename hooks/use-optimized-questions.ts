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

export function useOptimizedQuestions(_options: UseOptimizedQuestionsOptions = {}) {
  // page=1&limit=500: listagem completa para filtros no cliente
  const { data, error, isLoading, mutate } = useSWR<Question[]>(
    `${API_BASE_URL}/proxy/questions?page=1&limit=500`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 10_000,
      refreshInterval: 0,
      errorRetryCount: 2,
      errorRetryInterval: 4000,
      shouldRetryOnError: (err) => (err as { status?: number })?.status !== 404,
    }
  );

  const questions = useMemo(() => {
    if (!data) {
      return [];
    }
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
      return (data as any).data;
    }
    if (data && typeof data === 'object' && 'questions' in data && Array.isArray((data as any).questions)) {
      return (data as any).questions;
    }
    if (data && typeof data === 'object' && 'content' in data && Array.isArray((data as any).content)) {
      return (data as any).content;
    }
    if (data && typeof data === 'object' && 'items' in data && Array.isArray((data as any).items)) {
      return (data as any).items;
    }
    return [];
  }, [data]);

  const stats = useMemo(() => {
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

  const refresh = () => {
    mutate();
  };

  const invalidateCache = () => {
    mutate(undefined, { revalidate: true });
  };

  const isOffline = error?.message?.includes('Failed to fetch') ||
                   error?.message?.includes('NetworkError') ||
                   error?.message?.includes('network') ||
                   error?.message?.includes('Network request failed') ||
                   error?.message?.includes('Service Unavailable') ||
                   (error as any)?.status === 503;

  const errorMessage = useMemo(() => {
    if (!error) return null;

    const status = (error as any)?.status;
    if (status === 503) {
      return 'Backend indisponível. Defina NEXT_PUBLIC_BACKEND_URL e confirme que o Spring está a correr.';
    }
    if (status === 502) {
      return 'O proxy não conseguiu falar com o Java (502). Verifique se o Spring está acessível a partir do Next.';
    }
    if (status === 400) {
      return error.message || 'Pedido inválido ao carregar questões.';
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
