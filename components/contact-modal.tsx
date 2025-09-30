"use client";

import { useState } from "react";
import { Mail, Send, Loader2, X } from "lucide-react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const contactTypes = {
  complaint: "Reclamação",
  suggestion: "Sugestão",
  bug: "Reportar Bug",
  feature: "Nova Funcionalidade",
  other: "Outro",
};

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !name.trim() ||
      !email.trim() ||
      !type ||
      !subject.trim() ||
      !message.trim()
    ) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      // Criar o link mailto com todos os dados
      const emailBody = `
Nome: ${name}
Email: ${email}
Tipo: ${contactTypes[type as keyof typeof contactTypes]}
Assunto: ${subject}

Mensagem:
${message}

---
Enviado através do HabilitaDev
      `.trim();

      const mailtoLink = `mailto:bianca.alvessdasilva@gmail.com?subject=${encodeURIComponent(
        `[HabilitaDev] ${subject}`
      )}&body=${encodeURIComponent(emailBody)}`;

      // Abrir o cliente de email
      window.open(mailtoLink, "_blank");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);
    } catch (err) {
      setError("Erro ao abrir o cliente de email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setEmail("");
      setType("");
      setSubject("");
      setMessage("");
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-blue-400/20">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            Entre em Contato
          </DialogTitle>
          <CardDescription className="text-blue-300/80 text-lg mt-2">
            Sua opinião é muito importante para nós! Envie suas reclamações,
            sugestões ou reporte problemas.
          </CardDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none bg-slate-800/50 backdrop-blur-sm relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />

          {/* Floating Elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60" />
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-white rounded-full animate-ping opacity-40" />

          <CardContent className="p-0 relative z-10">
            {success ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Mail className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-green-400 mb-2">
                  Redirecionando para o seu cliente de email...
                </h3>
                <p className="text-white/70">
                  Obrigado pelo seu contato! Responderemos em breve.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-red-500/20 bg-red-500/10"
                  >
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-white font-medium">
                      Seu Nome
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ex: Maria Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-white font-medium">
                      Seu Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="type" className="text-white font-medium">
                    Tipo de Contato
                  </Label>
                  <Select
                    value={type}
                    onValueChange={setType}
                    disabled={loading}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-blue-400 focus:ring-blue-400/20 h-12">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {Object.entries(contactTypes).map(([key, label]) => (
                        <SelectItem
                          key={key}
                          value={key}
                          className="text-white hover:bg-slate-700 focus:bg-slate-700"
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-white font-medium">
                    Assunto
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Resumo do seu contato..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={loading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="message" className="text-white font-medium">
                    Mensagem
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Descreva detalhadamente sua reclamação, sugestão ou problema..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    disabled={loading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
                  />
                  <div className="text-xs text-slate-400 text-right">
                    {message.length}/1000 caracteres
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6 border-t border-slate-700/50">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="px-8 py-3 h-12 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !name.trim() ||
                      !email.trim() ||
                      !type ||
                      !subject.trim() ||
                      !message.trim()
                    }
                    className="px-8 py-3 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Enviar Email
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
