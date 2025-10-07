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
    <Card className="group hover:bg-accent/50 transition-colors cursor-pointer border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {question.title}
          </h3>
          <Badge
            variant="outline"
            className={`${
              DIFFICULTY_COLORS[question.difficulty]
            } shrink-0 capitalize`}
          >
            {question.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {question.description}
        </p>

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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(question.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Feedback
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(question.id)}
              className="text-primary hover:text-primary-foreground hover:bg-primary"
            >
              Responder
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails(question.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              Ver detalhes →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
