
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState } from '../App';
import { SidebarItem, CornerBracket, MainSidebar, logActivity } from './Dashboard';

export interface ReportCard {
  id: string;
  enrollmentId: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  remarks: string;
}

interface ReportCardsPageProps {
  onLogout: () => void;
  onNavigate: (view: ViewState, params?: any) => void;
  currentView: ViewState;
  activeYear: string;
}

export const ReportCardsPage: React.FC<ReportCardsPageProps> = ({ onLogout, onNavigate, currentView, activeYear }) => {
  // --- CORE DATA STATE ---
  const [subjects] = useState<any[]>(() => JSON.parse(localStorage.getItem('cnhs_subjects') || '[]'));
  const [teachers] = useState<any[]>(() => JSON.parse(localStorage.getItem('cnhs_teachers') || '[]'));
  const [classes] = useState<any[]>(() => JSON.parse(localStorage.getItem('cnhs_classes') || '[]'));
  const [students] = useState<any[]>(() => JSON.parse(localStorage.getItem('cnhs_students') || '[]'));
  const [enrollments] = useState<any[]>(() => JSON.parse(localStorage.getItem('cnhs_enrollments') || '[]'));
  const [reportCards, setReportCards] = useState<ReportCard[]>(() => JSON.parse(localStorage.getItem('cnhs_report_cards') || '[]'));

  // --- SELECTION STATE ---
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>(''); // "grade_section"
  const [selectedClassId, setSelectedClassId] = useState<string>(''); // Subject specific
  
  // --- UI MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullReportOpen, setIsFullReportOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<{ student: any, rc: ReportCard | null, enrollmentId: string } | null>(null);
  const [viewingFullStudent, setViewingFullStudent] = useState<any>(null);
  
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // --- SECTIONS & SUBJECTS DERIVATION ---
  const activeSections = useMemo(() => {
    const yearClasses = classes.filter(c => c.schoolYear === activeYear);
    const unique = new Set<string>();
    const result: any[] = [];
    yearClasses.forEach(c => {
      const key = `${c.gradeLevel}_${c.sectionName}`;
      if (!unique.has(key)) {
        unique.add(key);
        result.push({ grade: c.gradeLevel, section: c.sectionName, key });
      }
    });
    return result.sort((a, b) => a.grade - b.grade || a.section.localeCompare(b.section));
  }, [classes, activeYear]);

  const subjectsInActiveSection = useMemo(() => {
    if (!selectedSectionKey) return [];
    const [grade, section] = selectedSectionKey.split('_');
    return classes.filter(c => 
      c.schoolYear === activeYear && c.gradeLevel === parseInt(grade) && c.sectionName === section
    ).map(c => ({
      ...c,
      name: subjects.find(s => s.id === c.subjectId)?.name || 'UNKNOWN',
      teacher: teachers.find(t => t.id === c.teacherId) ? `${teachers.find(t => t.id === c.teacherId).lastName}, ${teachers.find(t => t.id === c.teacherId).firstName[0]}.` : 'TBD'
    }));
  }, [selectedSectionKey, classes, subjects, teachers, activeYear]);

  // --- GRADING MANIFEST ---
  const gradingManifest = useMemo(() => {
    if (!selectedClassId) return [];
    const classEnrollments = enrollments.filter(e => e.classId === selectedClassId && e.status === 'active');
    
    return classEnrollments.map(e => {
      const student = students.find(s => s.id === e.studentId);
      const enrollmentId = `${e.studentId}_${selectedClassId}`;
      const rc = reportCards.find(rc => rc.enrollmentId === enrollmentId);
      
      const quarters = [rc?.q1, rc?.q2, rc?.q3, rc?.q4];
      const encodedCount = quarters.filter(q => q !== undefined && q !== null).length;
      const complete = encodedCount === 4;
      const final = complete ? Math.round(quarters.reduce((a, b) => (a||0) + (b||0), 0) / 4) : null;
      
      return { student, rc, final, status: complete ? (final! >= 75 ? 'passed' : 'failed') : 'ongoing', enrollmentId };
    }).sort((a, b) => (a.student?.lastName || '').localeCompare(b.student?.lastName || ''));
  }, [selectedClassId, enrollments, students, reportCards]);

  const footerData = useMemo(() => {
    if (!selectedClassId) return null;
    const cls = classes.find(c => c.id === selectedClassId);
    const [grade, section] = selectedSectionKey.split('_');
    const adviserCls = classes.find(c => c.schoolYear === activeYear && c.gradeLevel === parseInt(grade) && c.sectionName === section && c.isAdviser);
    return {
      teacher: teachers.find(t => t.id === cls?.teacherId),
      adviser: teachers.find(t => t.id === adviserCls?.teacherId)
    };
  }, [selectedClassId, selectedSectionKey, classes, teachers, activeYear]);

  // --- FULL REPORT DATA CALCULATION ---
  const fullReportData = useMemo(() => {
    if (!viewingFullStudent) return null;
    const [grade, section] = selectedSectionKey.split('_');
    
    // Find all classes for this student in the active year/section
    const studentClasses = classes.filter(c => c.schoolYear === activeYear && c.gradeLevel === parseInt(grade) && c.sectionName === section);
    
    const grades = studentClasses.map(c => {
      const enrollmentId = `${viewingFullStudent.id}_${c.id}`;
      const rc = reportCards.find(rc => rc.enrollmentId === enrollmentId);
      const quarters = [rc?.q1, rc?.q2, rc?.q3, rc?.q4];
      const complete = quarters.every(q => q !== undefined && q !== null);
      const final = complete ? Math.round(quarters.reduce((a, b) => (a||0) + (b||0), 0) / 4) : null;
      return {
        subject: subjects.find(s => s.id === c.subjectId)?.name || 'UNKNOWN',
        q1: rc?.q1, q2: rc?.q2, q3: rc?.q3, q4: rc?.q4, final
      };
    });

    const finals = grades.map(g => g.final).filter(f => f !== null) as number[];
    const genAvg = finals.length === grades.length && grades.length > 0 ? Math.round(finals.reduce((a, b) => a + b, 0) / finals.length) : null;
    
    return {
      subjects: grades,
      genAvg,
      promotionStatus: genAvg === null ? 'PENDING' : genAvg >= 75 ? 'PROMOTED' : 'RETAINED'
    };
  }, [viewingFullStudent, activeYear, selectedSectionKey, classes, reportCards, subjects]);

  const handleSaveGrades = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingReport) return;
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());

    const newRC: ReportCard = {
      id: editingReport.rc?.id || `RC_${editingReport.enrollmentId}`,
      enrollmentId: editingReport.enrollmentId,
      q1: data.q1 !== "" ? parseInt(data.q1) : undefined,
      q2: data.q2 !== "" ? parseInt(data.q2) : undefined,
      q3: data.q3 !== "" ? parseInt(data.q3) : undefined,
      q4: data.q4 !== "" ? parseInt(data.q4) : undefined,
      remarks: data.remarks || '',
    };

    const updatedRCs = editingReport.rc 
      ? reportCards.map(rc => rc.id === editingReport.rc!.id ? newRC : rc)
      : [...reportCards, newRC];
    
    setReportCards(updatedRCs);
    localStorage.setItem('cnhs_report_cards', JSON.stringify(updatedRCs));
    addToast('GRADES ARCHIVED SUCCESSFULLY');
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1920" alt="" className="w-full h-full object-cover blur-3xl scale-110" />
      </div>

      <MainSidebar currentView={currentView} onNavigate={onNavigate} onLogout={onLogout} />

      <main className="flex-1 flex flex-col z-20 overflow-hidden relative">
        <header className="h-20 glass m-2 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <div className="text-[12px] font-black tracking-[0.2em] opacity-90 uppercase tracking-tighter">PORTAL / GRADING</div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <div className="flex flex-col">
              <div className="text-[10px] tracking-widest font-black opacity-30 uppercase">Assessment Registry</div>
              <div className="text-[9px] font-mono text-teal-400 font-bold uppercase tracking-tighter">SY: {activeYear}</div>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex flex-col items-end">
              <div className="text-[11px] font-mono tracking-widest opacity-80 uppercase">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
              <div className="text-[8px] tracking-[0.3em] opacity-30 font-bold uppercase mt-0.5">{time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center font-black text-xs opacity-80 transition-transform hover:scale-110">AP</div>
          </div>
        </header>

        {/* Filters Section */}
        <div className="px-6 py-4 flex gap-6 shrink-0">
          <div className="flex flex-col gap-2 flex-1 max-w-[300px]">
            <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">Step 1: Select Section</label>
            <select 
              value={selectedSectionKey} 
              onChange={e => { setSelectedSectionKey(e.target.value); setSelectedClassId(''); }}
              className="w-full glass bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black tracking-widest uppercase focus:outline-none focus:border-white/30"
            >
              <option value="">-- CHOOSE SECTION --</option>
              {activeSections.map(s => <option key={s.key} value={s.key}>GRADE {s.grade} - {s.section}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2 flex-1 max-w-[350px]">
            <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">Step 2: Select Subject Manifest</label>
            <select 
              value={selectedClassId} 
              disabled={!selectedSectionKey}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full glass bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black tracking-widest uppercase focus:outline-none focus:border-white/30 disabled:opacity-10"
            >
              <option value="">-- CHOOSE SUBJECT --</option>
              {subjectsInActiveSection.map(s => <option key={s.id} value={s.id}>{s.name} (Prof. {s.teacher})</option>)}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6">
          <div className="glass flex-1 flex flex-col relative overflow-hidden">
            <CornerBracket />
            
            {/* Table Header (Sticky) */}
            <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-30 glass backdrop-blur-xl">
                  <tr className="border-b border-white/10 text-[10px] font-black tracking-[0.2em] uppercase opacity-40">
                    <th className="p-4 bg-[#1a1a1a]">STUDENT_ID</th>
                    <th className="p-4 bg-[#1a1a1a]">FULL_NAME</th>
                    <th className="p-4 text-center bg-[#1a1a1a]">Q1</th>
                    <th className="p-4 text-center bg-[#1a1a1a]">Q2</th>
                    <th className="p-4 text-center bg-[#1a1a1a]">Q3</th>
                    <th className="p-4 text-center bg-[#1a1a1a]">Q4</th>
                    <th className="p-4 text-center bg-[#1a1a1a]">FINAL</th>
                    <th className="p-4 bg-[#1a1a1a]">STATUS</th>
                    <th className="p-4 text-right bg-[#1a1a1a]">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-medium tracking-wide">
                  {!selectedClassId ? (
                    <tr>
                      <td colSpan={9} className="p-32 text-center opacity-10 text-[12px] font-black uppercase tracking-[0.6em]">
                        Select parameters to load grading sheet
                      </td>
                    </tr>
                  ) : gradingManifest.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-32 text-center opacity-10 text-[12px] font-black uppercase tracking-[0.6em]">
                        No active enrollments found for this section
                      </td>
                    </tr>
                  ) : (
                    gradingManifest.map((item, idx) => (
                      <tr key={item.enrollmentId} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'} group`}>
                        <td className="p-4 font-mono text-teal-400 font-bold">{item.student?.id}</td>
                        <td className="p-4 uppercase font-black tracking-wider text-white/90">{item.student?.lastName}, {item.student?.firstName}</td>
                        <td className="p-4 text-center font-mono opacity-60">{item.rc?.q1 ?? '—'}</td>
                        <td className="p-4 text-center font-mono opacity-60">{item.rc?.q2 ?? '—'}</td>
                        <td className="p-4 text-center font-mono opacity-60">{item.rc?.q3 ?? '—'}</td>
                        <td className="p-4 text-center font-mono opacity-60">{item.rc?.q4 ?? '—'}</td>
                        <td className="p-4 text-center font-black">
                          {item.final ? (
                            <span className={item.final >= 75 ? 'text-emerald-400' : 'text-red-400'}>{item.final}</span>
                          ) : '—'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase border ${
                            item.status === 'passed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            item.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-white/5 text-white/20 border-white/10'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingReport({ student: item.student, rc: item.rc || null, enrollmentId: item.enrollmentId }); setIsModalOpen(true); }}
                              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              ENCODE
                            </button>
                            <button 
                              onClick={() => { setViewingFullStudent(item.student); setIsFullReportOpen(true); }}
                              className="px-3 py-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-400 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                            >
                              VIEW_FULL
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Sticky Context Footer */}
            {footerData && (
              <div className="p-6 border-t border-white/10 flex flex-wrap gap-12 bg-[#141414] sticky bottom-0 z-30">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">Subject Instructor</span>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-white/90">
                    {footerData.teacher ? `PROF. ${footerData.teacher.lastName}, ${footerData.teacher.firstName}` : 'UNASSIGNED'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">Class Adviser</span>
                  <span className="text-[12px] font-bold uppercase tracking-wider text-teal-400">
                    {footerData.adviser ? `PROF. ${footerData.adviser.lastName}, ${footerData.adviser.firstName}` : 'NOT ASSIGNED'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 ml-auto text-right">
                  <span className="text-[8px] font-black tracking-widest opacity-20 uppercase">Student Census</span>
                  <span className="text-[12px] font-mono font-bold uppercase tracking-widest">{gradingManifest.length} TOTAL LEARNERS</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Per-Subject Encoding */}
        {isModalOpen && editingReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="glass w-full max-w-2xl relative animate-in zoom-in duration-300">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">ENCODE_SUBJECT_GRADES</h2>
                  <span className="text-[9px] font-mono text-teal-400 mt-0.5 uppercase tracking-widest">LEARNER: {editingReport.student.lastName}, {editingReport.student.firstName}</span>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="opacity-30 hover:opacity-100 p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSaveGrades} className="p-8 space-y-8">
                <div className="grid grid-cols-4 gap-4">
                  <GradeField label="Quarter 1" name="q1" defaultValue={editingReport.rc?.q1} />
                  <GradeField label="Quarter 2" name="q2" defaultValue={editingReport.rc?.q2} />
                  <GradeField label="Quarter 3" name="q3" defaultValue={editingReport.rc?.q3} />
                  <GradeField label="Quarter 4" name="q4" defaultValue={editingReport.rc?.q4} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">Progress Observations</label>
                  <textarea name="remarks" defaultValue={editingReport.rc?.remarks} rows={3} className="bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold uppercase focus:outline-none focus:border-white/40 transition-all resize-none placeholder:opacity-10" placeholder="ENTER LEARNER PROGRESS OBSERVATIONS..."></textarea>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-[10px] font-black uppercase opacity-40 hover:opacity-100">ABORT</button>
                  <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-black px-12 py-2.5 rounded-lg text-[11px] font-black uppercase shadow-[0_0_25px_rgba(20,184,166,0.3)]">COMMIT_ARCHIVE</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Full Report Card (Cross-Subject) */}
        {isFullReportOpen && viewingFullStudent && fullReportData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsFullReportOpen(false)}></div>
            <div className="glass w-full max-w-4xl relative animate-in slide-in-from-bottom-10 duration-500 overflow-hidden flex flex-col max-h-[90vh]">
              <CornerBracket />
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
                <div className="flex flex-col">
                  <h2 className="text-sm font-black tracking-[0.3em] uppercase text-glow">CUMULATIVE_PERFORMANCE_TRANSCRIPT</h2>
                  <span className="text-[9px] font-mono text-teal-400 mt-0.5 uppercase tracking-widest">OFFICIAL ACADEMIC RECORD FOR: {viewingFullStudent.lastName}, {viewingFullStudent.firstName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      onNavigate('printReportCard', { reportCardId: viewingFullStudent.id, isFull: true });
                    }}
                    className="bg-white text-black px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:bg-white/90 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print Record
                  </button>
                  <button onClick={() => setIsFullReportOpen(false)} className="opacity-30 hover:opacity-100 p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/40">
                <div className="grid grid-cols-1 gap-8">
                  {/* Identity Context */}
                  <div className="grid grid-cols-3 gap-8 pb-8 border-b border-white/5">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black tracking-widest opacity-30 uppercase">Learner Identification</span>
                      <div className="text-[12px] font-bold uppercase tracking-wider">{viewingFullStudent.lastName}, {viewingFullStudent.firstName}</div>
                      <div className="text-[10px] font-mono opacity-50 tracking-tighter">LRN: {viewingFullStudent.lrn}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black tracking-widest opacity-30 uppercase">Level & Section</span>
                      <div className="text-[12px] font-bold uppercase tracking-wider">GRADE {viewingFullStudent.gradeLevel} - {viewingFullStudent.section}</div>
                      <div className="text-[10px] font-mono opacity-50 tracking-tighter">SY: {activeYear}</div>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[8px] font-black tracking-widest opacity-30 uppercase">Institutional Body</span>
                      <div className="text-[10px] font-black tracking-widest opacity-60">CAHIL NATIONAL HS</div>
                      <div className="text-[8px] opacity-20 uppercase">Dept. of Education • Region IV-A</div>
                    </div>
                  </div>

                  {/* Grading Table */}
                  <div className="space-y-4">
                    <table className="w-full text-left border-collapse border border-white/10 rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-white/5 text-[9px] font-black tracking-widest opacity-60 uppercase">
                          <th className="p-4 border border-white/10">Academic Subject</th>
                          <th className="p-4 border border-white/10 text-center">Q1</th>
                          <th className="p-4 border border-white/10 text-center">Q2</th>
                          <th className="p-4 border border-white/10 text-center">Q3</th>
                          <th className="p-4 border border-white/10 text-center">Q4</th>
                          <th className="p-4 border border-white/10 text-center bg-white/10">Final</th>
                        </tr>
                      </thead>
                      <tbody className="text-[11px] font-bold tracking-wider">
                        {fullReportData.subjects.map((sub, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors border-b border-white/5">
                            <td className="p-4 border border-white/10 uppercase opacity-90">{sub.subject}</td>
                            <td className="p-4 border border-white/10 text-center font-mono opacity-40">{sub.q1 ?? '—'}</td>
                            <td className="p-4 border border-white/10 text-center font-mono opacity-40">{sub.q2 ?? '—'}</td>
                            <td className="p-4 border border-white/10 text-center font-mono opacity-40">{sub.q3 ?? '—'}</td>
                            <td className="p-4 border border-white/10 text-center font-mono opacity-40">{sub.q4 ?? '—'}</td>
                            <td className={`p-4 border border-white/10 text-center font-black ${sub.final ? (sub.final >= 75 ? 'text-teal-400' : 'text-red-400') : 'opacity-20'}`}>
                              {sub.final || 'PENDING'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary & Logic */}
                  <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
                    <div className="glass p-6 flex flex-col justify-center items-center gap-2 border-teal-500/20 bg-teal-500/5">
                      <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase">General Average</span>
                      <div className="text-5xl font-black text-glow text-teal-400 tracking-tighter">
                        {fullReportData.genAvg || '—'}
                      </div>
                      <span className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em]">COMPUTED_INDEX_v2.0</span>
                    </div>
                    <div className="glass p-6 flex flex-col justify-center items-center gap-2 border-white/10">
                      <span className="text-[10px] font-black tracking-[0.3em] opacity-30 uppercase">Final Remark</span>
                      <div className={`text-3xl font-black tracking-tighter ${fullReportData.promotionStatus === 'PROMOTED' ? 'text-emerald-400' : fullReportData.promotionStatus === 'RETAINED' ? 'text-red-500' : 'text-white/40'}`}>
                        {fullReportData.promotionStatus}
                      </div>
                      <span className="text-[8px] font-mono opacity-20 uppercase tracking-[0.4em]">Academic Cycle: {activeYear}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-3">
          {toasts.map(toast => (
            <div key={toast.id} className={`glass px-6 py-4 flex items-center gap-4 animate-in slide-in-from-right-10 border-l-4 ${toast.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
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

const GradeField: React.FC<{ label: string; name: string; defaultValue?: number }> = ({ label, name, defaultValue }) => (
  <div className="flex flex-col gap-1.5 flex-1">
    <label className="text-[9px] font-black tracking-widest opacity-30 uppercase">{label}</label>
    <input 
      type="number" 
      name={name} 
      defaultValue={defaultValue ?? ''} 
      min="0" 
      max="100" 
      placeholder="--"
      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center text-[14px] font-mono focus:border-teal-500/40 outline-none transition-all placeholder:opacity-10" 
    />
  </div>
);
