"use client";

import type React from "react";
import { useState } from "react";
import styled from "styled-components";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  AlertCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

        <StyledWrapper>
          {success ? (
            <Alert className="border-green-500/20 bg-green-500/10">
              <AlertDescription className="text-green-400">
                Comentário enviado com sucesso! Obrigado pela contribuição.
              </AlertDescription>
            </Alert>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 mb-4">
                  <AlertDescription className="text-red-400 font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <p className="title">Deixar Comentário</p>
              <p className="message">Compartilhe sua correção ou sugestão para ajudar a melhorar esta questão.</p>

              <label>
                <input
                  required
                  placeholder=" "
                  type="text"
                  className="input"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  disabled={loading}
                />
                <span>Seu Nome</span>
              </label>

              <div className="select-wrapper">
                <select
                  value={commentType}
                  onChange={(e) => setCommentType(e.target.value as Comment["comment_type"])}
                  disabled={loading}
                  className="select-input"
                  required
                >
                  <option value="">Selecione o tipo...</option>
                  {Object.entries(commentTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label} - {commentTypeDescriptions[key as keyof typeof commentTypeDescriptions]}
                    </option>
                  ))}
                </select>
                <span className="select-label">Tipo de Comentário</span>
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
                <span>Comentário</span>
                <div className="char-count">{content.length}/500 caracteres</div>
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
    color: #3b82f6;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    margin: 0 0 10px 0;
  }

  .title::before,.title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: #3b82f6;
  }

  .title::before {
    width: 18px;
    height: 18px;
    background-color: #3b82f6;
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
    border-color: #3b82f6;
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

  .form label .input:focus + span,.form label .input:valid + span {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
    color: #3b82f6;
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
    border-color: #3b82f6;
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
    color: #3b82f6;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .submit {
    border: none;
    outline: none;
    background-color: #3b82f6;
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
    background-color: #2563eb;
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
    
    .submit, .cancel-btn {
      width: 100%;
    }
  }
`;
