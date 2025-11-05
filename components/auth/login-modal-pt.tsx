"use client";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { config } from "@/lib/config-simple";

interface LoginModalPTProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister?: () => void;
}

export function LoginModalPT({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalPTProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  // Limpar campos ao fechar
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      onClose();
      // Recarregar página para atualizar estado do usuário
      window.location.reload();
    } else {
      setError(result.error || "Email ou senha incorretos.");
    }
  };

  const handleGoogleLogin = async () => {
    // Verificar se o backend está configurado
    const backendUrl = config.api.backendUrl;
    if (!backendUrl) {
      alert('OAuth não está disponível. O backend não está configurado. Configure NEXT_PUBLIC_BACKEND_URL no .env para usar autenticação OAuth.');
      return;
    }

    // Verificar se o backend está acessível antes de redirecionar
    try {
      const healthCheck = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });

      if (!healthCheck.ok) {
        alert('O backend não está respondendo corretamente. Verifique se o servidor está online e se as credenciais OAuth estão configuradas no backend.');
        return;
      }
    } catch (error) {
      alert('Não foi possível conectar ao backend. Verifique se o servidor está online e se a URL está correta.');
      return;
    }

    // Redirecionar para o endpoint OAuth do backend
    const googleAuthUrl = `${backendUrl}/api/v1/auth/google`;
    
    // Salvar URL de retorno
    const returnUrl = window.location.href;
    localStorage.setItem("oauth_return_url", returnUrl);
    
    // Redirecionar para Google OAuth
    window.location.href = googleAuthUrl;
  };

  const handleGitHubLogin = async () => {
    // Verificar se o backend está configurado
    const backendUrl = config.api.backendUrl;
    if (!backendUrl) {
      alert('OAuth não está disponível. O backend não está configurado. Configure NEXT_PUBLIC_BACKEND_URL no .env para usar autenticação OAuth.');
      return;
    }

    // Verificar se o backend está acessível antes de redirecionar
    try {
      const healthCheck = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 segundos timeout
      });

      if (!healthCheck.ok) {
        alert('O backend não está respondendo corretamente. Verifique se o servidor está online e se as credenciais OAuth estão configuradas no backend.');
        return;
      }
    } catch (error) {
      alert('Não foi possível conectar ao backend. Verifique se o servidor está online e se a URL está correta.');
      return;
    }

    // Redirecionar para o endpoint OAuth do backend
    const githubAuthUrl = `${backendUrl}/api/v1/auth/github`;
    
    // Salvar URL de retorno
    const returnUrl = window.location.href;
    localStorage.setItem("oauth_return_url", returnUrl);
    
    // Redirecionar para GitHub OAuth
    window.location.href = githubAuthUrl;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md bg-slate-800/95 backdrop-blur-sm border border-blue-400/20 p-0 gap-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Login</DialogTitle>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Login</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-slate-700/50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white/80">
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Implementar recuperação de senha
                    alert("Funcionalidade de recuperação de senha em breve");
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 focus:border-blue-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-600" />
            <p className="px-3 text-sm text-white/60">
              Ou entre com contas sociais
            </p>
            <div className="flex-1 h-px bg-slate-600" />
          </div>

          {/* Social Login */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="p-3 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 transition-colors"
              aria-label="Entrar com Google"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-6 h-6 fill-current text-white"
              >
                <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
              </svg>
            </button>
            
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="p-3 rounded-lg border border-slate-600 bg-slate-700/50 hover:bg-slate-700 transition-colors"
              aria-label="Entrar com GitHub"
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                className="w-6 h-6 fill-current text-white"
              >
                <path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z" />
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          {onSwitchToRegister && (
            <p className="text-center text-sm text-white/60 mt-6">
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                Criar conta
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

