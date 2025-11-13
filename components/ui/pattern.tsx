"use client";

import React from "react";

const Pattern = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden">
      <div className="w-full h-full m-0 flex items-stretch justify-stretch relative bg-gradient-to-br from-[#181c21] via-[#232526] via-[#414345] via-[#2d1b69] to-[#8b5cf6]">
        <div className="w-full h-full overflow-hidden relative" style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(139,92,246,0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(236,72,153,0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(59,130,246,0.3) 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, rgba(168,85,247,0.2) 0%, transparent 50%),
            repeating-linear-gradient(45deg, transparent 0px, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)
          `
        }}>
          <svg
            preserveAspectRatio="xMidYMid slice"
            height="100%"
            width="100%"
            className="absolute w-[200%] h-[200%] left-[-30%] top-[-20%] bg-transparent opacity-60 z-[1] animate-cube-move md:opacity-60 sm:opacity-40 xs:opacity-30 sm:w-[250%] sm:h-[250%] sm:left-[-50%] sm:top-[-30%] xs:w-[300%] xs:h-[300%] xs:left-[-60%] xs:top-[-40%]"
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
          <div className="absolute w-full h-full overflow-hidden z-[2]">
            <div className="absolute top-[20%] left-[10%] rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-float-shape opacity-70 md:opacity-70 sm:opacity-50" style={{ width: '80px', height: '80px', animationDuration: '12s', animationDelay: '0s' }}></div>
            <div className="absolute top-[60%] right-[15%] rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-float-shape opacity-70 md:opacity-70 sm:opacity-50" style={{ width: '120px', height: '120px', animationDuration: '18s', animationDelay: '3s' }}></div>
            <div className="absolute top-[80%] left-[20%] rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-float-shape opacity-70 md:opacity-70 sm:opacity-50" style={{ width: '60px', height: '60px', animationDuration: '14s', animationDelay: '6s' }}></div>
            <div className="absolute top-[10%] right-[30%] rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-float-shape opacity-70 md:opacity-70 sm:opacity-50" style={{ width: '100px', height: '100px', animationDuration: '16s', animationDelay: '9s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pattern;
