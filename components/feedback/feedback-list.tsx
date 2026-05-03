"use client";

import {
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Star,
} from "lucide-react";
import { useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { config } from "@/lib/config-simple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Feedback } from "@/lib/types";
import {
  parseRatingFromFeedback,
  averageStarRating,
} from "@/lib/feedback-rating";
import { StarRatingRow } from "@/components/feedback/star-rating-row";

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

  const withParsed = feedbacks.map((f) => ({
    feedback: f,
    rating: parseRatingFromFeedback(f.content),
  }));
  const starEntries = withParsed.filter((x) => x.rating !== null) as {
    feedback: Feedback;
    rating: { stars: number; comment: string };
  }[];
  const avgStars = averageStarRating(starEntries.map((e) => e.rating));
  const otherFeedbacks = withParsed
    .filter((x) => x.rating === null)
    .map((x) => x.feedback);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback da comunidade ({feedbacks.length})
        </CardTitle>
        {avgStars != null && starEntries.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">
              Avaliação geral
            </span>
            <StarRatingRow value={Math.round(avgStars)} size="md" />
            <span className="text-sm tabular-nums text-muted-foreground">
              {avgStars.toFixed(1).replace(".", ",")} / 5 ·{" "}
              {starEntries.length}{" "}
              {starEntries.length === 1 ? "avaliação" : "avaliações"}
            </span>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {starEntries.map(({ feedback, rating }, index) => (
          <div key={`star-${feedback.id}`}>
            <div className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    Avaliação
                  </span>
                  <StarRatingRow value={rating.stars} size="sm" />
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
              {rating.comment ? (
                <p className="pl-6 text-sm italic leading-relaxed text-muted-foreground">
                  {rating.comment}
                </p>
              ) : null}
              <div className="flex items-center gap-2 pl-6">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {feedback.user_id
                    ? `Usuário #${feedback.user_id}`
                    : "Comunidade"}
                </span>
              </div>
            </div>
            {(index < starEntries.length - 1 || otherFeedbacks.length > 0) && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}

        {otherFeedbacks.map((feedback, index) => {
          const Icon =
            feedbackTypeIcons[
              feedback.feedback_type as keyof typeof feedbackTypeIcons
            ];
          return (
            <div key={feedback.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        feedbackTypeColors[
                          feedback.feedback_type as keyof typeof feedbackTypeColors
                        ]
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
              {index < otherFeedbacks.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
