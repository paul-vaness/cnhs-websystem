
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar, logActivity } from './Dashboard';

interface Student {
  id: string; 
  lrn: string; 
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  placeOfBirth: string;
  address?: string;
  religion?: string;
  contactNumber: string;
  email?: string;
  enrollmentDate: string;
  gradeLevel: 7 | 8 | 9 | 10;
  section: string;
  status: 'active' | 'inactive' | 'pending' | 'graduated' | 'withdrawn';
  motherName: string;
  fatherName: string;
  guardianName: string;
  guardianRelationship: string;
  guardianContact: string;
  previousSchool?: string;
}

interface StudentsPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  activeYear: string;
}

const MOCK_STUDENTS: Student[] = [
  { 
    id: 'S001', lrn: '102938475612', firstName: 'Juan', middleName: 'Gomez', lastName: 'Dela Cruz', 
    gender: 'male', dateOfBirth: '2010-05-15', placeOfBirth: 'Calaca, Batangas',
    contactNumber: '0912-345-6789', email: 'juan.dc@email.com', enrollmentDate: '2023-06-01', 
    gradeLevel: 7, section: 'A', status: 'active', 
    motherName: 'Maria Gomez Dela Cruz', fatherName: 'Roberto Dela Cruz',
    guardianName: 'Roberto Dela Cruz', guardianRelationship: 'Father', guardianContact: '0912-111-2222', 
    previousSchool: 'Cahil Elementary School' 
  },
  { 
    id: 'S002', lrn: '405968712345', firstName: 'Maria', middleName: 'Santos', lastName: 'Lopez', 
    gender: 'female', dateOfBirth: '2009-11-20', placeOfBirth: 'Balayan, Batangas',
    contactNumber: '0922-445-8899', email: 'maria.lopez@email.com', enrollmentDate: '2022-06-01', 
    gradeLevel: 8, section: 'SAMPAGUITA', status: 'active', 
    motherName: 'Elena Santos Lopez', fatherName: 'Ricardo Lopez',
    guardianName: 'Elena Lopez', guardianRelationship: 'Mother', guardianContact: '0922-333-4444', 
    previousSchool: 'Calaca Central School' 
  },
  { 
    id: 'S003', lrn: '501234987654', firstName: 'Pedro', middleName: 'Alcantara', lastName: 'Reyes', 
    gender: 'male', dateOfBirth: '2008-03-10', placeOfBirth: 'Nasugbu, Batangas',
    contactNumber: '0933-555-1122', email: 'pedro.reyes@email.com', enrollmentDate: '2021-06-01', 
    gradeLevel: 9, section: 'B', status: 'active', 
    motherName: 'Lucita Alcantara Reyes', fatherName: 'Mario Reyes',
    guardianName: 'Mario Reyes', guardianRelationship: 'Father', guardianContact: '0933-999-0000', 
    previousSchool: 'Batangas East Academy' 
  },
  { 
    id: 'S004', lrn: '309485726152', firstName: 'Ana', middleName: 'Mendoza', lastName: 'Garcia', 
    gender: 'female', dateOfBirth: '2007-08-05', placeOfBirth: 'Lemery, Batangas',
    contactNumber: '0944-666-3344', enrollmentDate: '2020-06-01', gradeLevel: 10, section: 'NARRA', 
    status: 'graduated', motherName: 'Rosalina Mendoza Garcia', fatherName: 'Tomas Garcia',
    guardianName: 'Lucia Garcia', guardianRelationship: 'Mother', guardianContact: '0944-888-7777', 
    previousSchool: 'Laiya High' 
  },
  { 
    id: 'S005', lrn: '120934857621', firstName: 'Jose', middleName: 'Rizal', lastName: 'Perez', 
    gender: 'male', dateOfBirth: '2011-12-25', placeOfBirth: 'Calamba, Laguna',
    contactNumber: '0955-777-5566', enrollmentDate: '2023-06-15', gradeLevel: 7, section: 'C', 
    status: 'pending', motherName: 'Teodora Perez', fatherName: 'Francisco Perez',
    guardianName: 'Felipe Perez', guardianRelationship: 'Uncle', guardianContact: '0955-444-3333', 
    previousSchool: 'Cahil Elementary School' 
  },
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `S${(i + 6).toString().padStart(3, '0')}`,
    lrn: (100000000000 + Math.floor(Math.random() * 900000000000)).toString(),
    firstName: ['Carlos', 'Liza', 'Antonio', 'Teresa', 'Ferdinand', 'Imelda', 'Joseph', 'Leni', 'Bongbong', 'Sara'][i % 10],
    lastName: ['Mercado', 'Roxas', 'Quirino', 'Magsaysay', 'Marcos', 'Romualdez', 'Estrada', 'Robredo', 'Marcos', 'Duterte'][i % 10],
    gender: (i % 2 === 0 ? 'male' : 'female') as any,
    dateOfBirth: '2010-01-01',
    placeOfBirth: 'CALABARZON, Philippines',
    contactNumber: '0912-345-6789',
    enrollmentDate: '2023-06-01',
    gradeLevel: (7 + (i % 4)) as any,
    section: ['A', 'B', 'C', 'SAMPAGUITA', 'NARRA', 'ILANG-ILANG'][i % 6],
    status: (['active', 'active', 'active', 'inactive', 'pending'][i % 5]) as any,
    motherName: 'Sample Mother',
    fatherName: 'Sample Father',
    guardianName: 'Sample Guardian',
    guardianRelationship: 'Parent',
    guardianContact: '0912-333-4444',
  }))
];

