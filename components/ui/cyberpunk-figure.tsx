"use client";

import React from "react";
import styled from "styled-components";

const CyberpunkFigure = () => {
  return (
    <StyledWrapper>
      <div className="figure-container">
        {/* Helmet */}
        <div className="helmet">
          <div className="visor">
            <div className="visor-frame"></div>
            <div className="visor-glow"></div>
          </div>
          <div className="helmet-sides">
            <div className="side-component left"></div>
            <div className="side-component right"></div>
          </div>
          <div className="wires">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="wire"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </div>
        </div>

        {/* Jacket */}
        <div className="jacket">
          <div className="collar"></div>
          <div className="shoulder-pad">
            <div className="device"></div>
          </div>
          <div className="jacket-glow"></div>
        </div>

        {/* Neon effects */}
        <div className="neon-effects">
          <div className="neon-line line-1"></div>
          <div className="neon-line line-2"></div>
          <div className="neon-line line-3"></div>
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
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
  opacity: 0.4;

  .figure-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .helmet {
    position: absolute;
    top: 20%;
    right: 15%;
    width: 80px;
    height: 100px;
    animation: floatHelmet 15s ease-in-out infinite;
  }

  .visor {
    position: relative;
    width: 100%;
    height: 60%;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.3) 0%,
      rgba(139, 92, 246, 0.4) 50%,
      rgba(236, 72, 153, 0.3) 100%
    );
    border-radius: 20px 20px 5px 5px;
    overflow: hidden;
  }

  .visor-frame {
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 15px 15px 3px 3px;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
  }

  .visor-glow {
    position: absolute;
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 8px;
    border: 1px solid rgba(236, 72, 153, 0.8);
    border-radius: 12px 12px 2px 2px;
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.6);
  }

  .helmet-sides {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .side-component {
    position: absolute;
    width: 15px;
    height: 30px;
    background: linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.6) 0%,
      rgba(59, 130, 246, 0.4) 100%
    );
    border-radius: 50%;
    top: 20%;
  }

  .side-component.left {
    left: -8px;
    animation: pulseGlow 2s ease-in-out infinite;
  }

  .side-component.right {
    right: -8px;
    animation: pulseGlow 2s ease-in-out infinite 1s;
  }

  .wires {
    position: absolute;
    top: 50%;
    right: -20px;
    width: 30px;
    height: 40px;
  }

  .wire {
    position: absolute;
    width: 2px;
    height: 20px;
    background: linear-gradient(
      180deg,
      rgba(236, 72, 153, 0.8) 0%,
      transparent 100%
    );
    border-radius: 1px;
    animation: wireFloat 3s ease-in-out infinite;
  }

  .wire:nth-child(1) {
    right: 0;
  }
  .wire:nth-child(2) {
    right: 8px;
  }
  .wire:nth-child(3) {
    right: 16px;
  }

  .jacket {
    position: absolute;
    top: 50%;
    right: 20%;
    width: 120px;
    height: 80px;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.3) 0%,
      rgba(139, 92, 246, 0.4) 25%,
      rgba(236, 72, 153, 0.3) 50%,
      rgba(168, 85, 247, 0.4) 75%,
      rgba(59, 130, 246, 0.3) 100%
    );
    border-radius: 20px;
    animation: floatJacket 18s ease-in-out infinite;
    overflow: hidden;
  }

  .collar {
    position: absolute;
    top: -10px;
    left: 20px;
    right: 20px;
    height: 20px;
    background: linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.6) 0%,
      rgba(236, 72, 153, 0.4) 100%
    );
    border-radius: 10px 10px 0 0;
  }

  .shoulder-pad {
    position: absolute;
    top: 10px;
    left: -15px;
    width: 30px;
    height: 25px;
    background: linear-gradient(
      45deg,
      rgba(236, 72, 153, 0.6) 0%,
      rgba(59, 130, 246, 0.4) 100%
    );
    border-radius: 15px;
  }

  .device {
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(236, 72, 153, 0.3) 50%,
      rgba(59, 130, 246, 0.2) 100%
    );
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
  }

  .jacket-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    animation: shimmerJacket 4s ease-in-out infinite;
  }

  .neon-effects {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .neon-line {
    position: absolute;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.8) 50%,
      transparent 100%
    );
    height: 2px;
    animation: neonPulse 3s ease-in-out infinite;
  }

  .line-1 {
    top: 30%;
    left: 10%;
    width: 200px;
    animation-delay: 0s;
  }

  .line-2 {
    top: 60%;
    right: 20%;
    width: 150px;
    animation-delay: 1s;
  }

  .line-3 {
    bottom: 20%;
    left: 30%;
    width: 100px;
    animation-delay: 2s;
  }

  @keyframes floatHelmet {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-15px) rotate(2deg);
    }
  }

  @keyframes floatJacket {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-10px) rotate(-1deg);
    }
  }

  @keyframes pulseGlow {
    0%,
    100% {
      box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
    }
  }

  @keyframes wireFloat {
    0%,
    100% {
      transform: translateY(0) scaleY(1);
    }
    50% {
      transform: translateY(-5px) scaleY(1.2);
    }
  }

  @keyframes shimmerJacket {
    0%,
    100% {
      transform: translateX(-100%) translateY(-100%) rotate(45deg);
    }
    50% {
      transform: translateX(100%) translateY(100%) rotate(45deg);
    }
  }

  @keyframes neonPulse {
    0%,
    100% {
      opacity: 0.3;
      box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
    }
    50% {
      opacity: 1;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .helmet {
      width: 60px;
      height: 80px;
      top: 15%;
      right: 10%;
    }

    .jacket {
      width: 90px;
      height: 60px;
      top: 45%;
      right: 15%;
    }

    .neon-line {
      height: 1px;
    }
  }

  @media (max-width: 480px) {
    opacity: 0.2;

    .helmet {
      width: 40px;
      height: 60px;
    }

    .jacket {
      width: 70px;
      height: 50px;
    }
  }
`;

export default CyberpunkFigure;

