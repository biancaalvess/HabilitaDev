"use client";

import React, { useState } from "react";
import { LoginFormV2 } from "@/components/auth/login-form-v2";
import { AnimatedLoader } from "@/components/ui/loader";
import Pattern from "@/components/ui/pattern";
import AbstractShapes from "@/components/ui/abstract-shapes";
import CyberpunkFigure from "@/components/ui/cyberpunk-figure";

export default function LoginDemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleLogin = async (data: { username: string; password: string }) => {
    console.log("Login data:", data);
    setIsLoading(true);

    // Simular login com feedback visual melhorado
    setTimeout(() => {
      setIsLoading(false);
      // Criar um toast mais elegante
      const toast = document.createElement("div");
      toast.className =
        "fixed top-4 right-4 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white px-6 py-3 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-300";
      toast.innerHTML = `
        <div class="flex items-center">
          <div class="w-5 h-5 bg-white/20 rounded-full mr-3 flex items-center justify-center">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          Login realizado com sucesso! 🎉
        </div>
      `;
      document.body.appendChild(toast);

      // Animar entrada
      setTimeout(() => {
        toast.style.transform = "translateX(0)";
      }, 100);

      // Remover após 3 segundos
      setTimeout(() => {
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
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
    <div className="min-h-screen bg-gradient-to-br from-[#181c21] via-[#232526] to-[#2d1b69] flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      <Pattern />
      <AbstractShapes />
      <CyberpunkFigure />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-5">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ["#8b5cf6", "#ec4899", "#3b82f6", "#a855f7"][
                  Math.floor(Math.random() * 4)
                ]
              } 0%, transparent 70%)`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px ${
                ["#8b5cf6", "#ec4899", "#3b82f6", "#a855f7"][
                  Math.floor(Math.random() * 4)
                ]
              }`,
            }}
          />
        ))}
      </div>

      {/* Iridescent Overlay */}
      <div className="absolute inset-0 z-3 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-[#8b5cf6]/5 to-transparent opacity-30"></div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#ec4899]/10 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#3b82f6]/10 via-transparent to-transparent"></div>
      </div>

      {/* Holographic Grid */}
      <div className="absolute inset-0 z-4 pointer-events-none opacity-20">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-md">
            {/* Welcome Section */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent mb-4">
                Bem-vindo de volta
              </h1>
              <p className="text-slate-300 text-lg">
                Entre na sua conta para continuar sua jornada
              </p>
            </div>

            {/* Login Form Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-[#8b5cf6]/30 rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-[#8b5cf6]/30 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6]/5 to-[#ec4899]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <LoginFormV2
                  onSubmit={handleLogin}
                  isLoading={isLoading}
                  onForgotPassword={handleForgotPassword}
                  onSignUp={handleSignUp}
                  onGoogleLogin={handleGoogleLogin}
                  onTwitterLogin={handleTwitterLogin}
                  onGitHubLogin={handleGitHubLogin}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Features & Demo */}
        <div className="flex items-center justify-center lg:justify-start">
          <div className="w-full max-w-md space-y-6">
            {/* Features Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-[#8b5cf6]/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-full mr-3"></div>
                Recursos Incríveis
              </h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full mr-3"></div>
                  Interface moderna e responsiva
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full mr-3"></div>
                  Animações suaves e fluidas
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#ec4899] rounded-full mr-3"></div>
                  Design glassmorphism
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-[#a855f7] rounded-full mr-3"></div>
                  Experiência imersiva
                </li>
              </ul>
            </div>

            {/* Loader Demo Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-[#8b5cf6]/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full mr-3"></div>
                Demonstração de Loaders
              </h3>

              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm text-slate-300 font-medium">
                    Tamanho Pequeno:
                  </p>
                  <div className="flex justify-center p-4 bg-white/5 rounded-xl">
                    <AnimatedLoader className="h-12" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-300 font-medium">
                    Tamanho Médio:
                  </p>
                  <div className="flex justify-center p-4 bg-white/5 rounded-xl">
                    <AnimatedLoader className="h-16" />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-slate-300 font-medium">
                    Tamanho Grande:
                  </p>
                  <div className="flex justify-center p-4 bg-white/5 rounded-xl">
                    <AnimatedLoader className="h-20" />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowLoader(!showLoader)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white rounded-xl hover:from-[#7c3aed] hover:to-[#db2777] transition-all duration-300 font-medium shadow-lg hover:shadow-[#8b5cf6]/25 transform hover:scale-105"
                >
                  {showLoader ? "Ocultar" : "Mostrar"} Loader Interativo
                </button>
              </div>

              {showLoader && (
                <div className="mt-4 p-6 bg-gradient-to-r from-[#8b5cf6]/10 to-[#ec4899]/10 rounded-xl border border-[#8b5cf6]/20">
                  <div className="flex justify-center">
                    <AnimatedLoader className="h-16" />
                  </div>
                  <p className="text-center text-sm text-slate-300 mt-3">
                    Loader em ação! ✨
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
