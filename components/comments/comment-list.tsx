"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Comment } from "@/lib/types";
// import { useComments } from "@/lib/comments" // Removido - implementação simplificada

interface CommentListProps {
  questionId: number;
}

const commentTypeIcons = {
  correction: AlertCircle,
  suggestion: Lightbulb,
};

const commentTypeColors = {
  correction: "text-red-400",
  suggestion: "text-yellow-400",
};

const commentTypeLabels = {
  correction: "Correção",
  suggestion: "Sugestão",
};

export function CommentList({ questionId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { apiService } = await import("@/lib/api");
        const response = await apiService.getComments(questionId);
        setComments(response.data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [questionId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum comentário ainda.</p>
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
          Comentários da Comunidade ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comments.map((comment, index) => {
          const Icon = commentTypeIcons[comment.comment_type as keyof typeof commentTypeIcons];
          return (
            <div key={comment.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        commentTypeColors[comment.comment_type as keyof typeof commentTypeColors]
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {commentTypeLabels[comment.comment_type as keyof typeof commentTypeLabels]}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {comment.comment_type === "correction"
                        ? "Correção"
                        : "Sugestão"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(comment.created_at)}
                  </div>
                </div>

                <p className="text-sm text-foreground leading-relaxed pl-6">
                  {comment.content}
                </p>

                <div className="flex items-center gap-2 pl-6">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {comment.author_name}
                  </span>
                </div>
              </div>
              {index < comments.length - 1 && <Separator className="mt-4" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
