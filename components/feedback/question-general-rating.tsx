"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { encodeRatingContent } from "@/lib/feedback-rating";
import { cn } from "@/lib/utils";

const STORAGE_KEY = (questionId: number) => `hbd-q-rating-sent-${questionId}`;

interface QuestionGeneralRatingProps {
  questionId: number;
}

export function QuestionGeneralRating({ questionId }: QuestionGeneralRatingProps) {
  const [mounted, setMounted] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setMounted(true);
    try {
      if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY(questionId)) === "1") {
        setAlreadySent(true);
      }
    } catch {
      /* private mode */
    }
  }, [questionId]);

  const display = hover || stars;

  const submit = async () => {
    setMsg("");
    if (stars < 1 || stars > 5) {
      setMsg("Escolhe de 1 a 5 estrelas.");
      return;
    }
    setLoading(true);
    try {
      const { apiService } = await import("@/lib/api");
      const content = encodeRatingContent(stars, comment);
      const result = await apiService.createFeedback(questionId, {
        feedback_type: "improvement",
        content,
        status: "pending",
      });
      if (result.success) {
        try {
          localStorage.setItem(STORAGE_KEY(questionId), "1");
        } catch {
          /* ignore */
        }
        setAlreadySent(true);
        window.dispatchEvent(new CustomEvent("feedback-created"));
        setMsg("Obrigado — a tua avaliação foi registada.");
      } else {
        setMsg("Não foi possível enviar. Tenta de novo.");
      }
    } catch {
      setMsg("Erro de rede. Tenta de novo.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (alreadySent) {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            Avaliação geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Já recebemos a tua avaliação desta questão. Obrigado por ajudares a
            comunidade.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/25 bg-gradient-to-br from-amber-500/5 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-5 w-5 text-amber-400" />
          Avaliar esta questão
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quão útil achaste o enunciado e o formato? A nota é pública na secção
          de feedbacks (estrelas).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Estrelas (obrigatório)</Label>
          <div
            className="flex flex-wrap items-center gap-1"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onClick={() => setStars(n)}
                className="rounded-md p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80"
                aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-10 w-10 sm:h-11 sm:w-11",
                    n <= display
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/35"
                  )}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground tabular-nums">
              {stars > 0 ? `${stars}/5` : "—"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating-comment" className="text-sm">
            Comentário opcional
          </Label>
          <Textarea
            id="rating-comment"
            rows={3}
            maxLength={500}
            placeholder="Ex.: enunciado claro, gostei do contexto…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={loading}
            className="resize-none bg-muted/40"
          />
        </div>

        {msg ? (
          <p className="text-sm text-green-600 dark:text-green-400">{msg}</p>
        ) : null}

        <Button
          type="button"
          onClick={() => void submit()}
          disabled={loading || stars < 1}
          className="bg-amber-600 text-white hover:bg-amber-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              A enviar…
            </>
          ) : (
            "Enviar avaliação"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
