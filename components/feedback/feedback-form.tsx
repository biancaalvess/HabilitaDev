"use client";

import type React from "react";
import { useState } from "react";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        user_id: user?.id, // Permite feedback anônimo
      });

      if (result.success) {
        setSuccess(true);
        setContent("");
        setFeedbackType("");
        
        // Disparar evento customizado para recarregar feedbacks
        window.dispatchEvent(new CustomEvent('feedback-created'));
        
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
            Ajude-nos a melhorar esta questão com seu feedback. Sua contribuição
            é valiosa para a comunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          {success ? (
            <Alert className="border-green-500/20 bg-green-500/10">
              <AlertDescription className="text-green-400">
                Feedback enviado com sucesso! Obrigado pela contribuição.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/20 bg-red-500/10"
                >
                  <AlertDescription className="text-red-400 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="feedbackType">Tipo de Feedback</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as Feedback["feedback_type"])}
                  disabled={loading}
                  required
                >
                  <SelectTrigger id="feedbackType">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(feedbackTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label} - {feedbackTypeDescriptions[key as keyof typeof feedbackTypeDescriptions]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Digite seu feedback..."
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
                  disabled={loading || !feedbackType || !content.trim()}
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
