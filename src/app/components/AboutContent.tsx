import React from 'react';
import { motion } from 'framer-motion';
import { PageData } from '../../hooks/useFirebaseData';

interface AboutContentProps {
  pageData: PageData;
}

export function AboutContent({ pageData }: AboutContentProps) {
  return (
    <div className="flex-1 flex flex-col animate-[fadeIn_0.5s_ease-out] w-full max-w-full overflow-hidden">
      


      {/* 2. Vision & Approach (Animated, Elegant Layout) */}
      <div className="relative w-full py-16 sm:py-24 lg:py-32 overflow-hidden border-b border-[#1a1a1a]/30">
        
        {/* Background Typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black uppercase text-[#1a1a1a] opacity-[0.02] leading-none pointer-events-none select-none tracking-tighter">
          HMS
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 z-10 flex flex-col">
          
          <div className="flex items-center gap-4 mb-16 lg:mb-24">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#1a1a1a]/50">
              [ 01 / STUDIO VISION ]
            </h4>
            <div className="flex-1 h-[1px] bg-[#1a1a1a]/10"></div>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: { transition: { staggerChildren: 0.3 } },
              hidden: {}
            }}
            className="flex flex-col gap-8 sm:gap-10 lg:gap-12 lg:pl-12"
          >
            
            {/* Line 1 */}
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.21, 0.47, 0.32, 0.98] } } }}
              className="font-sans text-xs sm:text-sm font-bold text-[#1a1a1a]/50 tracking-widest uppercase"
            >
              주식회사 에이치엠에스건축사사무소에 담아내려는 이념과 같이,
            </motion.p>

            {/* Line 2 (Hero Statement) */}
            <motion.h3 
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.21, 0.47, 0.32, 0.98] } } }}
              className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-[#1a1a1a] leading-[1.4] tracking-tight max-w-4xl"
            >
              <span className="text-[#E3342F] font-black">‘공간’</span> 이라는 스케치북에,<br className="hidden sm:block" />
              <span className="relative inline-block">
                <span className="relative z-10 font-black">‘시간’</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#1a1a1a]/10 -z-10"></span>
              </span> 을 그려나가는 건축을 하고자 합니다.
            </motion.h3>

            {/* Line 3 (Secondary Statement) */}
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.21, 0.47, 0.32, 0.98] } } }}
              className="text-xl sm:text-2xl lg:text-3xl font-sans font-medium text-[#1a1a1a]/80 leading-[1.5] max-w-3xl lg:ml-[5%] lg:mt-4"
            >
              사람의 기억을 건물로 형상화하는<br />
              <span className="text-[#1a1a1a] border-b-2 border-[#E3342F] pb-1 font-bold">‘기억을 담는 그릇’</span> 을 만들겠습니다.
            </motion.p>

            {/* Line 4 (Tertiary Statement) */}
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(10px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease: [0.21, 0.47, 0.32, 0.98] } } }}
              className="text-base sm:text-lg lg:text-xl font-sans font-light text-[#1a1a1a]/70 leading-[1.6] max-w-2xl lg:ml-[15%] lg:mt-4"
            >
              눈으로 보고, 귀로 듣고, 손으로 만들어,<br className="hidden sm:block" />
              <strong className="font-semibold text-[#1a1a1a]">‘당신의 꿈’</strong> 을 함께 완성해 나아가겠습니다.
            </motion.p>

            {/* Line 5 (Conclusion) */}
            <motion.div 
              variants={{ hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' }, visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1, ease: [0.21, 0.47, 0.32, 0.98] } } }}
              className="mt-8 lg:mt-12 lg:ml-[25%]"
            >
              <div className="inline-flex items-center gap-4 px-6 py-4 bg-[#1a1a1a]/5 border border-[#1a1a1a]/10 rounded-sm">
                <div className="w-2 h-2 rounded-full bg-[#E3342F] animate-pulse"></div>
                <p className="text-sm font-sans font-medium text-[#1a1a1a]/90 tracking-wide">
                  ‘소중한 당신’의 시간이 되어, 함께 기록하고 담기 위해 최선의 노력을 다합니다.
                </p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* 3. Operation Methodology (Free-form Layout) */}
      <div className="relative w-full py-20 sm:py-32 lg:py-48 overflow-hidden border-b border-[#1a1a1a]/30">
        
        {/* Background Typography */}
        <div className="absolute top-10 left-[-5%] text-[15vw] font-black uppercase text-[#1a1a1a] opacity-[0.03] leading-none pointer-events-none whitespace-nowrap">
          ARCHITECTS
        </div>
        <div className="absolute bottom-10 right-[-5%] text-[15vw] font-black uppercase text-[#1a1a1a] opacity-[0.03] leading-none pointer-events-none whitespace-nowrap">
          DESIGN
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row gap-16 lg:gap-8 items-center lg:items-stretch">
          
          {/* Block 1: Integrated Operation */}
          <div className="w-full lg:w-1/2 flex flex-col lg:items-start group relative z-10">
            <div className="absolute -top-12 -left-8 text-[120px] font-black text-[#1a1a1a] opacity-5 pointer-events-none transition-transform duration-700 group-hover:-translate-y-4">
              01
            </div>
            <div className="bg-white/50 backdrop-blur-sm border border-[#1a1a1a]/10 p-8 sm:p-12 shadow-sm hover:shadow-xl transition-all duration-500 w-full lg:w-[110%] lg:mt-0 mt-8 relative">
              <div className="w-12 h-[2px] bg-[#1a1a1a] mb-8 transition-all duration-500 group-hover:w-24 group-hover:bg-[#E3342F]"></div>
              <h4 className="font-mono text-xs uppercase tracking-[0.3em] text-[#1a1a1a]/50 mb-6">
                INTEGRATED OPERATION
              </h4>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-[#1a1a1a] mb-12 leading-[1.3] tracking-tight">
                사업이 진행되는 동안<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a1a1a] to-[#1a1a1a]/50">통합 운영</span> 하겠습니다.
              </h3>
              
              <div className="space-y-6">
                {[
                  '지속적인 OR을 활용한 통합 매뉴얼 작성',
                  '상품기획에 따른 Feasibility Study',
                  '사업지별 법규검토 및 Issue List 작성',
                  '사업팀과의 협업으로 협의 체계 구축',
                  '주요 쟁점사항 공유 및 통합관리'
                ].map((text, i) => (
                  <div key={i} className={`flex items-start gap-4 transition-transform duration-500 group-hover:translate-x-2`} style={{ transitionDelay: `${i * 50}ms` }}>
                    <span className="font-mono text-[10px] text-[#E3342F] font-bold pt-1.5 w-6 shrink-0">0{i+1}</span>
                    <p className="text-sm sm:text-base font-sans font-medium text-[#1a1a1a]/80 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Block 2: Client Customization */}
          <div className="w-full lg:w-1/2 flex flex-col lg:items-end group relative z-20 lg:mt-32">
            <div className="absolute -top-12 -right-8 text-[120px] font-black text-[#1a1a1a] opacity-5 pointer-events-none transition-transform duration-700 group-hover:-translate-y-4">
              02
            </div>
            <div className="bg-[#1a1a1a] p-8 sm:p-12 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 w-full lg:w-[110%] lg:-ml-[20%] relative">
              <div className="w-12 h-[2px] bg-[#f4f4f0] mb-8 transition-all duration-500 group-hover:w-24 group-hover:bg-[#E3342F]"></div>
              <h4 className="font-mono text-xs uppercase tracking-[0.3em] text-[#f4f4f0]/50 mb-6">
                CLIENT CUSTOMIZATION
              </h4>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-[#f4f4f0] mb-12 leading-[1.3] tracking-tight">
                CLIENT 맞춤형<br />
                운영방식을 적용하겠습니다.
              </h3>
              
              <div className="space-y-6">
                {[
                  '상호 1:1 담당 (Client : HMS) 적용',
                  '작은 조직의 강점을 활용한 신속한 대응',
                  '노출되지 않는 조직유지로 보안력 확보',
                  '매뉴얼화를 통한 Guide Line 수립',
                  '조직대응으로 짧은 시간 다수 건의 대응'
                ].map((text, i) => (
                  <div key={i} className={`flex items-start gap-4 transition-transform duration-500 group-hover:-translate-x-2`} style={{ transitionDelay: `${i * 50}ms` }}>
                    <span className="font-mono text-[10px] text-[#E3342F] font-bold pt-1.5 w-6 shrink-0">0{i+1}</span>
                    <p className="text-sm sm:text-base font-sans font-medium text-[#f4f4f0]/80 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Floating Bottom Banner */}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 mt-16 lg:mt-24 z-30">
          <div className="bg-[#E3342F] p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl hover:scale-[1.02] transition-transform duration-500">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-[0.2em] font-bold">
                CLIENT - HMS 맞춤형 운영계획
              </span>
              <h2 className="text-xl sm:text-2xl font-sans font-bold text-white leading-snug">
                조직력의 경험을 갖춘 신속한 대응 계획을 제시합니다.
              </h2>
            </div>
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center relative overflow-hidden group/btn cursor-pointer">
                <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <svg className="w-5 h-5 text-white group-hover/btn:text-[#E3342F] transition-colors duration-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Visual Anchor */}
      <div className="w-full h-[40vh] sm:h-[50vh] lg:h-[70vh] border-b border-[#1a1a1a]/30 relative overflow-hidden bg-[#1a1a1a]">
        <img 
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600" 
          alt="Studio Architecture" 
          className="w-full h-full object-cover filter brightness-[0.4] grayscale hover:scale-105 transition-transform duration-[2000ms] ease-out opacity-80 mix-blend-luminosity"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <span className="text-[12vw] font-black uppercase tracking-tighter text-[#f4f4f0] opacity-10 drop-shadow-lg mix-blend-overlay">
             HMS
           </span>
        </div>
      </div>

      {/* 5. Contact & Location Footer */}
      <div className="grid grid-cols-1 md:grid-cols-2 p-4 sm:p-6 lg:p-12 gap-12 md:gap-0 bg-[#f4f4f0]">
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#1a1a1a]/50 mb-2">GENERAL INQUIRIES</h4>
          <a href={`mailto:${pageData.contactEmail}`} className="text-2xl sm:text-3xl lg:text-4xl font-sans font-medium uppercase hover:line-through transition-all decoration-2 w-fit">
            {pageData.contactEmail}
          </a>
        </div>
        <div className="flex flex-col gap-2 md:items-end md:text-right">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-[#1a1a1a]/50 mb-2">HEADQUARTERS</h4>
          <p className="text-2xl sm:text-3xl lg:text-4xl font-sans font-medium uppercase text-[#1a1a1a]">
            {pageData.address}
          </p>
        </div>
      </div>

    </div>
  );
}
