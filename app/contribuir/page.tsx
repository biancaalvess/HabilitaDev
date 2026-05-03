"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Send, Trash2, Menu, Filter } from "lucide-react";
import Image from "next/image";
import type { Question } from "@/lib/api";
import { formatModerationAlertText } from "@/lib/moderation-feedback";
import { CATEGORY_LABELS } from "@/lib/types";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
const MIN_OPTIONS = 4;
const MAX_OPTIONS = OPTION_LETTERS.length;

function buildDescriptionWithAlternatives(
  description: string,
  optionTexts: string[]
): string {
  const trimmed = description.trim();
  const pairs = optionTexts
    .map((text, i) => ({
      letter: OPTION_LETTERS[i] ?? String(i + 1),
      text: text.trim(),
    }))
    .filter((p) => p.text.length > 0);
  if (pairs.length === 0) return trimmed;
  const block =
    "\n\n---\n**Alternativas**\n\n" +
    pairs.map((p) => `**${p.letter})** ${p.text}`).join("\n\n");
  return `${trimmed}${block}`;
}

export default function ContribuirPage() {
  const [formData, setFormData] = useState({
    nome: "",
    titulo: "",
    questao: "",
    resposta: "",
    nivel: "",
    categoria: "",
    fonte: "",
    referencia: "",
    isOriginal: false,
    isAI: false,
  });

  const [alternativasAtivas, setAlternativasAtivas] = useState(false);
  const [alternativas, setAlternativas] = useState<string[]>(() =>
    Array(MIN_OPTIONS).fill("")
  );

  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategorySelect = (category: string | undefined) => {
    setSelectedCategory(category);
    setFormData((prev) => ({
      ...prev,
      categoria: category ?? "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (
      !formData.nome ||
      !formData.titulo ||
      !formData.questao ||
      !formData.resposta ||
      !formData.nivel ||
      !formData.categoria
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!formData.isOriginal && !formData.isAI && !formData.referencia) {
      alert(
        "Por favor, forneça a referência da questão, marque como original ou como criada por IA."
      );
      return;
    }

    try {
      // Enviar para API real
      const { apiService } = await import("@/lib/api");

      // Preparar dados da questão - apenas os campos necessários: nome, título, questão, resposta, nível, categoria, fonte
      // Nota: email não é armazenado, apenas nome, título, questão, resposta, nível, categoria e fonte
      const descriptionFinal = alternativasAtivas
        ? buildDescriptionWithAlternatives(formData.questao, alternativas)
        : formData.questao.trim();

      const questionData: Omit<Question, "id" | "created_at"> = {
        title: formData.titulo,
        description: descriptionFinal,
        answer: formData.resposta,
        difficulty: formData.nivel as Question["difficulty"],
        category: formData.categoria as Question["category"],
        company: formData.fonte || undefined,
        tags: formData.referencia ? [formData.referencia] : [],
        author_name: formData.nome || undefined,
      };

      // Log dos dados sendo enviados (apenas em desenvolvimento)
      if (process.env.NODE_ENV === "development") {
        console.log(
          "📤 Enviando questão:",
          JSON.stringify(questionData, null, 2)
        );
      }

      const result = await apiService.createQuestion(questionData);

      if (result.success) {
        const created = result.data as Question;
        const moderationText = formatModerationAlertText(created);
        alert(
          `${moderationText}\n\nObrigada pela contribuição!`
        );

        // Lista pública só mostra questões já visíveis; o refetch ajuda quem estiver noutro separador.
        window.dispatchEvent(new CustomEvent("question-created"));

        // Limpar formulário após sucesso
        setFormData({
          nome: "",
          titulo: "",
          questao: "",
          resposta: "",
          nivel: "",
          categoria: "",
          fonte: "",
          referencia: "",
          isOriginal: false,
          isAI: false,
        });
        setAlternativasAtivas(false);
        setAlternativas(Array(MIN_OPTIONS).fill(""));
      } else {
        const errorMsg =
          result.message || "Erro ao enviar questão. Tente novamente.";
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Erro ao enviar questão:", error);
      // Extrair mensagem de erro mais específica
      let errorMessage = "Erro ao enviar questão. Tente novamente.";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
        // Se a mensagem contém detalhes, mostrar
        if (errorMessage.includes("Detalhes:")) {
          console.error("📋 Detalhes do erro:", errorMessage);
        }
      }
      alert(errorMessage);
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
            onCategorySelect={handleCategorySelect}
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
                    onCategorySelect={handleCategorySelect}
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
                onClick={() => handleCategorySelect(undefined)}
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
                    Contribuir com Questão
                  </h1>
                </div>
                <p className="text-blue-300/80 text-lg mb-4">
                  Ajude a comunidade compartilhando suas questões técnicas e
                  soluções.
                </p>
                <div className="space-y-2 rounded-lg border border-blue-400/30 bg-blue-500/10 p-4">
                  <p className="text-sm text-blue-200">
                    Após o envio, a questão fica{" "}
                    <strong className="text-blue-100">pendente</strong> até a
                    moderação automática (IA) avaliar conteúdo técnico, coerência
                    e spam. Em geral leva apenas alguns segundos.
                  </p>
                  <p className="text-xs text-blue-300/80">
                    Se for aprovada, passa a{" "}
                    <strong className="text-blue-200/90">visível</strong> na
                    lista pública. Se for reprovada, pode não aparecer ou ficar
                    para revisão humana, conforme a configuração do servidor.
                  </p>
                </div>
              </div>

              {/* Form */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white text-xl">
                    Nova Questão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações Pessoais */}
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
                        placeholder="Seu nome"
                        className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60"
                        required
                      />
                    </div>

                    {/* Título */}
                    <div className="space-y-2">
                      <Label htmlFor="titulo" className="text-white">
                        Título da Questão *
                      </Label>
                      <Input
                        id="titulo"
                        value={formData.titulo}
                        onChange={(e) =>
                          handleInputChange("titulo", e.target.value)
                        }
                        placeholder="Ex: Implementar uma função de busca binária"
                        className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60"
                        required
                      />
                    </div>

                    {/* Questão */}
                    <div className="space-y-2">
                      <Label htmlFor="questao" className="text-white">
                        Descrição da Questão *
                      </Label>
                      <Textarea
                        id="questao"
                        value={formData.questao}
                        onChange={(e) =>
                          handleInputChange("questao", e.target.value)
                        }
                        placeholder="Descreva a questão técnica..."
                        className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-3 rounded-lg border border-blue-400/20 bg-slate-900/40 p-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="alternativasAtivas"
                          checked={alternativasAtivas}
                          onCheckedChange={(checked) => {
                            const on = Boolean(checked);
                            setAlternativasAtivas(on);
                            if (!on) {
                              setAlternativas(Array(MIN_OPTIONS).fill(""));
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor="alternativasAtivas"
                            className="cursor-pointer text-white text-sm font-medium leading-tight"
                          >
                            Incluir alternativas (A, B, C, D…) — opcional
                          </Label>
                          <p className="text-xs text-blue-200/70">
                            Útil para múltipla escolha. As alternativas são
                            anexadas à descrição ao enviar. Indique qual é a
                            correta na resposta abaixo.
                          </p>
                        </div>
                      </div>

                      {alternativasAtivas ? (
                        <div className="space-y-3 pl-6">
                          {alternativas.map((text, index) => (
                            <div key={index} className="space-y-1.5">
                              <Label
                                htmlFor={`alt-${index}`}
                                className="text-xs text-white/80"
                              >
                                Alternativa {OPTION_LETTERS[index]}
                              </Label>
                              <Input
                                id={`alt-${index}`}
                                value={text}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setAlternativas((prev) => {
                                    const next = [...prev];
                                    next[index] = v;
                                    return next;
                                  });
                                }}
                                placeholder={`Texto da opção ${OPTION_LETTERS[index]} (deixe vazio para omitir)`}
                                className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/50"
                              />
                            </div>
                          ))}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {alternativas.length < MAX_OPTIONS ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border-blue-400/40 bg-slate-800/60 text-white hover:bg-slate-700/80"
                                onClick={() =>
                                  setAlternativas((prev) => [...prev, ""])
                                }
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Alternativa{" "}
                                {OPTION_LETTERS[alternativas.length] ?? ""}
                              </Button>
                            ) : null}
                            {alternativas.length > MIN_OPTIONS ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-white/70 hover:bg-white/10 hover:text-white"
                                onClick={() =>
                                  setAlternativas((prev) =>
                                    prev.slice(0, -1)
                                  )
                                }
                              >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Remover última
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Resposta */}
                    <div className="space-y-2">
                      <Label htmlFor="resposta" className="text-white">
                        Resposta/Solução *
                      </Label>
                      <Textarea
                        id="resposta"
                        value={formData.resposta}
                        onChange={(e) =>
                          handleInputChange("resposta", e.target.value)
                        }
                        placeholder="Descreva a solução ou resposta esperada..."
                        className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60 min-h-[120px]"
                        required
                      />
                    </div>

                    {/* Nível + Categoria (Select no formulário; «Categorias» na lateral abre /questoes) */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="nivel" className="text-white">
                          Nível de Dificuldade *
                        </Label>
                        <Select
                          value={formData.nivel || undefined}
                          onValueChange={(value) =>
                            handleInputChange("nivel", value)
                          }
                        >
                          <SelectTrigger
                            id="nivel"
                            className="h-auto min-h-9 w-full bg-slate-700/50 border-blue-400/30 text-white"
                          >
                            <SelectValue placeholder="Selecione o nível" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Fácil</SelectItem>
                            <SelectItem value="medium">Médio</SelectItem>
                            <SelectItem value="hard">Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria" className="text-white">
                          Categoria da questão *
                        </Label>
                        <Select
                          value={formData.categoria || undefined}
                          onValueChange={(value) => {
                            handleInputChange("categoria", value);
                            setSelectedCategory(value);
                          }}
                        >
                          <SelectTrigger
                            id="categoria"
                            className="h-auto min-h-9 w-full bg-slate-700/50 border-blue-400/30 text-white"
                          >
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(CATEGORY_LABELS) as [
                                keyof typeof CATEGORY_LABELS,
                                string,
                              ][]
                            ).map(([id, name]) => (
                              <SelectItem key={id} value={id}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-white/45">
                          Os botões «Categorias» na lateral levam à página de
                          questões filtrada; escolha a categoria da sua submissão
                          aqui.
                        </p>
                      </div>
                    </div>

                    {/* Fonte */}
                    <div className="space-y-2">
                      <Label htmlFor="fonte" className="text-white">
                        Fonte da Questão
                      </Label>
                      <Input
                        id="fonte"
                        value={formData.fonte}
                        onChange={(e) =>
                          handleInputChange("fonte", e.target.value)
                        }
                        placeholder="Ex: LeetCode, HackerRank, etc."
                        className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60"
                      />
                    </div>

                    {/* Checkboxes para tipo de questão */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isOriginal"
                          checked={formData.isOriginal}
                          onCheckedChange={(checked) =>
                            handleInputChange("isOriginal", checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="isOriginal"
                          className="text-white text-sm"
                        >
                          Esta é uma questão original criada por você
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isAI"
                          checked={formData.isAI}
                          onCheckedChange={(checked) =>
                            handleInputChange("isAI", checked as boolean)
                          }
                        />
                        <Label htmlFor="isAI" className="text-white text-sm">
                          Esta questão foi criada por IA (ChatGPT, Claude, etc.)
                        </Label>
                      </div>
                    </div>

                    {/* Referência (se não for original nem IA) */}
                    {!formData.isOriginal && !formData.isAI && (
                      <div className="space-y-2">
                        <Label htmlFor="referencia" className="text-white">
                          Referência/Link *
                        </Label>
                        <Input
                          id="referencia"
                          value={formData.referencia}
                          onChange={(e) =>
                            handleInputChange("referencia", e.target.value)
                          }
                          placeholder="Link para a fonte original da questão"
                          className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60"
                          required={!formData.isOriginal && !formData.isAI}
                        />
                      </div>
                    )}

                    {/* Botão de Envio */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-2"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Questão
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
