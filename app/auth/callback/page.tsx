"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { config } from "@/lib/config-simple";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processando autenticação...");

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage("Erro na autenticação. Tente novamente.");
      setTimeout(() => {
        router.push("/");
      }, 3000);
      return;
    }

    if (accessToken && refreshToken) {
      // Salvar tokens
      localStorage.setItem("habilitadev_token", accessToken);
      localStorage.setItem("habilitadev_refresh_token", refreshToken);

      setStatus("success");
      setMessage("Login realizado com sucesso! Redirecionando...");

      // Redirecionar após 1 segundo
      setTimeout(() => {
        const returnUrl = localStorage.getItem("oauth_return_url") || "/";
        localStorage.removeItem("oauth_return_url");
        router.push(returnUrl);
      }, 1000);
    } else {
      setStatus("error");
      setMessage("Token não recebido. Tente novamente.");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-blue-400/20 text-center max-w-md w-full">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Processando...</h2>
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Sucesso!</h2>
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Erro</h2>
            <p className="text-white/60">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

