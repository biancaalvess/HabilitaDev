"use client";

import React from "react";

const AbstractShapes = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-[1] overflow-hidden pointer-events-none">
      <div className="relative w-full h-full">
        {/* Ribbon 1 - Main flowing shape */}
        <div className="absolute opacity-30 animate-float-ribbon top-[10%] left-[5%] md:opacity-20 sm:opacity-15" style={{ width: '200px', height: '300px', animationDuration: '25s', animationDelay: '0s' }}>
          <div className="w-full h-full rounded-[50%_20%_50%_20%] blur-[1px] shadow-[0_0_30px_rgba(139,92,246,0.3),0_0_60px_rgba(236,72,153,0.2),inset_0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden" style={{
            background: 'linear-gradient(45deg, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.3) 25%, rgba(59,130,246,0.4) 50%, rgba(168,85,247,0.3) 75%, rgba(255,140,0,0.2) 100%)'
          }}>
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Ribbon 2 - Secondary flowing shape */}
        <div className="absolute opacity-30 animate-float-ribbon top-[30%] right-[10%] scale-80 md:opacity-20 sm:opacity-15" style={{ width: '200px', height: '300px', animationDuration: '30s', animationDelay: '8s' }}>
          <div className="w-full h-full rounded-[50%_20%_50%_20%] blur-[1px] shadow-[0_0_30px_rgba(139,92,246,0.3),0_0_60px_rgba(236,72,153,0.2),inset_0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden" style={{
            background: 'linear-gradient(45deg, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.3) 25%, rgba(59,130,246,0.4) 50%, rgba(168,85,247,0.3) 75%, rgba(255,140,0,0.2) 100%)'
          }}>
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Ribbon 3 - Accent shape */}
        <div className="absolute opacity-30 animate-float-ribbon bottom-[20%] left-[20%] scale-60 md:opacity-20 sm:opacity-15" style={{ width: '200px', height: '300px', animationDuration: '22s', animationDelay: '15s' }}>
          <div className="w-full h-full rounded-[50%_20%_50%_20%] blur-[1px] shadow-[0_0_30px_rgba(139,92,246,0.3),0_0_60px_rgba(236,72,153,0.2),inset_0_0_20px_rgba(255,255,255,0.1)] relative overflow-hidden" style={{
            background: 'linear-gradient(45deg, rgba(139,92,246,0.4) 0%, rgba(236,72,153,0.3) 25%, rgba(59,130,246,0.4) 50%, rgba(168,85,247,0.3) 75%, rgba(255,140,0,0.2) 100%)'
          }}>
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Floating particles with iridescent effect */}
        <div className="absolute w-full h-full">
          {[...Array(15)].map((_, i) => {
            const left = (i * 6.67) % 100;
            const top = (i * 4.5) % 100;
            const delay = (i % 5);
            const duration = 8 + (i % 4);
            
            return (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)] animate-float-particle md:w-0.5 md:h-0.5"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,140,0,0.6) 50%, transparent 100%)'
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AbstractShapes;
