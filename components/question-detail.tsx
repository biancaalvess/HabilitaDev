"use client";

import {
  ArrowLeft,
  Clock,
  Building2,
  Tag,
  MessageSquare,
  Copy,
  Check,
  Code,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FeedbackForm } from "./feedback/feedback-form";
import { FeedbackList } from "./feedback/feedback-list";
import { AnswerForm } from "./answers/answer-form";
import { AnswerList } from "./answers/answer-list";
import { CommentForm } from "./comments/comment-form";
import { CommentList } from "./comments/comment-list";
import { type Question, DIFFICULTY_COLORS, CATEGORY_LABELS } from "@/lib/types";

interface QuestionDetailProps {
  question: Question;
  onBack: () => void;
}

export function QuestionDetail({ question, onBack }: QuestionDetailProps) {
  const [copied, setCopied] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(question.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às questões
        </Button>

        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-balance">{question.title}</h1>
          <Badge
            variant="outline"
            className={`${
              DIFFICULTY_COLORS[question.difficulty]
            } capitalize shrink-0`}
          >
            {question.difficulty}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {formatDate(question.created_at)}
          </div>

          <Badge variant="secondary">
            <Tag className="w-3 h-3 mr-1" />
            {CATEGORY_LABELS[question.category]}
          </Badge>

          {question.company && (
            <Badge variant="outline">
              <Building2 className="w-3 h-3 mr-1" />
              {question.company}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Descrição do Problema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {question.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Solução
              </CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap text-foreground">
                {question.answer}
              </pre>
            </div>
          </CardContent>
        </Card>

        {question.tags && question.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        <AnswerList questionId={question.id} />

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setShowAnswerForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Code className="h-4 w-4 mr-2" />
            Responder Questão
          </Button>
          <Button onClick={() => setShowCommentForm(true)} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentar
          </Button>
        </div>

        <Separator />

        <CommentList questionId={question.id} />

        <div className="flex justify-center">
          <Button onClick={() => setShowFeedbackForm(true)} variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Enviar Feedback
          </Button>
        </div>
      </div>

      <AnswerForm
        questionId={question.id}
        isOpen={showAnswerForm}
        onClose={() => setShowAnswerForm(false)}
      />
      <CommentForm
        questionId={question.id}
        isOpen={showCommentForm}
        onClose={() => setShowCommentForm(false)}
      />
      <FeedbackForm
        questionId={question.id}
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
      />
    </div>
  );
}
