"use client";

import React from "react";
import styled from "styled-components";

const AbstractShapes = () => {
  return (
    <StyledWrapper>
      <div className="shapes-container">
        {/* Ribbon 1 - Main flowing shape */}
        <div className="ribbon ribbon-1">
          <div className="ribbon-surface"></div>
        </div>

        {/* Ribbon 2 - Secondary flowing shape */}
        <div className="ribbon ribbon-2">
          <div className="ribbon-surface"></div>
        </div>

        {/* Ribbon 3 - Accent shape */}
        <div className="ribbon ribbon-3">
          <div className="ribbon-surface"></div>
        </div>

        {/* Floating particles with iridescent effect */}
        <div className="particles">
          {[...Array(15)].map((_, i) => {
            // Usar valores fixos baseados no índice para evitar problemas de hidratação
            const left = (i * 6.67) % 100;
            const top = (i * 4.5) % 100;
            const delay = (i % 5);
            const duration = 8 + (i % 4);
            
            return (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;

  .shapes-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .ribbon {
    position: absolute;
    width: 200px;
    height: 300px;
    opacity: 0.3;
    animation: floatRibbon 20s ease-in-out infinite;
  }

  .ribbon-1 {
    top: 10%;
    left: 5%;
    animation-delay: 0s;
    animation-duration: 25s;
  }

  .ribbon-2 {
    top: 30%;
    right: 10%;
    animation-delay: 8s;
    animation-duration: 30s;
    transform: scale(0.8);
  }

  .ribbon-3 {
    bottom: 20%;
    left: 20%;
    animation-delay: 15s;
    animation-duration: 22s;
    transform: scale(0.6);
  }

  .ribbon-surface {
    width: 100%;
    height: 100%;
    background: linear-gradient(
      45deg,
      rgba(139, 92, 246, 0.4) 0%,
      rgba(236, 72, 153, 0.3) 25%,
      rgba(59, 130, 246, 0.4) 50%,
      rgba(168, 85, 247, 0.3) 75%,
      rgba(255, 140, 0, 0.2) 100%
    );
    border-radius: 50% 20% 50% 20%;
    filter: blur(1px);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.3),
      0 0 60px rgba(236, 72, 153, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .ribbon-surface::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    animation: shimmer 3s ease-in-out infinite;
  }

  .particles {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 215, 0, 0.8) 0%,
      rgba(255, 140, 0, 0.6) 50%,
      transparent 100%
    );
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    animation: floatParticle 12s ease-in-out infinite;
  }

  @keyframes floatRibbon {
    0%,
    100% {
      transform: translateY(0) rotate(0deg) scale(1);
    }
    25% {
      transform: translateY(-20px) rotate(5deg) scale(1.05);
    }
    50% {
      transform: translateY(-10px) rotate(-3deg) scale(0.95);
    }
    75% {
      transform: translateY(-30px) rotate(2deg) scale(1.02);
    }
  }

  @keyframes shimmer {
    0%,
    100% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    50% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  @keyframes floatParticle {
    0%,
    100% {
      transform: translateY(0) scale(1);
      opacity: 0.6;
    }
    50% {
      transform: translateY(-30px) scale(1.2);
      opacity: 1;
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .ribbon {
      width: 150px;
      height: 200px;
      opacity: 0.2;
    }

    .particle {
      width: 3px;
      height: 3px;
    }
  }

  @media (max-width: 480px) {
    .ribbon {
      width: 100px;
      height: 150px;
      opacity: 0.15;
    }
  }
`;

export default AbstractShapes;
