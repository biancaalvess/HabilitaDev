"use client";

import {
  MessageSquare,
  Clock,
  User,
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
import type { Comment } from "@/lib/types";

interface CommentListProps {
  questionId: number;
}

const API_BASE_URL = config.api.baseUrl;

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
  // Usar SWR para buscar comentários
  const { data, error, isLoading, mutate } = useSWR<Comment[]>(
    questionId
      ? `${API_BASE_URL}/proxy/questions/${questionId}/comments`
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Recarregar a cada 10 segundos
      dedupingInterval: 2000,
    }
  );

  // Garantir que comments seja sempre um array
  const comments = Array.isArray(data) ? data : [];

  // Ouvir eventos de criação de comentários para revalidação imediata
  useEffect(() => {
    const handleCommentCreated = () => {
      mutate(); // Recarregar comentários quando um novo for criado
    };

    window.addEventListener("comment-created", handleCommentCreated);

    return () => {
      window.removeEventListener("comment-created", handleCommentCreated);
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
          <p className="text-muted-foreground">Carregando comentários...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <MessageSquare className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Erro ao carregar comentários</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
        </CardContent>
      </Card>
    );
  }

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
          const Icon =
            commentTypeIcons[
              comment.comment_type as keyof typeof commentTypeIcons
            ];
          return (
            <div key={comment.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        commentTypeColors[
                          comment.comment_type as keyof typeof commentTypeColors
                        ]
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {
                        commentTypeLabels[
                          comment.comment_type as keyof typeof commentTypeLabels
                        ]
                      }
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
