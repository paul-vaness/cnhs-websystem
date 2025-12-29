
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar } from './Dashboard';

interface Subject {
  id: string;
  name: string;
  description: string;
  hoursPerWeek: number;
  gradeLevels: number[]; // e.g. [7, 8, 9, 10]
}

interface SubjectsPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState;
}

const MOCK_SUBJECTS: Subject[] = [
  { 
    id: 'SUB001', 
    name: 'English', 
    description: 'Developing communicative competence through understanding Philippine, Afro-Asian, and World Literature.', 
    hoursPerWeek: 4, 
    gradeLevels: [7, 8, 9, 10]
  },
  { 
    id: 'SUB002', 
    name: 'Filipino', 
    description: 'Pag-aaral ng wikang Filipino at panitikan upang malinang ang kakayahan sa pakikipagtalastasan.', 
    hoursPerWeek: 4, 
    gradeLevels: [7, 8, 9, 10]
  },
  { 
    id: 'SUB003', 
    name: 'Mathematics', 
    description: 'Covers Algebra, Geometry, Statistics, and Probability to enhance critical thinking and problem-solving skills.', 
    hoursPerWeek: 4, 
    gradeLevels: [7, 8, 9, 10]
  },
  { 
    id: 'SUB004', 
    name: 'Science', 
    description: 'Integrated approach to Biology, Chemistry, Physics, and Earth Science.', 
    hoursPerWeek: 4, 
    gradeLevels: [7, 8, 9, 10]
  },
  { 
    id: 'SUB005', 
    name: 'MAPEH', 
    description: 'Music, Arts, Physical Education, and Health for holistic development.', 
    hoursPerWeek: 4, 
    gradeLevels: [7, 8, 9, 10]
  },
  { 
    id: 'SUB006', 
    name: 'TLE', 
    description: 'Technology and Livelihood Education focusing on ICT, Home Economics, and Industrial Arts.', 
    hoursPerWeek: 4, 
    gradeLevels: [7, 8, 9, 10]
  },
];

