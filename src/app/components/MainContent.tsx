import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Project, PageData, MapLocation, TeamMember } from '../../hooks/useFirebaseData';
import { PeopleContent } from './PeopleContent';
import { MinimalMap } from './MinimalMap';
import { AboutContent } from './AboutContent';

function Clock() {
  const [time, setTime] = useState<string>('00:00:00');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Seoul'
      }) + ' KST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time}</span>;
}

interface MainContentProps {
  isVisible: boolean;
  onOpenAdmin: () => void;
  onGoToCarousel: () => void;
  onSelectCategory: (category: string) => void;
  projects: Project[];
  pageData: PageData;
  team: TeamMember[];
  locations: MapLocation[];
}

export function MainContent({ isVisible, onOpenAdmin, onGoToCarousel, onSelectCategory, projects, pageData, team, locations }: MainContentProps) {
  const [activeTab, setActiveTab] = useState<'index' | 'people' | 'about'>('index');
  const titleRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

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



  return (
    <div 
      className={`z-10 transition-opacity duration-1000 bg-[#1a1a1a] ${
        isVisible ? 'relative opacity-100 pointer-events-auto min-h-screen' : 'fixed inset-0 opacity-0 pointer-events-none overflow-hidden'
      }`}
    >
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-[25vw] h-auto md:h-screen md:fixed md:top-0 md:left-0 border-b md:border-b-0 md:border-r border-[#f4f4f0]/20 p-4 sm:p-6 md:p-8 flex flex-col z-20 overflow-y-visible md:overflow-y-auto hide-scrollbar shrink-0 bg-[#1a1a1a]">
          <div className="flex justify-between items-start mb-12 shrink-0">
            <img 
              src="/batch_logo.webp" 
              alt="HMS Architecture" 
              onClick={() => setActiveTab('index')}
              className="w-16 sm:w-20 md:w-24 h-auto object-contain invert brightness-0 contrast-200 cursor-pointer hover:opacity-80 transition-opacity -ml-1.5"
            />
          </div>
          
          <nav className="font-mono text-[10px] sm:text-xs uppercase flex flex-col tracking-widest mt-2 shrink-0 text-[#f4f4f0] mb-8 w-full">
            <button onClick={onGoToCarousel} className="hover:line-through transition-all whitespace-nowrap text-left flex items-center gap-2 pb-2 mb-4 md:mb-2 border-b border-[#f4f4f0]/20 self-start md:self-stretch pr-4 md:pr-0">
              <span className="text-[14px]">⬡</span> 3D CAROUSEL
            </button>
            <div className="flex flex-wrap md:flex-col gap-x-4 gap-y-2 md:gap-2 w-full">
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('about'); }} className={`hover:line-through transition-all whitespace-nowrap text-left ${activeTab === 'about' ? 'opacity-50' : ''}`}>About Us</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('index'); }} className={`hover:line-through transition-all whitespace-nowrap text-left ${activeTab === 'index' ? 'opacity-50' : ''}`}>Selected Works</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('people'); }} className={`hover:line-through transition-all whitespace-nowrap text-left ${activeTab === 'people' ? 'opacity-50' : ''}`}>People</a>
              <a href={`mailto:${pageData.contactEmail}`} className="hover:line-through transition-all whitespace-nowrap text-left">Contact</a>
            </div>
          </nav>
          
          <MinimalMap locations={locations} />
        </aside>

        {/* Right Content */}
        <main className="w-full md:w-[75vw] md:ml-[25vw] relative z-10 flex flex-col shrink-0 min-h-screen">
          {/* Top Header Grid */}
          <header className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[10px] sm:text-xs uppercase border-b border-[#1a1a1a]/30 leading-relaxed tracking-widest text-[#1a1a1a] bg-[#f4f4f0]">
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
              <Clock />
            </div>
          </header>

          <div className="flex-1 flex flex-col bg-[#f4f4f0]">
            {activeTab === 'index' && (
              <>
                {/* Big Typography Hero */}
                <section 
                  ref={heroRef}
                  className="px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center items-start border-b border-[#1a1a1a]/30 relative overflow-hidden group"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35vw] font-black text-[#1a1a1a]/[0.04] select-none pointer-events-none z-0">HMS</div>
                  
                  <div className="relative z-10 text-[#1a1a1a] select-none cursor-default inline-block w-full py-4 px-8 -ml-8">
                    <h2 className="text-[12vw] md:text-[8vw] font-black uppercase leading-[1.1] tracking-[-0.02em] break-words pl-[4vw] -ml-[4vw]">
                      ARCHITECTURE
                    </h2>
                    <h2 className="text-[12vw] md:text-[8vw] font-black uppercase leading-[1.1] tracking-[-0.02em] -mt-[3vw] md:-mt-[1.5vw] break-words pl-[4vw] -ml-[4vw]">
                      & DESIGN
                    </h2>
                  </div>
                </section>


                {/* Grid Archive - Category Layout */}
                <section className="p-4 sm:p-6 pb-12 flex-1">
                  <div className="flex justify-between items-end mb-8 border-b border-[#1a1a1a]/30 pb-2">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[#1a1a1a]">SELECTED WORKS</h3>
                    <span className="font-mono text-[10px] text-[#1a1a1a]/60 uppercase tracking-widest">{categories.length} TYPOLOGIES</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {categories.map((cat, idx) => (
                      <div 
                        key={cat.name} 
                        onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                        className="group cursor-pointer flex flex-col animate-[fadeIn_0.5s_ease-out] hover:-translate-y-2 transition transform-gpu duration-500 will-change-transform"
                      >
                        <div className="overflow-hidden mb-4 bg-[#1a1a1a] w-full relative aspect-[4/3] shadow-sm transform-gpu">
                          <ImageWithFallback 
                            src={cat.img} 
                            alt={cat.name} 
                            className="w-full h-full object-cover transition transform-gpu duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                            style={{ willChange: 'transform, filter, opacity' }}
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 text-center">
                            <h3 className="text-[#f4f4f0] text-3xl md:text-4xl font-black tracking-tighter uppercase drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">
                              {cat.name}
                            </h3>
                          </div>
                        </div>
                        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest flex justify-between items-center w-full px-2">
                          <span className="text-[#1a1a1a]/80 font-bold">0{idx + 1}</span>
                          <span className="text-[#1a1a1a]/60">{cat.count} PROJECTS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'people' && <PeopleContent team={team} />}
            {activeTab === 'about' && <AboutContent pageData={pageData} />}
            
            {/* Footer */}
            <footer className="px-4 sm:px-6 py-6 border-t border-[#1a1a1a]/30 font-mono text-[10px] sm:text-xs uppercase tracking-widest flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-auto">
              <div className="text-[#1a1a1a]/60">
                © {new Date().getFullYear()} HMS ARCHITECTS.
              </div>
              <div className="flex gap-4 items-center">
                {onOpenAdmin && (
                  <button onClick={onOpenAdmin} className="appearance-none bg-transparent p-0 border-none hover:underline underline-offset-4 text-[#1a1a1a]/40 hover:text-[#1a1a1a] text-[10px] sm:text-xs font-normal">ADMIN</button>
                )}
              </div>
            </footer>

            {/* Marquee Banner (Only visible on About page) */}
            {activeTab === 'about' && (
              pageData.clientLogos && pageData.clientLogos.length > 0 ? (
                <section className="overflow-hidden whitespace-nowrap border-t border-[#1a1a1a]/30 py-2 sm:py-3 bg-[#1a1a1a] shrink-0 flex items-center">
                  <div className="inline-flex animate-[marquee_100s_linear_infinite] gap-12 sm:gap-24 px-6 sm:px-12 items-center min-w-max">
                    {Array(8).fill(pageData.clientLogos).flat().map((logo, idx) => (
                      <img key={idx} src={logo} alt="Client Logo" className="h-5 sm:h-6 md:h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" />
                    ))}
                  </div>
                </section>
              ) : (
                <section className="overflow-hidden whitespace-nowrap border-t border-[#1a1a1a]/30 py-2 sm:py-3 bg-[#1a1a1a] text-[#f4f4f0] shrink-0">
                  <div className="inline-block animate-[marquee_100s_linear_infinite] text-xs font-mono uppercase tracking-widest text-transparent hover:text-[#f4f4f0] font-light transition-colors duration-300" style={{ WebkitTextStroke: '0.5px #f4f4f0' }}>
                    ARCHITECTURE &nbsp;///&nbsp; INTERIOR DESIGN &nbsp;///&nbsp; MASTER PLANNING &nbsp;///&nbsp; SPATIAL BRANDING &nbsp;///&nbsp; ARCHITECTURE &nbsp;///&nbsp; INTERIOR DESIGN &nbsp;///&nbsp; MASTER PLANNING &nbsp;///&nbsp; SPATIAL BRANDING &nbsp;///&nbsp;
                  </div>
                </section>
              )
            )}
          </div>
        </main>
      </div>

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
