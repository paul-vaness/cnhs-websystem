
import React, { useState, useEffect } from 'react';
import { Background } from './components/Background';
import { LoginForm } from './components/LoginForm';
import { HeroSection } from './components/HeroSection';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { StudentsPage } from './components/StudentsPage';
import { ParentsPage } from './components/ParentsPage';
import { TeachersPage } from './components/TeachersPage';
import { SubjectsPage } from './components/SubjectsPage';
import { ClassesPage } from './components/ClassesPage';
import { ClassDetailPage } from './components/ClassDetailPage';
import { SettingsPage } from './components/SettingsPage';
import { ReportCardsPage } from './components/ReportCardsPage';
import { PrintReportCardView } from './components/PrintReportCardView';

export type ViewState = 'landing' | 'dashboard' | 'students' | 'parents' | 'teachers' | 'subjects' | 'classes' | 'classDetail' | 'settings' | 'reportCards' | 'printReportCard';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [activeReportCardId, setActiveReportCardId] = useState<string | null>(null);
  const [isFullPrint, setIsFullPrint] = useState(false);
  const [activeYear, setActiveYear] = useState<string>(() => {
    return localStorage.getItem('cnhs_active_year') || '2024-2025';
  });

  // --- GLOBAL DATA SEEDING ENGINE ---
  useEffect(() => {
    const isSeeded = localStorage.getItem('cnhs_data_seeded_v1');
    if (!isSeeded) {
      console.log("Initializing Global Archive Seeding...");

      // 1. Subjects
      const subjects = [
        { id: 'SUB001', name: 'English', description: 'World Literature and Communication', hoursPerWeek: 4, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB002', name: 'Mathematics', description: 'Algebra and Geometry', hoursPerWeek: 4, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB003', name: 'Science', description: 'Biology and Chemistry', hoursPerWeek: 4, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB004', name: 'Filipino', description: 'Panitikan at Wika', hoursPerWeek: 4, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB005', name: 'MAPEH', description: 'Music, Arts, PE, and Health', hoursPerWeek: 4, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB006', name: 'TLE', description: 'Technology and Livelihood Education', hoursPerWeek: 4, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB007', name: 'Araling Panlipunan', description: 'Social Studies and History', hoursPerWeek: 3, gradeLevels: [7, 8, 9, 10] },
        { id: 'SUB008', name: 'EsP', description: 'Edukasyon sa Pagpapakatao', hoursPerWeek: 2, gradeLevels: [7, 8, 9, 10] }
      ];

      // 2. Teachers
      const teachers = [
        { id: 'T001', firstName: 'MARIA', lastName: 'SANTOS', department: 'Science', contactNumber: '0917-555-0101', email: 'maria.santos@cnhs.edu.ph', hireDate: '2015-06-15' },
        { id: 'T002', firstName: 'RODRIGO', lastName: 'PASCUAL', department: 'Mathematics', contactNumber: '0922-888-2323', email: 'r.pascual@cnhs.edu.ph', hireDate: '2018-08-01' },
        { id: 'T003', firstName: 'ELIZABETH', lastName: 'REYES', department: 'English', contactNumber: '0933-111-9988', email: 'e.reyes@cnhs.edu.ph', hireDate: '2012-05-20' },
        { id: 'T004', firstName: 'JAIME', lastName: 'CASTILLO', department: 'TLE', contactNumber: '0944-777-4455', email: 'j.castillo@cnhs.edu.ph', hireDate: '2019-11-10' },
        { id: 'T005', firstName: 'LOURDES', lastName: 'MENDOZA', department: 'Filipino', contactNumber: '0918-222-3344', email: 'l.mendoza@cnhs.edu.ph', hireDate: '2016-01-12' },
        { id: 'T006', firstName: 'ANTONIO', lastName: 'LUNA', department: 'Araling Panlipunan', contactNumber: '0919-333-4455', email: 'a.luna@cnhs.edu.ph', hireDate: '2014-07-22' },
        { id: 'T007', firstName: 'JOSE', lastName: 'RIZAL', department: 'ESP', contactNumber: '0920-444-5566', email: 'j.rizal@cnhs.edu.ph', hireDate: '2010-12-30' },
        { id: 'T008', firstName: 'EMILIO', lastName: 'AGUINALDO', department: 'MAPEH', contactNumber: '0921-555-6677', email: 'e.aguinaldo@cnhs.edu.ph', hireDate: '2011-03-14' }
      ];

      // 3. Classes (Sections)
      const sections = ['SAMPAGUITA', 'PEARL', 'NARRA', 'ILANG-ILANG'];
      const classes: any[] = [];
      sections.forEach((sec, idx) => {
        const grade = 7 + idx;
        subjects.forEach((sub, sIdx) => {
          classes.push({
            id: `CLS_${grade}_${sec}_${sub.id}`,
            subjectId: sub.id,
            teacherId: teachers[sIdx % teachers.length].id,
            gradeLevel: grade,
            sectionName: sec,
            schoolYear: '2024-2025',
            roomNumber: `RM ${100 + grade * 10 + sIdx}`,
            maxCapacity: 40,
            isAdviser: sIdx === 0 // Make the first subject teacher the adviser
          });
        });
      });

      // 4. Students (40 per section = 160 students)
      const firstNames = ['JUAN', 'MARIA', 'PEDRO', 'ANA', 'JOSE', 'REIN', 'CHRIS', 'MIA', 'LUIS', 'BEA', 'ARA', 'PAUL', 'MARK', 'TESS', 'BEN', 'MAX', 'SAM', 'LEO', 'ACE', 'ROB', 'NINA', 'ELSA', 'TOM', 'JERRY', 'LIZA', 'CARLO', 'LENI', 'VIC', 'KEN', 'JOY', 'DAN', 'MIRA', 'FELY', 'GAB', 'JUDE'];
      const lastNames = ['DELA CRUZ', 'LOPEZ', 'REYES', 'GARCIA', 'SANTOS', 'PASCUAL', 'MENDOZA', 'RAMOS', 'CRUZ', 'TORRES', 'BAUTISTA', 'VILLANUEVA', 'CASTILLO', 'LUMBERA', 'QUIRINO', 'OSMEÑA', 'ROXAS', 'AQUINO', 'COJUANGCO', 'SISON', 'VALDEZ', 'DIZON', 'ALONZO', 'DOMINGO', 'ESTRADA', 'EJERCITO', 'GONZALES', 'HERNANDEZ', 'IBARRA', 'JACINTO', 'KALAW', 'LAUREL'];
      const students: any[] = [];
      const enrollments: any[] = [];
      const reportCards: any[] = [];

      sections.forEach((sec, idx) => {
        const grade = 7 + idx;
        for (let i = 0; i < 40; i++) {
          const sid = `S${grade}${(100 + i)}`;
          const student = {
            id: sid,
            lrn: (120000000000 + grade * 1000 + i).toString(),
            firstName: firstNames[i % firstNames.length],
            lastName: lastNames[(i + idx) % lastNames.length],
            gender: i % 2 === 0 ? 'male' : 'female',
            dateOfBirth: `20${12 - grade + 7}-05-15`,
            placeOfBirth: 'CALACA, BATANGAS',
            gradeLevel: grade,
            section: sec,
            status: 'active',
            contactNumber: `0912-444-${(1000 + i)}`,
            motherName: `MARIA ${lastNames[i % lastNames.length]}`,
            fatherName: `JUAN ${lastNames[i % lastNames.length]}`,
            guardianName: `JUAN ${lastNames[i % lastNames.length]}`,
            guardianRelationship: 'Father'
          };
          students.push(student);

          // Enroll student in all subjects for their grade
          const gradeClasses = classes.filter(c => c.gradeLevel === grade && c.sectionName === sec);
          gradeClasses.forEach((c, cIdx) => {
            const eid = `${sid}_${c.id}`;
            enrollments.push({ studentId: sid, classId: c.id, status: 'active' });
            
            // Generate some grades for testing (full for first 10 students, partial for others)
            if (i < 10) {
              reportCards.push({
                id: `RC_${eid}`,
                enrollmentId: eid,
                q1: 80 + Math.floor(Math.random() * 15),
                q2: 80 + Math.floor(Math.random() * 15),
                q3: 80 + Math.floor(Math.random() * 15),
                q4: 80 + Math.floor(Math.random() * 15),
                remarks: 'EXCELLENT PROGRESS'
              });
            } else if (i < 25) {
              reportCards.push({
                id: `RC_${eid}`,
                enrollmentId: eid,
                q1: 75 + Math.floor(Math.random() * 15),
                q2: 75 + Math.floor(Math.random() * 15),
                remarks: 'ONGOING EVALUATION'
              });
            }
          });
        }
      });

      // 5. Commit to LocalStorage
      localStorage.setItem('cnhs_subjects', JSON.stringify(subjects));
      localStorage.setItem('cnhs_teachers', JSON.stringify(teachers));
      localStorage.setItem('cnhs_classes', JSON.stringify(classes));
      localStorage.setItem('cnhs_students', JSON.stringify(students));
      localStorage.setItem('cnhs_enrollments', JSON.stringify(enrollments));
      localStorage.setItem('cnhs_report_cards', JSON.stringify(reportCards));
      localStorage.setItem('cnhs_data_seeded_v1', 'true');
      
      console.log("Global Archive Seeding Complete. 160 Students, 32 Classes, 1280 Enrollments initialized.");
    }
  }, [activeYear]);

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleLogout = () => {
    setView('landing');
  };

  const navigateTo = (newView: ViewState, params?: any) => {
    if (newView === 'classDetail' && params?.classId) {
      setActiveClassId(params.classId);
    }
    if (newView === 'printReportCard' && params?.reportCardId) {
      setActiveReportCardId(params.reportCardId);
      setIsFullPrint(!!params.isFull);
    }
    setView(newView);
  };

  const handleYearChange = (year: string) => {
    setActiveYear(year);
    localStorage.setItem('cnhs_active_year', year);
  };

  if (view === 'printReportCard' && activeReportCardId) {
    return <PrintReportCardView reportCardId={activeReportCardId} isFull={isFullPrint} onBack={() => setView('reportCards')} />;
  }

  if (view === 'dashboard') {
    return <Dashboard onLogout={handleLogout} onNavigate={navigateTo} currentView="dashboard" activeYear={activeYear} />;
  }

  if (view === 'students') {
    return <StudentsPage onLogout={handleLogout} onNavigate={navigateTo} currentView="students" activeYear={activeYear} />;
  }

  if (view === 'parents') {
    return <ParentsPage onLogout={handleLogout} onNavigate={navigateTo} currentView="parents" />;
  }

  if (view === 'teachers') {
    return <TeachersPage onLogout={handleLogout} onNavigate={navigateTo} currentView="teachers" />;
  }

  if (view === 'subjects') {
    return <SubjectsPage onLogout={handleLogout} onNavigate={navigateTo} currentView="subjects" />;
  }

  if (view === 'classes') {
    return <ClassesPage onLogout={handleLogout} onNavigate={navigateTo} currentView="classes" activeYear={activeYear} />;
  }

  if (view === 'classDetail' && activeClassId) {
    return <ClassDetailPage classId={activeClassId} onLogout={handleLogout} onNavigate={navigateTo} currentView="classes" activeYear={activeYear} />;
  }

  if (view === 'settings') {
    return <SettingsPage onLogout={handleLogout} onNavigate={navigateTo} currentView="settings" activeYear={activeYear} onYearChange={handleYearChange} />;
  }

  if (view === 'reportCards') {
    return <ReportCardsPage onLogout={handleLogout} onNavigate={navigateTo} currentView="reportCards" activeYear={activeYear} />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between text-white overflow-hidden">
      <Background src="https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?auto=format&fit=crop&q=80&w=1920" />
      <Navigation />
      <main className="flex-1 flex flex-col items-center justify-center z-10 w-full px-4 pt-10">
        <HeroSection />
      </main>
      <footer className="w-full pb-10 pt-4 z-10 flex flex-col items-center">
        <div className="mb-4 text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">Secure Access Portal</div>
        <LoginForm onLogin={handleLogin} />
        <div className="mt-10 flex flex-col items-center gap-2">
          <p className="text-[9px] uppercase tracking-[0.5em] opacity-30 font-medium">
            Cahil National Highschool • Archives Division
          </p>
          <div 
            onClick={() => setView('settings')}
            className="text-[8px] uppercase tracking-[0.8em] opacity-20 font-bold hover:opacity-100 hover:text-white transition-all cursor-pointer"
          >
            Made by Team Peach
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
