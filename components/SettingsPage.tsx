
import React, { useState, useEffect } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar, logActivity } from './Dashboard';

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

interface SettingsPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  activeYear: string;
  onYearChange: (year: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, onNavigate, currentView, activeYear, onYearChange }) => {
  const [selectedYear, setSelectedYear] = useState(activeYear);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const handleSave = () => {
    onYearChange(selectedYear);
    logActivity(`GLOBAL_CONFIG_CHANGE: ACTIVE YEAR SET TO ${selectedYear}`, 'SYSTEM_UPDATE', 'bg-blue-500');
    // For a real app, you might show a toast here. Since it's passed via props, we assume success.
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1920" alt="" className="w-full h-full object-cover blur-3xl scale-110" />
      </div>

      <MainSidebar currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 flex flex-col z-20 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <header className="h-20 glass m-2 flex items-center justify-between px-8 shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / SETTINGS</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">System Configuration</div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
              <div className="text-[8px] tracking-[0.3em] opacity-30 font-bold uppercase mt-0.5">{time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center font-black text-xs opacity-80 transition-transform hover:scale-110">AP</div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto w-full space-y-12 pb-24">
          <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">SYSTEM PREFERENCES</h1>
          
          <section className="glass p-8 relative overflow-hidden space-y-10">
            <CornerBracket />
            
            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">ACADEMIC_TIME_MATRIX</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black tracking-widest opacity-40 uppercase">ACTIVE_SCHOOL_YEAR_IDENTIFIER</label>
                  <div className="flex flex-wrap gap-4">
                    <select 
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[11px] font-black tracking-widest focus:outline-none focus:border-teal-500/40 transition-all uppercase appearance-none cursor-pointer w-64"
                    >
                      <option value="2023-2024">2023-2024</option>
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                    </select>
                    <button 
                      onClick={handleSave}
                      className="bg-teal-500 hover:bg-teal-400 text-black px-10 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)]"
                    >
                      COMMIT_YEAR_SYNC
                    </button>
                  </div>
                  <p className="text-[8px] opacity-20 uppercase tracking-widest mt-2">
                    Note: Changing the active year will archive all records belonging to previous academic cycles.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">ACCESS_SECURITY_PARAMETERS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass bg-white/[0.02] p-4 border border-white/5 rounded-xl opacity-30 cursor-not-allowed">
                  <span className="text-[9px] font-black tracking-widest uppercase block mb-1">MFA_AUTHENTICATION</span>
                  <span className="text-[8px] font-mono opacity-60">STATUS: DEACTIVATED_BY_REGISTRY</span>
                </div>
                <div className="glass bg-white/[0.02] p-4 border border-white/5 rounded-xl opacity-30 cursor-not-allowed">
                  <span className="text-[9px] font-black tracking-widest uppercase block mb-1">DATA_EXPORT_ENCRYPTION</span>
                  <span className="text-[8px] font-mono opacity-60">PROTOCOL: AES-256_ACTIVE</span>
                </div>
              </div>
            </div>
          </section>

          {/* System Credits Section */}
          <section className="space-y-8 animate-in fade-in duration-1000">
             <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 whitespace-nowrap">SYSTEM_ATTRIBUTION</h3>
                <div className="h-[1px] w-full bg-white/5"></div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
               {/* Instructor Column */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="glass p-6 relative overflow-hidden">
                    <CornerBracket />
                    <span className="text-[9px] font-black tracking-[0.4em] opacity-30 uppercase block mb-4">Under the Guidance of:</span>
                    <h2 className="text-xl font-black tracking-tight uppercase mb-1 text-white/90">Gene Justine P. Rosales</h2>
                    <p className="text-[10px] font-bold tracking-widest opacity-40 uppercase">Course Instructor</p>
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <span className="text-[8px] font-black opacity-20 uppercase tracking-[0.2em]">Information Management Course Project</span>
                    </div>
                  </div>
               </div>

               {/* Developers Grid */}
               <div className="lg:col-span-2">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {developers.map((dev, i) => (
                      <div key={i} className="glass p-5 relative group hover:border-white/20 transition-all">
                        <CornerBracket />
                        <div className="flex flex-col h-full">
                          <h4 className="text-[11px] font-black tracking-wider uppercase mb-3 text-white/80 group-hover:text-teal-400 transition-colors">{dev.name}</h4>
                          <div className="space-y-1.5 mt-auto">
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] font-black tracking-widest opacity-20 uppercase">Student ID</span>
                              <span className="text-[9px] font-mono opacity-40">{dev.studentId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[7px] font-black tracking-widest opacity-20 uppercase">Contact</span>
                              <span className="text-[9px] font-mono opacity-40">{dev.contact}</span>
                            </div>
                            <div className="flex flex-col pt-1">
                              <span className="text-[7px] font-black tracking-widest opacity-20 uppercase">Institutional Email</span>
                              <span className="text-[9px] font-mono opacity-40 lowercase">{dev.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
             </div>

             <div className="flex justify-center pt-8">
                <div className="inline-block px-8 py-3 border border-white/5 glass bg-white/[0.02] rounded-full">
                  <span className="text-[9px] font-black tracking-[0.6em] opacity-30 uppercase">Academic Year: 2024–2025 • Archives Division</span>
                </div>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};
