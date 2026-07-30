import React, { useEffect, useRef } from 'react';
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
  const radius = isMobile ? 320 : 480; // 늘어난 반지름으로 카드 간격 확보
  const cardWidth = isMobile ? 160 : 240;
  const cardHeight = isMobile ? 240 : 320;
  const items = projects; // Use projects from props

  useEffect(() => {
    if (!isActive) return;

    // 인트로 클릭 시 "팽글팽글" 돌아가는 등장 효과: -1080도(3바퀴)에서 0도로 감속하며 안착
    currentRotation.current = -1080;
    targetRotation.current = 0;

    let animationFrameId: number;

    const handleWheel = (e: WheelEvent) => {
      targetRotation.current -= e.deltaY * 0.15; // 마우스 휠 스크롤 회전 감도
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging.current) {
        hoverVelocity.current = 0;
        const delta = e.clientX - startX.current;
        const sensitivity = isMobile ? 0.8 : 0.4; // 드래그 회전 감도 (모바일은 더 민감하게)
        targetRotation.current += delta * sensitivity;
        startX.current = e.clientX;
        return;
      }

      // 모바일에서는 가장자리 호버 회전 효과 비활성화 (드래그만 사용)
      if (isMobile) return;

      // 커서가 화면 가장자리에 있을 때의 회전 속도 계산
      const x = e.clientX;
      const width = window.innerWidth;
      const margin = width * 0.25; // 화면 양쪽 25% 영역

      if (x < margin) {
        const factor = (margin - x) / margin;
        hoverVelocity.current = factor * 1.5; // 왼쪽 가장자리 근처 속도 조절
      } else if (x > width - margin) {
        const factor = (x - (width - margin)) / margin;
        hoverVelocity.current = -factor * 1.5; // 오른쪽 가장자리 근처 속도 조절
      } else {
        hoverVelocity.current = 0;
      }
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    const handlePointerLeave = () => {
      hoverVelocity.current = 0;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointerleave', handlePointerLeave);

    const animate = () => {
      // 호버나 드래그 중이 아닐 때 가장 가까운 항목으로 스냅(정렬)
      if (!isDragging.current && hoverVelocity.current === 0) {
        const itemAngle = 360 / items.length;
        const nearestSnap = Math.round(targetRotation.current / itemAngle) * itemAngle;
        targetRotation.current += (nearestSnap - targetRotation.current) * 0.05;
      }

      // 호버에 의한 지속 회전 적용
      targetRotation.current += hoverVelocity.current;

      // Lerp(보간)를 통해 회전이 부드럽게 감속하며 안착하도록 처리
      currentRotation.current += (targetRotation.current - currentRotation.current) * 0.04;

      if (wrapperRef.current) {
        // 전체 래퍼를 Y축 기준으로 회전
        wrapperRef.current.style.transform = `rotateY(${currentRotation.current}deg)`;
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        const itemAngle = i * (360 / items.length);
        
        // 카드의 절대적인 각도 위치를 계산 (뒤에 있는 카드들을 흐리게 처리하기 위함)
        const rad = (itemAngle + currentRotation.current) * (Math.PI / 180);
        const z = Math.cos(rad); // 1 = 가장 앞쪽, -1 = 가장 뒤쪽
        
        let opacity = 1.0;
        let scale = 1.0;
        let pointerEvents = 'auto';

        // z값이 0보다 작으면 원기둥의 뒤쪽 반원에 위치함
        if (z < 0) {
          opacity = Math.max(0.1, 1 + z * 1.5); // 뒤로 갈수록 투명해짐
          scale = Math.max(0.85, 1 + z * 0.15); // 뒤로 갈수록 살짝 작아짐
          pointerEvents = 'none'; // 뒤에 있는 카드는 클릭 불가
        }

        card.style.opacity = opacity.toFixed(3);
        card.style.pointerEvents = pointerEvents;
        
        // 카드 개별 위치 및 원근 스케일 적용 (Y축 회전으로 둥글게 배치 후 Z축으로 밀어냄)
        card.style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px) scale(${scale.toFixed(3)})`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointerleave', handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, items.length, radius, isMobile]);

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
      style={{ perspective: '1500px' }} // 원근감 깊이 조정
    >
      {/* 백그라운드 갤러리 애니메이션 레이어 (모바일에서는 숨김 처리하여 성능 최적화) */}
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
        {/* DOM 개수를 절반(7열)으로 줄이고, 무거운 CSS 필터(blur, mix-blend-mode) 제거 후 하드웨어 가속 추가 */}
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
        className="absolute top-1/2 left-1/2 w-0 h-0" 
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: 'rotateX(0deg)' // 기울기 제거, 완전한 정면
        }}
      >
        <div ref={wrapperRef} className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              ref={(el) => (cardsRef.current[i] = el)}
              onClick={() => onSelect(item)}
              onMouseEnter={() => (isHovering.current = true)}
              onMouseLeave={() => (isHovering.current = false)}
              className="absolute group cursor-pointer"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                marginLeft: `-${cardWidth / 2}px`,
                marginTop: `-${cardHeight / 2}px`,
                // 초기 위치 렌더링
                transform: `rotateY(${i * (360 / items.length)}deg) translateZ(${radius}px)`,
              }}
            >
              <div 
                className={`w-full h-full relative transition-transform duration-500 ease-out group-hover:scale-[1.05] ${
                  'isLogo' in item && item.isLogo 
                    ? 'flex items-center justify-center' 
                    : 'overflow-hidden rounded-md bg-[#1a1a1a] shadow-[0_20px_40px_rgba(0,0,0,0.6)]'
                }`}
              >
                {'isLogo' in item && item.isLogo ? (
                  <>
                    <img 
                      src="/about_logo.webp" 
                      alt="ABOUT US" 
                      className="w-full h-full scale-[1.2] object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 group-hover:scale-[1.35] transition-all duration-700 ease-out select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden text-[100px] font-black tracking-tighter text-[#f4f4f0] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      HMS
                    </span>
                  </>
                ) : (
                  <>
                    <ImageWithFallback
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-700 ease-out brightness-[0.5] group-hover:brightness-110 group-hover:scale-110 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500 border border-white/5 pointer-events-none" />
                  </>
                )}
                <div className="absolute bottom-6 left-6 right-6 z-20 transition-transform duration-[400ms] group-hover:-translate-y-2 pointer-events-none">
                  <h3 className="text-[#f4f4f0] text-sm md:text-lg font-bold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] break-words leading-tight">
                    {item.desc}
                  </h3>
                  <p className="text-[#f4f4f0]/80 text-[10px] font-mono uppercase tracking-widest mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {'isLogo' in item && item.isLogo ? 'ABOUT US' : 'ENTER PROJECT'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/80 backdrop-blur-md px-6 py-3 rounded-full font-mono text-[10px] text-[#f4f4f0] tracking-[0.2em] uppercase z-50 pointer-events-none shadow-lg border border-white/10 whitespace-nowrap">
        {isMobile ? 'Swipe to Rotate' : 'Hover edges or Drag to Rotate'}
      </div>
    </div>
  );
}