"use client";

import type React from "react";
import { useState } from "react";
import styled from "styled-components";
import { MessageSquare, Send, Loader2 } from "lucide-react";
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

        <StyledWrapper>
          {success ? (
            <Alert className="border-green-500/20 bg-green-500/10">
              <AlertDescription className="text-green-400">
                Feedback enviado com sucesso! Obrigado pela contribuição.
              </AlertDescription>
            </Alert>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-500/20 bg-red-500/10 mb-4"
                >
                  <AlertDescription className="text-red-400 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <p className="title">Enviar Feedback</p>
              <p className="message">
                Ajude-nos a melhorar esta questão com seu feedback. Sua
                contribuição é valiosa para a comunidade.
              </p>

              <div className="select-wrapper">
                <select
                  value={feedbackType}
                  onChange={(e) =>
                    setFeedbackType(e.target.value as Feedback["feedback_type"])
                  }
                  disabled={loading}
                  className="select-input"
                  required
                >
                  <option value="">Selecione o tipo...</option>
                  {Object.entries(feedbackTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label} -{" "}
                      {
                        feedbackTypeDescriptions[
                          key as keyof typeof feedbackTypeDescriptions
                        ]
                      }
                    </option>
                  ))}
                </select>
                <span className="select-label">Tipo de Feedback</span>
              </div>

              <label>
                <textarea
                  required
                  placeholder=" "
                  className="input textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  rows={4}
                />
                <span>Conteúdo</span>
                <div className="char-count">
                  {content.length}/500 caracteres
                </div>
              </label>

              <div className="button-group">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="submit"
                  disabled={loading || !feedbackType || !content.trim()}
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
                </button>
              </div>
            </form>
          )}
        </StyledWrapper>
      </DialogContent>
    </Dialog>
  );
}

const StyledWrapper = styled.div`
  .form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-width: 100%;
    background-color: transparent;
    padding: 0;
    border-radius: 20px;
    position: relative;
  }

  .title {
    font-size: 28px;
    color: #10b981;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    margin: 0 0 10px 0;
  }

  .title::before,
  .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: #10b981;
  }

  .title::before {
    width: 18px;
    height: 18px;
    background-color: #10b981;
  }

  .title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
  }

  .message {
    color: rgba(88, 87, 87, 0.822);
    font-size: 14px;
    margin: 0 0 15px 0;
  }

  .form label {
    position: relative;
  }

  .form label .input {
    width: 100%;
    padding: 10px 10px 20px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
    background-color: #fff;
    font-size: 16px;
    transition: border-color 0.3s ease;
  }

  .form label .input:focus {
    border-color: #10b981;
  }

  .form label .textarea {
    resize: none;
    min-height: 100px;
  }

  .form label .input + span {
    position: absolute;
    left: 10px;
    top: 15px;
    color: grey;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
    pointer-events: none;
  }

  .form label .input:placeholder-shown + span {
    top: 15px;
    font-size: 0.9em;
  }

  .form label .input:focus + span,
  .form label .input:valid + span {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
    color: #10b981;
  }

  .form label .input:valid + span {
    color: #10b981;
  }

  .char-count {
    position: absolute;
    bottom: 5px;
    right: 10px;
    font-size: 0.7em;
    color: grey;
    pointer-events: none;
  }

  .select-wrapper {
    position: relative;
  }

  .select-input {
    width: 100%;
    padding: 10px 10px 20px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
    background-color: #fff;
    font-size: 16px;
    transition: border-color 0.3s ease;
    cursor: pointer;
  }

  .select-input:focus {
    border-color: #10b981;
  }

  .select-label {
    position: absolute;
    left: 10px;
    top: 15px;
    color: grey;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
    pointer-events: none;
  }

  .select-input:focus + .select-label,
  .select-input:valid + .select-label {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
    color: #10b981;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .submit {
    border: none;
    outline: none;
    background-color: #10b981;
    padding: 12px 20px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .submit:hover:not(:disabled) {
    background-color: #059669;
  }

  .submit:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  .cancel-btn {
    border: 1px solid rgba(105, 105, 105, 0.397);
    outline: none;
    background-color: transparent;
    padding: 12px 20px;
    border-radius: 10px;
    color: #374151;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex: 1;
  }

  .cancel-btn:hover:not(:disabled) {
    background-color: #f3f4f6;
    border-color: #6b7280;
  }

  .cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }

    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }

  @media (max-width: 640px) {
    .button-group {
      flex-direction: column;
    }

    .submit,
    .cancel-btn {
      width: 100%;
    }
  }
`;
