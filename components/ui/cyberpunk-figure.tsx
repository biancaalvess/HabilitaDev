"use client";

import React from "react";

const CyberpunkFigure = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-[2] overflow-hidden pointer-events-none opacity-40 md:opacity-40 sm:opacity-20">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Helmet */}
        <div className="absolute top-[20%] right-[15%] animate-float-helmet md:top-[15%] md:right-[10%]" style={{ width: '80px', height: '100px' }}>
          <div className="relative w-full h-[60%] rounded-t-[20px] overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.4) 50%, rgba(236,72,153,0.3) 100%)'
          }}>
            {/* Visor Frame */}
            <div className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px] border-2 border-white/80 rounded-t-[15px] shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
            {/* Visor Glow */}
            <div className="absolute top-2 left-2 right-2 bottom-2 border border-pink-500/80 rounded-t-[12px] shadow-[0_0_15px_rgba(236,72,153,0.6)]"></div>
          </div>
          {/* Helmet Sides */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute rounded-full top-[20%] -left-2 animate-pulse-glow" style={{
              width: '15px',
              height: '30px',
              background: 'linear-gradient(90deg, rgba(139,92,246,0.6) 0%, rgba(59,130,246,0.4) 100%)'
            }}></div>
            <div className="absolute rounded-full top-[20%] -right-2 animate-pulse-glow" style={{
              width: '15px',
              height: '30px',
              background: 'linear-gradient(90deg, rgba(139,92,246,0.6) 0%, rgba(59,130,246,0.4) 100%)',
              animationDelay: '1s'
            }}></div>
          </div>
          {/* Wires */}
          <div className="absolute top-1/2 -right-5" style={{ width: '30px', height: '40px' }}>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded animate-wire-float"
                style={{
                  right: `${i * 8}px`,
                  animationDelay: `${i * 0.5}s`,
                  width: '2px',
                  height: '20px',
                  background: 'linear-gradient(180deg, rgba(236,72,153,0.8) 0%, transparent 100%)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Jacket */}
        <div className="absolute top-1/2 right-[20%] animate-float-jacket md:top-[45%] md:right-[15%]" style={{ width: '120px', height: '80px' }}>
          <div className="relative w-full h-full rounded-[20px] overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.4) 25%, rgba(236,72,153,0.3) 50%, rgba(168,85,247,0.4) 75%, rgba(59,130,246,0.3) 100%)'
          }}>
            {/* Collar */}
            <div className="absolute -top-2.5 left-5 right-5 h-5 rounded-t-[10px]" style={{
              background: 'linear-gradient(90deg, rgba(139,92,246,0.6) 0%, rgba(236,72,153,0.4) 100%)'
            }}></div>
            {/* Shoulder Pad */}
            <div className="absolute top-2.5 -left-4 rounded-[15px]" style={{
              width: '30px',
              height: '25px',
              background: 'linear-gradient(45deg, rgba(236,72,153,0.6) 0%, rgba(59,130,246,0.4) 100%)'
            }}>
              <div className="absolute top-[5px] left-[5px] right-[5px] bottom-[5px] rounded-[10px] shadow-[0_0_10px_rgba(236,72,153,0.5)]" style={{
                background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, rgba(236,72,153,0.3) 50%, rgba(59,130,246,0.2) 100%)'
              }}></div>
            </div>
            {/* Jacket Glow */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-transparent via-white/10 to-transparent animate-shimmer-jacket"></div>
          </div>
        </div>

        {/* Neon effects */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[30%] left-[10%] h-0.5 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent animate-neon-pulse md:h-0.5 sm:h-px" style={{ width: '200px', animationDelay: '0s' }}></div>
          <div className="absolute top-[60%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent animate-neon-pulse md:h-0.5 sm:h-px" style={{ width: '150px', animationDelay: '1s' }}></div>
          <div className="absolute bottom-[20%] left-[30%] h-0.5 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent animate-neon-pulse md:h-0.5 sm:h-px" style={{ width: '100px', animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default CyberpunkFigure;
