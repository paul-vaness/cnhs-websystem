
import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../App';

export interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  category: string;
  color: string;
}

interface DashboardProps {
  onLogout: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState;
  activeYear?: string;
}

export const logActivity = (action: string, category: string, color: string = 'bg-teal-500') => {
  const savedLogs = localStorage.getItem('cnhs_activity_log');
  const logs: ActivityLog[] = savedLogs ? JSON.parse(savedLogs) : [];
  const newLog: ActivityLog = {
    id: Date.now().toString(),
    action,
    user: 'ADMIN_PORTAL',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    category,
    color
  };
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem('cnhs_activity_log', JSON.stringify(updatedLogs));
};

// --- UI COMPONENTS ---

export const CornerBracket = () => (
  <>
    <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-white/20 rounded-tl-[2px]"></div>
    <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-white/20 rounded-tr-[2px]"></div>
    <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-white/20 rounded-bl-[2px]"></div>
    <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-white/20 rounded-br-[2px]"></div>
  </>
);

export const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all border-l-2 ${active ? 'bg-white/5 border-white text-white' : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'}`}
  >
    <div className={`w-5 h-5 flex items-center justify-center ${active ? 'opacity-100' : 'opacity-40'}`}>{icon}</div>
    <span className="text-[11px] font-bold tracking-[0.15em] uppercase">{label}</span>
  </div>
);

