"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";

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
      });

      if (response.ok) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error resending verification email:", error);
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
              "Email Enviado!"
            ) : (
              "Reenviar Email"
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

