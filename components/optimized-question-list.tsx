"use client";

import { memo, useMemo } from 'react';
import { QuestionCard } from './question-card';
import { Question } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface OptimizedQuestionListProps {
  questions: Question[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  onRefresh: () => void;
  onViewDetails: (id: number) => void;
}

// Componente de loading otimizado
const QuestionSkeleton = memo(() => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="p-6 border rounded-lg">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

QuestionSkeleton.displayName = 'QuestionSkeleton';

// Componente de erro otimizado
const ErrorState = memo(({ error, onRefresh, isOffline }: { 
  error: string; 
  onRefresh: () => void; 
  isOffline: boolean; 
}) => (
  <div className="text-center py-12">
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-red-400/20">
      <div className="mb-4 flex justify-center">
        {isOffline ? (
          <WifiOff className="w-16 h-16 text-red-400" />
        ) : (
          <img
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTE5cmV3aTV2bmRkYzFua2cwamg3cHNxc2NqeTlocGs0NHYyMTd3MiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/IKsO37j6PoslBVHSG3/giphy.gif"
            alt="Erro"
            className="w-16 h-16 object-contain"
          />
        )}
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        {isOffline ? 'Modo Offline' : 'Erro ao carregar questões'}
      </h2>
      <p className="text-white/60 mb-6 text-lg leading-relaxed">
        {isOffline 
          ? 'Você está offline. Algumas funcionalidades podem estar limitadas.'
          : error
        }
      </p>
      <div className="flex gap-4 justify-center">
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
        {isOffline && (
          <Button variant="ghost" onClick={onRefresh}>
            <Wifi className="w-4 h-4 mr-2" />
            Verificar conexão
          </Button>
        )}
      </div>
    </div>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Componente de lista vazia otimizado
const EmptyState = memo(() => (
  <div className="text-center py-12">
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-blue-400/20">
      <p className="text-white/80 text-lg">
        Nenhuma questão encontrada com os filtros aplicados.
      </p>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

// Componente principal otimizado
export const OptimizedQuestionList = memo(function OptimizedQuestionList({
  questions,
  loading,
  error,
  isOffline,
  onRefresh,
  onViewDetails,
}: OptimizedQuestionListProps) {
  // Memoizar lista de questões para evitar re-renders desnecessários
  const questionList = useMemo(() => {
    return questions.map((question) => (
      <QuestionCard
        key={question.id}
        question={question}
        onViewDetails={onViewDetails}
      />
    ));
  }, [questions, onViewDetails]);

  // Mostrar loading
  if (loading) {
    return <QuestionSkeleton />;
  }

  // Mostrar erro
  if (error) {
    return <ErrorState error={error} onRefresh={onRefresh} isOffline={isOffline} />;
  }

  // Mostrar lista vazia
  if (questions.length === 0) {
    return <EmptyState />;
  }

  // Mostrar lista de questões
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {questionList}
    </div>
  );
});

OptimizedQuestionList.displayName = 'OptimizedQuestionList';