export const StudentsPage: React.FC<StudentsPageProps> = ({ onLogout, onNavigate, currentView, activeYear }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('cnhs_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ grade: 'all', status: 'all', section: 'all' });
  const [sort, setSort] = useState<{ key: keyof Student; order: 'asc' | 'desc' }>({ key: 'lastName', order: 'asc' });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    localStorage.setItem('cnhs_students', JSON.stringify(students));
  }, [students]);

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

  const sections = useMemo(() => {
    const unique = Array.from(new Set(students.map(s => s.section))).sort();
    return unique;
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const fullName = `${s.lastName}, ${s.firstName} ${s.middleName || ''}`.toLowerCase();
        const matchesSearch = fullName.includes(debouncedSearch.toLowerCase()) || 
                             s.id.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                             s.lrn.includes(debouncedSearch);
        const matchesGrade = filters.grade === 'all' || s.gradeLevel.toString() === filters.grade;
        const matchesStatus = filters.status === 'all' || s.status === filters.status;
        const matchesSection = filters.section === 'all' || s.section === filters.section;
        return matchesSearch && matchesGrade && matchesStatus && matchesSection;
      })
      .sort((a, b) => {
        const valA = (a[sort.key] || '').toString().toLowerCase();
        const valB = (b[sort.key] || '').toString().toLowerCase();
        if (valA < valB) return sort.order === 'asc' ? -1 : 1;
        if (valA > valB) return sort.order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [students, debouncedSearch, filters, sort]);

  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredStudents.slice(start, start + rowsPerPage);
  }, [filteredStudents, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    const formattedData = {
      ...data,
      gradeLevel: parseInt(data.gradeLevel),
      firstName: data.firstName.toUpperCase(),
      lastName: data.lastName.toUpperCase(),
      middleName: data.middleName?.toUpperCase(),
      section: data.section.toUpperCase(),
    };

    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formattedData } : s));
      logActivity(`MODIFIED LEARNER RECORD: ${editingStudent.id}`, 'STUDENT_UPDATE');
      addToast('STUDENT UPDATED SUCCESSFULLY');
    } else {
      const nextIdNum = Math.max(...students.map(s => parseInt(s.id.slice(1))), 0) + 1;
      const nextId = `S${nextIdNum.toString().padStart(3, '0')}`;
      setStudents(prev => [{ ...formattedData, id: nextId }, ...prev]);
      logActivity(`AUTHORIZED NEW ENROLLMENT: ${nextId}`, 'STUDENT_REG');
      addToast('STUDENT ADDED SUCCESSFULLY');
    }
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleDelete = () => {
    if (deleteId) {
      setStudents(prev => prev.filter(s => s.id !== deleteId));
      logActivity(`PURGED STUDENT RECORD: ${deleteId}`, 'STUDENT_DELETE', 'bg-red-500');
      setDeleteId(null);
      addToast('STUDENT DELETED SUCCESSFULLY', 'error');
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
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / STUDENTS</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex flex-col">
              <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">Learner Manifest</div>
              <div className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-tighter">SY: {activeYear}</div>
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
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">STUDENTS</h1>
            <button 
              onClick={() => { setEditingStudent(null); setIsModalOpen(true); }}
              className="bg-teal-500 hover:bg-teal-400 text-black px-5 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.3)] active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              ADD STUDENT
            </button>
          </div>

          <section className="glass p-5 flex flex-wrap gap-4 items-end relative overflow-hidden">
            <CornerBracket />
            <div className="flex-1 min-w-[240px]">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Omni_Search (NAME, ID, LRN)</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH BY NAME OR ID..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase placeholder:opacity-20 font-bold tracking-wider"
                />
              </div>
            </div>
            <div className="w-36">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Grade_Level</label>
              <select 
                value={filters.grade}
                onChange={e => { setFilters(f => ({ ...f, grade: e.target.value })); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider appearance-none"
              >
                <option value="all">ALL GRADES</option>
                <option value="7">GRADE 7</option>
                <option value="8">GRADE 8</option>
                <option value="9">GRADE 9</option>
                <option value="10">GRADE 10</option>
              </select>
            </div>
            <div className="w-36">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Status_Filter</label>
              <select 
                value={filters.status}
                onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider appearance-none"
              >
                <option value="all">ALL STATUS</option>
                <option value="active">ACTIVE</option>
                <option value="inactive">INACTIVE</option>
                <option value="pending">PENDING</option>
                <option value="graduated">GRADUATED</option>
                <option value="withdrawn">WITHDRAWN</option>
              </select>
            </div>
            <div className="w-36">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Section_Assign</label>
              <select 
                value={filters.section}
                onChange={e => { setFilters(f => ({ ...f, section: e.target.value })); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider appearance-none"
              >
                <option value="all">ALL SECTIONS</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button 
              onClick={() => { setSearch(''); setFilters({ grade: 'all', status: 'all', section: 'all' }); setPage(1); }}
              className="px-4 py-2 text-[9px] font-black tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity uppercase border border-white/10 rounded-lg hover:bg-white/5"
            >
              CLEAR FILTERS
            </button>
          </section>

          {/* Table Container */}
          <section className="glass overflow-hidden relative min-h-[400px]">
            <CornerBracket />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => setSort({ key: 'id', order: sort.order === 'asc' ? 'desc' : 'asc' })}>
                      STUDENT_ID {sort.key === 'id' && (sort.order === 'asc' ? '↓' : '↑')}
                    </th>
                    <th className="p-4 cursor-pointer hover:opacity-100 transition-opacity min-w-[200px]" onClick={() => setSort({ key: 'lastName', order: sort.order === 'asc' ? 'desc' : 'asc' })}>
                      FULL_NAME {sort.key === 'lastName' && (sort.order === 'asc' ? '↓' : '↑')}
                    </th>
                    <th className="p-4 text-center">GENDER</th>
                    <th className="p-4 text-center">GRADE</th>
                    <th className="p-4 text-center">SECTION</th>
                    <th className="p-4">STATUS</th>
                    <th className="p-4">CONTACT</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {paginatedStudents.length > 0 ? paginatedStudents.map(student => (
                    <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 group transition-all cursor-default">
                      <td className="p-4 font-mono text-teal-400/80 font-bold">{student.id}</td>
                      <td className="p-4">
                        <div className="font-black uppercase tracking-wider">{student.lastName}, {student.firstName} {student.middleName || ''}</div>
                        <div className="text-[9px] font-mono opacity-20 tracking-tighter">LRN: {student.lrn}</div>
                      </td>
                      <td className="p-4 text-center uppercase opacity-60 text-[10px]">{student.gender}</td>
                      <td className="p-4 text-center font-black opacity-80">G{student.gradeLevel}</td>
                      <td className="p-4 text-center uppercase opacity-60 tracking-widest">{student.section}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase inline-block border ${
                          student.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          student.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          student.status === 'graduated' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          student.status === 'withdrawn' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-white/5 text-white/40 border-white/10'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono opacity-50 whitespace-nowrap">{student.contactNumber}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingStudent(student); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="EDIT">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => setDeleteId(student.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500/40 hover:text-red-500" title="DELETE">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="p-24 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-20">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                          <span className="font-black tracking-[0.5em] uppercase text-sm">NO_STUDENTS_MATCHED</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination UI */}
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
                ENTITY_RANGE: {(page-1)*rowsPerPage + 1}—{Math.min(page*rowsPerPage, filteredStudents.length)} OF {filteredStudents.length} AGENTS
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 mr-4">
                  <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">ROWS:</span>
                  <select 
                    value={rowsPerPage} 
                    onChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(1); }}
                    className="bg-transparent text-[10px] font-mono opacity-50 focus:outline-none"
                  >
                    {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)} 
                    className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all active:scale-90"
                  >
                    PREV
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = i + 1;
                      return (
                        <button 
                          key={p} 
                          onClick={() => setPage(p)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono transition-all ${page === p ? 'bg-white text-black font-black' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    disabled={page >= totalPages} 
                    onClick={() => setPage(p => p + 1)} 
                    className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all active:scale-90"
                  >
                    NEXT
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal: Add/Edit Student */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass w-full max-w-4xl relative animate-in zoom-in fade-in duration-300 overflow-hidden">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">
                  {editingStudent ? 'EDIT_LEARNER_RECORD' : 'NEW_LEARNER_INITIALIZATION'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSaveStudent} className="p-8 space-y-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {/* Personal Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">PERSONAL_IDENTITY</h3>
                    <div className="space-y-4">
                      <Field label="LEARNER_REF_NUMBER (LRN)" name="lrn" defaultValue={editingStudent?.lrn} required placeholder="12-DIGIT LRN" pattern="\d{12}" />
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="FIRST_NAME" name="firstName" defaultValue={editingStudent?.firstName} required />
                        <Field label="MIDDLE_NAME" name="middleName" defaultValue={editingStudent?.middleName} />
                      </div>
                      <Field label="LAST_NAME" name="lastName" defaultValue={editingStudent?.lastName} required />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">GENDER_SPEC</label>
                          <div className="flex gap-4 items-center h-10">
                            {['male', 'female'].map(g => (
                              <label key={g} className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" name="gender" value={g} defaultChecked={editingStudent?.gender === g || (!editingStudent && g === 'male')} required className="hidden peer" />
                                <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all"></div>
                                <span className="text-[10px] font-black uppercase opacity-40 peer-checked:opacity-100 transition-opacity tracking-widest">{g}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <Field label="DATE_OF_BIRTH" name="dateOfBirth" type="date" defaultValue={editingStudent?.dateOfBirth} required />
                      </div>
                      <Field label="PLACE_OF_BIRTH" name="placeOfBirth" defaultValue={editingStudent?.placeOfBirth} required />
                    </div>
                  </div>

                  {/* Enrollment Section */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">ENROLLMENT_MANIFEST</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">GRADE_LEVEL</label>
                          <select name="gradeLevel" defaultValue={editingStudent?.gradeLevel || 7} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                            {[7, 8, 9, 10].map(lvl => <option key={lvl} value={lvl}>GRADE {lvl}</option>)}
                          </select>
                        </div>
                        <Field label="SECTION_ID" name="section" defaultValue={editingStudent?.section} required placeholder="A, B, SAMPAGUITA..." />
                      </div>
                      <Field label="PREVIOUS_INSTITUTION" name="previousSchool" defaultValue={editingStudent?.previousSchool} />
                      <Field label="ENROLLMENT_TIMESTAMP" name="enrollmentDate" type="date" defaultValue={editingStudent?.enrollmentDate || new Date().toISOString().split('T')[0]} required />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">CURRENT_STATUS</label>
                        <select name="status" defaultValue={editingStudent?.status || 'active'} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                          {['active', 'inactive', 'pending', 'graduated', 'withdrawn'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family & Contact Section */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">GUARDIAN_&_FAMILY_METRICS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="FATHER_FULL_NAME" name="fatherName" defaultValue={editingStudent?.fatherName} required />
                    <Field label="MOTHER_MAIDEN_NAME" name="motherName" defaultValue={editingStudent?.motherName} required />
                    <Field label="PRIMARY_GUARDIAN" name="guardianName" defaultValue={editingStudent?.guardianName} required />
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">RELATIONSHIP</label>
                      <select name="guardianRelationship" defaultValue={editingStudent?.guardianRelationship || 'Parent'} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer">
                        {['Parent', 'Grandparent', 'Uncle/Aunt', 'Sibling', 'Legal Guardian'].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <Field label="GUARDIAN_CONTACT" name="guardianContact" defaultValue={editingStudent?.guardianContact} required placeholder="09XX-XXX-XXXX" />
                    <Field label="STUDENT_CONTACT" name="contactNumber" defaultValue={editingStudent?.contactNumber} required placeholder="09XX-XXX-XXXX" />
                  </div>
                  <Field label="RESIDENTIAL_VECTOR (FULL ADDRESS)" name="address" defaultValue={editingStudent?.address} placeholder="STREET, BARANGAY, CITY, PROVINCE..." />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100 transition-all">ABORT_CHANGES</button>
                  <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-black px-10 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)] active:scale-95">
                    {editingStudent ? 'COMMIT_UPDATE' : 'AUTHORIZE_ENROLLMENT'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
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
                WARNING: YOU ARE ABOUT TO DELETE AGENT <span className="text-white font-black">{deleteId}</span>. THIS ACTION WIPES ALL LINKED ENROLLMENT DATA PERMANENTLY.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-white/5 transition-all">ABORT</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-black tracking-widest uppercase hover:bg-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]">CONFIRM_PURGE</button>
              </div>
            </div>
          </div>
        )}

        {/* Toast System */}
        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-3">
          {toasts.map(toast => (
            <div key={toast.id} className={`glass px-6 py-4 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border-l-4 ${toast.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
              <div className={`w-5 h-5 flex items-center justify-center rounded-full ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                {toast.type === 'success' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <span className="text-[11px] font-black tracking-widest uppercase whitespace-nowrap">{toast.message}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Field: React.FC<{ label: string; name: string; type?: string; defaultValue?: any; required?: boolean; placeholder?: string; pattern?: string }> = ({ label, name, type = 'text', defaultValue, required, placeholder, pattern }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
    <input 
      type={type}
      name={name}
      defaultValue={defaultValue}
      required={required}
      placeholder={placeholder}
      pattern={pattern}
      className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase placeholder:opacity-20 font-bold tracking-wider"
    />
  </div>
);
