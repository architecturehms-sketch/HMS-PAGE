import React, { useRef, useState, useEffect } from 'react';

interface IntroUIProps {
  onEnter: () => void;
  isHidden: boolean;
}

export function IntroUI({ onEnter, isHidden }: IntroUIProps) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      onClick={onEnter}
      className={`fixed inset-0 z-50 flex flex-col justify-center items-center text-[#ececec] transition-opacity duration-[1500ms] cursor-pointer ${
        isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Corner Decorations */}
      <div className="absolute top-10 left-10 w-6 h-6 border-t border-l border-white/30"></div>
      <div className="absolute top-10 right-10 w-6 h-6 border-t border-r border-white/30"></div>
      <div className="absolute bottom-10 left-10 w-6 h-6 border-b border-l border-white/30"></div>
      <div className="absolute bottom-10 right-10 w-6 h-6 border-b border-r border-white/30"></div>

      {/* Micro Copy */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/40 tracking-[0.3em]">
        SCALE 1:100
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] text-white/40 tracking-[0.3em]">
        PROJECTION.MATRIX
      </div>

      <div
        ref={titleRef}
        className="text-[11vw] leading-[0.85] tracking-[-0.05em] font-black uppercase text-center relative pointer-events-none select-none text-transparent"
        style={{
          backgroundImage: `radial-gradient(circle 15vw at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.15) 80%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
        }}
      >
        HMS
        <br />
        ARCHITECTURE
      </div>

      <div className={`absolute bottom-[10%] font-mono text-xs tracking-[0.2em] uppercase transition-opacity duration-1000 ${isHidden ? 'opacity-0' : 'opacity-100 animate-pulse'}`}>
        Click to Enter
      </div>
    </div>
  );
}
