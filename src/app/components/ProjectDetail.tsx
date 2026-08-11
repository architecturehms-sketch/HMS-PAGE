import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';

import { Project } from '../../hooks/useFirebaseData';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

export function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);

  const validImages = project.detailImages?.filter(url => url) || [];
  const displayImages = validImages.length > 0 ? validImages : [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600"
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };
  
  const { scrollYProgress } = useScroll({
    container: containerRef
  });

  // Parallax effects
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-[#1a1a1a] text-[#f4f4f0] overflow-y-auto overflow-x-hidden origin-bottom hide-scrollbar"
      ref={containerRef}
    >
      {/* Fixed Header / Nav */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .brutalist-scrollbar::-webkit-scrollbar {
          height: 10px;
        }
        .brutalist-scrollbar::-webkit-scrollbar-track {
          background: #111;
          border-top: 1px solid rgba(244, 244, 240, 0.1);
          border-bottom: 1px solid rgba(244, 244, 240, 0.1);
        }
        .brutalist-scrollbar::-webkit-scrollbar-thumb {
          background: #f4f4f0;
          cursor: pointer;
        }
        .brutalist-scrollbar::-webkit-scrollbar-thumb:hover {
          background: white;
        }
      `}</style>
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none mix-blend-difference text-[#f4f4f0]">
        <div className="font-mono text-xs uppercase tracking-[0.2em]">
          HMS ARCHITECTURE
        </div>
        <button 
          onClick={onClose}
          className="pointer-events-auto flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
        >
          <ArrowLeft size={16} /> [ BACK ]
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[100svh] overflow-hidden group">
        <motion.div 
          style={{ y: yImage }} 
          className="absolute inset-0 w-full h-[120%] -top-[10%]"
        >
          <img 
            src={project.img} 
            alt={project.title} 
            className="w-full h-full object-cover grayscale-0 md:grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700 pointer-events-none" />
        </motion.div>
        
        {/* Protective gradient for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
        
        <motion.div 
          style={{ opacity: opacityHero }}
          className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 pb-4 md:pb-12 pointer-events-none"
        >
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="md:-ml-4 text-[7vw] md:text-[5vw] font-medium leading-[0.85] tracking-tighter text-[#f4f4f0] drop-shadow-xl"
          >
            {project.title}
          </motion.h1>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-3 md:gap-y-5 gap-x-12 mt-12 md:mt-16 text-[#f4f4f0] font-mono text-xs md:text-sm font-light tracking-widest uppercase drop-shadow-md"
          >
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">TYPOLOGY</span>
              {project.desc}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">YEAR</span>
              {project.year}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">LOCATION</span>
              {project.location || 'SEOUL, KR'}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">STATUS</span>
              {project.status || 'COMPLETED'}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">SITE AREA</span>
              {project.siteArea || 'N/A'}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">FLOOR AREA</span>
              {project.totalFloorArea || 'N/A'}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">SCALE</span>
              {project.scale || 'N/A'}
            </div>
            <div>
              <span className="opacity-50 block mb-1 text-[10px]">CLIENT</span>
              {project.client || 'UNDISCLOSED'}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Content Section */}
      <div className="relative z-10 bg-[#1a1a1a] w-full min-h-screen px-6 md:px-12 py-24 flex flex-col items-center">
        


        {/* Media Layout */}
        <div className="w-[100vw] flex flex-col gap-16 md:gap-32 mb-32 relative left-0 right-0">
          
          {/* 1. Individual Large Images (First 2) */}
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-16 md:gap-32 px-6 md:px-12">
            {displayImages.slice(0, 2).map((url, index) => (
              <ParallaxImage 
                key={`individual-${index}`} 
                src={url} 
                alt={`Detail ${index + 1}`} 
                speed={0.05} 
                onClick={() => {
                  if (window.innerWidth < 768) setPopupIndex(index);
                }}
              />
            ))}
          </div>

          {/* 2. Horizontal Scroll Gallery (Remaining Images) */}
          {displayImages.length > 2 && (
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`w-full overflow-x-auto flex flex-nowrap gap-1 md:gap-2 px-6 md:px-12 pb-8 hide-scrollbar select-none ${
                displayImages.length === 3 ? 'justify-center' : ''
              } ${
                isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory scroll-smooth'
              }`}
            >
              {displayImages.slice(2).map((url, index) => (
                <div 
                  key={`gallery-${index}`} 
                  className="w-[85vw] md:w-[75vw] shrink-0 snap-center border border-[#f4f4f0]/10"
                  onClick={() => {
                    if (window.innerWidth < 768) setPopupIndex(index + 2);
                  }}
                >
                  <ParallaxImage src={url} alt={`Gallery Detail ${index + 3}`} speed={0.02} />
                </div>
              ))}
            </div>
          )}

          {/* 3. Video Player */}
          {project.videoUrl && (
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
              <div className="w-full h-[50vh] md:h-[90vh] bg-[#111] relative overflow-hidden border border-[#f4f4f0]/10">
                <video 
                  src={project.videoUrl} 
                  autoPlay 
                  controls
                  loop 
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-90 hover:opacity-100"
                />
              </div>
            </div>
          )}

        </div>

        <div className="w-full max-w-5xl border-t border-[#f4f4f0]/20 pt-12 flex justify-between items-center mb-24">
          <div className="font-mono text-xs tracking-widest uppercase text-[#f4f4f0]/50">
            © {project.year} HMS ARCHITECTS
          </div>
          <button 
            onClick={onClose}
            className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-2 hover:line-through transition-all text-[#f4f4f0]"
          >
            <ArrowLeft size={14} /> [ BACK ]
          </button>
        </div>
      </div>

      {/* Mobile Image Popup */}
      <AnimatePresence>
        {popupIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] bg-black/95 md:hidden"
          >
            <button 
              className="absolute top-6 right-6 text-white p-2 hover:opacity-50 transition-opacity z-10"
              onClick={() => setPopupIndex(null)}
            >
              <X size={24} />
            </button>
            <div 
              className="w-full h-full overflow-x-auto overflow-y-hidden flex flex-nowrap snap-x snap-mandatory hide-scrollbar"
              ref={(el) => {
                if (el && popupIndex !== null) {
                  if (!el.dataset.scrolled) {
                    el.scrollLeft = popupIndex * window.innerWidth;
                    el.dataset.scrolled = "true";
                  }
                }
              }}
              onClick={() => setPopupIndex(null)}
            >
              {displayImages.map((url, idx) => (
                <div 
                  key={`popup-${idx}`} 
                  className="w-screen h-full shrink-0 snap-center flex items-center justify-center p-4"
                >
                  <img 
                    src={url} 
                    alt={`Popup ${idx + 1}`} 
                    className="w-full h-auto max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Reusable Detail Image Component (Replaces Parallax)
function ParallaxImage({ src, alt, speed = 0.1, onClick }: { src: string, alt: string, speed?: number, onClick?: () => void }) {
  return (
    <div className="relative w-full aspect-video overflow-hidden bg-[#111] flex items-center justify-center cursor-pointer" onClick={onClick}>
      <img 
        src={src} 
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain transition-all duration-700 opacity-90 hover:opacity-100"
      />
    </div>
  );
}