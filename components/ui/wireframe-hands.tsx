"use client";

import { useEffect, useRef } from "react";

interface WireframeHandsProps {
  className?: string;
}

export function WireframeHands({ className = "" }: WireframeHandsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const drawWireframeHand = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      rotation: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Configurações do wireframe
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;

      // Pontos da mão (simplificados)
      const handPoints = [
        // Palma
        { x: 0, y: 0 },
        { x: 20, y: -5 },
        { x: 25, y: 10 },
        { x: 20, y: 25 },
        { x: 0, y: 20 },
        { x: -5, y: 10 },

        // Dedo polegar
        { x: -8, y: 8 },
        { x: -15, y: 5 },
        { x: -12, y: 12 },

        // Dedo indicador
        { x: 5, y: -8 },
        { x: 8, y: -20 },
        { x: 12, y: -25 },
        { x: 15, y: -22 },

        // Dedo médio
        { x: 12, y: -5 },
        { x: 15, y: -18 },
        { x: 18, y: -23 },
        { x: 20, y: -20 },

        // Dedo anelar
        { x: 18, y: 0 },
        { x: 20, y: -15 },
        { x: 22, y: -20 },
        { x: 24, y: -18 },

        // Dedo mindinho
        { x: 22, y: 5 },
        { x: 24, y: -10 },
        { x: 26, y: -15 },
        { x: 28, y: -12 },
      ];

      // Conectar pontos com linhas
      ctx.beginPath();
      for (let i = 0; i < handPoints.length; i++) {
        const point = handPoints[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();

      // Adicionar nós (pontos de conexão)
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      handPoints.forEach((point, index) => {
        if (index % 3 === 0) {
          // Apenas alguns pontos para não sobrecarregar
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Adicionar linhas de conexão entre pontos próximos
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < handPoints.length; i++) {
        for (let j = i + 1; j < handPoints.length; j++) {
          const dist = Math.sqrt(
            Math.pow(handPoints[i].x - handPoints[j].x, 2) +
              Math.pow(handPoints[i].y - handPoints[j].y, 2)
          );
          if (dist < 15) {
            ctx.beginPath();
            ctx.moveTo(handPoints[i].x, handPoints[i].y);
            ctx.lineTo(handPoints[j].x, handPoints[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;
      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);

      // Mão esquerda (bottom-left)
      const leftHandX = centerX - 100;
      const leftHandY = centerY + 50;
      const leftHandScale = 1.2 + Math.sin(time * 0.5) * 0.1;
      const leftHandRotation = Math.sin(time * 0.3) * 0.1;

      // Mão direita (top-right)
      const rightHandX = centerX + 100;
      const rightHandY = centerY - 50;
      const rightHandScale = 1.2 + Math.sin(time * 0.5 + Math.PI) * 0.1;
      const rightHandRotation = Math.sin(time * 0.3 + Math.PI) * 0.1;

      drawWireframeHand(
        ctx,
        leftHandX,
        leftHandY,
        leftHandScale,
        leftHandRotation
      );
      drawWireframeHand(
        ctx,
        rightHandX,
        rightHandY,
        rightHandScale,
        rightHandRotation
      );

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ background: "transparent" }}
    />
  );
}
