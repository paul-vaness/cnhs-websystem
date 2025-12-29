
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar, logActivity } from './Dashboard';

export interface ClassRecord {
  id: string;
  subjectId: string;
  teacherId: string;
  gradeLevel: number;
  sectionName: string;
  schoolYear: string;
  roomNumber?: string;
  maxCapacity: number;
  isAdviser?: boolean;
}

export interface Enrollment {
  studentId: string;
  classId: string;
  status: 'active' | 'dropped' | 'transferred';
}

interface ClassesPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState;
  activeYear: string;
}

const MOCK_CLASSES: ClassRecord[] = [
  { id: 'CLS001', subjectId: 'SUB004', teacherId: 'T001', gradeLevel: 8, sectionName: 'SAMPAGUITA', schoolYear: '2024-2025', roomNumber: 'RM 101', maxCapacity: 40, isAdviser: true },
  { id: 'CLS002', subjectId: 'SUB003', teacherId: 'T002', gradeLevel: 7, sectionName: 'A', schoolYear: '2024-2025', roomNumber: 'RM 102', maxCapacity: 45 },
  { id: 'CLS003', subjectId: 'SUB001', teacherId: 'T003', gradeLevel: 9, sectionName: 'B', schoolYear: '2024-2025', roomNumber: 'RM 204', maxCapacity: 40 },
];

const MOCK_ENROLLMENTS: Enrollment[] = [
  { studentId: 'S001', classId: 'CLS001', status: 'active' },
  { studentId: 'S002', classId: 'CLS001', status: 'active' },
  { studentId: 'S003', classId: 'CLS003', status: 'active' },
];

