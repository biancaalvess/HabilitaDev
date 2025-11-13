"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processando autenticação...");
  const processedRef = useRef(false);

  useEffect(() => {
    // Evitar processamento duplicado
    if (processedRef.current) return;
    processedRef.current = true;

    const processOAuthCallback = async () => {
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const returnUrl = searchParams.get("return_url") || "/";

      // Verificar se há erro
      if (error) {
        setStatus("error");
        setMessage(
          errorDescription || 
          "Erro na autenticação. Tente novamente."
        );
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      // Se temos tokens na URL, redirecionar para a rota de callback do servidor
      // que configurará o cookie
      if (accessToken) {
        try {
          // Construir URL para a rota de callback do servidor
          const callbackUrl = new URL("/api/auth/oauth/callback", window.location.origin);
          callbackUrl.searchParams.set("access_token", accessToken);
          if (refreshToken) {
            callbackUrl.searchParams.set("refresh_token", refreshToken);
          }
          if (returnUrl) {
            callbackUrl.searchParams.set("return_url", returnUrl);
          }

          // Redirecionar para a rota de callback do servidor
          window.location.href = callbackUrl.toString();
          return;
        } catch (error) {
          console.error("Erro ao processar callback OAuth:", error);
          setStatus("error");
          setMessage("Erro ao processar autenticação. Tente novamente.");
          
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } else {
        // Não há token na URL, isso significa que já voltamos da rota de callback do servidor
        // Verificar se a sessão foi configurada corretamente
        try {
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (response.ok) {
            setStatus("success");
            setMessage("Login realizado com sucesso! Redirecionando...");

            // Redirecionar após 1 segundo
            setTimeout(() => {
              router.push(returnUrl || "/");
              // Recarregar para atualizar estado do usuário
              window.location.reload();
            }, 1000);
          } else {
            setStatus("error");
            setMessage("Erro ao verificar sessão. Tente novamente.");
            
            setTimeout(() => {
              router.push("/");
            }, 3000);
          }
        } catch (error) {
          console.error("Erro ao verificar sessão:", error);
          setStatus("error");
          setMessage("Erro ao processar autenticação. Tente novamente.");
          
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      }
    };

    processOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

