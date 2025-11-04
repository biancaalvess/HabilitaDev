"use client";

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || "Usuário ou email já existe.");
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Criar Conta</h2>
        <p className="text-white/60 text-sm">Crie sua conta para começar a treinar</p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 mb-4">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/80">
                Nome de usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="seuusuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 focus:border-blue-400"
                required
              />
            </div>

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
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 focus:border-blue-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 focus:border-blue-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white/80">
                Confirmar senha
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirme sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-white/40 focus:border-blue-400"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar conta"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-white/60">Já tem uma conta? </span>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                Entrar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
