"use client";

import { Button } from "@/components/ui/button";
import { WireframeHands } from "@/components/ui/wireframe-hands";
import { TechParticles } from "@/components/ui/tech-particles";
import { ChevronDown, Code, Database, Cpu, Network } from "lucide-react";

interface HeroSectionProps {
  onStartTraining: () => void;
}

export default function HeroSection({ onStartTraining }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
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
      <div className="absolute inset-0">
        <TechParticles count={80} />
      </div>

      {/* Wireframe Hands */}
      <div className="absolute inset-0 opacity-30">
        <WireframeHands />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6">
        <div className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">HabilitaDev</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a
            href="#tecnologias"
            className="text-white/80 hover:text-white transition-colors"
          >
            Tecnologias
          </a>
          <a
            href="#questoes"
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
          <a
            href="#blog"
            className="text-white/80 hover:text-white transition-colors"
          >
            Blog
          </a>
        </div>

        <Button
          onClick={onStartTraining}
          className="bg-white text-slate-900 hover:bg-white/90 font-semibold"
        >
          Começar Agora
        </Button>
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
          <span className="block">TECH</span>
          <span className="block text-4xl md:text-6xl text-blue-300 mt-2">
            INTERVIEWS
          </span>
        </h1>

        {/* Decorative Line */}
        <div className="w-24 h-0.5 bg-blue-400 mb-8" />

        {/* Description */}
        <p className="text-xl md:text-2xl text-white/90 max-w-4xl mb-12 leading-relaxed">
          Domine as entrevistas técnicas das maiores empresas de tecnologia.
          Questões reais de empresas como{" "}
          <span className="text-blue-300 font-semibold">Meta</span>,
          <span className="text-blue-300 font-semibold"> Google</span>,
          <span className="text-blue-300 font-semibold"> Amazon</span> e outras
          gigantes tech.
          <br />
          <span className="text-lg text-white/70 mt-4 block">
            Prepare-se para o sucesso. Sua jornada começa hoje.
          </span>
        </p>

        {/* CTA Button */}
        <Button
          onClick={onStartTraining}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-4 h-auto font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
        >
          COMEÇAR TREINAMENTO
        </Button>

        {/* Tech Icons */}
        <div className="mt-16 flex items-center space-x-8 opacity-60">
          <Database className="h-8 w-8 text-white" />
          <Cpu className="h-8 w-8 text-white" />
          <Network className="h-8 w-8 text-white" />
          <Code className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center space-y-2">
          <span className="text-white/60 text-sm">Role para baixo</span>
          <ChevronDown className="h-6 w-6 text-white/60 animate-bounce" />
        </div>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute top-1/4 left-10 opacity-20">
        <div className="w-16 h-16 border border-blue-400 rounded-lg rotate-45 animate-spin-slow" />
      </div>
      <div className="absolute bottom-1/4 right-10 opacity-20">
        <div className="w-12 h-12 border border-white rounded-full animate-pulse" />
      </div>
    </div>
  );
}
