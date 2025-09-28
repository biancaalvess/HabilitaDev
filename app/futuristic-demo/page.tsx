"use client";

import React, { useState } from "react";
import { FuturisticInput } from "@/components/ui/futuristic-input";

export default function FuturisticDemoPage() {
  const [searchValue, setSearchValue] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="space-y-8 w-full max-w-4xl">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            Futuristic Input Demo
          </h1>
          <p className="text-[var(--muted-foreground)] text-lg">
            Demonstração dos inputs futuristas com animações e efeitos especiais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Search Input */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Input de Busca
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-2">
                  Buscar questões...
                </label>
                <FuturisticInput
                  placeholder="Digite sua busca..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  showSearchIcon={true}
                  showFilterIcon={false}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Valor: {searchValue || "vazio"}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Formulário de Login
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-2">
                  Username
                </label>
                <FuturisticInput
                  placeholder="Digite seu username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  showSearchIcon={false}
                  showFilterIcon={false}
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-2">
                  Password
                </label>
                <FuturisticInput
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showSearchIcon={false}
                  showFilterIcon={false}
                />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Input de Email
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-2">
                  Email
                </label>
                <FuturisticInput
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  showSearchIcon={false}
                  showFilterIcon={false}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Valor: {email || "vazio"}
              </p>
            </div>
          </div>

          {/* Filter Input */}
          <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Input com Filtro
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted-foreground)] mb-2">
                  Filtrar por categoria
                </label>
                <FuturisticInput
                  placeholder="Filtrar categorias..."
                  showSearchIcon={true}
                  showFilterIcon={true}
                  onFilterClick={() => alert("Filtro clicado!")}
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Clique no ícone de filtro para ver a ação
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-[var(--card)] p-6 rounded-xl border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Instruções
          </h3>
          <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <p>
              • <strong>Hover:</strong> Passe o mouse sobre os inputs para ver
              as animações de borda
            </p>
            <p>
              • <strong>Focus:</strong> Clique nos inputs para ver as animações
              de foco
            </p>
            <p>
              • <strong>Ícones:</strong> Os inputs podem ter ícones de busca e
              filtro
            </p>
            <p>
              • <strong>Responsivo:</strong> Os inputs se adaptam ao tamanho da
              tela
            </p>
            <p>
              • <strong>Animações:</strong> Bordas rotativas com gradientes
              conic-gradient
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
