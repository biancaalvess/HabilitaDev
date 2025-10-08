"use client";

import type React from "react";
import { useState } from "react";
import { Code, Send, Loader2, User, FileText, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AnswerValidation } from "./answer-validation";

interface InlineAnswerFormProps {
  questionId: number;
  correctAnswer?: string;
  onSuccess?: () => void;
}

export function InlineAnswerForm({
  questionId,
  correctAnswer,
  onSuccess,
}: InlineAnswerFormProps) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boardType, setBoardType] = useState<"normal" | "code">("normal");
  const [showValidation, setShowValidation] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");

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

    if (content.trim().length < 10) {
      setError("A resposta deve ter pelo menos 10 caracteres.");
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
        setUserAnswer(content.trim());
        setShowValidation(true);
        setContent("");
        setAuthorName("");
        // Não chamar onSuccess imediatamente, aguardar validação
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

  const handleValidationComplete = (isCorrect: boolean) => {
    if (onSuccess) {
      onSuccess();
    }
    // Manter a validação visível por um tempo antes de mostrar a solução
    setTimeout(() => {
      setShowValidation(false);
      setSuccess(true);
    }, 3000);
  };

  if (showValidation && correctAnswer) {
    return (
      <AnswerValidation
        userAnswer={userAnswer}
        correctAnswer={correctAnswer}
        onValidationComplete={handleValidationComplete}
      />
    );
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
            <Code className="h-6 w-6" />
            <span className="text-lg font-medium">Resposta Enviada!</span>
          </div>
          <p className="text-muted-foreground">
            Obrigado pela sua contribuição. Agora você pode ver a solução
            oficial.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Code className="h-5 w-5" />
          Sua Resposta
        </CardTitle>
        <p className="text-muted-foreground">
          Compartilhe sua solução para esta questão. Use código, explicações
          detalhadas ou qualquer abordagem que considere relevante.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Seletor de Tipo de Lousa */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Escolha o tipo de lousa:
            </Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={boardType === "normal" ? "default" : "outline"}
                onClick={() => setBoardType("normal")}
                className="flex items-center gap-2 px-4 py-2"
              >
                <FileText className="h-4 w-4" />
                Lousa Normal
              </Button>
              <Button
                type="button"
                variant={boardType === "code" ? "default" : "outline"}
                onClick={() => setBoardType("code")}
                className="flex items-center gap-2 px-4 py-2"
              >
                <Terminal className="h-4 w-4" />
                Lousa de Código
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="authorName" className="text-base font-medium">
              Seu Nome
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="authorName"
                placeholder="Ex: Maria Silva"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                disabled={loading}
                className="pl-12 h-12 bg-muted/50 text-base"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="content" className="text-base font-medium">
              Sua Resposta
              {boardType === "code" && " (Lousa de Código)"}
            </Label>

            {boardType === "normal" ? (
              <div className="relative">
                <Textarea
                  id="content"
                  placeholder="Descreva sua solução aqui... Use ``` para blocos de código, explique sua abordagem e complexidade."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  disabled={loading}
                  className="bg-muted/50 resize-none text-base leading-relaxed p-6 min-h-[300px]"
                />
                <div className="absolute bottom-4 right-4 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
                  {content.length}/5000 caracteres
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-black border border-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-300 text-sm ml-2">Terminal</span>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="// Digite seu código aqui...&#10;// Use comentários para explicar sua abordagem&#10;&#10;function minhaSolucao() {&#10;  // Sua implementação aqui&#10;}"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    disabled={loading}
                    className="bg-black text-green-400 font-mono text-sm resize-none p-6 min-h-[350px] border-0 focus-visible:ring-0"
                    style={{
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      lineHeight: "1.6",
                    }}
                  />
                </div>
                <div className="absolute bottom-6 right-6 text-sm text-gray-400 bg-black/80 px-3 py-1 rounded">
                  {content.length}/5000 caracteres
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              type="submit"
              disabled={loading || !authorName.trim() || !content.trim()}
              className="px-8 py-3 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Enviar Resposta
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
