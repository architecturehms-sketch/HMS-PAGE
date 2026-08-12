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
        className="w-full py-4 md:py-6 px-6 sm:px-12 flex flex-col items-center justify-center text-[#f4f4f0] z-20 relative bg-[#111] shrink-0 transition-all duration-700 ease-in-out"
        style={{ minHeight: selectedMember ? '50vh' : 'auto' }}
      >
        <AnimatePresence mode="wait">
          {!selectedMember ? (
            <motion.div 
              key="basic-info"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl text-center flex flex-col items-center"
            >
              <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                {displayTeam[activeIndex].name}
              </h1>
              <p className="text-xs md:text-sm font-mono text-[#f4f4f0]/60 uppercase tracking-widest mb-4">
                {displayTeam[activeIndex].role}
              </p>
              <div className="w-10 h-[1px] bg-white/20 mb-4"></div>
              <p className="text-xs md:text-sm text-[#f4f4f0]/80 leading-relaxed font-light whitespace-pre-wrap max-w-2xl mx-auto">
                {/* @ts-ignore */}
                {displayTeam[activeIndex].history || 'HMS 건축사사무소의 철학과 비전을 공유하며, 공간의 본질과 재료의 물성을 탐구하는 건축가입니다.\n다양한 스케일의 프로젝트를 통해 사용자 경험 중심의 혁신적인 공간을 창출하고 있습니다.'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="detail-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-6xl flex flex-col md:flex-row gap-8 md:gap-16 items-start justify-center cursor-default pt-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Side: Name & Role */}
              <div className="w-full md:w-1/3 text-center md:text-right border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter drop-shadow-lg">{selectedMember.name}</h2>
                <h3 className="text-sm md:text-lg text-[#f4f4f0]/80 mt-2 font-medium tracking-wide">{selectedMember.role}</h3>
                
                {(selectedMember.nameEn || selectedMember.roleEn) && (
                  <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-[#f4f4f0]/10">
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight text-[#f4f4f0]/60">{selectedMember.nameEn}</h2>
                    <h3 className="text-xs md:text-sm text-[#f4f4f0]/40 mt-1 uppercase tracking-widest font-mono">{selectedMember.roleEn}</h3>
                  </div>
                )}

                {selectedMember.specializations && (
                  <div className="mt-6 md:mt-8 text-[10px] md:text-xs text-[#E3342F] uppercase tracking-[0.2em] font-mono border border-[#E3342F]/30 bg-[#E3342F]/5 py-2 px-4 rounded-full inline-block">
                    {selectedMember.specializations}
                  </div>
                )}
              </div>

              {/* Right Side: Education, Career, Record */}
              <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Education */}
                {(selectedMember.educationKr || selectedMember.educationEn) && (
                  <div>
                    <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#E3342F] mb-3">Education</h4>
                    <div className="space-y-2">
                      <div className="text-xs md:text-sm text-[#f4f4f0]/90 whitespace-pre-wrap leading-relaxed">{selectedMember.educationKr}</div>
                      <div className="text-[10px] md:text-xs text-[#f4f4f0]/50 whitespace-pre-wrap leading-relaxed font-light">{selectedMember.educationEn}</div>
                    </div>
                  </div>
                )}
                {/* Career */}
                {(selectedMember.careerKr || selectedMember.careerEn) && (
                  <div>
                    <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#E3342F] mb-3">Career</h4>
                    <div className="space-y-2">
                      <div className="text-xs md:text-sm text-[#f4f4f0]/90 whitespace-pre-wrap leading-relaxed">{selectedMember.careerKr}</div>
                      <div className="text-[10px] md:text-xs text-[#f4f4f0]/50 whitespace-pre-wrap leading-relaxed font-light">{selectedMember.careerEn}</div>
                    </div>
                  </div>
                )}
                {/* Record */}
                {(selectedMember.recordKr || selectedMember.recordEn) && (
                  <div className="md:col-span-2">
                    <h4 className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold text-[#E3342F] mb-3">Record</h4>
                    <div className="space-y-2 flex flex-col md:flex-row gap-4 md:gap-8">
                      <div className="flex-1 text-xs md:text-sm text-[#f4f4f0]/90 whitespace-pre-wrap leading-relaxed">{selectedMember.recordKr}</div>
                      <div className="flex-1 text-[10px] md:text-xs text-[#f4f4f0]/50 whitespace-pre-wrap leading-relaxed font-light">{selectedMember.recordEn}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Embedded 3D Carousel (Moved to Bottom) */}
      <div 
        ref={containerRef}
        className={`relative flex-1 w-full select-none touch-none cursor-grab active:cursor-grabbing bg-[#111] transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          selectedMember 
            ? 'translate-y-[10vh] opacity-30 grayscale blur-[2px] pointer-events-none' 
            : 'translate-y-0 opacity-100 grayscale-0 blur-0'
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
                  
                  {/* Title overlay - visible only when centered */}
                  <div className="title-overlay absolute inset-x-0 bottom-0 p-2 md:p-3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none">
                    <h3 className="text-[#f4f4f0] text-[8px] md:text-[11px] font-bold tracking-tight drop-shadow-md whitespace-nowrap">
                      {person.name}
                    </h3>
                    <p className="text-[#f4f4f0]/60 text-[7px] md:text-[8px] font-mono uppercase tracking-wider mt-0.5 whitespace-nowrap">
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
