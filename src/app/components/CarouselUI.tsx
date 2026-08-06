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
  
  // Scroll states (in pixels)
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  
  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const isHovering = useRef(false);

  // Responsive variables
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cardWidth = isMobile ? 60 : 100;
  const cardHeight = isMobile ? 180 : 280;
  const gap = isMobile ? 4 : 8;
  const itemWidth = cardWidth + gap;

  // Repeat projects to ensure enough items for a seamless loop
  const displayItems = React.useMemo(() => {
    if (!projects || projects.length === 0) return [];
    let items = [...projects];
    while (items.length < 24) {
      items = [...items, ...projects];
    }
    const targetLength = Math.max(24, Math.ceil(24 / projects.length) * projects.length);
    return items.slice(0, targetLength);
  }, [projects]);

  const totalItems = displayItems.length;
  const totalWidth = totalItems * itemWidth;

  useEffect(() => {
    if (!isActive) return;

    // Start with a slight scroll to give a dynamic entrance
    currentScroll.current = -500;
    targetScroll.current = 0;

    let animationFrameId: number;

    const handleWheel = (e: WheelEvent) => {
      targetScroll.current += e.deltaY;
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        const delta = e.clientX - startX.current;
        const sensitivity = isMobile ? 1.5 : 1.2;
        targetScroll.current -= delta * sensitivity;
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
        // Optional: Snap to nearest item when not dragging
        const nearestSnap = Math.round(targetScroll.current / itemWidth) * itemWidth;
        targetScroll.current += (nearestSnap - targetScroll.current) * 0.05;
      }

      currentScroll.current += (targetScroll.current - currentScroll.current) * 0.08;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        
        // Calculate base position relative to current scroll
        const rawX = (i * itemWidth) - currentScroll.current;
        
        // Wrap items around the center (X = 0)
        // This math ensures that items going too far left will loop to the right, and vice versa.
        const x = ((rawX + totalWidth / 2) % totalWidth + totalWidth) % totalWidth - totalWidth / 2;
        
        // Calculate distance from center to apply visual effects
        const dist = Math.abs(x);
        
        // Fade out/shrink items that are far from the center
        // Max brightness at dist = 0, minimum at dist = 600px
        const z = Math.max(0, 1 - (dist / (isMobile ? 300 : 600))); 
        const brightness = Math.max(0.2, z);
        const isCenter = dist < (itemWidth / 2);
        
        let pointerEvents = 'auto';
        let opacity = 1.0;

        // Hide items that are too far away to avoid clipping at the edge of the wrapper
        if (z === 0) {
          pointerEvents = 'none';
          opacity = 0;
        }

        card.style.opacity = opacity.toFixed(3);
        card.style.pointerEvents = pointerEvents;
        card.style.zIndex = isCenter ? '10' : '1';
        
        // Apply flat horizontal transform (No 3D rotation or Z translation)
        card.style.transform = `translateX(${x}px)`;
        
        // Apply brightness and scale to the inner image container
        const inner = card.querySelector('.card-inner') as HTMLElement;
        if (inner) {
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
  }, [isActive, totalItems, itemWidth, totalWidth, isMobile]);

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
    >
      {/* Background Marquee Layer */}
      <div className="hidden md:flex absolute inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.08] justify-center items-center gap-6 scale-[1.1]">
        <style>{`
          @keyframes marqueeUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
          }
          @keyframes marqueeDown {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
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
        style={{ transform: 'translateY(-20px)' }}
      >
        <div ref={wrapperRef} className="absolute inset-0">
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
                
                {/* Title overlay */}
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
        {isMobile ? 'Swipe to Scroll' : 'Scroll or Drag'}
      </div>
    </div>
  );
}