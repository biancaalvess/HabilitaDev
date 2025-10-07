"use client";

import type React from "react";
import { useState } from "react";
import { Code, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
// import { useAnswers } from "@/hooks/use-api"; // Removido - implementação simplificada

interface AnswerFormProps {
  questionId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function AnswerForm({ questionId, isOpen, onClose }: AnswerFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!authorName.trim() || !content.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (authorName.trim().length < 2) {
      setError("O nome deve ter pelo menos 2 caracteres.");
      return;
    }

    if (content.trim().length < 20) {
      setError("A resposta deve ter pelo menos 20 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { apiService } = await import("@/lib/api");

      const result = await apiService.createAnswer(questionId, {
        author_name: authorName.trim(),
        content: content.trim(),
        is_solution: false,
      });

      if (result.success) {
        setSuccess(true);
        setContent("");
        setAuthorName("");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError("Erro ao enviar resposta. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao enviar resposta. Tente novamente.");
      console.error("Error sending answer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent("");
      setAuthorName("");
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Responder Questão
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-4">
            <CardDescription>
              Compartilhe sua solução para esta questão. Use código, explicações
              detalhadas ou qualquer abordagem que considere relevante.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {success ? (
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  Resposta enviada com sucesso! Obrigado pela contribuição.
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
                  <Label htmlFor="content">Sua Resposta</Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva sua solução aqui... Use ``` para blocos de código, explique sua abordagem e complexidade."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    disabled={loading}
                    className="bg-muted/50 resize-none font-mono text-sm"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {content.length}/2000 caracteres
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
                    disabled={loading || !authorName.trim() || !content.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Resposta
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
