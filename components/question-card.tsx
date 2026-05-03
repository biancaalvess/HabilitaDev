"use client";

import { memo, useEffect, useMemo } from "react";
import { Clock, Building2, Tag, MessageSquare } from "lucide-react";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRatingRow } from "@/components/feedback/star-rating-row";
import { fetcher } from "@/lib/fetcher";
import { config } from "@/lib/config-simple";
import {
  parseRatingFromFeedback,
  averageStarRating,
} from "@/lib/feedback-rating";
import type { Feedback } from "@/lib/types";
import { type Question, DIFFICULTY_COLORS, CATEGORY_LABELS } from "@/lib/types";

const API_BASE_URL = config.api.baseUrl;

interface QuestionCardProps {
  question: Question;
  onViewDetails: (id: number) => void;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  onViewDetails,
}: QuestionCardProps) {
  const { data: feedbacks = [], mutate } = useSWR<Feedback[]>(
    `${API_BASE_URL}/proxy/questions/${question.id}/feedback`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 8000,
    }
  );

  useEffect(() => {
    const onCreated = () => {
      void mutate();
    };
    window.addEventListener("feedback-created", onCreated);
    return () => window.removeEventListener("feedback-created", onCreated);
  }, [mutate]);

  const { avgStars, starCount } = useMemo(() => {
    const starEntries = feedbacks
      .map((f) => parseRatingFromFeedback(f.content))
      .filter((r): r is NonNullable<typeof r> => r !== null);
    const avg = averageStarRating(starEntries);
    return {
      avgStars: avg,
      starCount: starEntries.length,
    };
  }, [feedbacks]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const starDisplayValue = avgStars ?? 0;
  const hasStarRatings = starCount > 0 && avgStars != null;

  return (
    <Card className="group cursor-pointer gap-0 border-border/50 py-0 shadow-sm transition-all duration-200 hover:border-border hover:shadow-md hover:bg-accent/30">
      <CardHeader className="gap-0 border-b border-border/40 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <h3 className="flex-1 pr-1 text-balance text-xl font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl line-clamp-2">
            {question.title}
          </h3>
          <Badge
            variant="outline"
            className={`${DIFFICULTY_COLORS[question.difficulty]} shrink-0 px-2.5 py-0.5 text-xs font-semibold capitalize sm:text-sm`}
          >
            {question.difficulty}
          </Badge>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
          <StarRatingRow
            value={starDisplayValue}
            max={5}
            size="md"
            fractional={hasStarRatings}
            className="gap-1"
          />
          <span className="text-xs text-muted-foreground sm:text-sm">
            {hasStarRatings && avgStars != null ? (
              <>
                {avgStars.toFixed(1).replace(".", ",")} · {starCount}{" "}
                {starCount === 1 ? "avaliação" : "avaliações"}
              </>
            ) : (
              "Sem avaliação por estrelas ainda"
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
        <p className="line-clamp-5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90 sm:text-base">
          {question.description}
        </p>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1 text-xs sm:text-sm">
            <Tag className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            {CATEGORY_LABELS[question.category]}
          </Badge>
          {question.company && (
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-xs sm:text-sm">
              <Building2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              {question.company}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-border/30 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 opacity-80" />
              <span className="tabular-nums">
                <span className="hidden sm:inline">{formatDate(question.created_at)}</span>
                <span className="sm:hidden">
                  {new Date(question.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0 opacity-80" />
              <span>Feedback</span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button
              variant="default"
              size="default"
              onClick={() => onViewDetails(question.id)}
              className="h-10 w-full font-medium sm:w-auto sm:min-w-[8.5rem]"
            >
              Responder
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => onViewDetails(question.id)}
              className="h-10 w-full text-muted-foreground sm:w-auto"
            >
              <span className="hidden sm:inline">Ver detalhes</span>
              <span className="sm:hidden">Detalhes</span>
              <span className="ml-1 hidden sm:inline" aria-hidden>
                →
              </span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
