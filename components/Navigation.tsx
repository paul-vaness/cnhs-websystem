
import React, { useState, useEffect } from 'react';

const SystemClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end border-l border-white/10 pl-6 ml-2">
      <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </div>
      <div className="text-[8px] tracking-[0.3em] opacity-30 font-bold uppercase mt-0.5">
        {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
};

export const Navigation: React.FC = () => {
  return (
    <nav className="absolute top-0 w-full p-6 md:px-12 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-center z-20 gap-8 md:gap-0">
      {/* Left: Simplified Breadcrumbs */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] tracking-widest uppercase opacity-40 font-bold">Portal</span>
            <svg className="w-2 h-2 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            <span className="text-[9px] tracking-widest uppercase opacity-80 font-black">Authentication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
            <span className="text-[8px] tracking-[0.2em] uppercase font-bold opacity-30">Server Operational</span>
          </div>
        </div>
      </div>

      {/* Right: System Info (Clock only) */}
      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-end">
        <SystemClock />
      </div>
    </nav>
  );
};
