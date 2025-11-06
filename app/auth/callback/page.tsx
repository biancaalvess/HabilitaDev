"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyToken } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processando autenticação...");
  const processedRef = useRef(false);

  useEffect(() => {
    // Evitar processamento duplicado
    if (processedRef.current) return;
    processedRef.current = true;

    const processOAuthCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Verificar se há erro
      if (error) {
        setStatus("error");
        setMessage(
          errorDescription || 
          "Erro na autenticação. Tente novamente."
        );
        
        // Limpar dados OAuth
        localStorage.removeItem("oauth_return_url");
        localStorage.removeItem("oauth_provider");
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      // Verificar se temos tokens
      if (accessToken && refreshToken) {
        try {
          // Salvar tokens
          localStorage.setItem("habilitadev_token", accessToken);
          localStorage.setItem("habilitadev_refresh_token", refreshToken);

          // Verificar token com backend para obter dados do usuário
          await verifyToken(accessToken);

          setStatus("success");
          setMessage("Login realizado com sucesso! Redirecionando...");

          // Obter URL de retorno e limpar
          const returnUrl = localStorage.getItem("oauth_return_url") || "/";
          localStorage.removeItem("oauth_return_url");
          localStorage.removeItem("oauth_provider");

          // Redirecionar após 1 segundo
          setTimeout(() => {
            router.push(returnUrl);
            // Recarregar para atualizar estado do usuário
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error("Erro ao processar callback OAuth:", error);
          setStatus("error");
          setMessage("Erro ao processar autenticação. Tente novamente.");
          
          // Limpar dados
          localStorage.removeItem("habilitadev_token");
          localStorage.removeItem("habilitadev_refresh_token");
          localStorage.removeItem("oauth_return_url");
          localStorage.removeItem("oauth_provider");
          
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } else {
        setStatus("error");
        setMessage("Token não recebido. Tente novamente.");
        
        // Limpar dados OAuth
        localStorage.removeItem("oauth_return_url");
        localStorage.removeItem("oauth_provider");
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
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