export const MainSidebar: React.FC<{ currentView: ViewState; onNavigate: (v: ViewState, params?: any) => void; onLogout: () => void }> = ({ currentView, onNavigate, onLogout }) => (
  <aside className="w-[240px] z-20 border-r border-white/5 glass flex flex-col hidden md:flex shrink-0 m-2">
    <div className="p-8 border-b border-white/5 relative group">
      <CornerBracket />
      
      {/* School Logo Placeholder */}
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-white/20 shadow-inner group-hover:scale-105 duration-500">
         <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent"></div>
         <svg className="w-7 h-7 text-white/20 group-hover:text-white/40 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
         </svg>
         <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-500/20 blur-md rounded-full"></div>
      </div>

      <div className="relative">
        <div className="text-2xl font-black tracking-[-0.05em] leading-none uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          Cahil<br />National
        </div>
        <div className="text-[9px] tracking-[0.6em] opacity-30 font-black uppercase mt-2 pl-0.5 border-l border-white/10">
          Highschool
        </div>
      </div>
    </div>
    
    <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
      <SidebarItem 
        active={currentView === 'dashboard'} 
        label="Dashboard" 
        onClick={() => onNavigate('dashboard')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
      />
      <SidebarItem 
        active={currentView === 'students'} 
        label="Students" 
        onClick={() => onNavigate('students')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} 
      />
      <SidebarItem 
        active={currentView === 'parents'}
        label="Parents" 
        onClick={() => onNavigate('parents')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} 
      />
      <SidebarItem 
        active={currentView === 'teachers'}
        label="Teachers" 
        onClick={() => onNavigate('teachers')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} 
      />
      <SidebarItem 
        active={currentView === 'subjects'}
        label="Subjects" 
        onClick={() => onNavigate('subjects')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
      />
      <SidebarItem 
        active={currentView === 'classes'}
        label="Classes" 
        onClick={() => onNavigate('classes')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} 
      />
      <SidebarItem 
        active={currentView === 'reportCards'}
        label="Report Cards" 
        onClick={() => onNavigate('reportCards')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
      />
      
      <div className="mx-6 my-4 h-[1px] bg-white/10"></div>
      
      <SidebarItem 
        active={currentView === 'settings'}
        label="Settings" 
        onClick={() => onNavigate('settings')}
        icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
      />
      <div onClick={onLogout}>
        <SidebarItem label="Logout" icon={<svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>} />
      </div>
    </nav>
  </aside>
);

const EnhancedStatCard: React.FC<{ 
  label: string; 
  value: string; 
  sub: string; 
  icon: React.ReactNode; 
  accent: string;
  breakdown: { label: string; value: string | number }[]
}> = ({ label, value, sub, icon, accent, breakdown }) => (
  <div className="glass p-5 hover:border-white/20 transition-all group cursor-default relative overflow-hidden flex flex-col h-full">
    <CornerBracket />
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${accent}`}>
        {icon}
      </div>
      <div className="text-[9px] font-mono tracking-tighter opacity-10">ENTITY_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
    </div>
    <div className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-bold mb-1">{label}</div>
    <div className="text-4xl font-black tracking-tighter mb-1 text-glow">{value}</div>
    <div className="text-[9px] uppercase tracking-widest opacity-20 font-bold mb-4">{sub}</div>
    
    <div className="space-y-1 pt-3 border-t border-white/5 mt-auto">
      {breakdown.map((item, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">{item.label}</span>
          <span className="text-[10px] font-mono opacity-60">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

const ActivityItem: React.FC<{ time: string; text: string; category: string; color: string }> = ({ time, text, category, color }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/5 hover:bg-white/10 px-4 transition-colors group">
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-mono opacity-20 w-16">{time}</span>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <div className="flex flex-col">
        <span className="text-[9px] uppercase tracking-widest opacity-30 font-black mb-0.5">{category}</span>
        <span className="text-[11px] uppercase tracking-wider font-medium opacity-70 group-hover:opacity-100 transition-opacity">{text}</span>
      </div>
    </div>
    <button className="text-[9px] font-black uppercase tracking-[0.2em] opacity-20 hover:opacity-100 transition-all border border-white/10 px-3 py-1 rounded hover:bg-white/10">View Log</button>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigate, currentView, activeYear }) => {
  const [time, setTime] = useState(new Date());
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  const academicDonutRef = useRef<HTMLCanvasElement>(null);
  const gradeRangeBarRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedLogs = localStorage.getItem('cnhs_activity_log');
    if (savedLogs) setLogs(JSON.parse(savedLogs).slice(0, 10));
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (academicDonutRef.current) {
      const ctx = academicDonutRef.current.getContext('2d');
      if (ctx) {
        const rate = 92.4;
        const width = academicDonutRef.current.width;
        const height = academicDonutRef.current.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 60;
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 12;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -0.5 * Math.PI, (-0.5 + (rate / 100) * 2) * Math.PI);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(`${rate}%`, centerX, centerY + 8);
      }
    }

    if (gradeRangeBarRef.current) {
      const ctx = gradeRangeBarRef.current.getContext('2d');
      if (ctx) {
        const data = [145, 450, 320, 280, 45];
        const labels = ['90-100', '85-89', '80-84', '75-79', '<75'];
        const colors = ['#10b981', '#5a9d9d', '#eab308', '#f97316', '#ef4444'];
        const width = gradeRangeBarRef.current.width;
        const height = gradeRangeBarRef.current.height;
        const max = 500;
        ctx.clearRect(0, 0, width, height);
        data.forEach((val, i) => {
          const barWidth = (val / max) * (width - 120);
          const y = 30 + i * 35;
          ctx.fillStyle = 'rgba(255,255,255,0.05)';
          ctx.beginPath();
          ctx.roundRect(80, y, width - 120, 10, 5);
          ctx.fill();
          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.roundRect(80, y, barWidth, 10, 5);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'right';
          ctx.fillText(labels[i], 70, y + 9);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'left';
          ctx.fillText(val.toString(), 85 + barWidth, y + 9);
        });
      }
    }
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
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / DASHBOARD</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex flex-col">
              <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">Record Portal</div>
              <div className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-tighter">ACTIVE_YEAR: {activeYear}</div>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div className="text-[8px] tracking-[0.2em] opacity-30 font-bold uppercase mt-0.5">
                {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center font-black text-xs opacity-80 cursor-help transition-transform hover:scale-105">AP</div>
          </div>
        </header>

        <div className="p-6 space-y-8 animate-in fade-in duration-1000">
          <section className="glass p-4 flex justify-between items-center relative overflow-hidden">
            <CornerBracket />
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-30 mb-0.5">CORE STATUS</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                  <span className="text-[10px] font-black tracking-[0.1em] uppercase">LINKED_OK</span>
                </div>
              </div>
              <div className="h-6 w-[1px] bg-white/5"></div>
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-widest font-bold opacity-30 mb-0.5">SYSTEM UPTIME</span>
                <span className="text-[10px] font-mono tracking-widest opacity-60">99.98% / REL_7.3</span>
              </div>
            </div>
            <div className="hidden md:block text-[9px] font-mono opacity-20 uppercase tracking-[0.3em]">SECURE_GATEWAY_V3.1.2</div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <EnhancedStatCard 
              label="Total Students" value="1,240" sub="ACTIVE ENROLLMENTS" accent="text-teal-400" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              breakdown={[{ label: 'Grade 7', value: '310' }, { label: 'Grade 8', value: '305' }, { label: 'Grade 9', value: '300' }, { label: 'Grade 10', value: '325' }]}
            />
            <EnhancedStatCard 
              label="Teachers" value="86" sub="FACULTY_COUNT" accent="text-amber-400" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              breakdown={[{ label: 'Math', value: 15 }, { label: 'Science', value: 18 }, { label: 'English', value: 14 }, { label: 'Filipino', value: 12 }]}
            />
            <EnhancedStatCard 
              label="Parents" value="1,142" sub="GUARDIAN_LINKAGE" accent="text-purple-400" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
              breakdown={[{ label: 'Mothers', value: 620 }, { label: 'Fathers', value: 480 }, { label: 'Guardians', value: 32 }, { label: 'Other', value: 10 }]}
            />
            <EnhancedStatCard 
              label="Reports" value="4.2K" sub="ASSESSMENTS_DONE" accent="text-emerald-400" 
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              breakdown={[{ label: 'Q1 Complete', value: '1,240' }, { label: 'Q2 Complete', value: '1,195' }, { label: 'Q3 Complete', value: '1,180' }, { label: 'Q4 Pending', value: '25' }]}
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 relative overflow-hidden flex flex-col sm:flex-row gap-8">
              <CornerBracket />
              <div className="flex-1">
                <div className="mb-6">
                  <h3 className="text-[12px] font-black tracking-[0.2em] uppercase opacity-90 mb-1">Academic Passing Rate</h3>
                  <p className="text-[10px] tracking-widest opacity-30 font-bold uppercase">Overall Performance Index</p>
                </div>
                <div className="flex items-center justify-center py-4">
                  <canvas ref={academicDonutRef} width={200} height={200} className="max-w-[160px]" />
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center gap-4 border-l border-white/5 pl-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-40 uppercase">GRADE 7</span>
                    <span className="text-[11px] font-mono text-emerald-400">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-40 uppercase">GRADE 8</span>
                    <span className="text-[11px] font-mono text-emerald-400">91.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-40 uppercase">GRADE 9</span>
                    <span className="text-[11px] font-mono text-amber-400">82.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold opacity-40 uppercase">GRADE 10</span>
                    <span className="text-[11px] font-mono text-emerald-400">89.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-8 relative overflow-hidden">
              <CornerBracket />
              <div className="mb-8">
                <h3 className="text-[12px] font-black tracking-[0.2em] uppercase opacity-90 mb-1">Grade Distribution</h3>
                <p className="text-[10px] tracking-widest opacity-30 font-bold uppercase">Final Assessment Range</p>
              </div>
              <canvas ref={gradeRangeBarRef} width={500} height={220} className="w-full" />
            </div>
          </section>

          <section className="glass overflow-hidden mb-12 relative">
            <CornerBracket />
            <div className="p-6 border-b border-white/5 glass flex items-center justify-between">
              <div>
                <h3 className="text-[12px] font-black tracking-[0.2em] uppercase opacity-90 mb-1">Audit Log / System Activity</h3>
                <p className="text-[10px] tracking-widest opacity-30 font-bold uppercase">Real-time Entity Monitoring</p>
              </div>
            </div>
            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
              {logs.length > 0 ? logs.map(log => (
                <ActivityItem key={log.id} time={log.timestamp} text={log.action} category={log.category} color={log.color} />
              )) : (
                <div className="p-12 text-center opacity-10 text-[10px] font-black uppercase tracking-[0.4em]">NO_LOGS_AVAILABLE</div>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-auto p-8 border-t border-white/5 glass flex flex-col sm:flex-row justify-between items-center shrink-0 gap-4">
          <div className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-bold">CNHS_ARCHIVES_DIV_SECURE_V3</div>
          <div className="flex items-center gap-4">
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-20 font-bold border border-white/5 px-3 py-1 rounded">DEPED K-12 COMPLIANT</div>
            <div 
              onClick={() => onNavigate('settings')}
              className="text-[10px] uppercase tracking-[0.4em] opacity-50 font-black text-glow hover:opacity-100 transition-all cursor-pointer"
            >
              Made by Team Peach
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.4em] opacity-30 font-bold">ENCRYPTED_SESSION_128BIT</div>
        </footer>
      </main>
    </div>
  );
};
