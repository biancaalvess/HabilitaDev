"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

interface ParticlesBackgroundProps {
  particleCount?: number;
  speed?: number;
  color?: string;
  className?: string;
}

export function ParticlesBackground({
  particleCount = 50,
  speed = 0.5,
  color = "rgba(59, 130, 246, 0.3)",
  className = "",
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Criar partículas iniciais
    const createParticles = () => {
      const particles: Particle[] = [];
      const count = Math.min(
        particleCount,
        window.innerWidth < 768 ? 30 : window.innerWidth < 1024 ? 40 : particleCount
      );

      const width = canvas.width || window.innerWidth;
      const height = canvas.height || window.innerHeight;

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }

      particlesRef.current = particles;
    };

    // Ajustar canvas para tamanho da tela
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || window.innerHeight;
      
      // Recriar partículas se necessário
      if (particlesRef.current.length === 0) {
        createParticles();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Detectar visibilidade da página para pausar animação
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Animar partículas
    const animate = () => {
      if (!isVisibleRef.current || !ctx) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Atualizar e desenhar partículas
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Atualizar posição
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bater nas bordas
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx = -particle.vx;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy = -particle.vy;
        }

        // Garantir que partículas fiquem dentro do canvas
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = color.replace("0.3", particle.opacity.toString());
        ctx.fill();

        // Desenhar linhas entre partículas próximas
        for (let j = i + 1; j < particles.length; j++) {
          const otherParticle = particles[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (1 - distance / 100) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = color.replace("0.3", opacity.toString());
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Iniciar animação
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, speed, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        zIndex: 0,
        willChange: "transform",
        width: "100%",
        height: "100%",
      }}
      aria-hidden="true"
    />
  );
}