export const SubjectsPage: React.FC<SubjectsPageProps> = ({ onLogout, onNavigate, currentView }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('cnhs_subjects');
    return saved ? JSON.parse(saved) : MOCK_SUBJECTS;
  });

  const [classes, setClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [teachers, setTeachers] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_teachers');
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('cnhs_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getActiveInstructors = (subjectId: string) => {
    const activeTeacherIds = Array.from(new Set(classes.filter(c => c.subjectId === subjectId).map(c => c.teacherId)));
    return teachers.filter(t => activeTeacherIds.includes(t.id));
  };

  const filteredSubjects = useMemo(() => {
    return subjects
      .filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchesGrade = gradeFilter === 'all' || s.gradeLevels.includes(parseInt(gradeFilter));
        return matchesSearch && matchesGrade;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects, search, gradeFilter]);

  const paginatedSubjects = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSubjects.slice(start, start + rowsPerPage);
  }, [filteredSubjects, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredSubjects.length / rowsPerPage);

  const handleSaveSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    const selectedGrades = [7, 8, 9, 10].filter(g => formData.get(`grade_${g}`));

    const formattedData = {
      name: data.name,
      description: data.description,
      hoursPerWeek: parseInt(data.hoursPerWeek),
      gradeLevels: selectedGrades,
    };

    if (editingSubject) {
      setSubjects(prev => prev.map(s => s.id === editingSubject.id ? { ...s, ...formattedData } : s));
      addToast('SUBJECT RECORD UPDATED');
    } else {
      const nextIdNum = Math.max(...subjects.map(s => parseInt(s.id.slice(3))), 0) + 1;
      const nextId = `SUB${nextIdNum.toString().padStart(3, '0')}`;
      setSubjects(prev => [{ ...formattedData, id: nextId } as Subject, ...prev]);
      addToast('NEW SUBJECT ARCHIVED');
    }
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      const inUse = classes.some(c => c.subjectId === deleteId);
      if (inUse) {
        addToast('BLOCK: SUBJECT IS CURRENTLY IN USE BY ACTIVE CLASSES', 'error');
        setDeleteId(null);
        return;
      }
      setSubjects(prev => prev.filter(s => s.id !== deleteId));
      setDeleteId(null);
      addToast('SUBJECT PERMANENTLY DELETED', 'error');
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
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / SUBJECTS</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">School Record Keeping System</div>
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
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">ACADEMIC SUBJECTS</h1>
            <button 
              onClick={() => { setEditingSubject(null); setIsModalOpen(true); }}
              className="bg-teal-500 hover:bg-teal-400 text-black px-5 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.3)] active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              ADD SUBJECT
            </button>
          </div>

          <section className="glass p-5 flex flex-wrap gap-4 items-end relative overflow-hidden">
            <CornerBracket />
            <div className="flex-1 min-w-[240px]">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Subject_Search (NAME)</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH SUBJECTS..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Grade_Coverage</label>
              <select 
                value={gradeFilter}
                onChange={e => setGradeFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold appearance-none cursor-pointer"
              >
                <option value="all">ALL GRADES</option>
                <option value="7">GRADE 7</option>
                <option value="8">GRADE 8</option>
                <option value="9">GRADE 9</option>
                <option value="10">GRADE 10</option>
              </select>
            </div>
          </section>

          <section className="glass overflow-hidden relative min-h-[400px]">
            <CornerBracket />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4">SUBJECT_ID</th>
                    <th className="p-4">SUBJECT_NAME</th>
                    <th className="p-4">DESCRIPTION</th>
                    <th className="p-4 text-center">HRS/WEEK</th>
                    <th className="p-4 text-center">INSTRUCTORS</th>
                    <th className="p-4">COVERAGE</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {paginatedSubjects.length > 0 ? paginatedSubjects.map(subject => {
                    const activeInstructors = getActiveInstructors(subject.id);
                    return (
                      <tr key={subject.id} className="border-b border-white/5 hover:bg-white/5 group transition-all cursor-default">
                        <td className="p-4 font-mono text-teal-400/80 font-bold">{subject.id}</td>
                        <td className="p-4 uppercase font-black tracking-wider">{subject.name}</td>
                        <td className="p-4">
                          <div className="text-[9px] opacity-40 uppercase line-clamp-1 max-w-[200px] tracking-widest">{subject.description}</div>
                        </td>
                        <td className="p-4 text-center font-mono opacity-80">{subject.hoursPerWeek}H</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${activeInstructors.length > 0 ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-white/10'}`}>
                            {activeInstructors.length}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {subject.gradeLevels.map(g => (
                              <span key={g} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black">G{g}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setViewingSubject(subject); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="VIEW DETAILS">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={() => { setEditingSubject(subject); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="EDIT">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => setDeleteId(subject.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500/40 hover:text-red-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={7} className="p-24 text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-20">NO_SUBJECTS_FOUND</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
                ENTITY_RANGE: {(page-1)*rowsPerPage + 1}—{Math.min(page*rowsPerPage, filteredSubjects.length)} OF {filteredSubjects.length} SUBJECTS
              </span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">PREV</button>
                <div className="px-4 py-1.5 font-mono text-xs opacity-60 border border-white/5 rounded-lg flex items-center">{page} / {totalPages || 1}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">NEXT</button>
              </div>
            </div>
          </section>
        </div>

        {/* Modal: Add/Edit Subject */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass w-full max-w-2xl relative animate-in zoom-in duration-300 overflow-hidden">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">
                  {editingSubject ? 'EDIT_SUBJECT_RECORD' : 'NEW_SUBJECT_INITIALIZATION'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSaveSubject} className="p-8 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <Field label="SUBJECT_NAME" name="name" defaultValue={editingSubject?.name} required placeholder="e.g., MATHEMATICS" />
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">DESCRIPTION / LEARNING_OBJECTIVES</label>
                    <textarea 
                      name="description" 
                      defaultValue={editingSubject?.description} 
                      required 
                      rows={3}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase placeholder:opacity-20 font-bold tracking-wider resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="HOURS_PER_WEEK" name="hoursPerWeek" type="number" defaultValue={editingSubject?.hoursPerWeek || 4} required />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">GRADE_LEVEL_COVERAGE</label>
                    <div className="flex gap-6">
                      {[7, 8, 9, 10].map(g => (
                        <label key={g} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            name={`grade_${g}`} 
                            defaultChecked={editingSubject?.gradeLevels.includes(g)} 
                            className="hidden peer"
                          />
                          <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all">
                            <svg className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="text-[10px] font-black uppercase opacity-40 peer-checked:opacity-100 transition-opacity">GRADE {g}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100">ABORT</button>
                  <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-black px-10 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)]">
                    {editingSubject ? 'COMMIT_UPDATE' : 'AUTHORIZE_RECORD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {isViewModalOpen && viewingSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
            <div className="glass w-full max-w-3xl relative animate-in zoom-in duration-300 overflow-hidden">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">SUBJECT_SYLLABUS_OVERVIEW</h2>
                  <span className="text-[9px] font-mono text-teal-400 mt-0.5 opacity-60 uppercase tracking-widest">ID: {viewingSubject.id}</span>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-3xl font-black tracking-tighter uppercase text-white/90">{viewingSubject.name}</h3>
                    <div className="flex gap-2">
                      {viewingSubject.gradeLevels.map(g => (
                        <span key={g} className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[9px] font-black tracking-widest">GRADE {g}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[12px] font-medium leading-relaxed opacity-60 uppercase tracking-wider bg-white/5 p-4 rounded-xl border border-white/5">
                    {viewingSubject.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <ProfileField label="WEEKLY_INTENSITY" value={`${viewingSubject.hoursPerWeek} HOURS / WEEK`} />
                    <ProfileField label="ACTIVE_INSTRUCTORS_COUNT" value={getActiveInstructors(viewingSubject.id).length.toString()} />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[8px] font-black tracking-widest opacity-20 uppercase block">ACTIVE_FACULTY_ASSIGNED</label>
                    <div className="flex flex-wrap gap-2">
                      {getActiveInstructors(viewingSubject.id).map(t => (
                        <span key={t.id} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest">
                          {t.lastName}, {t.firstName[0]}.
                        </span>
                      ))}
                      {getActiveInstructors(viewingSubject.id).length === 0 && (
                        <span className="text-[9px] opacity-20 italic uppercase tracking-widest">No instructors currently handling this subject in any section</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <h4 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase mb-4">ACTIVE_CLASS_ENROLLMENTS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classes.filter(c => c.subjectId === viewingSubject.id).map((c, i) => (
                      <div key={i} className="glass bg-white/[0.02] px-4 py-3 border border-white/5 flex justify-between items-center group hover:border-teal-500/30 transition-all">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black tracking-widest uppercase">GRADE {c.gradeLevel} - {c.sectionName}</span>
                          <span className="text-[8px] font-mono opacity-30 mt-0.5">INSTRUCTOR: {teachers.find(t => t.id === c.teacherId)?.lastName || 'TBD'}</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                      </div>
                    ))}
                    {classes.filter(c => c.subjectId === viewingSubject.id).length === 0 && (
                      <div className="col-span-2 text-[9px] opacity-10 uppercase tracking-[0.4em] py-8 text-center border-2 border-dashed border-white/5 rounded-xl">NO_ACTIVE_CLASS_SECTIONS_FOUND</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex justify-end">
                <button onClick={() => setIsViewModalOpen(false)} className="px-10 py-2.5 glass text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">CLOSE_SYLLABUS</button>
              </div>
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
                WARNING: YOU ARE ABOUT TO DELETE SUBJECT <span className="text-white font-black">{deleteId}</span>. THIS ACTION WIPES THE RECORD FROM ALL SYLLABI.
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

const ProfileField: React.FC<{ label: string; value: string; mono?: boolean; accent?: string }> = ({ label, value, mono, accent }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">{label}</span>
    <span className={`text-[12px] font-bold uppercase tracking-wider ${mono ? 'font-mono' : ''} ${accent || 'text-white/80'}`}>{value}</span>
  </div>
);