export const ClassesPage: React.FC<ClassesPageProps> = ({ onLogout, onNavigate, currentView, activeYear }) => {
  const [classes, setClasses] = useState<ClassRecord[]>(() => {
    const saved = localStorage.getItem('cnhs_classes');
    return saved ? JSON.parse(saved) : MOCK_CLASSES;
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('cnhs_enrollments');
    return saved ? JSON.parse(saved) : MOCK_ENROLLMENTS;
  });

  const [subjects, setSubjects] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [teachers, setTeachers] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_teachers');
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('cnhs_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('cnhs_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(clock);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || 'UNKNOWN_SUB';
  const getTeacherName = (id: string) => {
    const t = teachers.find(t => t.id === id);
    return t ? `${t.lastName}, ${t.firstName}` : 'UNKNOWN_TCH';
  };
  const getEnrolledCount = (classId: string) => enrollments.filter(e => e.classId === classId && e.status === 'active').length;

  const schoolYears = useMemo(() => Array.from(new Set(classes.map(c => c.schoolYear))).sort().reverse(), [classes]);

  const filteredClasses = useMemo(() => {
    return classes
      .filter(c => {
        const subName = getSubjectName(c.subjectId).toLowerCase();
        const tchName = getTeacherName(c.teacherId).toLowerCase();
        const secName = c.sectionName.toLowerCase();
        const matchesSearch = subName.includes(search.toLowerCase()) || tchName.includes(search.toLowerCase()) || secName.includes(search.toLowerCase());
        const matchesGrade = gradeFilter === 'all' || c.gradeLevel.toString() === gradeFilter;
        const matchesYear = yearFilter === 'all' || c.schoolYear === yearFilter;
        return matchesSearch && matchesGrade && matchesYear;
      })
      .sort((a, b) => a.schoolYear.localeCompare(b.schoolYear) || a.gradeLevel - b.gradeLevel);
  }, [classes, search, gradeFilter, yearFilter, subjects, teachers]);

  const paginatedClasses = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredClasses.slice(start, start + rowsPerPage);
  }, [filteredClasses, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredClasses.length / rowsPerPage);

  const handleSaveClass = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    const formattedData = {
      subjectId: data.subjectId,
      teacherId: data.teacherId,
      gradeLevel: parseInt(data.gradeLevel),
      sectionName: data.sectionName.toUpperCase(),
      schoolYear: data.schoolYear,
      roomNumber: data.roomNumber?.toUpperCase(),
      maxCapacity: parseInt(data.maxCapacity) || 40,
      isAdviser: data.isAdviser === 'on',
    };

    // Adviser rule: Only one adviser per section group
    if (formattedData.isAdviser) {
      const otherAdviser = classes.find(c => 
        c.id !== editingClass?.id &&
        c.gradeLevel === formattedData.gradeLevel &&
        c.sectionName === formattedData.sectionName &&
        c.schoolYear === formattedData.schoolYear &&
        c.isAdviser
      );
      if (otherAdviser) {
        addToast(`CONFLICT: ${getTeacherName(otherAdviser.teacherId)} IS ALREADY THE ADVISER FOR THIS SECTION`, 'error');
        return;
      }
    }

    if (editingClass) {
      setClasses(prev => prev.map(c => c.id === editingClass.id ? { ...c, ...formattedData } : c));
      logActivity(`MODIFIED CLASS ${editingClass.id}`, 'CLASS_UPDATE');
      addToast('CLASS UPDATED SUCCESSFULLY');
    } else {
      const nextIdNum = Math.max(...classes.map(c => parseInt(c.id.slice(3))), 0) + 1;
      const nextId = `CLS${nextIdNum.toString().padStart(3, '0')}`;
      setClasses(prev => [{ ...formattedData, id: nextId } as ClassRecord, ...prev]);
      logActivity(`INITIALIZED NEW CLASS ${nextId}`, 'CLASS_REG');
      addToast('NEW CLASS SECTION ARCHIVED');
    }
    setIsModalOpen(false);
    setEditingClass(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      if (getEnrolledCount(deleteId) > 0) {
        addToast('CANNOT DELETE: SECTION HAS ACTIVE ENROLLMENTS', 'error');
        setDeleteId(null);
        return;
      }
      setClasses(prev => prev.filter(c => c.id !== deleteId));
      logActivity(`PURGED CLASS ${deleteId}`, 'CLASS_DELETE', 'bg-red-500');
      setDeleteId(null);
      addToast('CLASS RECORD PURGED', 'error');
    }
  };

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
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / CLASSES</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex flex-col">
              <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">Class Archives</div>
              <div className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-tighter">ACTIVE_YEAR: {activeYear}</div>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
              <div className="text-[8px] tracking-[0.3em] opacity-30 font-bold uppercase mt-0.5">
                {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center font-black text-xs opacity-80 cursor-help transition-transform hover:scale-105">AP</div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">CLASS SECTIONS</h1>
            <button 
              onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
              className="bg-teal-500 hover:bg-teal-400 text-black px-5 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.3)] active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              ADD CLASS
            </button>
          </div>

          <section className="glass p-5 flex flex-wrap gap-4 items-end relative overflow-hidden">
            <CornerBracket />
            <div className="flex-1 min-w-[240px]">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Omni_Search (SUBJECT, SECTION, TEACHER)</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH CLASSES..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider"
                />
              </div>
            </div>
            <div className="w-40">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Grade_Level</label>
              <select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold appearance-none cursor-pointer">
                <option value="all">ALL GRADES</option>
                {[7, 8, 9, 10].map(lvl => <option key={lvl} value={lvl}>GRADE {lvl}</option>)}
              </select>
            </div>
            <div className="w-40">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">School_Year</label>
              <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold appearance-none cursor-pointer">
                <option value="all">ALL YEARS</option>
                {schoolYears.map(yr => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            </div>
          </section>

          <section className="glass overflow-hidden relative min-h-[400px]">
            <CornerBracket />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4">CLASS_ID</th>
                    <th className="p-4">SUBJECT</th>
                    <th className="p-4">LVL_SECTION</th>
                    <th className="p-4">SCH_YEAR</th>
                    <th className="p-4">TEACHER_ASSIGNED</th>
                    <th className="p-4 text-center">CAPACITY</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {paginatedClasses.length > 0 ? paginatedClasses.map(cls => {
                    const enrolled = getEnrolledCount(cls.id);
                    const isFull = enrolled >= cls.maxCapacity;
                    const isArchived = cls.schoolYear !== activeYear;

                    return (
                      <tr key={cls.id} className={`border-b border-white/5 hover:bg-white/5 group transition-all cursor-default ${isArchived ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                        <td className="p-4 font-mono text-teal-400/80 font-bold">
                          {cls.id}
                          {isArchived && <span className="ml-2 px-1 py-0.5 rounded bg-white/5 text-[7px] opacity-40 tracking-[0.2em]">ARCHIVED</span>}
                        </td>
                        <td className="p-4 uppercase font-black tracking-wider">{getSubjectName(cls.subjectId)}</td>
                        <td className="p-4 uppercase font-bold">
                          <span className="opacity-40">G{cls.gradeLevel}</span> • <span className="opacity-80">{cls.sectionName}</span>
                        </td>
                        <td className="p-4 font-mono opacity-50">{cls.schoolYear}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-wider">
                              {getTeacherName(cls.teacherId)}
                              {cls.isAdviser && <span className="ml-2 text-teal-400 text-[8px] border border-teal-400/30 px-1 rounded">ADVISER</span>}
                            </span>
                            <span className="text-[8px] font-mono opacity-20 uppercase">RM: {cls.roomNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center justify-center gap-1.5 ${isFull ? 'bg-red-500/20 text-red-400 border border-red-500/20' : enrolled > 0 ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-white/10'}`}>
                            {enrolled} <span className="opacity-30">/</span> {cls.maxCapacity}
                            {isFull && <div className="w-1 h-1 rounded-full bg-red-400 animate-pulse"></div>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onNavigate('classDetail', { classId: cls.id })} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="VIEW CLASS DETAIL">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            {!isArchived && (
                              <>
                                <button onClick={() => { setEditingClass(cls); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="EDIT">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => setDeleteId(cls.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500/40 hover:text-red-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-10">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                          <span className="text-sm font-black uppercase tracking-[0.5em]">NO_CLASSES_FOUND</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
                ENTITY_RANGE: {(page-1)*rowsPerPage + 1}—{Math.min(page*rowsPerPage, filteredClasses.length)} OF {filteredClasses.length} CLASSES
              </span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">PREV</button>
                <div className="px-4 py-1.5 font-mono text-xs opacity-60 border border-white/5 rounded-lg flex items-center">{page} / {totalPages || 1}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">NEXT</button>
              </div>
            </div>
          </section>
        </div>

        {/* Modal: Add/Edit Class */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass w-full max-w-2xl relative animate-in zoom-in duration-300 overflow-hidden">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">
                  {editingClass ? 'EDIT_CLASS_SECTION' : 'NEW_CLASS_INITIALIZATION'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSaveClass} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">SUBJECT_ASSIGN</label>
                    <select name="subjectId" defaultValue={editingClass?.subjectId || ''} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                      <option value="">SELECT SUBJECT...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">TEACHER_LEAD</label>
                    <select name="teacherId" defaultValue={editingClass?.teacherId || ''} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                      <option value="">SELECT TEACHER...</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.lastName.toUpperCase()}, {t.firstName.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">GRADE_LEVEL</label>
                    <select name="gradeLevel" defaultValue={editingClass?.gradeLevel || 7} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                      {[7, 8, 9, 10].map(lvl => <option key={lvl} value={lvl}>GRADE {lvl}</option>)}
                    </select>
                  </div>
                  <Field label="SECTION_NAME" name="sectionName" defaultValue={editingClass?.sectionName} required placeholder="e.g., SAMPAGUITA" />
                  <Field label="SCHOOL_YEAR" name="schoolYear" defaultValue={editingClass?.schoolYear || activeYear} required placeholder="e.g., 2024-2025" />
                  <Field label="ROOM_NUMBER" name="roomNumber" defaultValue={editingClass?.roomNumber} placeholder="e.g., RM 101" />
                  <Field label="MAX_CAPACITY" name="maxCapacity" type="number" defaultValue={editingClass?.maxCapacity || 40} required />
                  
                  <div className="flex items-center gap-3 pt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" name="isAdviser" defaultChecked={editingClass?.isAdviser} className="hidden peer" />
                      <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all">
                        <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="text-[10px] font-black uppercase opacity-40 peer-checked:opacity-100 transition-opacity tracking-widest">Mark as Class Adviser</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100">ABORT</button>
                  <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-black px-10 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)]">
                    {editingClass ? 'COMMIT_UPDATE' : 'AUTHORIZE_RECORD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setDeleteId(null)}></div>
            <div className="glass max-w-sm w-full p-8 relative animate-in zoom-in fade-in duration-200 text-center">
              <CornerBracket />
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h2 className="text-sm font-black tracking-[0.3em] uppercase mb-4 text-red-500">PURGE_AUTHORIZED?</h2>
              <p className="text-[10px] opacity-40 uppercase leading-relaxed mb-8 tracking-[0.2em]">
                WARNING: YOU ARE ABOUT TO DELETE CLASS SECTION <span className="text-white font-black">{deleteId}</span>. THIS ACTION WIPES THE RECORD FROM THE SEMESTER ARCHIVES.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-all">ABORT</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">CONFIRM_PURGE</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification Stack */}
        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-3">
          {toasts.map(toast => (
            <div key={toast.id} className={`glass px-6 py-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border-l-4 ${toast.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg>
              </div>
              <span className="text-[11px] font-black tracking-widest uppercase whitespace-nowrap">{toast.message}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Field: React.FC<{ label: string; name: string; type?: string; defaultValue?: any; required?: boolean; placeholder?: string }> = ({ label, name, type = 'text', defaultValue, required, placeholder }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      type={type}
      name={name}
      defaultValue={defaultValue}
      required={required}
      placeholder={placeholder}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase placeholder:opacity-20 font-bold tracking-wider"
    />
  </div>
);
