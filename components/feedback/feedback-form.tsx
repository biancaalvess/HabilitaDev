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
  DialogDescription,
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
        status: "pending" as any,
        user_id: user?.id,
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
      <DialogContent className="w-full max-w-lg mx-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 rounded-lg bg-green-500/10">
              <MessageSquare className="h-5 w-5 text-green-500" />
            </div>
            Enviar Feedback
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Ajude-nos a melhorar esta questão com seu feedback. Sua contribuição é valiosa para a comunidade.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="px-0 pt-4">
            {success ? (
              <Alert className="border-green-500/20 bg-green-500/10">
                <AlertDescription className="text-green-400">
                  Feedback enviado com sucesso! Obrigado pela contribuição.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                    <AlertDescription className="text-red-400 font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                {!user && (
                  <Alert className="border-amber-500/20 bg-amber-500/10">
                    <AlertDescription className="text-amber-400 font-medium">
                      Você precisa estar logado para enviar feedback.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="feedbackType" className="text-sm font-medium text-foreground">
                    Tipo de Feedback
                  </Label>
                  <Select
                    value={feedbackType}
                    onValueChange={(value) =>
                      setFeedbackType(value as Feedback["feedback_type"])
                    }
                    disabled={loading || !user}
                  >
                    <SelectTrigger className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-green-500 focus:ring-green-500/20 transition-colors">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(feedbackTypeLabels).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 rounded-md bg-green-500/10">
                                <MessageSquare className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {
                                    feedbackTypeDescriptions[
                                      key as keyof typeof feedbackTypeDescriptions
                                    ]
                                  }
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="content" className="text-sm font-medium text-foreground">
                    Conteúdo
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="content"
                      placeholder="Descreva seu feedback detalhadamente..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={5}
                      disabled={loading || !user}
                      className="min-h-[120px] bg-muted/50 border-muted-foreground/20 focus:border-green-500 focus:ring-green-500/20 transition-colors resize-none"
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
                      loading || !user || !feedbackType || !content.trim()
                    }
                    className="w-full sm:w-auto h-11 bg-green-500 hover:bg-green-600 text-white"
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
