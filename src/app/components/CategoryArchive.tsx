import React, { useMemo } from 'react';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Project } from '../../hooks/useFirebaseData';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface CategoryArchiveProps {
  category: string;
  projects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export function CategoryArchive({ category, projects, onClose, onSelectProject }: CategoryArchiveProps) {
  const filteredProjects = useMemo(() => {
    return projects.filter(p => p.desc === category && !p.isLogo);
  }, [category, projects]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[60] bg-[#f4f4f0] text-[#1a1a1a] overflow-y-auto hide-scrollbar"
    >
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
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

      <div className="pt-32 px-6 md:px-12 pb-12 min-h-screen">
        <h1 className="text-[12vw] md:text-[8vw] font-black uppercase leading-[0.85] tracking-tighter text-[#1a1a1a] mb-12 border-b border-[#1a1a1a]/20 pb-6">
          {category}
        </h1>
        
        <ResponsiveMasonry columnsCountBreakPoints={{300: 2, 600: 3, 900: 4, 1200: 5}}>
          <Masonry gutter="16px">
            {filteredProjects.map((item, idx) => (
              <div 
                key={item.id} 
                onClick={() => onSelectProject(item)}
                className={`group cursor-pointer flex flex-col animate-[fadeIn_0.5s_ease-out] hover:-translate-y-2 transition-transform duration-500 ${idx % 2 === 0 ? 'md:mt-12' : 'mt-0'}`}
              >
                <div className="overflow-hidden mb-4 bg-gray-200 w-full relative" style={{ aspectRatio: idx % 3 === 0 ? '3/4' : idx % 3 === 1 ? '1/1' : '4/5' }}>
                  <ImageWithFallback 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-110 group-hover:grayscale-0"
                  />
                </div>
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">0{idx + 1}.</span>
                    <span className="text-[#1a1a1a]/60">{item.year}</span>
                  </div>
                  <div className="font-semibold">{item.title}</div>
                </div>
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </motion.div>
  );
}
