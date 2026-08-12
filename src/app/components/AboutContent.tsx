import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageData } from '../../hooks/useFirebaseData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AboutContentProps {
  pageData: PageData;
}

// 11장의 슬라이드 이미지 (사용자가 public 폴더 등에 추가한 이미지 경로로 변경 필요)
const SLIDES = [
  '/about/slide_1.jpg',
  '/about/slide_2.jpg',
  '/about/slide_3.jpg',
  '/about/slide_4.jpg',
  '/about/slide_5.jpg',
  '/about/slide_6.jpg',
  '/about/slide_7.jpg',
  '/about/slide_8.jpg',
  '/about/slide_9.jpg',
  '/about/slide_10.jpg',
  '/about/slide_11.jpg',
];

export function AboutContent({ pageData }: AboutContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for right, -1 for left

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) nextIndex = SLIDES.length - 1;
      if (nextIndex >= SLIDES.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // 화살표 키로 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault();
        paginate(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'Left' || e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();
        paginate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-[#1a1a1a] relative overflow-hidden group select-none">
      
      {/* 슬라이드 이미지 영역 */}
      <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={SLIDES[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute max-w-full max-h-full object-contain pointer-events-none"
            onError={(e) => {
              // 이미지가 없을 때를 대비한 플레이스홀더
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                e.currentTarget.nextElementSibling.classList.remove('hidden');
              }
            }}
          />
          
          {/* 이미지가 없을 때 표시되는 더미 화면 */}
          <motion.div
            key={`placeholder-${currentIndex}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute w-full h-full flex flex-col items-center justify-center text-white/50 bg-[#1a1a1a] hidden"
          >
            <div className="text-4xl mb-4 opacity-30">NO IMAGE FOUND</div>
            <p className="text-sm font-mono opacity-50">Please add {SLIDES[currentIndex]} to public folder</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 좌우 네비게이션 버튼 */}
      <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none z-10">
        <button 
          onClick={() => paginate(-1)}
          className="pointer-events-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm transition-all shadow-lg border border-white/10"
        >
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 -ml-1" />
        </button>
        <button 
          onClick={() => paginate(1)}
          className="pointer-events-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm transition-all shadow-lg border border-white/10"
        >
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 -mr-1" />
        </button>
      </div>

      {/* 하단 페이지네이션 인디케이터 (Dot) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentIndex === idx 
                ? 'bg-[#E3342F] scale-125 shadow-[0_0_10px_rgba(227,52,47,0.8)]' 
                : 'bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* 스와이프 제스처 레이어 (모바일 지원용) */}
      <div 
        className="absolute inset-0 z-0 touch-pan-y"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (window as any).touchStartX = touch.clientX;
        }}
        onTouchEnd={(e) => {
          if ((window as any).touchStartX === undefined) return;
          const touchEndX = e.changedTouches[0].clientX;
          const diff = (window as any).touchStartX - touchEndX;
          if (diff > 50) paginate(1); // Swipe left -> Next
          if (diff < -50) paginate(-1); // Swipe right -> Prev
          (window as any).touchStartX = undefined;
        }}
      />
    </div>
  );
}
