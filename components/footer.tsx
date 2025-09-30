"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900/95 backdrop-blur-sm border-t border-blue-400/20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold text-white">HabilitaDev</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4 max-w-md">
              Democratizando o acesso ao conhecimento técnico de alta qualidade. 
              Prepare-se para entrevistas técnicas com questões reais de grandes empresas.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-blue-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="mailto:contato@habilitadev.com"
                className="text-white/60 hover:text-blue-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/questoes"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Questões
                </Link>
              </li>
              <li>
                <Link
                  href="/contribuir"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Contribuir
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Sobre
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categorias</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/questoes?category=algorithms"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Algoritmos
                </Link>
              </li>
              <li>
                <Link
                  href="/questoes?category=data_structures"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Estruturas de Dados
                </Link>
              </li>
              <li>
                <Link
                  href="/questoes?category=system_design"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Design de Sistema
                </Link>
              </li>
              <li>
                <Link
                  href="/questoes?category=databases"
                  className="text-white/70 hover:text-blue-400 transition-colors text-sm"
                >
                  Bancos de Dados
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha Separadora */}
        <div className="border-t border-white/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} HabilitaDev. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span>Feito com</span>
              <Heart className="h-4 w-4 text-red-400 fill-current" />
              <span>para a comunidade</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
