"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailVerificationNoticeProps {
  email: string;
}

export function EmailVerificationNotice({ email }: EmailVerificationNoticeProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/resend-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Mostrar toast de sucesso robusto
        toast({
          title: "✅ Email enviado com sucesso!",
          description: "Verifique sua caixa de entrada e a pasta de spam. O link de verificação expira em 24 horas.",
          variant: "default",
          duration: 5000,
        });
      } else {
        // Mostrar toast de erro
        const errorMessage = data.error?.message || data.message || "Erro ao reenviar email. Tente novamente.";
        toast({
          title: "❌ Erro ao reenviar email",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Alert className="bg-blue-500/10 border-blue-500/20">
      <Mail className="h-4 w-4 text-blue-400" />
      <AlertDescription className="text-blue-400">
        <div className="flex flex-col gap-2">
          <p>
            Enviamos um email de verificação para <strong>{email}</strong>.
            Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={loading || success}
            className="w-fit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Email Enviado!
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Reenviar Email
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

