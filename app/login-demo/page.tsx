"use client";

import React, { useState } from "react";
import { LoginFormV2 } from "@/components/auth/login-form-v2";
import { AnimatedLoader } from "@/components/ui/loader";

export default function LoginDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleLogin = async (data: { username: string; password: string }) => {
    console.log("Login data:", data);
    setIsLoading(true);

    // Simular login
    setTimeout(() => {
      setIsLoading(false);
      alert("Login realizado com sucesso!");
    }, 2000);
  };

  const handleForgotPassword = () => {
    alert("Funcionalidade de recuperação de senha");
  };

  const handleSignUp = () => {
    alert("Redirecionando para cadastro");
  };

  const handleGoogleLogin = () => {
    alert("Login com Google");
  };

  const handleTwitterLogin = () => {
    alert("Login com Twitter");
  };

  const handleGitHubLogin = () => {
    alert("Login com GitHub");
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="space-y-8">
        {/* Login Form */}
        <LoginFormV2
          onSubmit={handleLogin}
          isLoading={isLoading}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
          onGoogleLogin={handleGoogleLogin}
          onTwitterLogin={handleTwitterLogin}
          onGitHubLogin={handleGitHubLogin}
        />

        {/* Loader Demo */}
        <div className="bg-[var(--card)] p-8 rounded-xl border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 text-center">
            Loader Demo
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                Tamanho Pequeno:
              </p>
              <AnimatedLoader className="h-16" />
            </div>

            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                Tamanho Médio:
              </p>
              <AnimatedLoader className="h-20" />
            </div>

            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">
                Tamanho Grande:
              </p>
              <AnimatedLoader className="h-24" />
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setShowLoader(!showLoader)}
              className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md hover:bg-[var(--primary)]/90 transition-colors"
            >
              {showLoader ? "Ocultar" : "Mostrar"} Loader
            </button>
          </div>

          {showLoader && (
            <div className="mt-4">
              <AnimatedLoader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
