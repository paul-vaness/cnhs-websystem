import React from 'react';

interface PrintReportCardViewProps {
  reportCardId: string; // This is the studentId when isFull is true
  isFull?: boolean;
  onBack: () => void;
}

export const PrintReportCardView: React.FC<PrintReportCardViewProps> = ({ reportCardId, isFull, onBack }) => {
  const students = JSON.parse(localStorage.getItem('cnhs_students') || '[]');
  const reportCards = JSON.parse(localStorage.getItem('cnhs_report_cards') || '[]');
  const enrollments = JSON.parse(localStorage.getItem('cnhs_enrollments') || '[]');
  const classes = JSON.parse(localStorage.getItem('cnhs_classes') || '[]');
  const subjects = JSON.parse(localStorage.getItem('cnhs_subjects') || '[]');
  const teachers = JSON.parse(localStorage.getItem('cnhs_teachers') || '[]');
  const activeYear = localStorage.getItem('cnhs_active_year') || '2024-2025';

  const student = students.find((s: any) => s.id === reportCardId);
  if (!student) return <div className="text-white p-20">Error: Student Record Missing</div>;

  // Aggregate all grades for the student in the active year
  const studentEnrollments = enrollments.filter((e: any) => e.studentId === student.id);
  const studentClasses = classes.filter((c: any) => 
    c.schoolYear === activeYear && 
    studentEnrollments.some((e: any) => e.classId === c.id)
  );

  const subjectGrades = studentClasses.map((c: any) => {
    const rc = reportCards.find((r: any) => r.enrollmentId === `${student.id}_${c.id}`);
    const sub = subjects.find((s: any) => s.id === c.subjectId);
    const teacher = teachers.find((t: any) => t.id === c.teacherId);
    
    const quarters = [rc?.q1, rc?.q2, rc?.q3, rc?.q4];
    const isComplete = quarters.every(q => q !== undefined && q !== null);
    const final = isComplete ? Math.round(quarters.reduce((a, b) => (a||0) + (b||0), 0) / 4) : null;
    
    return {
      name: sub?.name || 'UNKNOWN',
      q1: rc?.q1, q2: rc?.q2, q3: rc?.q3, q4: rc?.q4, final,
      teacher: teacher ? `${teacher.lastName}, ${teacher.firstName}` : 'UNASSIGNED'
    };
  });

  const finals = subjectGrades.map(sg => sg.final).filter(f => f !== null) as number[];
  const genAvg = (finals.length === subjectGrades.length && finals.length > 0) ? Math.round(finals.reduce((a, b) => a + b, 0) / finals.length) : null;
  const status = genAvg === null ? 'PENDING' : genAvg >= 75 ? 'PROMOTED' : 'RETAINED';

  const adviserCls = classes.find((c: any) => c.schoolYear === activeYear && c.gradeLevel === student.gradeLevel && c.section === student.section && c.isAdviser);
  const adviser = teachers.find((t: any) => t.id === adviserCls?.teacherId);

  return (
    <div className="min-h-screen bg-neutral-900 text-black flex flex-col items-center py-10 print:bg-white print:py-0 no-scrollbar overflow-y-auto">
      {/* Action Bar */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center print:hidden px-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Return to Registry
        </button>
        <button onClick={() => window.print()} className="bg-white text-black px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-transform active:scale-95">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Official Record
        </button>
      </div>

      {/* Official A4 Sheet */}
      <div className="w-[210mm] bg-white p-[20mm] min-h-[297mm] shadow-2xl relative flex flex-col font-serif print:shadow-none print:w-full">
        
        {/* Header Section */}
        <header className="flex flex-col items-center mb-12 border-b-2 border-black pb-8">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1">Republic of the Philippines</div>
          <div className="text-[12px] font-black uppercase tracking-widest mb-1">Department of Education</div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-4">Region IV-A CALABARZON • Division of Calaca City</div>
          <h1 className="text-2xl font-black uppercase tracking-[0.2em] mt-2">Cahil National High School</h1>
          <p className="text-[11px] text-neutral-500 italic mt-1 font-sans">Brgy. Cahil, Calaca City, Batangas</p>
          <div className="mt-8 px-8 py-2 border border-black text-sm font-black uppercase tracking-[0.3em]">
            Learner's Progress Report Card
          </div>
        </header>

        {/* Student Data Section */}
        <section className="grid grid-cols-2 gap-y-6 mb-12 font-sans">
          <DetailRow label="Name of Learner" value={`${student.lastName}, ${student.firstName} ${student.middleName || ''}`} />
          <DetailRow label="LRN (Learner Reference No.)" value={student.lrn} />
          <DetailRow label="Grade & Section" value={`Grade ${student.gradeLevel} - ${student.section}`} />
          <DetailRow label="School Year" value={activeYear} />
        </section>

        {/* Grades Table */}
        <section className="mb-12 font-sans">
          <table className="w-full border-collapse border-2 border-black">
            <thead>
              <tr className="bg-neutral-100 text-[9px] font-black uppercase tracking-wider">
                <th className="border border-black p-3 text-left w-1/3">Learning Areas</th>
                <th className="border border-black p-3 text-center">Q1</th>
                <th className="border border-black p-3 text-center">Q2</th>
                <th className="border border-black p-3 text-center">Q3</th>
                <th className="border border-black p-3 text-center">Q4</th>
                <th className="border border-black p-3 text-center bg-neutral-200">Final</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-medium">
              {subjectGrades.map((sg, i) => (
                <tr key={i}>
                  <td className="border border-black p-3 font-bold uppercase">{sg.name}</td>
                  <td className="border border-black p-3 text-center font-mono opacity-80">{sg.q1 || '—'}</td>
                  <td className="border border-black p-3 text-center font-mono opacity-80">{sg.q2 || '—'}</td>
                  <td className="border border-black p-3 text-center font-mono opacity-80">{sg.q3 || '—'}</td>
                  <td className="border border-black p-3 text-center font-mono opacity-80">{sg.q4 || '—'}</td>
                  <td className="border border-black p-3 text-center font-black bg-neutral-50">{sg.final || '—'}</td>
                </tr>
              ))}
              {/* Summary Row */}
              <tr className="bg-neutral-50">
                <td colSpan={5} className="border border-black p-4 text-right font-black uppercase tracking-widest text-[10px]">General Average</td>
                <td className="border border-black p-4 text-center text-lg font-black">{genAvg || '—'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Promotion Box */}
        <section className="mb-20 font-sans grid grid-cols-2 gap-10">
          <div className="border-2 border-black p-6 flex flex-col items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase opacity-40">Final Promotion Status</span>
            <div className={`text-2xl font-black tracking-widest ${status === 'PROMOTED' ? 'text-green-700' : 'text-red-700'}`}>
              {status}
            </div>
          </div>
          <div className="border-2 border-black p-6 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] font-black uppercase opacity-40">General Average Index</span>
            <div className="text-4xl font-black">{genAvg || 'INC'}</div>
          </div>
        </section>

        {/* Signature Module */}
        <section className="mt-auto font-sans">
          <div className="grid grid-cols-2 gap-20">
            <div className="flex flex-col items-center">
              <div className="w-full border-b border-black mb-1"></div>
              <span className="text-[10px] font-black uppercase">{adviser ? `${adviser.lastName}, ${adviser.firstName}` : '____________________'}</span>
              <span className="text-[8px] uppercase opacity-40">Class Adviser</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full border-b border-black mb-1"></div>
              <span className="text-[10px] font-black uppercase">DR. VIRGILIO O. SANTOS</span>
              <span className="text-[8px] uppercase opacity-40">School Principal</span>
            </div>
          </div>
          <div className="mt-16 text-center text-[7px] uppercase tracking-[0.4em] text-neutral-300">
            CNHS_ARCHIVES_DIV_SECURE_AUTH_OFFICIAL_GEN_{new Date().getTime()}
          </div>
        </section>

      </div>
      
      {/* Print Specific CSS override */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print-hidden { display: none !important; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          * { -webkit-print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col border-b border-neutral-200 mr-8 pb-1">
    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-[12px] font-bold uppercase tracking-wider">{value}</span>
  </div>
);
