"use client";

import React from "react";
import styled from "styled-components";

const Pattern = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <div className="pattern-bg">
          <svg
            preserveAspectRatio="xMidYMid slice"
            height="100%"
            width="100%"
            className="cube-svg"
            viewBox="0 0 120 104"
          >
            <defs>
              <linearGradient
                y2="100%"
                x2="100%"
                y1="0%"
                x1="0%"
                id="cube-dark"
              >
                <stop stopColor="#232526" offset="0%" />
                <stop stopColor="#414345" offset="100%" />
              </linearGradient>
              <linearGradient y2="0%" x2="100%" y1="100%" x1="0%" id="cube-mid">
                <stop stopColor="#4b6cb7" offset="0%" />
                <stop stopColor="#182848" offset="100%" />
              </linearGradient>
              <linearGradient
                y2="100%"
                x2="0%"
                y1="0%"
                x1="100%"
                id="cube-light"
              >
                <stop stopColor="#a8edea" offset="0%" />
                <stop stopColor="#fed6e3" offset="100%" />
              </linearGradient>
            </defs>
          </svg>
          <div className="floating-shapes">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  overflow: hidden;

  .container {
    background: linear-gradient(
      135deg,
      #0f0f23 0%,
      #1a1a2e 25%,
      #16213e 50%,
      #0f3460 75%,
      #533483 100%
    );
    width: 100%;
    height: 100%;
    margin: 0;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
    position: relative;
  }

  .pattern-bg {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: radial-gradient(
        circle at 20% 80%,
        rgba(120, 119, 198, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(255, 119, 198, 0.3) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 40%,
        rgba(120, 219, 255, 0.2) 0%,
        transparent 50%
      ),
      repeating-linear-gradient(
        45deg,
        transparent 0px,
        transparent 2px,
        rgba(255, 255, 255, 0.03) 2px,
        rgba(255, 255, 255, 0.03) 4px
      );
    position: relative;
  }

  .cube-svg {
    position: absolute;
    width: 200%;
    height: 200%;
    left: -30%;
    top: -20%;
    background: transparent;
    opacity: 0.6;
    z-index: 1;
    animation: cubeMove 20s ease-in-out infinite alternate;
  }

  .floating-shapes {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 2;
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    animation: float 15s ease-in-out infinite;
  }

  .shape:nth-child(1) {
    width: 80px;
    height: 80px;
    top: 20%;
    left: 10%;
    animation-delay: 0s;
    animation-duration: 12s;
  }

  .shape:nth-child(2) {
    width: 120px;
    height: 120px;
    top: 60%;
    right: 15%;
    animation-delay: 3s;
    animation-duration: 18s;
  }

  .shape:nth-child(3) {
    width: 60px;
    height: 60px;
    top: 80%;
    left: 20%;
    animation-delay: 6s;
    animation-duration: 14s;
  }

  .shape:nth-child(4) {
    width: 100px;
    height: 100px;
    top: 10%;
    right: 30%;
    animation-delay: 9s;
    animation-duration: 16s;
  }

  @keyframes cubeMove {
    0% {
      transform: translateY(0) scale(1) rotate(0deg);
    }
    50% {
      transform: translateY(-10%) scale(1.05) rotate(0.5deg);
    }
    100% {
      transform: translateY(-20%) scale(1.02) rotate(1deg);
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    33% {
      transform: translateY(-20px) rotate(120deg);
    }
    66% {
      transform: translateY(10px) rotate(240deg);
    }
  }

  /* Responsividade para dispositivos móveis */
  @media (max-width: 768px) {
    .pattern-bg {
      background: radial-gradient(
          circle at 20% 80%,
          rgba(120, 119, 198, 0.2) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 80% 20%,
          rgba(255, 119, 198, 0.2) 0%,
          transparent 50%
        ),
        repeating-linear-gradient(
          45deg,
          transparent 0px,
          transparent 1px,
          rgba(255, 255, 255, 0.02) 1px,
          rgba(255, 255, 255, 0.02) 2px
        );
    }

    .cube-svg {
      width: 250%;
      height: 250%;
      left: -50%;
      top: -30%;
      opacity: 0.4;
    }

    .shape {
      opacity: 0.7;
    }
  }

  @media (max-width: 480px) {
    .pattern-bg {
      background: radial-gradient(
          circle at 20% 80%,
          rgba(120, 119, 198, 0.15) 0%,
          transparent 50%
        ),
        radial-gradient(
          circle at 80% 20%,
          rgba(255, 119, 198, 0.15) 0%,
          transparent 50%
        );
    }

    .cube-svg {
      width: 300%;
      height: 300%;
      left: -60%;
      top: -40%;
      opacity: 0.3;
    }

    .shape {
      opacity: 0.5;
    }
  }
`;

export default Pattern;
