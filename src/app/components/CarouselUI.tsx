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
  
  // Drag states
  const isDragging = useRef(false);
  const startX = useRef(0);
  const isHovering = useRef(false);

  // Responsive radius for the 3D ring
  const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 320 : 550;
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
      if (!isDragging.current) return;
      const delta = e.clientX - startX.current;
      targetRotation.current += delta * 0.4; // 드래그 회전 감도
      startX.current = e.clientX;
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    const animate = () => {
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
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, items.length, radius]);

  return (
    <div
      className={`fixed inset-0 w-screen h-screen z-40 transition-opacity duration-1000 overflow-hidden select-none touch-none ${
        isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ perspective: '1500px' }} // 원근감 깊이 조정
    >
      {/* 백그라운드 갤러리 애니메이션 레이어 (클릭 불가, 작고 규칙적인 패턴 효과) */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden opacity-10 flex justify-center items-center gap-4 scale-[1.2]">
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
        {/* 여러 개의 열을 만들어 넓은 화면도 커버할 수 있도록 구성 */}
        {[...Array(15)].map((_, colIndex) => {
          // 각 열마다 시작 이미지를 다르게 배치
          const offsetItems = [...items.slice(colIndex % items.length), ...items.slice(0, colIndex % items.length)];
          // 끊김 없는 무한 스크롤을 위해 배열을 두 번 반복
          const columnItems = [...offsetItems, ...offsetItems];

          return (
            <div
              key={`col-${colIndex}`}
              className="flex flex-col gap-4 w-[100px] opacity-80"
              style={{
                animation: `${colIndex % 2 === 0 ? 'marqueeUp' : 'marqueeDown'} ${40 + (colIndex % 3) * 10}s linear infinite`,
              }}
            >
              {columnItems.map((item, i) => (
                <div
                  key={`bg-gallery-${colIndex}-${i}`}
                  className="w-full h-[140px] rounded-sm overflow-hidden grayscale mix-blend-screen"
                >
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover blur-[1px] brightness-[0.5]"
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
                width: '280px',
                height: '380px',
                marginLeft: '-140px',
                marginTop: '-190px',
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
                    <span className="text-[100px] font-black tracking-tighter text-[#f4f4f0] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out select-none drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      HMS
                    </span>
                  </>
                ) : (
                  <>
                    <ImageWithFallback
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-all duration-700 ease-out grayscale group-hover:grayscale-0 brightness-[0.5] group-hover:brightness-110 group-hover:scale-110 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500 border border-white/5 pointer-events-none" />
                  </>
                )}
                <div className="absolute bottom-6 left-6 z-20 transition-transform duration-[400ms] group-hover:-translate-y-2 pointer-events-none">
                  <h3 className="text-[#f4f4f0] text-xl font-bold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
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

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1a1a1a]/80 backdrop-blur-md px-6 py-3 rounded-full font-mono text-[10px] text-[#f4f4f0] tracking-[0.2em] uppercase z-50 pointer-events-none shadow-lg border border-white/10">
        Drag or Scroll to Rotate
      </div>
    </div>
  );
}