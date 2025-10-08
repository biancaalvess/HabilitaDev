"use client";

import { Button } from "@/components/ui/button";
import { Target, Users, Trophy, ArrowRight } from "lucide-react";
import Image from "next/image";

interface AboutSectionProps {
  onStartTraining: () => void;
}

export function AboutSection({ onStartTraining }: AboutSectionProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 py-10 sm:py-16 lg:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.1),transparent_50%)]" />

      {/* Floating Elements */}
      <div className="absolute top-16 sm:top-20 left-4 sm:left-6 lg:left-10 w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-blue-400 rounded-full animate-pulse opacity-60" />
      <div className="absolute top-32 sm:top-40 right-4 sm:right-6 lg:right-20 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full animate-ping opacity-40" />
      <div className="absolute bottom-32 sm:bottom-40 left-4 sm:left-6 lg:left-20 w-2 h-2 sm:w-3 sm:h-3 bg-blue-300 rounded-full animate-pulse opacity-50" />
      <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 lg:right-10 w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full animate-ping opacity-30" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6">
            Sobre o <span className="text-blue-400">HabilitaDev</span>
          </h2>
          <div className="w-16 sm:w-20 lg:w-24 h-1 bg-blue-400 mx-auto mb-6 sm:mb-8" />
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed px-2">
            A Habilitatech nasceu a partir de uma dor pessoal: eu sempre
            enfrentei dificuldades em entrevistas técnicas e testes orais,
            especialmente na área de tecnologia. Essas situações exigem não
            apenas conhecimento, mas também prática, confiança e clareza na
            comunicação — pontos que nem sempre conseguimos desenvolver
            sozinhos. Pensando nisso, decidi criar um espaço dedicado a esse
            desafio. Um ambiente para praticar, errar sem pressão e aprender de
            forma constante. O objetivo é simples: transformar insegurança em
            preparo, e preparar você para encarar qualquer entrevista ou teste
            com mais segurança e domínio. Mais do que uma ferramenta, a
            Habilitatech é um apoio para quem busca evoluir, seja dando os
            primeiros passos ou aprimorando habilidades já conquistadas.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16 lg:mb-20">
          {/* Left Side - Text Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                Nossa <span className="text-blue-400">Missão</span>
              </h3>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 leading-relaxed">
                Democratizar o acesso a entrevistas técnicas de alta qualidade,
                oferecendo questões reais das maiores empresas tech do mundo.
                Queremos que cada desenvolvedor tenha as ferramentas necessárias
                para brilhar em qualquer processo seletivo.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-white mb-4">
                Por que <span className="text-blue-400">Escolher</span>?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Image
                    src="/icon.png"
                    alt="HabilitaDev"
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0 mt-1"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Questões Reais
                    </h4>
                    <p className="text-white/80">
                      Problemas autênticos de empresas como Meta, Google, Amazon
                      e outras gigantes tech.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Preparação Focada
                    </h4>
                    <p className="text-white/80">
                      Estratégias específicas para cada tipo de entrevista e
                      nível de senioridade.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      Comunidade Ativa
                    </h4>
                    <p className="text-white/80">
                      Conecte-se com outros desenvolvedores e compartilhe
                      experiências.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Elements */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white">
                  Sucesso Garantido
                </h4>
                <p className="text-white/80">
                  Mais de 85% dos nossos usuários conseguem aprovação em
                  entrevistas técnicas após usar nossa plataforma.
                </p>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">500+</div>
                    <div className="text-sm text-white/70">Questões</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">50+</div>
                    <div className="text-sm text-white/70">Empresas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">10k+</div>
                    <div className="text-sm text-white/70">Usuários</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 backdrop-blur-sm border border-white/10 max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
            <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Pronto para <span className="text-blue-400">Transformar</span> sua
              Carreira?
            </h3>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 max-w-xs sm:max-w-xl md:max-w-2xl mx-auto">
              Junte-se a milhares de desenvolvedores que já conquistaram seus
              empregos dos sonhos com nossa plataforma.
            </p>
            <Button
              onClick={onStartTraining}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm sm:text-base md:text-lg px-6 py-3 sm:px-8 sm:py-4 h-auto font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
            >
              <span className="hidden sm:inline">Conhecer a Plataforma</span>
              <span className="sm:hidden">Conhecer</span>
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
