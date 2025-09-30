"use client";

import { Button } from "@/components/ui/button";
import { WireframeHands } from "@/components/ui/wireframe-hands";
import { TechParticles } from "@/components/ui/tech-particles";
import {
  ChevronDown,
  Code,
  Database,
  Cpu,
  Network,
  Target,
  Users,
  Heart,
} from "lucide-react";

interface HeroSectionProps {
  onStartTraining: () => void;
}

export default function HeroSection({ onStartTraining }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden scroll-smooth">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute bottom-60 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
      </div>

      {/* Tech Particles */}
      <div className="absolute inset-0 opacity-10">
        <TechParticles count={15} />
      </div>

      {/* Wireframe Hands */}
      <div className="absolute inset-0 opacity-30">
        <WireframeHands />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-center px-6 py-6">
        <div className="flex items-center space-x-8">
          <a
            href="#inicio"
            className="text-white/80 hover:text-white transition-colors"
          >
            Inicio
          </a>
          <a
            href="questoes"
            className="text-white/80 hover:text-white transition-colors"
          >
            Questões
          </a>
          <a
            href="#sobre"
            className="text-white/80 hover:text-white transition-colors"
          >
            Sobre
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
        {/* Category Label */}
        <div className="mb-4">
          <span className="text-sm font-medium text-blue-300 uppercase tracking-wider">
            DESENVOLVIMENTO
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
          <span className="block">HABILITA</span>
          <span className="block text-4xl md:text-6xl text-blue-300 mt-2">
            DEV
          </span>
        </h1>

        {/* Decorative Line */}
        <div className="w-24 h-0.5 bg-blue-400 mb-8" />

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/90 max-w-4xl mb-12 leading-relaxed">
          Um espaço para estudantes e profissionais praticarem, errarem sem
          pressão e se prepararem para{" "}
          <span className="text-blue-300 font-semibold">
            entrevistas técnias
          </span>
          ,<span className="text-blue-300 font-semibold"> testes</span>
          <span className="text-blue-300 font-semibold"> e desafios </span> que
          realmente importam.
          <br />
          <span className="text-lg text-white/70 mt-4 block">
            Prepare-se para o sucesso. Sua jornada começa hoje.
          </span>
        </p>

        {/* CTA Button */}
        <Button
          onClick={() => (window.location.href = "/#questoes")}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-4 h-auto font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
        >
          VAMOS COMEÇAR
        </Button>

        {/* Tech Icons */}
        <div className="mt-16 flex items-center space-x-8 opacity-60">
          <Database className="h-8 w-8 text-white" />
          <Cpu className="h-8 w-8 text-white" />
          <Network className="h-8 w-8 text-white" />
          <Code className="h-8 w-8 text-white" />
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 flex flex-col items-center">
          <div className="text-white/60 text-sm mb-2">
            Conheça mais sobre nós
          </div>
          <button
            onClick={() => {
              const element = document.getElementById("sobre");
              if (element) {
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  inline: "nearest",
                });
              }
            }}
            className="text-white/60 hover:text-white transition-all duration-300 hover:scale-110 animate-bounce"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* About Section */}
      <div id="sobre" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sobre o <span className="text-blue-300">HabilitaDev</span>
            </h2>
            <p className="text-xl text-blue-300/80 max-w-3xl mx-auto">
              Democratizando o acesso ao conhecimento técnico de alta qualidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Missão */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded bg-blue-500 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Nossa Missão</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Criar um espaço acessível onde estudantes e profissionais possam
                praticar entrevistas técnicas, testes e desafios de tecnologia,
                aprendendo com os erros sem pressão e ganhando confiança para
                conquistar novas oportunidades.
              </p>
            </div>

            {/* Visão */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded bg-blue-500 flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Nossa Visão</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Criar um espaço acessível para prática e preparação técnica,
                onde pessoas de diferentes níveis e áreas da tecnologia possam
                aprender juntas, ganhar confiança e crescer em comunidade.
              </p>
            </div>

            {/* Valores */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded bg-blue-500 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Nossos Valores</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Acessibilidade, Comunidade, Qualidade e Evolução Contínua.
                Acreditamos que qualquer pessoa pode se desenvolver quando
                encontra um ambiente de apoio, com prática realista, feedbacks
                construtivos e espaço para crescer.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Vamos para começar sua jornada?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/questoes")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Começar a Praticar
              </button>
              <button
                onClick={() => (window.location.href = "/contribuir")}
                className="bg-transparent border-2 border-blue-400 text-blue-300 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Contribuir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tech Elements - Simplified */}
      <div className="absolute top-1/4 left-10 opacity-10">
        <div className="w-8 h-8 border border-blue-400 rounded-lg rotate-45 animate-spin-slow" />
      </div>
      <div className="absolute bottom-1/4 right-10 opacity-10">
        <div className="w-6 h-6 border border-white rounded-full animate-pulse" />
      </div>
      <div className="absolute top-1/2 right-1/4 opacity-5">
        <div className="w-4 h-4 bg-blue-400 rounded-full animate-ping" />
      </div>
    </div>
  );
}
