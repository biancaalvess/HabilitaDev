"use client";

import type React from "react";
import { useState } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        
        // Disparar evento customizado para recarregar comentários
        window.dispatchEvent(new CustomEvent('comment-created'));
        
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

        <div className="w-full">
          {success ? (
            <Alert className="border-green-500/20 bg-green-500/10">
              <AlertDescription className="text-green-400">
                Comentário enviado com sucesso! Obrigado pela contribuição.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                  <AlertDescription className="text-red-400 font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="authorName">Seu Nome</Label>
                <Input
                  id="authorName"
                  type="text"
                  placeholder="Digite seu nome"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  disabled={loading}
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentType">Tipo de Comentário</Label>
                <Select
                  value={commentType}
                  onValueChange={(value) => setCommentType(value as Comment["comment_type"])}
                  disabled={loading}
                  required
                >
                  <SelectTrigger id="commentType">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(commentTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label} - {commentTypeDescriptions[key as keyof typeof commentTypeDescriptions]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Comentário</Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Digite seu comentário..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    rows={4}
                    required
                    minLength={10}
                    maxLength={500}
                    className="pr-20"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {content.length}/500
                  </div>
                </div>
              </div>

              <div className="flex gap-3 sm:flex-row flex-col">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
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
                  className="flex-1"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
