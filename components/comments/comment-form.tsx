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
  DialogDescription,
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
      <DialogContent className="w-full max-w-lg mx-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            Deixar Comentário
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Compartilhe sua correção ou sugestão para ajudar a melhorar esta questão.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="px-0 pt-4">
            {success ? (
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  Comentário enviado com sucesso! Obrigado pela contribuição.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                    <AlertDescription className="text-red-400 font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="authorName" className="text-sm font-medium text-foreground">
                    Seu Nome
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="authorName"
                      placeholder="Ex: Maria Silva"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      disabled={loading}
                      className="pl-11 h-12 bg-muted/50 border-muted-foreground/20 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="commentType" className="text-sm font-medium text-foreground">
                    Tipo de Comentário
                  </Label>
                  <Select
                    value={commentType}
                    onValueChange={(value) =>
                      setCommentType(value as Comment["comment_type"])
                    }
                    disabled={loading}
                  >
                    <SelectTrigger className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-blue-500 focus:ring-blue-500/20 transition-colors">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(commentTypeLabels).map(([key, label]) => {
                        const Icon =
                          commentTypeIcons[
                            key as keyof typeof commentTypeIcons
                          ];
                        return (
                          <SelectItem key={key} value={key} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-md bg-blue-500/10">
                                <Icon className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{label}</div>
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

                <div className="space-y-3">
                  <Label htmlFor="content" className="text-sm font-medium text-foreground">
                    Comentário
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="content"
                      placeholder="Descreva sua correção ou sugestão..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                      disabled={loading}
                      className="min-h-[120px] bg-muted/50 border-muted-foreground/20 focus:border-blue-500 focus:ring-blue-500/20 transition-colors resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                      {content.length}/500 caracteres
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="w-full sm:w-auto h-11"
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
                    className="w-full sm:w-auto h-11 bg-blue-500 hover:bg-blue-600 text-white"
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
