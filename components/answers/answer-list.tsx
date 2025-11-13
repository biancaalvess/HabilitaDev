"use client";

import { Code, Clock, User, CheckCircle, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { config } from "@/lib/config-simple";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface AnswerListProps {
  questionId: number;
}

const API_BASE_URL = config.api.baseUrl;

interface Answer {
  id: number;
  question_id: number;
  author_name: string;
  content: string;
  created_at: string;
  is_solution: boolean;
}

export function AnswerList({ questionId }: AnswerListProps) {
  const [copiedAnswerId, setCopiedAnswerId] = useState<number | null>(null);

  // Usar SWR para buscar respostas
  const { data: answers = [], error, isLoading, mutate } = useSWR<Answer[]>(
    questionId ? `${API_BASE_URL}/proxy/questions/${questionId}/answers` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 10000, // Recarregar a cada 10 segundos
      dedupingInterval: 2000,
    }
  );

  // Ouvir eventos de criação de respostas para revalidação imediata
  useEffect(() => {
    const handleAnswerCreated = () => {
      mutate(); // Recarregar respostas quando uma nova for criada
    };

    window.addEventListener('answer-created', handleAnswerCreated);
    
    return () => {
      window.removeEventListener('answer-created', handleAnswerCreated);
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

  const copyToClipboard = async (content: string, answerId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedAnswerId(answerId);
      setTimeout(() => setCopiedAnswerId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting for code blocks
    const parts = content.split(/```([\s\S]*?)```/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a code block
        return (
          <pre
            key={index}
            className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto my-2"
          >
            <code>{part.trim()}</code>
          </pre>
        );
      } else {
        // This is regular text
        return part.split("\n").map((line, lineIndex) => (
          <p key={`${index}-${lineIndex}`} className="mb-2 last:mb-0">
            {line}
          </p>
        ));
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando respostas...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Code className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Erro ao carregar respostas</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Erro desconhecido'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma resposta ainda.</p>
          <p className="text-sm text-muted-foreground">
            Seja o primeiro a responder!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Respostas da Comunidade ({answers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {answers.map((answer, index) => (
          <div key={answer.id}>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {answer.is_solution && (
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/20"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Solução
                    </Badge>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {answer.author_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(answer.created_at)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(answer.content, answer.id)}
                    className="h-6 w-6 p-0"
                  >
                    {copiedAnswerId === answer.id ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-sm text-foreground leading-relaxed">
                  {formatContent(answer.content)}
                </div>
              </div>
            </div>
            {index < answers.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
