"use client";

import { useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useFeedback } from "@/lib/feedback" // Removido - implementação simplificada
import type { Feedback } from "@/lib/types";

const feedbackTypeIcons = {
  correction: AlertCircle,
  suggestion: Lightbulb,
  improvement: CheckCircle,
};

const feedbackTypeColors = {
  correction: "text-red-400",
  suggestion: "text-yellow-400",
  improvement: "text-green-400",
};

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  implemented: "bg-green-500/10 text-green-400 border-green-500/20",
};

const statusLabels = {
  pending: "Pendente",
  reviewed: "Revisado",
  implemented: "Implementado",
};

export function FeedbackManagement() {
  // Mock feedbacks - em produção, implementar API real
  const feedbacks: Feedback[] = [];
  const [localFeedbacks, setLocalFeedbacks] = useState<Feedback[]>(feedbacks);

  const handleStatusChange = (id: number, newStatus: Feedback["status"]) => {
    setLocalFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Gerenciar Feedbacks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Questão</TableHead>
              <TableHead>Conteúdo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localFeedbacks.map((feedback) => {
              const Icon = feedbackTypeIcons[feedback.feedback_type as keyof typeof feedbackTypeIcons];
              return (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          feedbackTypeColors[feedback.feedback_type as keyof typeof feedbackTypeColors]
                        }`}
                      />
                      <span className="capitalize text-sm">
                        {feedback.feedback_type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    Questão #{feedback.question_id}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-sm">{feedback.content}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${statusColors[feedback.status as keyof typeof statusColors]} text-xs`}
                    >
                      {statusLabels[feedback.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(feedback.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(feedback.id, "pending")
                          }
                        >
                          Pendente
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(feedback.id, "reviewed")
                          }
                        >
                          Revisado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(feedback.id, "implemented")
                          }
                        >
                          Implementado
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
