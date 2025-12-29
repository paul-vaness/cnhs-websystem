
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar } from './Dashboard';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  contactNumber: string;
  email: string;
  hireDate: string;
}

interface AssignedClass {
  grade: number;
  section: string;
  subject: string;
  schoolYear: string;
}

interface TeachersPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState;
}

const DEPARTMENTS = [
  'Mathematics', 'Science', 'English', 'Filipino', 
  'Araling Panlipunan', 'MAPEH', 'TLE', 'ESP'
];

const MOCK_TEACHERS: Teacher[] = [
  { id: 'T001', firstName: 'MARIA', lastName: 'SANTOS', department: 'Science', contactNumber: '0917-555-0101', email: 'maria.santos@cnhs.edu.ph', hireDate: '2015-06-15' },
  { id: 'T002', firstName: 'RODRIGO', lastName: 'PASCUAL', department: 'Mathematics', contactNumber: '0922-888-2323', email: 'r.pascual@cnhs.edu.ph', hireDate: '2018-08-01' },
  { id: 'T003', firstName: 'ELIZABETH', lastName: 'REYES', department: 'English', contactNumber: '0933-111-9988', email: 'e.reyes@cnhs.edu.ph', hireDate: '2012-05-20' },
  { id: 'T004', firstName: 'JAIME', lastName: 'CASTILLO', department: 'TLE', contactNumber: '0944-777-4455', email: 'j.castillo@cnhs.edu.ph', hireDate: '2019-11-10' },
  { id: 'T005', firstName: 'LOURDES', lastName: 'MENDOZA', department: 'Filipino', contactNumber: '0918-222-3344', email: 'l.mendoza@cnhs.edu.ph', hireDate: '2016-01-12' },
];

