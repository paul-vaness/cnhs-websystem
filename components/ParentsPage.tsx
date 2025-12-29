
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar } from './Dashboard';

// Shared Mock Student Data for linking demonstration
const MOCK_STUDENTS_FOR_PARENTS = [
  { 
    id: 'S001', lrn: '102938475612', firstName: 'JUAN', middleName: 'GOMEZ', lastName: 'DELA CRUZ', 
    gender: 'male', gradeLevel: 7, section: 'A', status: 'active', 
    motherName: 'MARIA GOMEZ DELA CRUZ', fatherName: 'ROBERTO DELA CRUZ',
    guardianName: 'ROBERTO DELA CRUZ', guardianRelationship: 'Father'
  },
  { 
    id: 'S006', lrn: '102938475615', firstName: 'SANTIAGO', middleName: 'GOMEZ', lastName: 'DELA CRUZ', 
    gender: 'male', gradeLevel: 9, section: 'B', status: 'active', 
    motherName: 'MARIA GOMEZ DELA CRUZ', fatherName: 'ROBERTO DELA CRUZ',
    guardianName: 'MARIA GOMEZ DELA CRUZ', guardianRelationship: 'Mother'
  },
  { 
    id: 'S002', lrn: '405968712345', firstName: 'MARIA', middleName: 'SANTOS', lastName: 'LOPEZ', 
    gender: 'female', gradeLevel: 8, section: 'SAMPAGUITA', status: 'active', 
    motherName: 'ELENA SANTOS LOPEZ', fatherName: 'RICARDO LOPEZ',
    guardianName: 'ELENA SANTOS LOPEZ', guardianRelationship: 'Mother'
  },
  { 
    id: 'S003', lrn: '501234987654', firstName: 'PEDRO', middleName: 'ALCANTARA', lastName: 'REYES', 
    gender: 'male', gradeLevel: 9, section: 'B', status: 'active', 
    motherName: 'LUCITA ALCANTARA REYES', fatherName: 'MARIO REYES',
    guardianName: 'MARIO REYES', guardianRelationship: 'Father'
  }
];

interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email?: string;
  address: string;
}

interface StudentLink {
  id: string;
  name: string;
  relationship: string;
  grade: number;
  section: string;
  status: string;
}

interface ParentsPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

const MOCK_PARENTS: Parent[] = [
  { id: 'P001', firstName: 'ROBERTO', lastName: 'DELA CRUZ', contactNumber: '0912-111-2222', email: 'roberto.dc@email.com', address: 'Brgy. Cahil, Calaca City, Batangas' },
  { id: 'P002', firstName: 'MARIA GOMEZ', lastName: 'DELA CRUZ', contactNumber: '0912-111-3333', email: 'maria.gomez@email.com', address: 'Brgy. Cahil, Calaca City, Batangas' },
  { id: 'P003', firstName: 'ELENA SANTOS', lastName: 'LOPEZ', contactNumber: '0922-333-4444', email: 'elena.lopez@email.com', address: 'Balayan, Batangas' },
  { id: 'P004', firstName: 'RICARDO', lastName: 'LOPEZ', contactNumber: '0922-333-5555', email: 'ricardo.l@email.com', address: 'Balayan, Batangas' },
  { id: 'P005', firstName: 'MARIO', lastName: 'REYES', contactNumber: '0933-999-0000', email: 'mario.reyes@email.com', address: 'Nasugbu, Batangas' },
  { id: 'P006', firstName: 'LUCITA ALCANTARA', lastName: 'REYES', contactNumber: '0933-999-1111', email: 'lucita.r@email.com', address: 'Nasugbu, Batangas' },
];

