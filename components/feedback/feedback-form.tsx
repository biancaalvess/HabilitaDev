"use client";

import type React from "react";
import { useState } from "react";
import { MessageSquare, Send, Loader2, Star } from "lucide-react";
import { encodeRatingContent } from "@/lib/feedback-rating";
import { cn } from "@/lib/utils";
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
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!feedbackType) {
      setError("Selecione o tipo de feedback.");
      return;
    }

    const text = content.trim();
    if (stars < 1 && text.length < 10) {
      setError(
        "Escreva pelo menos 10 caracteres no feedback ou escolha uma nota de 1 a 5 estrelas."
      );
      return;
    }

    const payloadContent =
      stars >= 1 ? encodeRatingContent(stars, text) : text;

    setLoading(true);
    try {
      const { apiService } = await import("@/lib/api");

      const result = await apiService.createFeedback(questionId, {
        feedback_type: feedbackType as any,
        content: payloadContent,
        status: "pending" as any,
      });

      if (result.success) {
        setSuccess(true);
        setContent("");
        setStars(0);
        setHoverStar(0);
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
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao enviar feedback. Tente novamente."
      );
      console.error("Error sending feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent("");
      setStars(0);
      setHoverStar(0);
      setFeedbackType("");
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  const starDisplay = hoverStar || stars;
  const canSubmit =
    Boolean(feedbackType) &&
    (stars >= 1 || content.trim().length >= 10);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-md gap-0 overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="space-y-1.5 pb-3 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold leading-tight">
            <div className="rounded-md bg-green-500/10 p-1">
              <MessageSquare className="h-4 w-4 text-green-500" />
            </div>
            Enviar Feedback
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug text-muted-foreground sm:text-sm">
            Ajude-nos a melhorar esta questão. Sua contribuição é valiosa para a
            comunidade.
          </DialogDescription>
        </DialogHeader>

        <div className="w-full">
          {success ? (
            <Alert className="border-green-500/20 bg-green-500/10 py-2">
              <AlertDescription className="text-sm text-green-400">
                Feedback enviado com sucesso! Obrigado pela contribuição.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/20 bg-red-500/10 py-2"
                >
                  <AlertDescription className="text-sm font-medium text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="feedbackType" className="text-sm">
                  Tipo de Feedback
                </Label>
                <Select
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as Feedback["feedback_type"])}
                  disabled={loading}
                  required
                >
                  <SelectTrigger id="feedbackType" className="h-9 text-sm">
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

              <div className="space-y-1">
                <Label className="text-sm font-medium leading-tight">
                  Estrelas{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional, média da questão)
                  </span>
                </Label>
                <div
                  className="inline-flex max-w-full flex-wrap items-center gap-0.5"
                  onMouseLeave={() => setHoverStar(0)}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHoverStar(n)}
                      onClick={() => setStars(n)}
                      disabled={loading}
                      className="rounded p-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/60 disabled:opacity-50"
                      aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
                    >
                      <Star
                        className={cn(
                          "h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]",
                          n <= starDisplay
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/35"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground tabular-nums">
                    {stars > 0 ? `${stars}/5` : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-sm">
                  Conteúdo
                </Label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Digite seu feedback..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    rows={3}
                    required
                    maxLength={500}
                    className="min-h-[4.5rem] resize-none pr-14 text-sm"
                  />
                  <div className="absolute bottom-1.5 right-2 text-[10px] text-muted-foreground">
                    {content.length}/500
                  </div>
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {stars >= 1
                    ? "Com estrelas o texto pode ser curto; sem estrelas, mín. 10 caracteres."
                    : "Mín. 10 caracteres, salvo se marcar estrelas."}
                </p>
              </div>

              <div className="flex gap-2 pt-1 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={loading}
                  className="h-9 flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || !canSubmit}
                  className="h-9 flex-1"
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
