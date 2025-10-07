"use client";

import type React from "react";
import { useState } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { useComments } from "@/lib/comments" // Removido - implementação simplificada
import type { Comment } from "@/lib/types";

interface CommentFormProps {
  questionId: number;
  isOpen: boolean;
  onClose: () => void;
}

const commentTypeLabels = {
  correction: "Correção",
  suggestion: "Sugestão",
};

const commentTypeDescriptions = {
  correction: "Corrigir um erro na questão ou resposta",
  suggestion: "Sugerir melhorias na questão ou resposta",
};

const commentTypeIcons = {
  correction: AlertCircle,
  suggestion: Lightbulb,
};

export function CommentForm({ questionId, isOpen, onClose }: CommentFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [commentType, setCommentType] = useState<Comment["comment_type"] | "">(
    ""
  );
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!authorName.trim() || !commentType || !content.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (authorName.trim().length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres.");
      return;
    }

    if (content.trim().length < 10) {
      setError("O comentário deve ter pelo menos 10 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { apiService } = await import("@/lib/api");

      const result = await apiService.createComment(questionId, {
        author_name: authorName.trim(),
        comment_type: commentType as any,
        content: content.trim(),
      });

      if (result.success) {
        setSuccess(true);
        setContent("");
        setAuthorName("");
        setCommentType("");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError("Erro ao enviar comentário. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao enviar comentário. Tente novamente.");
      console.error("Error sending comment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent("");
      setAuthorName("");
      setCommentType("");
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Deixar Comentário
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-4">
            <CardDescription>
              Compartilhe sua correção ou sugestão para ajudar a melhorar esta
              questão.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {success ? (
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  Comentário enviado com sucesso! Obrigado pela contribuição.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="authorName">Seu Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="authorName"
                      placeholder="Ex: Maria Silva"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      disabled={loading}
                      className="pl-10 bg-muted/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentType">Tipo de Comentário</Label>
                  <Select
                    value={commentType}
                    onValueChange={(value) =>
                      setCommentType(value as Comment["comment_type"])
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(commentTypeLabels).map(([key, label]) => {
                        const Icon =
                          commentTypeIcons[
                            key as keyof typeof commentTypeIcons
                          ];
                        return (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {
                                    commentTypeDescriptions[
                                      key as keyof typeof commentTypeDescriptions
                                    ]
                                  }
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Comentário</Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva sua correção ou sugestão..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    disabled={loading}
                    className="bg-muted/50 resize-none"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {content.length}/500 caracteres
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !authorName.trim() ||
                      !commentType ||
                      !content.trim()
                    }
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
