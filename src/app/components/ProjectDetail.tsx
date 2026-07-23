import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { X } from 'lucide-react';

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
          [ CLOSE ] <X size={16} />
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
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-700 pointer-events-none" />
        </motion.div>
        
        <motion.div 
          style={{ opacity: opacityHero }}
          className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 pb-24"
        >
          <motion.h1 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="-ml-2 md:-ml-4 text-[7vw] md:text-[5vw] font-medium leading-[0.85] tracking-tighter text-[#f4f4f0] mix-blend-difference"
          >
            {project.title}
          </motion.h1>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 md:grid-cols-4 gap-y-3 md:gap-y-5 gap-x-12 mt-8 text-[#f4f4f0] font-mono text-xs md:text-sm font-light tracking-widest uppercase mix-blend-difference"
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
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-12 mb-32">
          <div className="md:col-span-4 font-mono text-sm tracking-widest uppercase border-t border-[#f4f4f0]/20 pt-4 text-[#f4f4f0]/70">
            Project Overview
          </div>
          <div className="md:col-span-8 text-xl md:text-3xl font-medium leading-[1.4] tracking-tight text-[#f4f4f0] whitespace-pre-wrap">
            {project.content || `The ${project.title} represents a fundamental shift in our approach to brutalist architecture, merging raw concrete textures with expansive glass volumes to create a dialogue between mass and transparency. Designed in ${project.year}, this ${project.desc.toLowerCase()} space challenges conventional boundaries.`}
          </div>
        </div>

        {/* Media Layout */}
        <div className="w-[100vw] -ml-6 md:-ml-12 flex flex-col gap-16 md:gap-32 mb-32 relative left-0 right-0">
          
          {/* 1. Individual Large Images (First 2) */}
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-16 md:gap-32 px-6 md:px-12">
            {project.detailImages?.slice(0, 2).filter(url => url).map((url, index) => (
              <ParallaxImage key={`individual-${index}`} src={url} alt={`Detail ${index + 1}`} speed={0.05} />
            ))}
            {/* Fallback individual images if none exist */}
            {(!project.detailImages || !project.detailImages.some(url => url)) && (
              <>
                <ParallaxImage src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600" alt="Detail 1" speed={0.1} />
                <ParallaxImage src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1600" alt="Detail 2" speed={0.05} />
              </>
            )}
          </div>

          {/* 2. Horizontal Scroll Gallery (Remaining Images) */}
          {project.detailImages && project.detailImages.slice(2).some(url => url) && (
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`w-full overflow-x-auto flex flex-nowrap gap-1 md:gap-2 px-6 md:px-12 pb-8 hide-scrollbar select-none ${
                isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory scroll-smooth'
              }`}
            >
              {project.detailImages.slice(2).filter(url => url).map((url, index) => (
                <div key={`gallery-${index}`} className="w-[85vw] md:w-[75vw] shrink-0 snap-center border border-[#f4f4f0]/10">
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
            className="font-mono text-xs tracking-[0.2em] uppercase hover:line-through transition-all text-[#f4f4f0]"
          >
            BACK TO INDEX
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Reusable Parallax Image Component
function ParallaxImage({ src, alt, speed = 0.1 }: { src: string, alt: string, speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div ref={ref} className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden bg-[#111]">
      <motion.img 
        style={{ y }}
        src={src} 
        alt={alt}
        draggable={false}
        className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover transition-all duration-700 opacity-80 hover:opacity-100"
      />
    </div>
  );
}