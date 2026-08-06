import React, { useEffect, useRef, useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Project } from '../../hooks/useFirebaseData';

interface CarouselUIProps {
  isActive: boolean;
  onSelect: (item: any) => void;
  projects: Project[];
}

export function CarouselUI({ isActive, onSelect, projects }: CarouselUIProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  // Rotation states
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const hoverVelocity = useRef(0);
  
  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const isHovering = useRef(false);

  // Responsive variables
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cardWidth = isMobile ? 80 : 130;
  const cardHeight = isMobile ? 180 : 280;
  const gap = isMobile ? 4 : 8; // Small gap between cards like the image

  // Repeat projects to create a dense cylinder (at least 24 items)
  const displayItems = React.useMemo(() => {
    if (!projects || projects.length === 0) return [];
    let items = [...projects];
    while (items.length < 24) {
      items = [...items, ...projects];
    }
    // Cap at a multiple of projects length to avoid weird wrapping, around 24-30
    const targetLength = Math.max(24, Math.ceil(24 / projects.length) * projects.length);
    return items.slice(0, targetLength);
  }, [projects]);

  const totalItems = displayItems.length;
  // Calculate radius based on width and gap to form a perfect circle
  const radius = Math.round((cardWidth + gap) / (2 * Math.tan(Math.PI / totalItems)));

  useEffect(() => {
    if (!isActive) return;

    // Start with a slight rotation to give a dynamic entrance
    currentRotation.current = -180;
    targetRotation.current = 0;

    let animationFrameId: number;

    const handleWheel = (e: WheelEvent) => {
      targetRotation.current -= e.deltaY * 0.1;
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const delta = e.clientX - startX.current;
        const sensitivity = isMobile ? 0.4 : 0.2;
        targetRotation.current += delta * sensitivity;
        startX.current = e.clientX;
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

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
        
        // Calculate absolute angle to determine z-depth and visibility
        const rad = (itemAngle + currentRotation.current) * (Math.PI / 180);
        const z = Math.cos(rad); // 1 = front center, -1 = back center
        
        let opacity = 1.0;
        let pointerEvents = 'auto';

        // Dimming effect: darkest at the back, brightest at the front
        // z ranges from 1 to -1
        const brightness = Math.max(0.2, (z + 1) / 2); // 0.2 to 1.0
        
        if (z < 0) {
          pointerEvents = 'none'; // Cannot click back items
          opacity = Math.max(0, 1 + z * 1.5); // Fade out back items if needed
        }

        card.style.opacity = opacity.toFixed(3);
        card.style.pointerEvents = pointerEvents;
        
        // Apply transform
        card.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
        
        // Apply brightness to the inner image container
        const inner = card.querySelector('.card-inner') as HTMLElement;
        if (inner) {
          // Extra brightness boost for the absolute center item
          const isCenter = z > 0.98;
          inner.style.filter = `brightness(${isCenter ? 1.1 : brightness})`;
          inner.style.transform = isCenter ? 'scale(1.05)' : 'scale(1)';
        }
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
  }, [isActive, totalItems, radius, isMobile]);

  useEffect(() => {
    if (!isActive) {
      cardsRef.current.forEach((card) => {
        if (card) card.style.pointerEvents = 'none';
      });
    }
  }, [isActive]);

  return (
    <div
      className={`fixed inset-0 w-screen h-[100dvh] z-40 transition-opacity duration-1000 overflow-hidden select-none touch-none bg-[#111] ${
        isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ perspective: '1800px' }} // Strong perspective for depth
    >
      {/* Background Marquee Layer (Kept as requested) */}
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
          const offsetItems = [...projects.slice(colIndex % projects.length), ...projects.slice(0, colIndex % projects.length)];
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
        style={{ 
          transformStyle: 'preserve-3d',
          // RotateX(-8deg) gives the arched look (center higher, edges lower)
          // translateY pushes the whole carousel to visually center it after rotation
          transform: 'rotateX(-8deg) translateY(-20px)' 
        }}
      >
        <div ref={wrapperRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {displayItems.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              ref={(el) => (cardsRef.current[i] = el)}
              onClick={() => onSelect(item)}
              onMouseEnter={() => (isHovering.current = true)}
              onMouseLeave={() => (isHovering.current = false)}
              className="absolute flex items-center justify-center cursor-pointer will-change-transform group"
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
                style={{ 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.8)' 
                }}
              >
                {'isLogo' in item && item.isLogo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#111]">
                    <img 
                      src="/about_logo.webp" 
                      alt="ABOUT US" 
                      className="w-3/4 object-contain filter brightness-0 invert opacity-80"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden text-3xl font-black tracking-tighter text-[#f4f4f0] opacity-80">
                      HMS
                    </span>
                  </div>
                ) : (
                  <ImageWithFallback
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                )}
                
                {/* Title overlay - visible only on hover or when centered */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <h3 className="text-[#f4f4f0] text-xs font-bold tracking-tight drop-shadow-md break-words">
                    {item.desc}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/80 backdrop-blur-md px-6 py-3 rounded-full font-mono text-[10px] text-[#f4f4f0] tracking-[0.2em] uppercase z-50 pointer-events-none shadow-lg border border-white/10 whitespace-nowrap">
        {isMobile ? 'Swipe to Rotate' : 'Scroll or Drag to Rotate'}
      </div>
    </div>
  );
}