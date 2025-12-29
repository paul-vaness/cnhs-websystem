
import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="text-center select-none animate-in fade-in zoom-in duration-1000 mt-20 md:mt-0">
      {/* Generic Institutional Placeholder */}
      <div className="flex justify-center mb-10">
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl glass border border-white/10 flex items-center justify-center relative overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.4)] group transition-all duration-700">
           <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20"></div>
           
           {/* Generic Minimalist Shield/Crest Icon */}
           <svg className="w-10 h-10 md:w-12 md:h-12 text-white/30 group-hover:text-white/50 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
           </svg>
           
           <div className="absolute inset-0 border border-white/5 rounded-3xl m-1"></div>
        </div>
      </div>

      <div className="inline-block px-6 py-2 mb-12 border border-white/10 rounded-full glass shadow-xl">
        <span className="text-[9px] uppercase tracking-[0.6em] block opacity-80 font-black text-white/90">
          Academic Archive Network
        </span>
      </div>
      
      <div className="flex flex-col items-center">
        <h1 className="text-6xl md:text-[8rem] font-black tracking-[-0.04em] leading-[0.85] mb-2 uppercase text-white drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
          Cahil<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            National
          </span>
        </h1>
        
        <h2 className="text-xl md:text-3xl font-light tracking-[1em] opacity-40 uppercase mt-4 ml-4">
          Highschool
        </h2>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-16">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/10"></div>
        <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-20 whitespace-nowrap">Archives Division • Calaca City</span>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/10"></div>
      </div>
    </div>
  );
};
