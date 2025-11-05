"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Eye, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DIFFICULTY_COLORS, CATEGORY_LABELS, Question } from "@/lib/types";

export function QuestionsTable() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pending-questions");
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.data || []);
      } else {
        setError(data.error?.message || "Erro ao carregar questões");
      }
    } catch (err) {
      setError("Erro ao carregar questões");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/proxy/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      
      if (response.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert("Erro ao aprovar questão");
      }
    } catch (err) {
      alert("Erro ao aprovar questão");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`/api/proxy/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: false }),
      });
      
      if (response.ok) {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, approved: false } : q)));
      } else {
        alert("Erro ao rejeitar questão");
      }
    } catch (err) {
      alert("Erro ao rejeitar questão");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) return;
    
    try {
      const response = await fetch(`/api/proxy/questions/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert("Erro ao excluir questão");
      }
    } catch (err) {
      alert("Erro ao excluir questão");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando questões...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Questões</CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma questão pendente
          </p>
        ) : (
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
                    {CATEGORY_LABELS[question.category as keyof typeof CATEGORY_LABELS]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${
                      DIFFICULTY_COLORS[question.difficulty as keyof typeof DIFFICULTY_COLORS]
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
        )}
      </CardContent>
    </Card>
  );
}
