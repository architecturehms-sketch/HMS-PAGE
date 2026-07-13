import React, { useState, useEffect, useRef, useMemo } from 'react';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Project, PageData } from '../../hooks/useFirebaseData';

interface MainContentProps {
  isVisible: boolean;
  onOpenAdmin?: () => void;
  onGoToCarousel?: () => void;
  onSelectCategory?: (category: string) => void;
  projects: Project[];
  pageData: PageData;
}

export function MainContent({ isVisible, onOpenAdmin, onGoToCarousel, onSelectCategory, projects, pageData }: MainContentProps) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [heroMousePos, setHeroMousePos] = useState({ x: -1000, y: -1000 });
  const titleRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [time, setTime] = useState<string>('00:00:00');

  // Extract unique typologies (Categories)
  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.filter(p => !p.isLogo).map(item => item.desc)));
    return unique.map(desc => {
      const firstProject = projects.find(p => p.desc === desc && !p.isLogo);
      return {
        name: desc,
        img: firstProject?.img || '',
        count: projects.filter(p => p.desc === desc && !p.isLogo).length
      };
    });
  }, [projects]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setHeroMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative z-40 transition-all duration-[1500ms] delay-500 min-h-screen font-sans flex flex-col md:flex-row text-[#1a1a1a] items-start ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-[30px] pointer-events-none'
      }`}
    >
      {/* Background with transparency to show 3D particles */}
      <div className="fixed inset-0 bg-[#f4f4f0]/85 -z-10 pointer-events-none" />

      {/* Left Sidebar */}
      <aside className="w-full md:w-[25vw] sticky top-0 h-auto md:h-screen border-b md:border-b-0 md:border-r border-[#f4f4f0]/30 p-4 sm:p-6 flex flex-col z-30 overflow-y-auto bg-[#1a1a1a] text-[#f4f4f0] shadow-sm md:shadow-none self-start max-h-screen">
        <div 
          ref={titleRef}
          className="relative text-transparent select-none cursor-default mb-2 inline-block w-fit shrink-0"
          style={{
            WebkitTextStroke: '0',
            backgroundImage: `radial-gradient(circle 12vw at ${mousePos.x}px ${mousePos.y}px, #1a1a1a 0%, #f4f4f0 60%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
          }}
        >
          {/* Logo with masking effect */}
          <h1 className="text-[12vw] md:text-[6vw] leading-[0.85] tracking-[-0.04em] font-black uppercase pb-2 pr-2">
            H<br className="hidden md:block" />
            <span className="md:hidden"> </span>M<br className="hidden md:block" />
            <span className="md:hidden"> </span>S
          </h1>
        </div>
        
        <nav className="font-mono text-[10px] sm:text-xs uppercase flex flex-row md:flex-col gap-4 md:gap-2 tracking-widest mt-2 shrink-0 overflow-x-auto pb-2 md:pb-0 hide-scrollbar text-[#f4f4f0]">
          <button onClick={onGoToCarousel} className="hover:line-through transition-all whitespace-nowrap text-left flex items-center gap-2 pb-2 mb-2 border-b border-[#f4f4f0]/20">
            <span className="text-[14px]">⬡</span> 3D CAROUSEL
          </button>
          <a href="#" className="hover:line-through transition-all whitespace-nowrap">Index</a>
          <a href="#" className="hover:line-through transition-all whitespace-nowrap">Selected Works</a>
          <a href="#" className="hover:line-through transition-all whitespace-nowrap">People</a>
          <a href="#" className="hover:line-through transition-all whitespace-nowrap">Contact</a>
        </nav>

        {/* About Section */}
        <div className="mt-4 md:mt-6 flex-1 flex flex-col gap-4 md:gap-6 text-sm font-sans text-[#f4f4f0]/70 leading-relaxed pr-4">
          <p>{pageData.about}</p>
        </div>
      </aside>

      {/* Right Content */}
      <main className="w-full md:w-[75vw] min-h-screen relative z-10 flex flex-col">
        {/* Top Header Grid */}
        <header className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[10px] sm:text-xs uppercase border-b border-[#1a1a1a]/30 leading-relaxed tracking-widest">
          <div>
            HMS ARCHITECTURE<br />
            BASED IN {pageData.address.toUpperCase()}
          </div>
          <div className="sm:text-center hidden sm:block">
            {pageData.contactEmail}<br />
            <a href={`mailto:${pageData.contactEmail}`} className="hover:underline">CONTACT US</a>
          </div>
          <div className="sm:text-right">
            STATUS: ACTIVE<br />
            {time}
          </div>
        </header>

        {/* Big Typography Hero */}
        <section 
          ref={heroRef}
          className="px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center items-start border-b border-[#1a1a1a]/30 relative overflow-hidden group"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-black text-[#1a1a1a]/[0.02] select-none pointer-events-none z-0">HMS</div>
          
          <div className="relative z-10 text-[#1a1a1a] select-none cursor-default inline-block w-full py-4 px-8 -ml-8">
            <h2 className="text-[12vw] md:text-[8vw] font-black uppercase leading-[1.1] tracking-[-0.02em] break-words pl-[4vw] -ml-[4vw]">
              ARCHITECTURE
            </h2>
            <h2 className="text-[12vw] md:text-[8vw] font-black uppercase leading-[1.1] tracking-[-0.02em] -mt-[3vw] md:-mt-[1.5vw] break-words pl-[4vw] -ml-[4vw]">
              STUDIO
            </h2>
          </div>
        </section>

        {/* Marquee Banner */}
        <section className="overflow-hidden whitespace-nowrap border-b border-[#1a1a1a]/30 py-2 sm:py-3 bg-[#1a1a1a] text-[#f4f4f0]">
          <div className="inline-block animate-[marquee_25s_linear_infinite] text-xs font-mono uppercase tracking-widest text-transparent hover:text-[#f4f4f0] font-light transition-colors duration-300" style={{ WebkitTextStroke: '0.5px #f4f4f0' }}>
            ARCHITECTURE &nbsp;///&nbsp; INTERIOR DESIGN &nbsp;///&nbsp; MASTER PLANNING &nbsp;///&nbsp; SPATIAL BRANDING &nbsp;///&nbsp; ARCHITECTURE &nbsp;///&nbsp; INTERIOR DESIGN &nbsp;///&nbsp; MASTER PLANNING &nbsp;///&nbsp; SPATIAL BRANDING &nbsp;///&nbsp;
          </div>
        </section>

        {/* Grid Archive - Category Layout */}
        <section className="p-4 sm:p-6 pb-12 flex-1">
          <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a]/30 pb-2">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#1a1a1a]">CATEGORIES</h3>
            <span className="font-mono text-[10px] text-[#1a1a1a]/60 uppercase tracking-widest">{categories.length} TYPOLOGIES</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {categories.map((cat, idx) => (
              <div 
                key={cat.name} 
                onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                className="group cursor-pointer flex flex-col animate-[fadeIn_0.5s_ease-out] hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="overflow-hidden mb-4 bg-[#1a1a1a] w-full relative aspect-[4/3] shadow-sm">
                  <ImageWithFallback 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0 opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 text-center">
                    <h3 className="text-[#f4f4f0] text-3xl md:text-4xl font-black tracking-tighter uppercase drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                      {cat.name}
                    </h3>
                  </div>
                </div>
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest flex justify-between items-center w-full px-2">
                  <span className="text-[#1a1a1a]/80 font-bold">0{idx + 1}.</span>
                  <span className="text-[#1a1a1a]/60">{cat.count} PROJECTS</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-6 border-t border-[#1a1a1a]/30 font-mono text-[10px] sm:text-xs uppercase tracking-widest flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-[#1a1a1a]/60">
            © {new Date().getFullYear()} HMS ARCHITECTURE.
          </div>
          <div className="flex gap-4 items-center">
            {onOpenAdmin && (
              <button onClick={onOpenAdmin} className="hover:underline underline-offset-4 text-[#1a1a1a]/40 hover:text-[#1a1a1a]">Admin</button>
            )}
            <a href="#" className="hover:underline underline-offset-4">Instagram</a>
            <a href="#" className="hover:underline underline-offset-4">LinkedIn</a>
          </div>
        </footer>
      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
