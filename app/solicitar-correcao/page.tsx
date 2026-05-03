"use client";

import { useState, useEffect } from "react";
import { QuestoesHeader } from "@/components/questoes-header";
import { QuestoesSidebar } from "@/components/questoes-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertCircle, Trash2, Loader2, Menu, Filter } from "lucide-react";
import Image from "next/image";
import { apiService } from "@/lib/api";
import type { CorrectionRequestResponse } from "@/lib/api";
import type { Question } from "@/lib/types";

export default function SolicitarCorrecaoPage() {
  const [formData, setFormData] = useState({
    questionId: "",
    tipoSolicitacao: "",
    motivo: "",
    nome: "",
    email: "",
  });

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [correctionMeta, setCorrectionMeta] =
    useState<CorrectionRequestResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const buscarQuestao = async () => {
    if (!formData.questionId.trim()) {
      setError("Por favor, informe o ID da questão.");
      return;
    }

    const questionId = parseInt(formData.questionId);
    if (isNaN(questionId) || questionId <= 0) {
      setError("ID da questão inválido. Por favor, informe um número válido.");
      return;
    }

    setLoadingQuestion(true);
    setError("");
    setQuestion(null);

    try {
      const result = await apiService.getQuestion(questionId);
      if (result.success && result.data) {
        setQuestion(result.data);
      } else {
        setError("Questão não encontrada. Verifique o ID informado.");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao buscar questão.";
      setError(msg);
      console.error("Erro ao buscar questão:", err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validações
    if (!formData.questionId.trim()) {
      setError("Por favor, informe o ID da questão.");
      return;
    }

    const questionId = parseInt(formData.questionId);
    if (isNaN(questionId) || questionId <= 0) {
      setError("ID da questão inválido.");
      return;
    }

    if (!formData.tipoSolicitacao) {
      setError("Por favor, selecione o tipo de solicitação.");
      return;
    }

    if (!formData.nome.trim()) {
      setError("Por favor, informe o seu nome.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Por favor, informe o seu e-mail.");
      return;
    }

    if (!formData.motivo.trim()) {
      setError("Por favor, informe o motivo/justificativa para a solicitação.");
      return;
    }

    if (formData.motivo.trim().length < 20) {
      setError("O motivo/justificativa deve ter pelo menos 20 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const tipoLabel =
        formData.tipoSolicitacao === "exclusao" ? "Exclusão" : "Correção";
      const subject = question
        ? `${tipoLabel} — «${question.title.slice(0, 120)}» (#${questionId})`
        : `${tipoLabel} — questão #${questionId}`;

      const result = await apiService.createCorrectionRequest({
        question_id: questionId,
        name: formData.nome.trim(),
        email: formData.email.trim(),
        subject,
        message: formData.motivo.trim(),
      });

      if (result.success) {
        setCorrectionMeta(result.data ?? null);
        setSuccess(true);
        setFormData({
          questionId: "",
          tipoSolicitacao: "",
          motivo: "",
          nome: "",
          email: "",
        });
        setQuestion(null);

        setTimeout(() => {
          setSuccess(false);
          setCorrectionMeta(null);
        }, 12000);
      } else {
        setError(result.message || "Erro ao enviar solicitação. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao enviar solicitação:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao enviar solicitação. Tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 md:h-dvh md:max-h-dvh md:overflow-hidden">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      {/* Floating Elements */}
      <div className="pointer-events-none absolute top-20 left-10 z-0 h-2 w-2 rounded-full bg-blue-400 opacity-60 animate-pulse" />
      <div className="pointer-events-none absolute top-40 right-20 z-0 h-1 w-1 rounded-full bg-white opacity-40 animate-ping" />
      <div className="pointer-events-none absolute bottom-40 left-20 z-0 h-2 w-2 rounded-full bg-blue-300 opacity-50 animate-pulse" />
      <div className="pointer-events-none absolute bottom-20 right-10 z-0 h-1 w-1 rounded-full bg-white opacity-30 animate-ping" />

      <div className="relative z-20 flex min-h-0 flex-1 flex-col md:flex-row md:overflow-hidden">
        <div className="hidden h-full min-h-0 shrink-0 overflow-hidden md:flex md:max-h-dvh">
          <QuestoesSidebar
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            isMinimized={isSidebarMinimized}
            onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
          />
        </div>

        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden md:w-auto">
          <QuestoesHeader />

          <div className="flex items-center justify-between px-4 pt-4 md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-400/20 bg-slate-800/50 text-white"
                >
                  <Menu className="mr-2 h-4 w-4" />
                  <Filter className="mr-2 h-4 w-4" />
                  Categorias
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-blue-400/20 bg-slate-900/95 p-0 backdrop-blur-sm"
              >
                <SheetHeader className="border-b border-blue-400/20 p-6 pb-4">
                  <SheetTitle className="text-lg text-white">
                    Categorias
                  </SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto">
                  <QuestoesSidebar
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                    onCategoryNavigate={() => setMobileMenuOpen(false)}
                    isMinimized={false}
                    onToggleMinimize={() => {}}
                  />
                </div>
              </SheetContent>
            </Sheet>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                className="text-white/80 hover:text-white"
              >
                Limpar filtro
              </Button>
            )}
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src="/icon.png"
                    alt="HabilitaDev"
                    width={32}
                    height={32}
                    className="rounded"
                  />
                  <h1 className="text-3xl font-bold text-white">
                    Solicitar Correção ou Exclusão
                  </h1>
                </div>
                <p className="text-blue-300/80 text-lg mb-4">
                  Solicite a correção de erros ou a exclusão de questões
                  inadequadas. Sua justificativa é obrigatória.
                </p>
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    Em até 48h sua solicitação será analisada pela equipe.
                    Obrigado pela contribuição!
                  </p>
                </div>
              </div>

              {/* Form */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">
                    Nova Solicitação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ID da Questão */}
                    <div className="space-y-2">
                      <Label htmlFor="questionId" className="text-white">
                        ID da Questão *
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="questionId"
                          type="number"
                          value={formData.questionId}
                          onChange={(e) =>
                            handleInputChange("questionId", e.target.value)
                          }
                          placeholder="Ex: 123"
                          className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60"
                          required
                          min="1"
                        />
                        <Button
                          type="button"
                          onClick={buscarQuestao}
                          disabled={loadingQuestion || !formData.questionId.trim()}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          {loadingQuestion ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Buscar"
                          )}
                        </Button>
                      </div>
                      {question && (
                        <div className="mt-2 p-3 bg-slate-700/30 rounded border border-blue-400/20">
                          <p className="text-sm text-blue-200">
                            <strong>Questão encontrada:</strong> {question.title}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Tipo de Solicitação */}
                    <div className="space-y-2">
                      <Label htmlFor="tipoSolicitacao" className="text-white">
                        Tipo de Solicitação *
                      </Label>
                      <Select
                        value={formData.tipoSolicitacao}
                        onValueChange={(value) =>
                          handleInputChange("tipoSolicitacao", value)
                        }
                      >
                        <SelectTrigger className="bg-slate-700/50 border-blue-400/30 text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="correction">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-400" />
                              <span>Correção</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="exclusao">
                            <div className="flex items-center gap-2">
                              <Trash2 className="h-4 w-4 text-red-400" />
                              <span>Exclusão</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-white">
                        Nome *
                      </Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) =>
                          handleInputChange("nome", e.target.value)
                        }
                        placeholder="O seu nome"
                        className="border-blue-400/30 bg-slate-700/50 text-white placeholder:text-white/60"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="email@exemplo.com"
                        className="border-blue-400/30 bg-slate-700/50 text-white placeholder:text-white/60"
                        required
                      />
                    </div>

                    {/* Motivo/Justificativa */}
                    <div className="space-y-2">
                      <Label htmlFor="motivo" className="text-white">
                        Motivo/Justificativa *
                      </Label>
                      <Textarea
                        id="motivo"
                        value={formData.motivo}
                        onChange={(e) =>
                          handleInputChange("motivo", e.target.value)
                        }
                        placeholder="Descreva detalhadamente o motivo da sua solicitação. Seja específico e claro sobre o problema encontrado..."
                        className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60 min-h-[150px]"
                        required
                        minLength={20}
                      />
                      <p className="text-xs text-blue-300/60">
                        Mínimo de 20 caracteres. Seja detalhado para facilitar a
                        análise.
                      </p>
                      <p className="text-xs text-blue-300/60">
                        {formData.motivo.length}/500 caracteres
                      </p>
                    </div>

                    {/* Mensagens de Erro/Sucesso */}
                    {error && (
                      <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-red-400">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="border-green-500/20 bg-green-500/10">
                        <AlertDescription className="space-y-2 text-green-400">
                          <p>
                            Solicitação enviada com sucesso. A equipa irá
                            analisar o pedido.
                          </p>
                          {correctionMeta?.ai_resumo && (
                            <p className="text-sm text-green-300/90">
                              <strong>Resumo (IA):</strong>{" "}
                              {String(correctionMeta.ai_resumo)}
                            </p>
                          )}
                          {correctionMeta?.ai_prioridade && (
                            <p className="text-xs text-green-300/70">
                              Prioridade:{" "}
                              {String(correctionMeta.ai_prioridade)}
                            </p>
                          )}
                          {correctionMeta?.contact && (
                            <p className="text-xs text-green-300/70">
                              Contacto: {String(correctionMeta.contact)}
                            </p>
                          )}
                          {correctionMeta?.ai_notas_para_equipa && (
                            <p className="text-xs text-green-200/80">
                              Notas internas:{" "}
                              {String(correctionMeta.ai_notas_para_equipa)}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Botão de Envio */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={
                          loading ||
                          !formData.questionId ||
                          !formData.tipoSolicitacao ||
                          !formData.nome.trim() ||
                          !formData.email.trim() ||
                          !formData.motivo.trim() ||
                          formData.motivo.trim().length < 20
                        }
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Solicitação
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

