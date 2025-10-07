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
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Code } from "lucide-react";

const CATEGORIAS = [
  { id: "algorithms", name: "Algoritmos" },
  { id: "data_structures", name: "Estruturas de Dados" },
  { id: "system_design", name: "Design de Sistema" },
  { id: "databases", name: "Bancos de Dados" },
  { id: "frontend", name: "Frontend" },
  { id: "backend", name: "Backend" },
  { id: "devops", name: "DevOps" },
];

export default function ContribuirPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    questao: "",
    resposta: "",
    nivel: "",
    categoria: "",
    fonte: "",
    referencia: "",
    isOriginal: false,
    isAI: false,
  });

  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (
      !formData.nome ||
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
      // Simular envio para API (substitua pela sua lógica real)
      const questionData = {
        ...formData,
        id: Date.now(), // ID temporário
        createdAt: new Date().toISOString(),
        status: "pending", // Status de aprovação
      };

      // Simular delay de envio
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Questão enviada:", questionData);

      // Feedback de sucesso
      alert(
        "Questão enviada com sucesso! Obrigado pela contribuição. Ela será revisada antes de ser publicada."
      );

      // Limpar formulário
      setFormData({
        nome: "",
        email: "",
        questao: "",
        resposta: "",
        nivel: "",
        categoria: "",
        fonte: "",
        referencia: "",
        isOriginal: false,
        isAI: false,
      });
    } catch (error) {
      console.error("Erro ao enviar questão:", error);
      alert("Erro ao enviar questão. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-ping opacity-40" />
      <div className="absolute bottom-40 left-20 w-2 h-2 bg-blue-300 rounded-full animate-pulse opacity-50" />
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-white rounded-full animate-ping opacity-30" />

      <div className="relative z-10 flex">
        <QuestoesSidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          isMinimized={isSidebarMinimized}
          onToggleMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
        />

        <div className="flex-1 flex flex-col">
          <QuestoesHeader />

          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">
                    Contribuir com Questão
                  </h1>
                </div>
                <p className="text-blue-300/80 text-lg mb-4">
                  Ajude a comunidade compartilhando suas questões técnicas e
                  soluções.
                </p>
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <p className="text-blue-200 text-sm">
                    <strong>Importante:</strong> Sua questão será analisada pela
                    nossa equipe antes de ser publicada. Isso garante a
                    qualidade e relevância do conteúdo para toda a comunidade.
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email (opcional)
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          placeholder="seu@email.com"
                          className="bg-slate-700/50 border-blue-400/30 text-white placeholder:text-white/60"
                        />
                      </div>
                    </div>

                    {/* Questão */}
                    <div className="space-y-2">
                      <Label htmlFor="questao" className="text-white">
                        Questão *
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

                    {/* Nível e Categoria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nivel" className="text-white">
                          Nível de Dificuldade *
                        </Label>
                        <Select
                          value={formData.nivel}
                          onValueChange={(value) =>
                            handleInputChange("nivel", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-700/50 border-blue-400/30 text-white">
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
                          Categoria *
                        </Label>
                        <Select
                          value={formData.categoria}
                          onValueChange={(value) =>
                            handleInputChange("categoria", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-700/50 border-blue-400/30 text-white">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS.map((categoria) => (
                              <SelectItem
                                key={categoria.id}
                                value={categoria.id}
                              >
                                {categoria.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
