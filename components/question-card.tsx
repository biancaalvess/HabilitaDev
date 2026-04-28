"use client";

import { memo } from "react";
import { Clock, Building2, Tag, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Question, DIFFICULTY_COLORS, CATEGORY_LABELS } from "@/lib/types";

interface QuestionCardProps {
  question: Question;
  onViewDetails: (id: number) => void;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  onViewDetails,
}: QuestionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card className="group hover:bg-accent/50 transition-all duration-200 cursor-pointer border-border/50 hover:shadow-md">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight flex-1 pr-2">
            {question.title}
          </h3>
          <Badge
            variant="outline"
            className={`${
              DIFFICULTY_COLORS[question.difficulty]
            } shrink-0 capitalize font-semibold`}
          >
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-16 pb-4">
        <div className="mb-4">
          <p className="text-muted-foreground text-[0.5rem] sm:text-[0.625rem] leading-relaxed line-clamp-3 whitespace-pre-wrap break-words font-normal">
            {question.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {CATEGORY_LABELS[question.category]}
          </Badge>

          {question.company && (
            <Badge variant="outline" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              {question.company}
            </Badge>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">
                {formatDate(question.created_at)}
              </span>
              <span className="sm:hidden">
                {new Date(question.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span className="hidden xs:inline">Feedback</span>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(question.id)}
              className="text-primary hover:text-primary-foreground hover:bg-primary flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              Responder
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(question.id)}
              className="text-muted-foreground hover:text-foreground flex-1 sm:flex-initial text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Ver detalhes →</span>
              <span className="sm:hidden">Detalhes</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
