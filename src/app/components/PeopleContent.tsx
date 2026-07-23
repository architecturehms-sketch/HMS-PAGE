import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TeamMember } from '../../hooks/useFirebaseData';

interface PeopleContentProps {
  team: TeamMember[];
}

export function PeopleContent({ team }: PeopleContentProps) {
  const [tickIndex, setTickIndex] = useState(0);
  const [hoveredPerson, setHoveredPerson] = useState<TeamMember | null>(null);
  const [lastHovered, setLastHovered] = useState<TeamMember | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const donutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickIndex(prev => {
        // Only rotate if the user is NOT actively hovering and reading a card
        if (hoveredPerson) return prev;
        return prev + 1;
      });
    }, 6000); // Increased cycle from 3s to 6s
    return () => clearInterval(interval);
  }, [hoveredPerson]);

  // Use all team members, but if there are too few, duplicate them to ensure at least 12 items for visual density
  const displayTeam = useMemo(() => {
    if (team.length === 0) return [];
    const shuffled = [...team].sort(() => Math.random() - 0.5);
    
    let fullTeam = [...shuffled];
    while (fullTeam.length < 12) {
      fullTeam = [...fullTeam, ...shuffled];
    }
    return fullTeam;
  }, [team]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Calculate safe tooltip position radially (Orbiting Logic)
  let targetX = mousePos.x;
  let targetY = mousePos.y;

  if (donutRef.current) {
    const rect = donutRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    const dx = mousePos.x - cx;
    const dy = mousePos.y - cy;
    
    // Calculate distance from center (prevent division by zero)
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    
    // Orbit radius = Donut radius + half of card width (~110px) + padding (30px)
    const orbitRadius = radius + 140;

    // Force the anchor point to perfectly orbit the donut edge
    targetX = cx + (dx / distance) * orbitRadius;
    targetY = cy + (dy / distance) * orbitRadius;
  }

  return (
    <div className="w-full flex flex-col animate-[fadeIn_0.5s_ease-out]" onMouseMove={handleMouseMove}>
      {/* People Header */}
      <section className="px-4 sm:px-6 py-2 flex flex-col justify-center items-start relative overflow-hidden">
        <div className="relative z-10 text-[#1a1a1a] select-none cursor-default flex w-full">
          <h2 className="font-mono text-[10px] sm:text-xs uppercase tracking-widest">
            PEOPLE
          </h2>
        </div>
      </section>

      {/* Team 12-Segment Donut Layout */}
      <section className="p-4 sm:p-6 py-6 md:py-8 flex items-center justify-center">
        <div 
          ref={donutRef}
          className="relative w-full max-w-[350px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[650px] aspect-square"
        >
          
          {/* Clock Tick Marks */}
          <div className="absolute inset-[-3%] md:inset-[-4%] rounded-full pointer-events-none">
            {[...Array(60)].map((_, i) => (
              <div
                key={`tick_${i}`}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div className={`${i % 5 === 0 ? 'w-[1.5px] h-2 md:h-2.5 bg-[#1a1a1a]/30' : 'w-[1px] h-1 bg-[#1a1a1a]/15'} mt-1`} />
              </div>
            ))}
          </div>

          {/* The Rotating Wheel */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden shadow-xl"
            style={{
              transform: `rotate(${tickIndex * (360 / displayTeam.length)}deg)`,
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' // Bouncy tick effect
            }}
          >
            {displayTeam.map((person, i) => {
              const sliceAngle = 360 / displayTeam.length;
              const currentAngle = i * sliceAngle;
              
              // Calculate dynamic clip-path for wedge
              const angleRad = (sliceAngle / 2) * (Math.PI / 180);
              const tanVal = Math.tan(angleRad);
              const leftEdge = 50 - 50 * tanVal;
              const rightEdge = 50 + 50 * tanVal;
              const clipPath = `polygon(50% 50%, ${leftEdge}% 0%, ${rightEdge}% 0%)`;
              
              const isHovered = hoveredPerson?.id === person.id;
              
              return (
                <div
                  key={`${person.id}_${i}`}
                  className="absolute inset-0 origin-center group cursor-pointer"
                  style={{
                    transform: `rotate(${currentAngle}deg)`,
                    clipPath
                  }}
                  onMouseEnter={() => {
                    setHoveredPerson(person);
                    setLastHovered(person);
                  }}
                  onMouseLeave={() => setHoveredPerson(null)}
                >
                  <div className="w-full h-full relative border-[0.5px] border-[#f4f4f0]/20">
                    {/* ImagePositioner perfectly covers the visible wedge area */}
                    <div 
                      className="absolute w-[44%] h-[44%] origin-center"
                      style={{ top: '-7%', left: '28%' }}
                    >
                      <div 
                        className="w-full h-full origin-center rounded-full overflow-hidden"
                        style={{
                          transform: `rotate(${-(currentAngle + tickIndex * sliceAngle)}deg)`,
                          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        <img 
                          src={person.img}
                          alt={person.name}
                          className={`w-full h-full object-cover transition-all duration-500 
                            ${isHovered ? 'grayscale-0 mix-blend-normal scale-110' : 'grayscale mix-blend-luminosity opacity-80 group-hover:opacity-100'}
                          `}
                        />
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* The Center Hole (Donut) */}
          <div className="absolute inset-[30%] bg-[#f4f4f0] rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.05),0_0_15px_rgba(0,0,0,0.2)] z-20 flex flex-col items-center justify-center p-4 md:p-8 text-center border-4 border-[#f4f4f0]">
            <div className="flex flex-col items-center w-full mt-2">
              <span className="font-black text-lg md:text-2xl lg:text-3xl tracking-tighter text-[#1a1a1a] uppercase truncate w-full">
                OUR CREW
              </span>
              <div className="w-12 md:w-20 h-[1px] bg-[#1a1a1a]/30 my-2 md:my-3" />
              <span className="font-mono text-[9px] md:text-xs text-[#1a1a1a]/60 uppercase tracking-widest leading-relaxed">
                HMS ARCHITECTS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Orbiting Info Card (Perfectly smooth, no flipping) */}
      <div 
        className="fixed z-50 pointer-events-none left-0 top-0"
        style={{ 
          transform: `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div className={`transition-all duration-300 ease-out origin-center ${
          hoveredPerson ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}>
          <div className="bg-[#1a1a1a]/95 backdrop-blur-sm text-[#f4f4f0] p-3 md:p-4 rounded-xl shadow-2xl flex flex-col items-center w-[160px] md:w-[220px]">
            {lastHovered && (
              <>
                <img src={lastHovered.img} className="w-full aspect-[3/4] object-cover rounded shadow-inner mb-3 md:mb-4" alt={lastHovered.name} />
                <div className="text-center w-full">
                  <h3 className="font-black text-sm md:text-lg uppercase tracking-tight truncate w-full">{lastHovered.name}</h3>
                  <p className="font-mono text-[9px] md:text-[10px] text-[#f4f4f0]/60 uppercase tracking-widest mt-1 truncate w-full">{lastHovered.role}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