export const ParentsPage: React.FC<ParentsPageProps> = ({ onLogout, onNavigate, currentView }) => {
  const [parents, setParents] = useState<Parent[]>(() => {
    const saved = localStorage.getItem('cnhs_parents');
    return saved ? JSON.parse(saved) : MOCK_PARENTS;
  });
  
  const [students, setStudents] = useState<any[]>(() => {
    const saved = localStorage.getItem('cnhs_students');
    // Ensure we fallback to the same mock data used in StudentsPage so links are visible by default
    return saved ? JSON.parse(saved) : MOCK_STUDENTS_FOR_PARENTS;
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());

  // Student Linking State
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('Parent');

  useEffect(() => {
    localStorage.setItem('cnhs_parents', JSON.stringify(parents));
  }, [parents]);

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const getLinkedStudents = (parent: Parent): StudentLink[] => {
    const fullName = `${parent.firstName} ${parent.lastName}`.toUpperCase();
    const links: StudentLink[] = [];
    
    students.forEach(s => {
      const isFather = s.fatherName?.toUpperCase() === fullName;
      const isMother = s.motherName?.toUpperCase() === fullName;
      const isGuardian = s.guardianName?.toUpperCase() === fullName;

      if (isFather || isMother || isGuardian) {
        links.push({
          id: s.id,
          name: `${s.lastName}, ${s.firstName}`.toUpperCase(),
          relationship: isFather ? 'FATHER' : isMother ? 'MOTHER' : (s.guardianRelationship?.toUpperCase() || 'GUARDIAN'),
          grade: s.gradeLevel,
          section: s.section,
          status: s.status
        });
      }
    });
    
    return links;
  };

  const filteredParents = useMemo(() => {
    return parents
      .filter(p => {
        const nameMatch = `${p.firstName} ${p.lastName} ${p.id}`.toLowerCase().includes(search.toLowerCase());
        return nameMatch;
      })
      .sort((a, b) => a.lastName.localeCompare(b.lastName));
  }, [parents, search]);

  const paginatedParents = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredParents.slice(start, start + rowsPerPage);
  }, [filteredParents, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredParents.length / rowsPerPage);

  const handleSaveParent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    const formattedData = {
      ...data,
      firstName: data.firstName.toUpperCase(),
      lastName: data.lastName.toUpperCase(),
    };

    if (editingParent) {
      setParents(prev => prev.map(p => p.id === editingParent.id ? { ...p, ...formattedData } : p));
      addToast('PARENT RECORD UPDATED');
    } else {
      const nextIdNum = Math.max(...parents.map(p => parseInt(p.id.slice(1))), 0) + 1;
      const nextId = `P${nextIdNum.toString().padStart(3, '0')}`;
      setParents(prev => [{ ...formattedData, id: nextId }, ...prev]);
      addToast('PARENT ADDED TO ARCHIVES');
    }
    setIsModalOpen(false);
    setEditingParent(null);
  };

  const linkStudent = (studentId: string) => {
    if (!editingParent) return;
    const parentName = `${editingParent.firstName} ${editingParent.lastName}`.toUpperCase();
    
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        if (selectedRelationship === 'Father') return { ...s, fatherName: parentName };
        if (selectedRelationship === 'Mother') return { ...s, motherName: parentName };
        return { ...s, guardianName: parentName, guardianRelationship: selectedRelationship };
      }
      return s;
    });

    setStudents(updatedStudents);
    localStorage.setItem('cnhs_students', JSON.stringify(updatedStudents));
    addToast('STUDENT LINKED SUCCESSFULLY');
    setStudentSearch('');
  };

  const unlinkStudent = (studentId: string) => {
    if (!editingParent) return;
    const parentName = `${editingParent.firstName} ${editingParent.lastName}`.toUpperCase();
    
    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        const newS = { ...s };
        if (s.fatherName?.toUpperCase() === parentName) delete newS.fatherName;
        if (s.motherName?.toUpperCase() === parentName) delete newS.motherName;
        if (s.guardianName?.toUpperCase() === parentName) {
          delete newS.guardianName;
          delete newS.guardianRelationship;
        }
        return newS;
      }
      return s;
    });

    setStudents(updatedStudents);
    localStorage.setItem('cnhs_students', JSON.stringify(updatedStudents));
    addToast('STUDENT UNLINKED', 'error');
  };

  const handleDelete = () => {
    if (deleteId) {
      const parentToDelete = parents.find(p => p.id === deleteId);
      if (parentToDelete && getLinkedStudents(parentToDelete).length > 0) {
        addToast('CANNOT DELETE: PARENT IS LINKED TO STUDENTS', 'error');
        setDeleteId(null);
        return;
      }
      setParents(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
      addToast('PARENT RECORD PURGED', 'error');
    }
  };

  const studentSearchResults = useMemo(() => {
    if (!studentSearch) return [];
    return students.filter(s => 
      `${s.lastName}, ${s.firstName} ${s.id}`.toLowerCase().includes(studentSearch.toLowerCase())
    ).slice(0, 5);
  }, [students, studentSearch]);

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
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / PARENTS</div>
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
            <h1 className="text-2xl font-black tracking-tighter uppercase text-glow">PARENTS / GUARDIANS</h1>
            <button 
              onClick={() => { setEditingParent(null); setIsModalOpen(true); }}
              className="bg-teal-500 hover:bg-teal-400 text-black px-5 py-2.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.3)] active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
              ADD PARENT
            </button>
          </div>

          <section className="glass p-5 flex flex-wrap gap-4 items-end relative overflow-hidden">
            <CornerBracket />
            <div className="flex-1 min-w-[240px]">
              <label className="text-[9px] font-black tracking-widest opacity-30 uppercase block mb-2">Omni_Search (NAME, ID)</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="SEARCH PARENTS..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-[11px] focus:outline-none focus:border-white/30 transition-all uppercase font-bold tracking-wider"
                />
              </div>
            </div>
          </section>

          <section className="glass overflow-hidden relative min-h-[400px]">
            <CornerBracket />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4">PARENT_ID</th>
                    <th className="p-4">FULL_NAME</th>
                    <th className="p-4">CONTACT_INFO</th>
                    <th className="p-4">RESIDENTIAL_ADDRESS</th>
                    <th className="p-4 text-center">LINKED_STUDENTS</th>
                    <th className="p-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {paginatedParents.length > 0 ? paginatedParents.map(parent => {
                    const links = getLinkedStudents(parent);
                    return (
                      <tr key={parent.id} className="border-b border-white/5 hover:bg-white/5 group transition-all cursor-default">
                        <td className="p-4 font-mono text-teal-400/80 font-bold">{parent.id}</td>
                        <td className="p-4 uppercase font-black tracking-wider">{parent.lastName}, {parent.firstName}</td>
                        <td className="p-4">
                          <div className="font-mono opacity-80">{parent.contactNumber}</div>
                          <div className="text-[9px] opacity-20 lowercase">{parent.email || 'N/A'}</div>
                        </td>
                        <td className="p-4 uppercase opacity-50 text-[9px] tracking-widest max-w-[200px] truncate">{parent.address}</td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${links.length > 0 ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-white/20'}`}>
                              {links.length}
                            </span>
                            {links.length > 0 && (
                              <div className="flex -space-x-1 mt-1">
                                {links.slice(0, 3).map(l => (
                                  <div key={l.id} className="w-4 h-4 rounded-full bg-white/10 border border-black flex items-center justify-center text-[6px] font-black" title={l.name}>
                                    {l.name.charAt(0)}
                                  </div>
                                ))}
                                {links.length > 3 && <div className="text-[6px] opacity-40 ml-1">+{links.length - 3}</div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingParent(parent); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white" title="EDIT / CONNECT">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => setDeleteId(parent.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500/40 hover:text-red-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={6} className="p-24 text-center opacity-20 uppercase font-black tracking-[0.5em]">NO_PARENTS_FOUND</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-mono opacity-30 uppercase tracking-[0.2em]">
                ENTITY_RANGE: {(page-1)*rowsPerPage + 1}—{Math.min(page*rowsPerPage, filteredParents.length)} OF {filteredParents.length} GUARDIANS
              </span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">PREV</button>
                <div className="px-4 py-1.5 font-mono text-xs opacity-60 border border-white/5 rounded-lg flex items-center">{page} / {totalPages || 1}</div>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 glass text-[10px] font-black uppercase tracking-widest disabled:opacity-5 hover:bg-white/5 transition-all">NEXT</button>
              </div>
            </div>
          </section>
        </div>

        {/* Modal for Add/Edit Parent */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass w-full max-w-5xl relative animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                  <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">
                    {editingParent ? 'EDIT_GUARDIAN_DATA' : 'NEW_GUARDIAN_INITIALIZATION'}
                  </h2>
                  {editingParent && <span className="text-[9px] font-mono text-teal-400 mt-0.5 opacity-60 uppercase tracking-widest">ID: {editingParent.id}</span>}
                </div>
                <button onClick={() => setIsModalOpen(false)} className="opacity-30 hover:opacity-100 transition-opacity p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column: Form Info */}
                  <form id="parentForm" onSubmit={handleSaveParent} className="space-y-8">
                    <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">CORE_IDENTITY_&_CONTACT</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field label="FIRST_NAME" name="firstName" defaultValue={editingParent?.firstName} required />
                      <Field label="LAST_NAME" name="lastName" defaultValue={editingParent?.lastName} required />
                      <Field label="CONTACT_NUMBER" name="contactNumber" defaultValue={editingParent?.contactNumber} required placeholder="09XX-XXX-XXXX" />
                      <Field label="EMAIL_ADDRESS" name="email" type="email" defaultValue={editingParent?.email} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">RESIDENTIAL_ADDRESS</label>
                      <textarea name="address" rows={3} defaultValue={editingParent?.address} required className="bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-[11px] focus:outline-none focus:border-white/40 transition-all uppercase resize-none placeholder:opacity-20 font-bold tracking-wider" placeholder="COMPLETE ADDRESS..."></textarea>
                    </div>

                    <div className="flex justify-start gap-4 pt-4">
                      <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-black px-12 py-3 rounded-lg text-xs font-black tracking-widest uppercase transition-all shadow-[0_0_25px_rgba(20,184,166,0.3)]">
                        {editingParent ? 'SAVE_CHANGES' : 'COMMIT_RECORD'}
                      </button>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-[10px] font-black tracking-widest uppercase opacity-40 hover:opacity-100">CANCEL</button>
                    </div>
                  </form>

                  {/* Right Column: Connection Manifest */}
                  <div className="space-y-8">
                    <h3 className="text-[10px] font-black tracking-[0.3em] opacity-20 uppercase border-b border-white/5 pb-2">STUDENT_LINKAGE_MANIFEST</h3>
                    
                    {editingParent ? (
                      <div className="space-y-6">
                        {/* Current Links */}
                        <div className="space-y-3">
                          <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">CURRENTLY_LINKED_STUDENTS</label>
                          <div className="space-y-2">
                            {getLinkedStudents(editingParent).map((link, i) => (
                              <div key={i} className="flex justify-between items-center glass bg-white/[0.02] px-4 py-3 rounded-xl border border-white/5 group">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-[10px] text-teal-400">
                                    {link.id}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-black tracking-wider uppercase">{link.name}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[8px] font-mono opacity-30">GRADE {link.grade} • SEC_{link.section}</span>
                                      <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                      <span className="text-[8px] font-black text-teal-500/60 tracking-widest">{link.relationship}</span>
                                    </div>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => unlinkStudent(link.id)}
                                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all rounded-lg"
                                  title="UNLINK STUDENT"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            ))}
                            {getLinkedStudents(editingParent).length === 0 && (
                              <div className="text-[9px] opacity-10 uppercase tracking-[0.4em] py-8 text-center border-2 border-dashed border-white/5 rounded-xl">NO_ACTIVE_CONNECTIONS</div>
                            )}
                          </div>
                        </div>

                        {/* Search & Link Interface */}
                        <div className="pt-6 border-t border-white/5 space-y-4">
                          <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">ESTABLISH_NEW_CONNECTION</label>
                          <div className="flex gap-3">
                            <div className="flex-1 relative">
                              <input 
                                value={studentSearch}
                                onChange={e => setStudentSearch(e.target.value)}
                                placeholder="SEARCH STUDENT BY NAME/ID..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-4 py-2.5 text-[11px] focus:outline-none focus:border-teal-500/40 transition-all uppercase font-bold tracking-wider placeholder:opacity-20"
                              />
                              {studentSearchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 glass border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
                                  {studentSearchResults.map(s => (
                                    <div 
                                      key={s.id} 
                                      onClick={() => linkStudent(s.id)}
                                      className="px-4 py-2.5 hover:bg-teal-500/10 cursor-pointer border-b border-white/5 last:border-0 flex justify-between items-center group"
                                    >
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-wider">{s.lastName}, {s.firstName}</span>
                                        <span className="text-[8px] font-mono opacity-20">{s.id} • GRADE {s.gradeLevel}</span>
                                      </div>
                                      <span className="text-[8px] font-black opacity-0 group-hover:opacity-40 tracking-widest uppercase">CLICK TO LINK</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <select 
                              value={selectedRelationship}
                              onChange={e => setSelectedRelationship(e.target.value)}
                              className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] focus:outline-none focus:border-white/40 transition-all uppercase font-bold appearance-none cursor-pointer"
                            >
                              <option value="Father">FATHER</option>
                              <option value="Mother">MOTHER</option>
                              <option value="Guardian">GUARDIAN</option>
                              <option value="Relative">RELATIVE</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 text-center">
                        <svg className="w-12 h-12 opacity-5 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        <p className="text-[10px] font-black opacity-10 uppercase tracking-widest">COMMIT PARENT RECORD<br/>TO ENABLE LINKING MODULE</p>
                      </div>
                    )}
                  </div>
                </div>
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
                WARNING: YOU ARE ABOUT TO DELETE PARENT RECORD <span className="text-white font-black">{deleteId}</span>. THIS ACTION WIPES THE ENTITY FROM THE CENTRAL ARCHIVES.
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
