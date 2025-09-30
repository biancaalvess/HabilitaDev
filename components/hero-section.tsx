"use client";

import { Button } from "@/components/ui/button";
import { WireframeHands } from "@/components/ui/wireframe-hands";
import { TechParticles } from "@/components/ui/tech-particles";
import { Code, Database, Cpu, Network } from "lucide-react";

interface HeroSectionProps {
  onStartTraining: () => void;
}

export default function HeroSection({ onStartTraining }: HeroSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center space-x-2">
          <Code className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            HabilitaDev
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-4 lg:space-x-8">
          <a
            href="#tecnologias"
            className="text-sm lg:text-base text-white/80 hover:text-white transition-colors"
          >
            Tecnologias
          </a>
          <a
            href="#questoes"
            className="text-sm lg:text-base text-white/80 hover:text-white transition-colors"
          >
            Questões
          </a>
          <a
            href="#sobre"
            className="text-sm lg:text-base text-white/80 hover:text-white transition-colors"
          >
            Sobre
          </a>
          <a
            href="#blog"
            className="text-sm lg:text-base text-white/80 hover:text-white transition-colors"
          >
            Blog
          </a>
        </div>

        <Button
          onClick={onStartTraining}
          className="bg-white text-slate-900 hover:bg-white/90 font-semibold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2"
        >
          <span className="hidden sm:inline">Começar Agora</span>
          <span className="sm:hidden">Começar</span>
        </Button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8 text-center">
        {/* Category Label */}
        <div className="mb-2 sm:mb-4">
          <span className="text-xs sm:text-sm font-medium text-blue-300 uppercase tracking-wider">
            DESENVOLVIMENTO
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          <span className="block">HABILITA</span>
          <span className="block text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-blue-300 mt-1 sm:mt-2">
            DEV
          </span>
        </h1>

        {/* Decorative Line */}
        <div className="w-16 sm:w-20 lg:w-24 h-0.5 bg-blue-400 mb-6 sm:mb-8" />

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mb-8 sm:mb-12 leading-relaxed px-2">
          Pratique de forma gratuita para entrevistar profissionais ou testes
          estudantis. Faça parte dessa comunidade de aprendizagem e
          desenvolvimento!
        </p>

        {/* CTA Button */}
        <Button
          onClick={onStartTraining}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm sm:text-base md:text-lg lg:text-xl px-6 py-3 sm:px-8 sm:py-4 h-auto font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
        >
          CONHECER
        </Button>

        {/* Tech Icons */}
        <div className="mt-8 sm:mt-12 lg:mt-16 flex items-center space-x-4 sm:space-x-6 lg:space-x-8 opacity-60">
          <Database className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
          <Cpu className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
          <Network className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
          <Code className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
        </div>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute top-1/4 left-4 sm:left-6 lg:left-10 opacity-20">
        <div className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 border border-blue-400 rounded-lg rotate-45 animate-spin-slow" />
      </div>
      <div className="absolute bottom-1/4 right-4 sm:right-6 lg:right-10 opacity-20">
        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 border border-white rounded-full animate-pulse" />
      </div>
    </div>
  );
}
