
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { CornerBracket, MainSidebar, logActivity } from './Dashboard';
import { Enrollment, ClassRecord } from './ClassesPage';

interface ClassDetailPageProps {
  classId: string;
  onLogout: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState;
  activeYear: string;
}

export const ClassDetailPage: React.FC<ClassDetailPageProps> = ({ classId, onLogout, onNavigate, currentView, activeYear }) => {
  const [classes, setClasses] = useState<ClassRecord[]>(() => {
    const saved = localStorage.getItem('cnhs_classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('cnhs_enrollments');
    return saved ? JSON.parse(saved) : [];
  });

  const [students, setStudents] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [teachers, setTeachers] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_teachers');
    return saved ? JSON.parse(saved) : [];
  });

  const [subjects, setSubjects] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'dropped' | 'transferred' | 'all'>('active');
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());

  const currentClass = useMemo(() => classes.find(c => c.id === classId), [classes, classId]);
  const isArchived = useMemo(() => currentClass?.schoolYear !== activeYear, [currentClass, activeYear]);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEnrollModalOpen) setIsEnrollModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(clock);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnrollModalOpen]);

  useEffect(() => {
    localStorage.setItem('cnhs_enrollments', JSON.stringify(enrollments));
  }, [enrollments]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const filteredEnrollments = useMemo(() => {
    const sectionEnrollments = enrollments.filter(e => e.classId === classId);
    if (statusFilter === 'all') return sectionEnrollments;
    return sectionEnrollments.filter(e => e.status === statusFilter);
  }, [enrollments, classId, statusFilter]);

  const enrolledStudents = useMemo(() => {
    const studentIds = filteredEnrollments.map(e => e.studentId);
    return students.filter(s => studentIds.includes(s.id)).map(s => ({
      ...s,
      enrollmentStatus: filteredEnrollments.find(e => e.studentId === s.id)?.status
    }));
  }, [filteredEnrollments, students]);

  const activeEnrolledCount = useMemo(() => {
    return enrollments.filter(e => e.classId === classId && e.status === 'active').length;
  }, [enrollments, classId]);

  const availableStudents = useMemo(() => {
    const existingStudentIdsInClass = enrollments.filter(e => e.classId === classId).map(e => e.studentId);
    return students.filter(s => !existingStudentIdsInClass.includes(s.id) && s.gradeLevel === currentClass?.gradeLevel && s.status === 'active');
  }, [enrollments, students, classId, currentClass]);

  const searchResults = useMemo(() => {
    if (!studentSearch) return [];
    return availableStudents.filter(s => 
      `${s.lastName}, ${s.firstName} ${s.id}`.toLowerCase().includes(studentSearch.toLowerCase())
    ).slice(0, 5);
  }, [availableStudents, studentSearch]);

  const enrollStudent = (studentId: string) => {
    if (activeEnrolledCount >= (currentClass?.maxCapacity || 40)) {
      addToast('ERROR: CLASS CAPACITY REACHED', 'error');
      return;
    }
    setEnrollments(prev => [...prev, { studentId, classId, status: 'active' }]);
    logActivity(`ENROLLED STUDENT ${studentId} TO CLASS ${classId}`, 'ENROLLMENT');
    addToast('STUDENT ENROLLED IN SECTION');
    setStudentSearch('');
  };

  const setStudentStatus = (studentId: string, newStatus: 'active' | 'dropped' | 'transferred') => {
    setEnrollments(prev => prev.map(e => (e.studentId === studentId && e.classId === classId) ? { ...e, status: newStatus } : e));
    logActivity(`UPDATED ENROLLMENT ${studentId} STATUS TO ${newStatus}`, 'ENROLLMENT_UPDATE');
    addToast(`STUDENT STATUS: ${newStatus.toUpperCase()}`);
  };

  if (!currentClass) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="glass p-12 text-center relative">
          <CornerBracket />
          <h2 className="text-xl font-black uppercase tracking-[0.5em] opacity-20 mb-8">CLASS_ID_NOT_FOUND</h2>
          <button onClick={() => onNavigate('classes')} className="bg-white text-black px-8 py-3 rounded-lg text-xs font-black uppercase tracking-widest">RETURN_TO_REGISTRY</button>
        </div>
      </div>
    );
  }

  const tch = teachers.find(t => t.id === currentClass.teacherId);
  const sub = subjects.find(s => s.id === currentClass.subjectId);

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1920" alt="" className="w-full h-full object-cover blur-3xl scale-110" />
      </div>

      <MainSidebar currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 flex flex-col z-20 overflow-y-auto overflow-x-hidden">
        <header className="h-20 glass m-2 flex items-center justify-between px-8 shrink-0 relative">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button onClick={() => onNavigate('classes')} className="text-[10px] font-black opacity-30 hover:opacity-100 uppercase tracking-widest transition-opacity">CLASSES</button>
              <svg className="w-2.5 h-2.5 opacity-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase">{currentClass.id}</div>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">Section Overview</div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
              <div className="text-[8px] tracking-[0.3em] opacity-30 font-bold uppercase mt-0.5">{time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center font-black text-xs opacity-80">AP</div>
          </div>
        </header>

        <div className="p-6 space-y-8">
          <section className="glass p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-8">
            <CornerBracket />
            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter uppercase text-glow mb-1">{sub?.name || 'SUBJECT_PENDING'}</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black tracking-[0.3em] text-teal-400">GRADE {currentClass.gradeLevel} — {currentClass.sectionName}</span>
                    <div className="w-1 h-1 rounded-full bg-white/10"></div>
                    <span className="text-[10px] font-mono opacity-40 uppercase">{currentClass.schoolYear}</span>
                    {isArchived && <span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-black opacity-40 border border-white/10 tracking-[0.2em]">READ_ONLY_ARCHIVE</span>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-white/5">
                <DetailItem label="PRIMARY_INSTRUCTOR" value={tch ? `${tch.lastName}, ${tch.firstName}` : 'UNASSIGNED'} accent />
                <DetailItem label="LOCATION" value={currentClass.roomNumber || 'TBD'} />
                <DetailItem label="ENROLLMENT_STATUS" value={`${activeEnrolledCount} / ${currentClass.maxCapacity}`} accent={activeEnrolledCount >= currentClass.maxCapacity} />
                <DetailItem label="ADVISER_LINK" value={currentClass.isAdviser ? 'LINKED_PRIMARY' : 'SUBJECT_ONLY'} />
              </div>
            </div>
            {!isArchived && (
              <button 
                onClick={() => setIsEnrollModalOpen(true)}
                disabled={activeEnrolledCount >= currentClass.maxCapacity}
                className="bg-teal-500 hover:bg-teal-400 text-black px-8 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)] shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {activeEnrolledCount >= currentClass.maxCapacity ? 'SECTION FULL' : 'ENROLL STUDENT'}
              </button>
            )}
          </section>

          <section className="glass overflow-hidden relative min-h-[400px]">
            <CornerBracket />
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">CLASS_MANIFEST_RECORDS</h3>
              <div className="flex gap-4 items-center">
                <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">FILTER_STATUS:</span>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-1 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
                >
                  <option value="active">ACTIVE_ONLY</option>
                  <option value="dropped">DROPPED_ONLY</option>
                  <option value="transferred">TRANSFERRED_ONLY</option>
                  <option value="all">SHOW_ALL_RECORDS</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4">STUDENT_ID</th>
                    <th className="p-4">FULL_NAME</th>
                    <th className="p-4 text-center">GENDER</th>
                    <th className="p-4">ENROLLMENT_STATUS</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {enrolledStudents.length > 0 ? enrolledStudents.map(student => (
                    <tr key={student.id} className={`border-b border-white/5 hover:bg-white/5 group transition-all cursor-default ${student.enrollmentStatus !== 'active' ? 'opacity-40' : ''}`}>
                      <td className="p-4 font-mono text-teal-400/80 font-bold">{student.id}</td>
                      <td className="p-4 uppercase font-black tracking-wider">{student.lastName}, {student.firstName}</td>
                      <td className="p-4 text-center uppercase opacity-60 text-[10px]">{student.gender}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${
                          student.enrollmentStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          student.enrollmentStatus === 'dropped' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {student.enrollmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {!isArchived && student.enrollmentStatus === 'active' && (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => setStudentStatus(student.id, 'dropped')} 
                              className="p-2 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all rounded-lg"
                              title="MARK AS DROPPED"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                            <button 
                              onClick={() => setStudentStatus(student.id, 'transferred')} 
                              className="p-2 hover:bg-amber-500/10 text-amber-500/40 hover:text-amber-500 transition-all rounded-lg"
                              title="MARK AS TRANSFERRED"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                            </button>
                          </div>
                        )}
                        {!isArchived && student.enrollmentStatus !== 'active' && (
                          <button 
                            onClick={() => setStudentStatus(student.id, 'active')}
                            className="text-[8px] font-black opacity-40 hover:opacity-100 hover:text-emerald-400 uppercase tracking-widest"
                          >
                            RESTORE_ACTIVE
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-10">
                          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                          <span className="text-sm font-black uppercase tracking-[0.5em]">NO_STUDENTS_MATCH_FILTER</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Enrollment Search Modal */}
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEnrollModalOpen(false)}></div>
            <div className="glass w-full max-w-lg relative animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[70vh]">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">STUDENT_ENROLLMENT_SEARCH</h2>
                <button onClick={() => setIsEnrollModalOpen(false)} className="opacity-30 hover:opacity-100 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">Search Learners (Grade {currentClass.gradeLevel} Only)</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="ENTER NAME OR ID..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider" />
                  </div>
                </div>

                <div className="space-y-2">
                  {searchResults.map(s => (
                    <div key={s.id} onClick={() => enrollStudent(s.id)} className="flex justify-between items-center glass bg-white/[0.02] px-4 py-3 border border-white/5 hover:bg-teal-500/10 cursor-pointer group transition-all rounded-xl">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black tracking-wider uppercase">{s.lastName}, {s.firstName}</span>
                        <span className="text-[8px] font-mono opacity-20 uppercase">{s.id} • LRN: {s.lrn}</span>
                      </div>
                      <span className="text-[9px] font-black opacity-0 group-hover:opacity-100 text-teal-400 tracking-widest transition-opacity">ENROLL+</span>
                    </div>
                  ))}
                  {studentSearch && searchResults.length === 0 && (
                    <div className="text-center py-12 opacity-10 uppercase text-[10px] font-black tracking-[0.4em]">NO_ELIGIBLE_LEARNERS_FOUND</div>
                  )}
                  {!studentSearch && (
                    <div className="text-center py-12 opacity-10 uppercase text-[10px] font-black tracking-[0.4em]">AWAITING_SEARCH_INPUT</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-3">
          {toasts.map(toast => (
            <div key={toast.id} className={`glass px-6 py-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border-l-4 ${toast.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d={toast.type === 'success' ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} /></svg></div>
              <span className="text-[11px] font-black tracking-widest uppercase whitespace-nowrap">{toast.message}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[9px] font-black tracking-widest opacity-20 uppercase">{label}</span>
    <span className={`text-[12px] font-bold uppercase tracking-wider ${accent ? 'text-teal-400' : 'text-white/80'}`}>{value}</span>
  </div>
);
