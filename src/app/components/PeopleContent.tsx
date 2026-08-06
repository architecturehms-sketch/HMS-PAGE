import React, { useEffect, useRef, useMemo } from 'react';
import { TeamMember } from '../../hooks/useFirebaseData';

interface PeopleContentProps {
  team: TeamMember[];
}

export function PeopleContent({ team }: PeopleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Rotation states
  const targetRotation = useRef(0);
  const currentRotation = useRef(-180);
  
  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);

  // Responsive variables (matching CarouselUI)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cardWidth = isMobile ? 60 : 100;
  const cardHeight = isMobile ? 180 : 280;
  const gap = isMobile ? 4 : 8;

  // Duplicate items to form a dense circle
  const displayTeam = useMemo(() => {
    if (!team || team.length === 0) return [];
    let items = [...team];
    while (items.length < 24) {
      items = [...items, ...team];
    }
    const targetLength = Math.max(24, Math.ceil(24 / team.length) * team.length);
    return items.slice(0, targetLength);
  }, [team]);

  const totalItems = displayTeam.length;
  const radius = Math.round((cardWidth + gap) / (2 * Math.tan(Math.PI / totalItems)));

  useEffect(() => {
    if (totalItems === 0) return;

    let animationFrameId: number;

    const animate = () => {
      if (!isDragging.current) {
        // Snap to nearest item
        const itemAngle = 360 / totalItems;
        const nearestSnap = Math.round(targetRotation.current / itemAngle) * itemAngle;
        targetRotation.current += (nearestSnap - targetRotation.current) * 0.05;
      }

      currentRotation.current += (targetRotation.current - currentRotation.current) * 0.08;

      if (wrapperRef.current) {
        wrapperRef.current.style.transform = `rotateY(${currentRotation.current}deg)`;
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const itemAngle = i * (360 / totalItems);
        
        const rad = (itemAngle + currentRotation.current) * (Math.PI / 180);
        const z = Math.cos(rad); // 1 = front center, -1 = back center
        
        let opacity = 1.0;
        let pointerEvents = 'auto';

        const brightness = Math.max(0.2, (z + 1) / 2);
        
        if (z < 0) {
          pointerEvents = 'none';
          opacity = Math.max(0, 1 + z * 1.5);
        }

        card.style.opacity = opacity.toFixed(3);
        card.style.pointerEvents = pointerEvents;
        card.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
        
        const inner = card.querySelector('.card-inner') as HTMLElement;
        const titleOverlay = card.querySelector('.title-overlay') as HTMLElement;
        
        if (inner) {
          const isCenter = z > 0.98;
          inner.style.filter = `brightness(${isCenter ? 1.1 : brightness})`;
          inner.style.transform = isCenter ? 'scale(1.05)' : 'scale(1)';
          
          if (titleOverlay) {
            titleOverlay.style.opacity = isCenter ? '1' : '0';
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [totalItems, radius]);

  const handleWheel = (e: React.WheelEvent) => {
    // Only capture horizontal/vertical wheel events to rotate the carousel
    targetRotation.current -= e.deltaY * 0.1;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const delta = e.clientX - startX.current;
      const sensitivity = isMobile ? 0.4 : 0.2;
      targetRotation.current += delta * sensitivity;
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#111] animate-[fadeIn_0.5s_ease-out] min-h-[500px]">
      {/* Header */}
      <section className="px-4 sm:px-6 py-4 flex flex-col justify-center items-start relative overflow-hidden shrink-0 z-10 border-b border-white/10">
        <h2 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#f4f4f0]">
          PEOPLE /// OUR CREW
        </h2>
      </section>

      {/* Embedded 3D Carousel */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ perspective: '1800px' }}
      >
        <div 
          className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center" 
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-8deg) translateY(-20px)' 
          }}
        >
          <div ref={wrapperRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
            {displayTeam.map((person, i) => (
              <div
                key={`${person.id}-${i}`}
                ref={(el) => (cardsRef.current[i] = el)}
                className="absolute flex items-center justify-center will-change-transform group"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  marginLeft: `-${cardWidth / 2}px`,
                  marginTop: `-${cardHeight / 2}px`,
                  transformOrigin: 'center center',
                }}
              >
                <div 
                  className="card-inner w-full h-full relative transition-all duration-300 ease-out bg-[#0a0a0a] overflow-hidden rounded-[2px]"
                  style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                >
                  <img 
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover pointer-events-none grayscale opacity-90 transition-all duration-300"
                    style={{ WebkitUserDrag: 'none' }}
                  />
                  
                  {/* Title overlay - visible only when centered */}
                  <div className="title-overlay absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none">
                    <h3 className="text-[#f4f4f0] text-[10px] md:text-sm font-bold tracking-tight drop-shadow-md break-words truncate">
                      {person.name}
                    </h3>
                    <p className="text-[#f4f4f0]/60 text-[8px] md:text-[9px] font-mono uppercase tracking-widest mt-1 truncate">
                      {person.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/80 backdrop-blur-md px-6 py-3 rounded-full font-mono text-[10px] text-[#f4f4f0] tracking-[0.2em] uppercase z-50 pointer-events-none shadow-lg border border-white/10 whitespace-nowrap">
          {isMobile ? 'Swipe to Rotate' : 'Scroll or Drag to Rotate'}
        </div>
      </div>
    </div>
  );
}
