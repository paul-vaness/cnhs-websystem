
import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar } from './Dashboard';

interface CreditsPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

interface Developer {
  name: string;
  studentId: string;
  contact: string;
  email: string;
}

const developers: Developer[] = [
  { name: 'ESPERANZA R. ALVAREZ', studentId: '2024-10302', contact: '0930 424 4464', email: 'ealvares302@ccgc.edu.ph' },
  { name: 'ANGELINE E. CASTOR', studentId: '2024-10352', contact: '0995 778 1726', email: 'acastor352@ccgc.edu.ph' },
  { name: 'HERLYN MAE O. ESGUERRA', studentId: '2024-10530', contact: '0970 471 1897', email: 'hesguerra530@ccgc.edu.ph' },
  { name: 'EL KATRINA DE PATRICIA F. TOLEDO', studentId: '2024-10435', contact: '0906 389 3799', email: 'etoledo435@ccgc.edu.ph' },
  { name: 'PAUL VANESS B. RAMOS', studentId: '2024-10419', contact: '0956 163 8839', email: 'pramos419@ccgc.edu.ph' },
  { name: 'CARL VINCENT C. VERGARA', studentId: '2024-10387', contact: '0936 671 0925', email: 'cvergara387@ccgc.edu.ph' },
];

export const CreditsPage: React.FC<CreditsPageProps> = ({ onLogout, onNavigate, currentView }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1920" 
          alt="" 
          className="w-full h-full object-cover blur-3xl scale-110"
        />
      </div>

      <MainSidebar currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 flex flex-col z-20 overflow-y-auto overflow-x-hidden">
        <header className="h-20 glass m-2 flex items-center justify-between px-8 shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / CREDITS</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">System Attribution</div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
              <div className="text-[8px] tracking-[0.3em] opacity-30 font-bold uppercase mt-0.5">{time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center font-black text-xs opacity-80 transition-transform hover:scale-110">AP</div>
          </div>
        </header>

        <div className="p-8 space-y-12 animate-in fade-in duration-1000 max-w-6xl mx-auto w-full">
          {/* Header Attribution */}
          <section className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-glow">System Credits</h1>
            <p className="text-[10px] font-black tracking-[0.5em] opacity-40 uppercase">Information Management Course Project</p>
          </section>

          {/* Instructor Block */}
          <section className="flex justify-center">
            <div className="glass p-8 relative overflow-hidden max-w-lg w-full text-center">
              <CornerBracket />
              <span className="text-[9px] font-black tracking-[0.4em] opacity-30 uppercase block mb-4">Under the Guidance of:</span>
              <h2 className="text-2xl font-black tracking-tight uppercase mb-1">Gene Justine P. Rosales</h2>
              <p className="text-[11px] font-bold tracking-widest opacity-60 uppercase">Course Instructor</p>
            </div>
          </section>

          {/* Student Developers Grid */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-black tracking-[0.4em] opacity-30 uppercase text-center border-b border-white/5 pb-4">Student Developers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {developers.map((dev, i) => (
                <div key={i} className="glass p-6 relative group hover:border-white/20 transition-all">
                  <CornerBracket />
                  <div className="flex flex-col h-full">
                    <h4 className="text-[13px] font-black tracking-wider uppercase mb-3 text-white/90 group-hover:text-teal-400 transition-colors">{dev.name}</h4>
                    <div className="space-y-2 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">Student ID</span>
                        <span className="text-[10px] font-mono opacity-60">{dev.studentId}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">Contact Vector</span>
                        <span className="text-[10px] font-mono opacity-60">{dev.contact}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">Institutional Email</span>
                        <span className="text-[10px] font-mono opacity-60 lowercase">{dev.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Timeline */}
          <section className="pt-12 text-center">
            <div className="inline-block px-8 py-3 border border-white/5 glass bg-white/[0.02] rounded-full">
               <span className="text-[10px] font-black tracking-[0.6em] opacity-30 uppercase">Academic Year: 2024–2025</span>
            </div>
          </section>
        </div>

        <footer className="mt-auto p-8 border-t border-white/5 glass flex justify-between items-center shrink-0">
          <div className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-bold">CAHIL_NATIONAL_HIGHSCHOOL</div>
          <div className="text-[10px] uppercase tracking-[0.4em] opacity-50 font-black text-glow">TEAM_PEACH_ARCHIVE</div>
        </footer>
      </main>
    </div>
  );
};
