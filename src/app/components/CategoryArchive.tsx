import React, { useMemo } from 'react';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Project, PageData } from '../../hooks/useFirebaseData';
import { motion } from 'motion/react';
import { X, ArrowLeft, Play } from 'lucide-react';

interface CategoryArchiveProps {
  category: string;
  projects: Project[];
  pageData?: PageData;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export function CategoryArchive({ category, projects, pageData, onClose, onSelectProject }: CategoryArchiveProps) {
  const filteredProjects = useMemo(() => {
    const orderList = pageData?.categoryProjectOrders?.[category] || [];
    return projects.filter(p => {
      if (p.isLogo || p.carouselOnly) return false;
      const cats = p.desc ? p.desc.split(',').map(c => c.trim()) : [];
      return cats.includes(category);
    }).sort((a, b) => {
      const indexA = orderList.indexOf(a.id as string);
      const indexB = orderList.indexOf(b.id as string);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }, [category, projects, pageData]);

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
      
      <div className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none text-[#1a1a1a]">
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

      <div className="pt-12 md:pt-32 px-6 md:px-12 pb-12 min-h-screen">
        <h1 className="text-[9vw] sm:text-[10vw] md:text-[8vw] font-black uppercase leading-[0.9] tracking-tighter text-[#1a1a1a] mb-12 border-b border-[#1a1a1a]/20 pb-6 break-words">
          {category}
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {filteredProjects.map((item, idx) => {
              const hasProjectDetails = !!(item.videoUrl?.trim() || (item.detailImages && item.detailImages.some((img: string) => img.trim() !== '')));
              
              return (
                <div 
                  key={item.uniqueId || item.id} 
                  onClick={() => {
                    if (hasProjectDetails) onSelectProject(item);
                  }}
                  className={`group flex flex-col animate-[fadeIn_0.5s_ease-out] transition-transform duration-500 ${hasProjectDetails ? 'cursor-pointer hover:-translate-y-2' : ''} ${idx % 2 !== 0 ? 'md:mt-12' : 'mt-0'}`}
                >
                  <div className="overflow-hidden mb-4 bg-gray-200 w-full relative" style={{ aspectRatio: idx % 3 === 0 ? '3/4' : idx % 3 === 1 ? '1/1' : '4/5' }}>
                    {item.videoUrl && (
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-black/30 backdrop-blur-md rounded-full p-2 z-10 text-white/90 group-hover:bg-black/50 transition-colors">
                        <Play size={12} fill="currentColor" />
                      </div>
                    )}
                    <ImageWithFallback 
                      src={item.img} 
                      alt={item.title} 
                      className={`w-full h-full object-cover transition-all duration-700 ease-out ${hasProjectDetails ? 'group-hover:scale-110' : ''}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest flex justify-between items-start mb-2">
                      <span className="font-bold">0{idx + 1}</span>
                      <span className="text-[#1a1a1a]/60">{item.year}</span>
                    </div>
                    <div className="font-sans text-sm font-medium tracking-normal text-[#1a1a1a] leading-snug break-keep">{item.title}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}
