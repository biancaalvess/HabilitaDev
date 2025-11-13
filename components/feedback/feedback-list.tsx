"use client";

import {
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { config } from "@/lib/config-simple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Feedback } from "@/lib/types";

interface FeedbackListProps {
  questionId: number;
}

const API_BASE_URL = config.api.baseUrl;

const feedbackTypeIcons = {
  correction: AlertCircle,
  suggestion: Lightbulb,
  improvement: CheckCircle,
};

const feedbackTypeColors = {
  correction: "text-red-400",
  suggestion: "text-yellow-400",
  improvement: "text-green-400",
};

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  implemented: "bg-green-500/10 text-green-400 border-green-500/20",
};

const statusLabels = {
  pending: "Pendente",
  reviewed: "Revisado",
  implemented: "Implementado",
};

export function FeedbackList({ questionId }: FeedbackListProps) {
  // Usar SWR para buscar feedbacks
  const { data: feedbacks = [], error, isLoading, mutate } = useSWR<Feedback[]>(
    questionId ? `${API_BASE_URL}/proxy/questions/${questionId}/feedback` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Recarregar a cada 10 segundos
      dedupingInterval: 2000,
    }
  );

  // Ouvir eventos de criação de feedbacks para revalidação imediata
  useEffect(() => {
    const handleFeedbackCreated = () => {
      mutate(); // Recarregar feedbacks quando um novo for criado
    };

    window.addEventListener('feedback-created', handleFeedbackCreated);
    
    return () => {
      window.removeEventListener('feedback-created', handleFeedbackCreated);
    };
  }, [mutate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando feedbacks...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Erro ao carregar feedbacks</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum feedback ainda.</p>
          <p className="text-sm text-muted-foreground">
            Seja o primeiro a contribuir!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback da Comunidade ({feedbacks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedbacks.map((feedback, index) => {
          const Icon = feedbackTypeIcons[feedback.feedback_type as keyof typeof feedbackTypeIcons];
          return (
            <div key={feedback.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        feedbackTypeColors[feedback.feedback_type as keyof typeof feedbackTypeColors]
                      }`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {feedback.feedback_type}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${statusColors[feedback.status as keyof typeof statusColors]} text-xs`}
                    >
                      {statusLabels[feedback.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(feedback.created_at)}
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed pl-6">
                  {feedback.content}
                </p>

                <div className="flex items-center gap-2 pl-6">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {feedback.user_id
                      ? `Usuário #${feedback.user_id}`
                      : "Anônimo"}
                  </span>
                </div>
              </div>
              {index < feedbacks.length - 1 && <Separator className="mt-4" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
