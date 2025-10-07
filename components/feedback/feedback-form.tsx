"use client";

import type React from "react";

import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/lib/auth";
import type { Feedback } from "@/lib/types";

interface FeedbackFormProps {
  questionId: number;
  isOpen: boolean;
  onClose: () => void;
}

const feedbackTypeLabels = {
  correction: "Correção",
  suggestion: "Sugestão",
  improvement: "Melhoria",
};

const feedbackTypeDescriptions = {
  correction: "Reportar um erro na questão ou resposta",
  suggestion: "Sugerir melhorias no conteúdo",
  improvement: "Propor adições ou aprimoramentos",
};

export function FeedbackForm({
  questionId,
  isOpen,
  onClose,
}: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<
    Feedback["feedback_type"] | ""
  >("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Você precisa estar logado para enviar feedback.");
      return;
    }

    if (!feedbackType || !content.trim()) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (content.trim().length < 10) {
      setError("O feedback deve ter pelo menos 10 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { apiService } = await import("@/lib/api");
      
      const result = await apiService.createFeedback(questionId, {
        feedback_type: feedbackType as any,
        content: content.trim(),
        status: 'pending' as any,
        user_id: user?.id
      });

      if (result.success) {
        setSuccess(true);
        setContent("");
        setFeedbackType("");
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        setError("Erro ao enviar feedback. Tente novamente.");
      }
    } catch (err) {
      setError("Erro ao enviar feedback. Tente novamente.");
      console.error("Error sending feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent("");
      setFeedbackType("");
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
            Enviar Feedback
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pb-4">
            <CardDescription>
              Ajude-nos a melhorar esta questão com seu feedback. Sua
              contribuição é valiosa para a comunidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {success ? (
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  Feedback enviado com sucesso! Obrigado pela contribuição.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!user && (
                  <Alert>
                    <AlertDescription>
                      Você precisa estar logado para enviar feedback.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="feedbackType">Tipo de Feedback</Label>
                  <Select
                    value={feedbackType}
                    onValueChange={(value) =>
                      setFeedbackType(value as Feedback["feedback_type"])
                    }
                    disabled={loading || !user}
                  >
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(feedbackTypeLabels).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            <div>
                              <div className="font-medium">{label}</div>
                              <div className="text-xs text-muted-foreground">
                                {
                                  feedbackTypeDescriptions[
                                    key as keyof typeof feedbackTypeDescriptions
                                  ]
                                }
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    placeholder="Descreva seu feedback detalhadamente..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    disabled={loading || !user}
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
                      loading || !user || !feedbackType || !content.trim()
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
