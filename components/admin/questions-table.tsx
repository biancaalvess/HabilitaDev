"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Check, X } from "lucide-react";
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
// import { mockQuestions } from "@/lib/mock-data" // Removido - usando dados da API
import { DIFFICULTY_COLORS, CATEGORY_LABELS } from "@/lib/types";

export function QuestionsTable() {
  // Mock questions - em produção, implementar API real
  const [questions, setQuestions] = useState<any[]>([]);

  const handleApprove = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, approved: true } : q))
    );
  };

  const handleReject = (id: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, approved: false } : q))
    );
  };

  const handleDelete = (id: number) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Questões</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Dificuldade</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate">{question.title}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {CATEGORY_LABELS[question.category]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${
                      DIFFICULTY_COLORS[question.difficulty]
                    } text-xs capitalize`}
                  >
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>{question.company || "-"}</TableCell>
                <TableCell>
                  {question.approved ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                      Aprovada
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                      Pendente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(question.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!question.approved && (
                        <DropdownMenuItem
                          onClick={() => handleApprove(question.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Aprovar
                        </DropdownMenuItem>
                      )}
                      {question.approved && (
                        <DropdownMenuItem
                          onClick={() => handleReject(question.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Rejeitar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(question.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
