import React, { useEffect, useRef, useMemo, useState } from 'react';
import { TeamMember } from '../../hooks/useFirebaseData';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
  const hasDragged = useRef(false);
  const startX = useRef(0);

  // Active person state
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  
  // Popup state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Responsive variables (matching CarouselUI)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const cardWidth = isMobile ? 60 : 100;
  const cardHeight = isMobile ? 120 : 180;
  const gap = isMobile ? 6 : 10;

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

      let closestDist = Infinity;
      let newActiveIndex = activeIndexRef.current;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const itemAngle = i * (360 / totalItems);
        
        const rad = (itemAngle + currentRotation.current) * (Math.PI / 180);
        const z = Math.cos(rad); // 1 = front center, -1 = back center
        
        // Find center item
        const dist = Math.abs(1 - z);
        if (dist < closestDist) {
          closestDist = dist;
          newActiveIndex = i;
        }
        
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

      if (newActiveIndex !== activeIndexRef.current) {
        activeIndexRef.current = newActiveIndex;
        setActiveIndex(newActiveIndex);
      }

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
    hasDragged.current = false;
    startX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
      const delta = e.clientX - startX.current;
      if (Math.abs(delta) > 5) hasDragged.current = true;
      const sensitivity = isMobile ? 0.4 : 0.2;
      targetRotation.current += delta * sensitivity;
      startX.current = e.clientX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
  };

  return (
    <div 
      className="flex-1 flex flex-col bg-[#111] animate-[fadeIn_0.5s_ease-out] h-full overflow-hidden"
      onClick={() => {
         if (selectedMember) setSelectedMember(null);
      }}
    >
      {/* Header */}
      <section className="px-4 sm:px-6 py-4 flex flex-col justify-center items-start relative overflow-hidden shrink-0 z-20 border-b border-white/10">
        <h2 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#f4f4f0]">
          PEOPLE /// OUR CREW
        </h2>
      </section>

      {/* Active Person Info / Detailed Profile Area */}
      <div 
        className="w-full py-4 md:py-6 px-6 sm:px-12 flex flex-col items-center justify-start text-[#f4f4f0] z-20 relative bg-[#111] shrink-0"
      >
        {displayTeam[activeIndex] && (
          <div className="max-w-5xl w-full flex flex-col items-center">
            {/* 1. Permanent Name & Role Block */}
            <div 
              className="text-center flex flex-col items-center cursor-pointer z-30" 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMember(null);
              }}
            >
              <div className="flex items-baseline justify-center gap-3">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight transition-all duration-500">
                  {selectedMember ? selectedMember.name : displayTeam[activeIndex].name}
                </h1>
                <AnimatePresence>
                  {selectedMember && selectedMember.nameEn && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }} 
                      animate={{ opacity: 1, width: 'auto' }} 
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm md:text-lg text-[#f4f4f0]/40 font-bold tracking-wider whitespace-nowrap overflow-hidden"
                    >
                      <span className="pl-3">{selectedMember.nameEn}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-center gap-2 mt-2 transition-all duration-500">
                <p className="text-xs md:text-sm font-mono text-[#f4f4f0]/60 uppercase tracking-widest">
                  {selectedMember ? selectedMember.role : displayTeam[activeIndex].role}
                </p>
                <AnimatePresence>
                  {selectedMember && selectedMember.roleEn && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }} 
                      animate={{ opacity: 1, width: 'auto' }} 
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center gap-2 whitespace-nowrap overflow-hidden"
                    >
                      <span className="text-[#f4f4f0]/20 text-xs pl-2">|</span>
                      <p className="text-[10px] md:text-xs font-mono text-[#f4f4f0]/30 uppercase tracking-widest">{selectedMember.roleEn}</p>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <AnimatePresence>
                {selectedMember && selectedMember.specializations && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                    animate={{ opacity: 1, height: 'auto', marginTop: 12 }} 
                    exit={{ opacity: 0, height: 0, marginTop: 0 }} 
                    className="overflow-hidden"
                  >
                    <div className="text-[10px] text-[#E3342F] uppercase tracking-[0.2em] font-mono bg-[#E3342F]/10 py-1.5 px-3 rounded-full inline-block">
                      {selectedMember.specializations}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Expandable Details Block */}
            <AnimatePresence initial={false}>
              {selectedMember && (
                <motion.div
                  key="expandable-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full overflow-hidden flex flex-col items-center origin-top cursor-default"
                >
                  <div className="w-10 h-[1px] bg-white/20 mt-12 md:mt-20 mb-12 md:mb-20"></div>

                  <div className="w-full max-w-6xl flex flex-col md:flex-row items-center md:items-start gap-12 px-4 pb-24 md:pb-40">
                    {/* Left: Original Image */}
                    <div className="w-full md:w-1/3 flex justify-center md:justify-end shrink-0">
                      <div className="w-48 md:w-64 aspect-[3/4] overflow-hidden rounded-[2px]" style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <img 
                          src={selectedMember.img} 
                          alt={selectedMember.name}
                          className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                        />
                      </div>
                    </div>

                    {/* Right: Career Details */}
                    <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 text-center md:text-left pt-4 md:pt-0">
                      {/* Education */}
                      {(selectedMember.educationKr || selectedMember.educationEn) && (
                        <div className="flex flex-col items-center md:items-start">
                          <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#E3342F] mb-3 md:mb-4">Education</h4>
                          <div className="text-xs md:text-sm text-[#f4f4f0]/90 whitespace-pre-wrap leading-relaxed">{selectedMember.educationKr}</div>
                          <div className="text-[10px] md:text-xs text-[#f4f4f0]/50 whitespace-pre-wrap leading-relaxed font-light mt-1.5">{selectedMember.educationEn}</div>
                        </div>
                      )}
                      {/* Career */}
                      {(selectedMember.careerKr || selectedMember.careerEn) && (
                        <div className="flex flex-col items-center md:items-start">
                          <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#E3342F] mb-3 md:mb-4">Career</h4>
                          <div className="text-xs md:text-sm text-[#f4f4f0]/90 whitespace-pre-wrap leading-relaxed">{selectedMember.careerKr}</div>
                          <div className="text-[10px] md:text-xs text-[#f4f4f0]/50 whitespace-pre-wrap leading-relaxed font-light mt-1.5">{selectedMember.careerEn}</div>
                        </div>
                      )}
                      {/* Record */}
                      {(selectedMember.recordKr || selectedMember.recordEn) && (
                        <div className="flex flex-col items-center md:items-start sm:col-span-2">
                          <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#E3342F] mb-3 md:mb-4">Record</h4>
                          <div className="text-xs md:text-sm text-[#f4f4f0]/90 whitespace-pre-wrap leading-relaxed">{selectedMember.recordKr}</div>
                          <div className="text-[10px] md:text-xs text-[#f4f4f0]/50 whitespace-pre-wrap leading-relaxed font-light mt-1.5">{selectedMember.recordEn}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Embedded 3D Carousel (Moved to Bottom) */}
      <div 
        ref={containerRef}
        className={`relative flex-1 w-full select-none touch-none cursor-grab active:cursor-grabbing bg-[#111] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          selectedMember 
            ? 'opacity-20 grayscale pointer-events-none scale-95' 
            : 'opacity-100 grayscale-0 scale-100'
        }`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ perspective: '1800px' }}
      >
        <div 
          className="absolute top-[25%] left-1/2 w-0 h-0 flex items-center justify-center" 
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-12deg)' 
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
                  onClick={(e) => {
                    // Prevent click if we were dragging
                    if (hasDragged.current) return;
                    
                    const itemAngle = 360 / totalItems;
                    const currentBase = Math.round(targetRotation.current / 360) * 360;
                    let target = currentBase - (i * itemAngle);
                    
                    const diff = target - targetRotation.current;
                    if (diff > 180) target -= 360;
                    else if (diff < -180) target += 360;
                    
                    if (Math.abs(diff) < 5) {
                      setSelectedMember(person);
                    } else {
                      targetRotation.current = target;
                    }
                  }}
                  className="card-inner w-full h-full relative transition-all duration-300 ease-out bg-[#0a0a0a] overflow-hidden rounded-[2px] cursor-pointer"
                  style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                >
                  <img 
                    src={person.img}
                    alt={person.name}
                    className="w-full h-full object-cover pointer-events-none grayscale opacity-90 transition-all duration-300"
                    style={{ WebkitUserDrag: 'none' }}
                  />
                  

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
