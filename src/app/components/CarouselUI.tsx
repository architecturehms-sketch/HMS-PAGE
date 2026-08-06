import React, { useEffect, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Project } from '../../hooks/useFirebaseData';

interface CarouselUIProps {
  isActive: boolean;
  onSelect: (item: any) => void;
  projects: Project[];
}

export function CarouselUI({ isActive, onSelect, projects }: CarouselUIProps) {
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Scroll states (using index space, e.g., 0 = first item, 1 = second item)
  const targetScrollIndex = useRef(0);
  const currentScrollIndex = useRef(0);
  
  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const isHovering = useRef(false);

  // Responsive variables
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cardWidth = isMobile ? 140 : 220;
  const cardHeight = isMobile ? 210 : 330;
  const items = projects;

  useEffect(() => {
    if (!isActive) return;

    // Reset to beginning on open
    currentScrollIndex.current = -2; // Start from outside
    targetScrollIndex.current = 0;

    let animationFrameId: number;

    const handleWheel = (e: WheelEvent) => {
      // Prevent default to stop full page scrolling if desired (usually handled globally)
      const delta = e.deltaY || e.deltaX;
      targetScrollIndex.current += delta * 0.003;
      clampTarget();
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const delta = e.clientX - startX.current;
        const sensitivity = isMobile ? 0.008 : 0.004;
        targetScrollIndex.current -= delta * sensitivity;
        clampTarget();
        startX.current = e.clientX;
      }
    };

    const clampTarget = () => {
      if (targetScrollIndex.current < 0) {
        targetScrollIndex.current = 0;
      } else if (targetScrollIndex.current > items.length - 1) {
        targetScrollIndex.current = items.length - 1;
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
      // Snap to nearest integer on release
      targetScrollIndex.current = Math.round(targetScrollIndex.current);
      clampTarget();
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    
    // Add touch end to handle snap on mobile correctly
    window.addEventListener('touchend', handlePointerUp);

    const animate = () => {
      // Lerp for smooth scrolling wave effect
      currentScrollIndex.current += (targetScrollIndex.current - currentScrollIndex.current) * 0.06;

      const spineSpacing = isMobile ? 30 : 45;
      const centerSpacing = isMobile ? 110 : 160;
      const maxRotation = 82; // 82 degrees creates a good "spine" look

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        
        // Difference in index between this card and the current scroll focus
        const diff = i - currentScrollIndex.current;
        const absDiff = Math.abs(diff);
        
        // 1. Calculate X Position
        let pushAmount = 0;
        if (diff > 0) {
          pushAmount = Math.min(diff, 1) * centerSpacing;
        } else if (diff < 0) {
          pushAmount = Math.max(diff, -1) * centerSpacing;
        }
        const translateX = diff * spineSpacing + pushAmount;

        // 2. Calculate Rotation Y
        let rotateY = 0;
        if (diff > 0) {
          rotateY = Math.min(diff, 1) * -maxRotation;
        } else if (diff < 0) {
          rotateY = Math.max(diff, -1) * -maxRotation; 
        }

        // 3. Calculate Z translation and Scale for "Pop out" effect
        let translateZ = 0;
        let scale = 1.0;
        let opacity = 1.0;
        let pointerEvents = 'auto';

        if (absDiff < 1) {
          // Transitioning through center
          translateZ = (1 - absDiff) * (isMobile ? 100 : 150);
          scale = 1 + (1 - absDiff) * 0.1;
          opacity = 1;
        } else {
          // Outside center (Spines)
          translateZ = 0;
          scale = 1;
          opacity = Math.max(0.3, 1 - (absDiff - 1) * 0.2); // Fade out items far away
        }

        // Only allow clicking on the center item
        if (absDiff > 0.5) {
          pointerEvents = 'none';
        }

        // Calculate z-index: Center item is highest
        const zIndex = 100 - Math.round(absDiff * 10);

        card.style.opacity = opacity.toFixed(3);
        card.style.zIndex = zIndex.toString();
        card.style.pointerEvents = pointerEvents;
        card.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale.toFixed(3)})`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, items.length, isMobile]);

  useEffect(() => {
    if (!isActive) {
      cardsRef.current.forEach((card) => {
        if (card) card.style.pointerEvents = 'none';
      });
    }
  }, [isActive]);

  return (
    <div
      className={`fixed inset-0 w-screen h-[100dvh] z-40 transition-opacity duration-1000 overflow-hidden select-none touch-none ${
        isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ perspective: '1200px' }} // Perspective depth for the 3D effect
    >
      {/* Background Marquee Layer (Unchanged) */}
      <div className="hidden md:flex absolute inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.08] justify-center items-center gap-6 scale-[1.1]">
        <style>{`
          @keyframes marqueeUp {
            0% { transform: translateY(0) translateZ(0); }
            100% { transform: translateY(-50%) translateZ(0); }
          }
          @keyframes marqueeDown {
            0% { transform: translateY(-50%) translateZ(0); }
            100% { transform: translateY(0) translateZ(0); }
          }
        `}</style>
        {[...Array(7)].map((_, colIndex) => {
          const offsetItems = [...items.slice(colIndex % items.length), ...items.slice(0, colIndex % items.length)];
          const columnItems = [...offsetItems, ...offsetItems];

          return (
            <div
              key={`col-${colIndex}`}
              className="flex flex-col gap-6 w-[200px]"
              style={{
                willChange: 'transform',
                animation: `${colIndex % 2 === 0 ? 'marqueeUp' : 'marqueeDown'} ${40 + (colIndex % 3) * 10}s linear infinite`,
              }}
            >
              {columnItems.map((item, i) => (
                <div
                  key={`bg-gallery-${colIndex}-${i}`}
                  className="w-full h-[280px] rounded-sm overflow-hidden"
                >
                  <ImageWithFallback
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover brightness-[0.4]"
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div 
        className="absolute top-1/2 left-1/2 w-0 h-0 flex items-center justify-center" 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            ref={(el) => (cardsRef.current[i] = el)}
            onClick={() => onSelect(item)}
            onMouseEnter={() => (isHovering.current = true)}
            onMouseLeave={() => (isHovering.current = false)}
            className="absolute flex items-center justify-center cursor-pointer transition-colors duration-500 will-change-transform"
            style={{
              width: `${cardWidth}px`,
              height: `${cardHeight}px`,
              marginLeft: `-${cardWidth / 2}px`,
              marginTop: `-${cardHeight / 2}px`,
              transformOrigin: 'center center',
            }}
          >
            <div 
              className={`w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-[1.02] ${
                'isLogo' in item && item.isLogo 
                  ? 'flex items-center justify-center' 
                  : 'overflow-hidden rounded-md bg-[#1a1a1a] shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-white/10'
              }`}
            >
              {'isLogo' in item && item.isLogo ? (
                <>
                  <img 
                    src="/about_logo.webp" 
                    alt="ABOUT US" 
                    className="w-full h-full scale-[1.2] object-contain filter brightness-0 invert opacity-90 transition-all duration-700 ease-out select-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="hidden text-[100px] font-black tracking-tighter text-[#f4f4f0] opacity-90 transition-all duration-700 ease-out select-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                    HMS
                  </span>
                </>
              ) : (
                <>
                  <ImageWithFallback
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out brightness-[0.7] group-hover:brightness-110 pointer-events-none"
                  />
                  {/* Subtle overlay for inactive cards to make them look more like spines when rotated */}
                  <div className="absolute inset-0 bg-black/20 transition-colors duration-500 pointer-events-none" />
                </>
              )}
              
              {/* Title & Detail Overlay - only prominent when facing front */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-20 pointer-events-none">
                <h3 className="text-[#f4f4f0] text-xs md:text-lg font-bold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] break-words leading-tight">
                  {item.desc}
                </h3>
                <p className="text-[#f4f4f0]/80 text-[10px] font-mono uppercase tracking-widest mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {'isLogo' in item && item.isLogo ? 'ABOUT US' : 'ENTER PROJECT'}
                </p>
              </div>
              
              {/* Darkening shadow that appears on the spine edges */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 opacity-0 transition-opacity duration-300 pointer-events-none spine-shadow" />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/80 backdrop-blur-md px-6 py-3 rounded-full font-mono text-[10px] text-[#f4f4f0] tracking-[0.2em] uppercase z-50 pointer-events-none shadow-lg border border-white/10 whitespace-nowrap">
        {isMobile ? 'Swipe to Explore' : 'Scroll or Drag to Explore'}
      </div>
      
      {/* Add a global style to fade in the edge shadows when rotated */}
      <style>{`
        .spine-shadow {
          opacity: 0 !important;
        }
      `}</style>
    </div>
  );
}