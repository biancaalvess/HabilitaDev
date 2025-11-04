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
import { InlineAnswerForm } from "./answers/inline-answer-form";
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
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [userHasAnswered, setUserHasAnswered] = useState(false);

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
    <div className="max-w-4xl mx-auto px-2 sm:px-4">
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-3 sm:mb-4 text-sm sm:text-base">
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Voltar às questões</span>
          <span className="sm:hidden">Voltar</span>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-balance flex-1">{question.title}</h1>
          <Badge
            variant="outline"
            className={`${
              DIFFICULTY_COLORS[question.difficulty]
            } capitalize shrink-0 w-fit`}
          >
            {question.difficulty}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{formatDate(question.created_at)}</span>
            <span className="sm:hidden">{new Date(question.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
          </div>

          <Badge variant="secondary" className="text-xs">
            <Tag className="w-3 h-3 mr-1" />
            {CATEGORY_LABELS[question.category]}
          </Badge>

          {question.company && (
            <Badge variant="outline" className="text-xs">
              <Building2 className="w-3 h-3 mr-1" />
              {question.company}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              Descrição do Problema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                {question.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {userHasAnswered ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Solução
                </CardTitle>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="text-xs sm:text-sm">
                  {copied ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  ) : (
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  )}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap text-foreground break-words">
                  {question.answer}
                </pre>
              </div>
            </CardContent>
          </Card>
        ) : (
          <InlineAnswerForm
            questionId={question.id}
            correctAnswer={question.answer}
            onSuccess={() => setUserHasAnswered(true)}
          />
        )}

        {Array.isArray(question.tags) && question.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(question.tags) && question.tags.length > 0 ? (
                  question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    Sem tags
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        <AnswerList questionId={question.id} />

        <div className="flex justify-center gap-2 sm:gap-3">
          <Button onClick={() => setShowCommentForm(true)} variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentar
          </Button>
        </div>

        <Separator />

        <CommentList questionId={question.id} />

        <div className="flex justify-center">
          <Button onClick={() => setShowFeedbackForm(true)} variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
            <MessageSquare className="h-4 w-4 mr-2" />
            Enviar Feedback
          </Button>
        </div>
      </div>

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