export const TeachersPage: React.FC<TeachersPageProps> = ({ onLogout, onNavigate, currentView }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('cnhs_teachers');
    return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

  const [classes, setClasses] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [subjects, setSubjects] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());
  const [sort, setSort] = useState<{ key: keyof Teacher; order: 'asc' | 'desc' }>({ key: 'lastName', order: 'asc' });

  useEffect(() => {
    localStorage.setItem('cnhs_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const filteredTeachers = useMemo(() => {
    return teachers
      .filter(t => {
        const nameMatch = `${t.firstName} ${t.lastName} ${t.id} ${t.department}`.toLowerCase().includes(search.toLowerCase());
        const deptMatch = deptFilter === 'all' || t.department === deptFilter;
        return nameMatch && deptMatch;
      })
      .sort((a, b) => {
        const valA = (a[sort.key] || '').toString().toLowerCase();
        const valB = (b[sort.key] || '').toString().toLowerCase();
        if (valA < valB) return sort.order === 'asc' ? -1 : 1;
        if (valA > valB) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [teachers, search, deptFilter, sort]);

  const paginatedTeachers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredTeachers.slice(start, start + rowsPerPage);
  }, [filteredTeachers, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredTeachers.length / rowsPerPage);

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    const formattedData = {
      ...data,
      firstName: data.firstName.toUpperCase(),
      lastName: data.lastName.toUpperCase(),
    };

    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? { ...t, ...formattedData } : t));
      addToast('TEACHER RECORD UPDATED');
    } else {
      const nextIdNum = Math.max(...teachers.map(t => parseInt(t.id.slice(1))), 0) + 1;
      const nextId = `T${nextIdNum.toString().padStart(3, '0')}`;
      setTeachers(prev => [{ ...formattedData, id: nextId }, ...prev]);
      addToast('FACULTY RECORD INITIALIZED');
    }
    setIsModalOpen(false);
    setEditingTeacher(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      const hasClasses = classes.some(c => c.teacherId === deleteId);
      if (hasClasses) {
        addToast('BLOCK: TEACHER IS CURRENTLY ASSIGNED TO ACTIVE CLASSES', 'error');
        setDeleteId(null);
        return;
      }
      setTeachers(prev => prev.filter(t => t.id !== deleteId));
      setDeleteId(null);
      addToast('FACULTY RECORD PURGED', 'error');
    }
  };

  const getAssignedCount = (teacherId: string) => {
    return classes.filter(c => c.teacherId === teacherId).length;
  };

  const getTeacherAssignments = (teacherId: string) => {
    const teacherClasses = classes.filter(c => c.teacherId === teacherId);
    
    // Derived Subjects
    const subjectIds = Array.from(new Set(teacherClasses.map(c => c.subjectId)));
    const assignedSubjects = subjects.filter(s => subjectIds.includes(s.id)).map(s => s.name);

    // Formatted Classes
    const assignedClasses: AssignedClass[] = teacherClasses.map(c => {
      const sub = subjects.find(s => s.id === c.subjectId);
      return {
        grade: c.gradeLevel,
        section: c.sectionName,
        subject: sub?.name || 'UNKNOWN',
        schoolYear: c.schoolYear
      };
    });

    return { assignedSubjects, assignedClasses };
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
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / TEACHERS</div>
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
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">FACULTY ARCHIVES</h1>
            <button 
              onClick={() => { setEditingTeacher(null); setIsModalOpen(true); }}
              className="bg-teal-500 hover:bg-teal-400 text-black px-5 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.3)] active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              ADD TEACHER
            </button>
          </div>

          <section className="glass p-5 flex flex-wrap gap-4 items-end relative overflow-hidden">
            <CornerBracket />
            <div className="flex-1 min-w-[240px]">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Search_Faculty (NAME, ID)</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH FACULTY..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider"
                />
              </div>
            </div>
            <div className="w-48">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Department_Sort</label>
              <select 
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold appearance-none cursor-pointer"
              >
                <option value="all">ALL DEPARTMENTS</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </select>
            </div>
          </section>

          <section className="glass overflow-hidden relative min-h-[400px]">
            <CornerBracket />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4">FACULTY_ID</th>
                    <th className="p-4 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => setSort({ key: 'lastName', order: sort.order === 'asc' ? 'desc' : 'asc' })}>
                      FULL_NAME {sort.key === 'lastName' && (sort.order === 'asc' ? '↓' : '↑')}
                    </th>
                    <th className="p-4 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => setSort({ key: 'department', order: sort.order === 'asc' ? 'desc' : 'asc' })}>
                      DEPARTMENT {sort.key === 'department' && (sort.order === 'asc' ? '↓' : '↑')}
                    </th>
                    <th className="p-4">CONTACT_INFO</th>
                    <th className="p-4 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => setSort({ key: 'hireDate', order: sort.order === 'asc' ? 'desc' : 'asc' })}>
                      HIRE_DATE {sort.key === 'hireDate' && (sort.order === 'asc' ? '↓' : '↑')}
                    </th>
                    <th className="p-4 text-center">CLASSES</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {paginatedTeachers.length > 0 ? paginatedTeachers.map(teacher => (
                    <tr key={teacher.id} className="border-b border-white/5 hover:bg-white/5 group transition-all cursor-default">
                      <td className="p-4 font-mono text-teal-400/80 font-bold">{teacher.id}</td>
                      <td className="p-4 uppercase font-black tracking-wider">{teacher.lastName}, {teacher.firstName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest">{teacher.department}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-mono opacity-80">{teacher.contactNumber}</div>
                        <div className="text-[9px] opacity-20 lowercase">{teacher.email}</div>
                      </td>
                      <td className="p-4 font-mono opacity-50">{teacher.hireDate}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${getAssignedCount(teacher.id) > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/10'}`}>
                          {getAssignedCount(teacher.id)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setViewingTeacher(teacher); setIsViewModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="VIEW DETAILS">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => { setEditingTeacher(teacher); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="EDIT">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => setDeleteId(teacher.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500/40 hover:text-red-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="p-24 text-center opacity-20 uppercase font-black tracking-[0.5em]">NO_FACULTY_FOUND</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
                ENTITY_RANGE: {(page-1)*rowsPerPage + 1}—{Math.min(page*rowsPerPage, filteredTeachers.length)} OF {filteredTeachers.length} FACULTY
              </span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">PREV</button>
                <div className="px-4 py-1.5 font-mono text-xs opacity-60 border border-white/5 rounded-lg flex items-center">{page} / {totalPages || 1}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">NEXT</button>
              </div>
            </div>
          </section>
        </div>

        {/* Modal: Add/Edit Teacher */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass w-full max-w-2xl relative animate-in zoom-in duration-300 overflow-hidden">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">
                  {editingTeacher ? 'EDIT_FACULTY_RECORD' : 'NEW_FACULTY_INITIALIZATION'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSaveTeacher} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="FIRST_NAME" name="firstName" defaultValue={editingTeacher?.firstName} required />
                  <Field label="LAST_NAME" name="lastName" defaultValue={editingTeacher?.lastName} required />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">DEPARTMENT_ASSIGN</label>
                    <select name="department" defaultValue={editingTeacher?.department || 'Science'} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <Field label="HIRE_DATE" name="hireDate" type="date" defaultValue={editingTeacher?.hireDate || new Date().toISOString().split('T')[0]} required />
                  <Field label="CONTACT_NUMBER" name="contactNumber" defaultValue={editingTeacher?.contactNumber} required placeholder="09XX-XXX-XXXX" />
                  <Field label="OFFICIAL_EMAIL" name="email" type="email" defaultValue={editingTeacher?.email} required />
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100">ABORT</button>
                  <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-black px-10 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)]">
                    {editingTeacher ? 'COMMIT_UPDATE' : 'AUTHORIZE_RECORD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Details */}
        {isViewModalOpen && viewingTeacher && (() => {
          const { assignedSubjects, assignedClasses } = getTeacherAssignments(viewingTeacher.id);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsViewModalOpen(false)}></div>
              <div className="glass w-full max-w-4xl relative animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                <CornerBracket />
                <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                  <div className="flex flex-col">
                    <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">FACULTY_PROFILE_ACCESS</h2>
                    <span className="text-[9px] font-mono text-teal-400 mt-0.5 opacity-60 uppercase tracking-widest">ID: {viewingTeacher.id}</span>
                  </div>
                  <button onClick={() => setIsViewModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 rounded-2xl glass bg-white/5 border border-white/10 flex items-center justify-center font-black text-4xl text-white/20 select-none shrink-0">
                      {viewingTeacher.firstName[0]}{viewingTeacher.lastName[0]}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileField label="NAME" value={`${viewingTeacher.lastName}, ${viewingTeacher.firstName}`} />
                        <ProfileField label="DEPARTMENT" value={viewingTeacher.department.toUpperCase()} />
                        <ProfileField label="EMAIL" value={viewingTeacher.email} mono />
                        <ProfileField label="CONTACT" value={viewingTeacher.contactNumber} mono />
                        <ProfileField label="HIRE_DATE" value={viewingTeacher.hireDate} mono />
                        <ProfileField label="STATUS" value="ACTIVE_FACULTY" accent="text-emerald-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">SUBJECTS_HANDLED</h3>
                      <div className="flex flex-wrap gap-2">
                        {assignedSubjects.length > 0 ? assignedSubjects.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 rounded bg-teal-500/10 border border-teal-500/20 text-[10px] font-black text-teal-400 uppercase tracking-widest">{s}</span>
                        )) : (
                          <span className="text-[10px] opacity-20 uppercase tracking-widest italic">No subjects currently assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">ACTIVE_CLASSES_MANIFEST</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {assignedClasses.length > 0 ? assignedClasses.map((c, i) => (
                          <div key={i} className="glass bg-white/[0.02] px-4 py-3 border border-white/5 flex justify-between items-center group hover:border-teal-500/30 transition-all">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black tracking-widest uppercase">{c.subject}</span>
                                <span className="text-[8px] font-mono opacity-20 uppercase tracking-tighter">({c.schoolYear})</span>
                              </div>
                              <span className="text-[9px] font-mono opacity-30 mt-0.5">GRADE {c.grade} • SEC_{c.section}</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                          </div>
                        )) : (
                          <div className="text-[9px] opacity-10 uppercase tracking-[0.4em] py-8 text-center border-2 border-dashed border-white/5 rounded-xl">NO_ACTIVE_ASSIGNMENTS_FOUND</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end shrink-0">
                  <button onClick={() => setIsViewModalOpen(false)} className="px-10 py-2.5 glass text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">CLOSE_PROFILE</button>
                </div>
              </div>
            </div>
          );
        })()}

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
                WARNING: YOU ARE ABOUT TO DELETE FACULTY RECORD <span className="text-white font-black">{deleteId}</span>. THIS ACTION WIPES THE ENTITY FROM THE CENTRAL ARCHIVES.
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
