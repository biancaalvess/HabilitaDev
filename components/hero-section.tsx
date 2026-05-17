"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WireframeHands } from "@/components/ui/wireframe-hands";
import { TechParticles } from "@/components/ui/tech-particles";
import { Footer } from "@/components/footer";
import {
  ChevronDown,
  Database,
  Cpu,
  Network,
  Target,
  Users,
  Heart,
} from "lucide-react";
import Image from "next/image";

import { ParticlesBackground } from "@/components/particles-background";

interface HeroSectionProps {
  onStartTraining: () => void;
}

export default function HeroSection(_props: HeroSectionProps) {
  const scrollToAbout = () => {
    const element = document.getElementById("sobre");
    if (!element) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    element.scrollIntoView({
      behavior:
        prefersReducedMotion || isCoarsePointer ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      id="inicio"
      className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
    >
      {/* Particles Background */}
      <ParticlesBackground
        particleCount={45}
        speed={0.4}
        color="rgba(59, 130, 246, 0.4)"
      />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />

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

      <div className="absolute inset-0 opacity-30">
        <WireframeHands />
      </div>

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

      {/* Navigation */}
      <nav className="relative z-20 flex items-center px-4 sm:px-6 py-4 sm:py-6">
        {/* Espaço vazio à esquerda para balancear */}
        <div className="flex-1"></div>

        {/* Links centralizados */}
        <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8">
          <a
            href="#inicio"
            className="text-white/80 hover:text-white transition-colors text-sm sm:text-base"
          >
            Início
          </a>
          <Link
            href="/questoes"
            className="text-white/80 hover:text-white transition-colors text-sm sm:text-base"
            prefetch
          >
            Questões
          </Link>
          <a
            href="#sobre"
            className="text-white/80 hover:text-white transition-colors text-sm sm:text-base"
          >
            Sobre
          </a>
        </div>

        {/* Espaço vazio à direita para balancear */}
        <div className="flex-1"></div>
      </nav>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-[calc(100dvh-120px)] px-6 text-center">
        {/* Category Label */}
        <div className="mb-4">
          <span className="text-sm font-medium text-blue-300 uppercase tracking-wider">
            DESENVOLVIMENTO
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          <span className="block">HABILITA</span>
          <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-300 mt-1 sm:mt-2">
            DEV
          </span>
        </h1>

        {/* Decorative Line */}
        <div className="w-24 h-0.5 bg-blue-400 mb-8" />

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mb-8 sm:mb-12 leading-relaxed px-4">
          Um espaço para estudantes e profissionais praticarem, errarem sem
          pressão e se prepararem para{" "}
          <span className="text-blue-300 font-semibold">
            entrevistas técnicas
          </span>
          ,<span className="text-blue-300 font-semibold"> testes</span>
          <span className="text-blue-300 font-semibold"> e desafios </span> que
          realmente importam.
          <br />
          <span className="text-sm sm:text-base md:text-lg text-white/70 mt-3 sm:mt-4 block">
            Prepare-se para o sucesso. Sua jornada começa hoje.
          </span>
        </p>

        {/* CTA Button */}
        <Link href="/questoes" className="w-full sm:w-auto">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 w-full sm:w-auto"
          >
            VAMOS COMEÇAR
          </Button>
        </Link>

        {/* Tech Icons */}
        <div className="mt-16 flex items-center space-x-8 opacity-60">
          <Database className="h-8 w-8 text-white" />
          <Cpu className="h-8 w-8 text-white" />
          <Network className="h-8 w-8 text-white" />
          <Image
            src="/icon.png"
            alt="HabilitaDev"
            width={32}
            height={32}
            className="rounded"
          />
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 flex flex-col items-center">
          <div className="text-white/60 text-sm mb-2">
            Conheça mais sobre nós
          </div>
          <button
            type="button"
            onClick={scrollToAbout}
            className="text-white/60 hover:text-white transition-all duration-300 hover:scale-110 animate-bounce"
          >
            <ChevronDown className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* About Section */}
      <div id="sobre" className="relative z-20 scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Sobre o <span className="text-blue-300">HabilitaDev</span>
            </h2>
            <p className="text-xl text-blue-300/80 max-w-3xl mx-auto">
              Democratizando o acesso ao conhecimento técnico de alta qualidade
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Missão */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 sm:p-6">
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
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 sm:p-6">
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
            <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4 sm:p-6">
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
        </div>
      </div>

      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
}
