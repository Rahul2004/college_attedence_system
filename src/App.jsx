import React, { useState, useEffect, useCallback } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, Calendar, Clock } from 'lucide-react';
import MateSidebar from './components/MateSidebar';
import OrdersTableRoster from './components/OrdersTableRoster';
import AttendanceGrid from './components/AttendanceGrid';
import StudentDetailCard from './components/StudentDetailCard';
import RightMetricsPanel from './components/RightMetricsPanel';
import StudentView from './components/StudentView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import WarningDeficitEngine from './components/WarningDeficitEngine';
import ExportReporting from './components/ExportReporting';
import AdminDashboard from './components/AdminDashboard';
import AdminAcademicSetup from './components/AdminAcademicSetup';
import FacultyLeaveApprovals from './components/FacultyLeaveApprovals';
import AuthScreen from './components/AuthScreen';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { INITIAL_STUDENTS, COURSE_METADATA, INDIAN_COLLEGE_PROGRAMS, LECTURE_PERIODS } from './data/mockData';

// Protected Admin Route wrapper that enforces admin privileges
function AdminRoute({ role, children }) {
  if (role !== 'admin') {
    return (
      <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-8 text-center text-slate-300">
        <h2 className="text-base font-bold text-rose-400 mb-2">403 — Unauthorized Administrative Access</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          You do not possess the required clearance level to access the Institutional Admin Suite.
        </p>
      </div>
    );
  }
  return children;
}

export default function App() {
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@college.edu.in').toLowerCase();
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('admin')) {
      return 'admin';
    }
    return 'student';
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('admin')) {
      return 'admin';
    }
    return 'overview';
  });
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [toast, setToast] = useState({ type: null, message: '' });
  const [isCommitting, setIsCommitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeDetailStudent, setActiveDetailStudent] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer open/close
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // Desktop expanded (w-64) vs compact (w-18)

  // Real-Time Live Clock State (ticks every second)
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Indian College Program & Subject Selection States (Empty by default)
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedSemNumber, setSelectedSemNumber] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');

  // Derive dynamic active course metadata based on Indian College selection
  const selectedProgram = INDIAN_COLLEGE_PROGRAMS.find(p => p.id === selectedProgramId) || null;
  const selectedSem = selectedProgram?.semesters?.find(s => s.semNumber === selectedSemNumber) || null;
  const selectedSubject = selectedSem?.subjects?.find(s => s.code === selectedSubjectCode) || null;
  const selectedSlot = LECTURE_PERIODS.find(l => l.id === selectedSlotId) || null;

  const isClassConfigured = Boolean(selectedProgramId && selectedSemNumber && selectedSubjectCode && selectedSlotId);

  const activeCourse = {
    ...COURSE_METADATA,
    degree: selectedProgram?.degree || '',
    branch: selectedProgram?.branch || '',
    code: selectedSubject?.code || '',
    name: selectedSubject?.name || '',
    faculty: selectedSubject?.faculty || '',
    room: selectedSubject?.room || '',
    semester: selectedSem?.semLabel || '',
    timeSlot: selectedSlot ? `${selectedSlot.time} (${selectedSlot.label})` : '',
    credits: selectedSubject?.credits || 0,
    type: selectedSubject?.type || '',
  };

  // Supabase Auth Listener with Role Resolution
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const resolveRoleAndSetSession = async (currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setLoading(true);
        let resolvedRole = null;
        let resolvedStatus = currentSession.user.user_metadata?.status || 'active';

        try {
          // 1. Strictly query public.profiles using .single()
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role, status')
            .eq('id', currentSession.user.id)
            .single();

          if (!error && profile?.role) {
            resolvedRole = profile.role;
          }
          if (!error && profile?.status) {
            resolvedStatus = profile.status;
          }
        } catch {
          // Fallback handled below
        }

        // Fallback to user metadata if profile table is not synced yet
        if (!resolvedRole) {
          if (currentSession.user?.email?.toLowerCase() === ADMIN_EMAIL) {
            resolvedRole = 'admin';
          } else {
            resolvedRole = currentSession.user.user_metadata?.role || 'student';
          }
        }

        // Prevent pending or suspended accounts from entering faculty/admin portals
        if (resolvedRole === 'faculty' && resolvedStatus === 'pending') {
          await supabase.auth.signOut();
          setSession(null);
          setRole('student');
          setLoading(false);
          return;
        }

        // 2. Strict Conditional Routing
        setRole(resolvedRole);
        setActiveTab(resolvedRole === 'admin' ? 'admin' : resolvedRole === 'faculty' ? 'roster' : 'overview');
        setLoading(false);
      } else {
        setSession(null);
        setRole('student');
        setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      resolveRoleAndSetSession(sess);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        resolveRoleAndSetSession(data.session);
      } else {
        setLoading(false);
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  // Fetch Real Students from Database only when teacher selects class
  useEffect(() => {
    const fetchStudents = async () => {
      // If teacher has not chosen program/semester/subject, show clean empty state
      if (!isClassConfigured) {
        setStudents([]);
        setActiveDetailStudent(null);
        setLoading(false);
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        // Fallback to rich mock students for local preview
        setStudents(INITIAL_STUDENTS);
        setActiveDetailStudent(INITIAL_STUDENTS[0] || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .order('roll_number');

        if (error) throw error;

        if (data && data.length > 0) {
          const formatted = data.map(s => ({
            id: s.id,
            rollNo: s.roll_number,
            name: s.name,
            email: s.email || `${s.roll_number.toLowerCase()}@univ.edu`,
            phone: s.phone || '',
            department: s.department || selectedProgram?.branch || 'General',
            attendedClasses: s.attended_classes || 0,
            totalClasses: s.total_classes || 0,
            todayStatus: s.today_status || 'ABSENT',
          }));
          setStudents(formatted);
          setActiveDetailStudent(formatted[0]);
        } else {
          setStudents(INITIAL_STUDENTS);
          setActiveDetailStudent(INITIAL_STUDENTS[0] || null);
        }
      } catch (err) {
        console.warn('Students fetch notice:', err);
        setStudents(INITIAL_STUDENTS);
        setActiveDetailStudent(INITIAL_STUDENTS[0] || null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isClassConfigured, selectedProgramId, selectedSemNumber, selectedSubjectCode, selectedSlotId]);

  const handleToggleStatus = useCallback((studentId, newStatus) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === studentId ? { ...s, todayStatus: newStatus } : s);
      setPendingChanges(old => new Set(old).add(studentId));
      return updated;
    });

    setActiveDetailStudent(prev => prev && prev.id === studentId ? { ...prev, todayStatus: newStatus } : prev);
  }, []);

  const handleMarkAll = useCallback((status) => {
    setStudents(prev => {
      const updated = prev.map(s => ({ ...s, todayStatus: status }));
      setPendingChanges(new Set(prev.map(s => s.id)));
      return updated;
    });
  }, []);

  const handleCommit = async () => {
    if (!supabase || pendingChanges.size === 0) return;
    setIsCommitting(true);
    try {
      const logRows = students
        .filter(s => pendingChanges.has(s.id))
        .map(s => ({
          roll_number: s.rollNo,
          date: selectedDate,
          subject_code: activeCourse.code,
          status: s.todayStatus === 'PRESENT' ? 'Present' : 'Absent',
        }));

      const { error: logError } = await supabase
        .from('attendance_logs')
        .upsert(logRows, { onConflict: 'roll_number,date' });
      if (logError) throw logError;

      const updates = students
        .filter(s => pendingChanges.has(s.id))
        .map(s => {
          const newAttended = s.todayStatus === 'PRESENT' ? s.attendedClasses + 1 : s.attendedClasses;
          const newTotal = s.totalClasses + 1;
          const newPct = Math.round((newAttended / newTotal) * 10000) / 100;
          return {
            id: s.id,
            roll_number: s.rollNo,
            name: s.name,
            department: s.department || activeCourse.branch || 'Computer Science & Engineering',
            semester: activeCourse.semester,
            total_classes: newTotal,
            attended_classes: newAttended,
            attendance_percentage: newPct,
            today_status: s.todayStatus,
            status: s.todayStatus,
            updated_at: new Date().toISOString(),
          };
        });

      const { error: upsertError } = await supabase.from('students').upsert(updates);
      if (upsertError) throw upsertError;

      setPendingChanges(new Set());
      setToast({
        type: 'success',
        message: `Attendance committed for ${activeCourse.code} (${activeCourse.name}) — ${activeCourse.branch} (${selectedDate}).`
      });
    } catch {
      setToast({ type: 'error', message: 'Failed to save attendance session. Please check permissions.' });
    } finally {
      setIsCommitting(false);
      setTimeout(() => setToast({ type: null, message: '' }), 4000);
    }
  };

  const lowWarningCount = students.filter(s => {
    const attended = s.todayStatus === 'PRESENT' ? s.attendedClasses + 1 : s.attendedClasses;
    return ((attended / (s.totalClasses + 1)) * 100) < 75.0;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Loading Academic Suite...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        onLogin={(userRole, userSession) => {
          const targetRole = userRole || 'faculty';
          setRole(targetRole);
          if (userSession) {
            setSession(userSession);
          } else if (supabase) {
            supabase.auth.getSession().then(({ data }) => {
              if (data?.session) {
                setSession(data.session);
              } else {
                setSession({
                  user: {
                    id: targetRole === 'admin' ? 'admin-system' : `user-${targetRole}`,
                    email: targetRole === 'admin' ? ADMIN_EMAIL : `${targetRole}@university.edu`,
                    user_metadata: { role: targetRole, name: targetRole === 'admin' ? 'System Administrator' : undefined }
                  }
                });
              }
            });
          } else {
            setSession({
              user: {
                id: targetRole === 'admin' ? 'admin-system' : `user-${targetRole}`,
                email: targetRole === 'admin' ? ADMIN_EMAIL : `${targetRole}@university.edu`,
                user_metadata: { role: targetRole, name: targetRole === 'admin' ? 'System Administrator' : undefined }
              }
            });
          }
          setActiveTab(targetRole === 'admin' ? 'admin' : targetRole === 'faculty' ? 'roster' : 'overview');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans flex text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* 1. Left Dark Sidebar */}
      <MateSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'admin') {
            setRole('admin');
          } else if (tab === 'overview' && role === 'admin') {
            setRole('student');
          } else if (role === 'admin' && ['roster', 'analytics', 'warnings', 'reports'].includes(tab)) {
            // Keep admin role while browsing roster/analytics, or allow dual access
          }
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        lowWarningCount={lowWarningCount}
        course={activeCourse}
        role={role}
        currentStudent={students[0] || INITIAL_STUDENTS[0]}
        session={session}
        isSidebarOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(prev => !prev)}
        onLogout={async () => {
          try {
            if (supabase) {
              await supabase.auth.signOut();
            }
          } catch {
            // Teardown state unconditionally
          } finally {
            // Complete state isolation and teardown
            setSession(null);
            setRole('student');
            setPendingChanges(new Set());
            setActiveDetailStudent(null);
            setActiveTab('roster');
            setIsSidebarOpen(false);
          }
        }}
      />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full transition-all duration-300">
        <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            {/* Mobile Hamburger Toggle Button (☰) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="md:hidden p-1.5 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={() => setIsSidebarExpanded(prev => !prev)}
              className="hidden md:flex p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors items-center justify-center"
              title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label="Toggle Sidebar Expansion"
            >
              {isSidebarExpanded ? (
                <PanelLeftClose className="w-4 h-4 text-slate-500 hover:text-slate-800" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-blue-600 hover:text-blue-700" />
              )}
            </button>

            <span className="font-semibold text-slate-800">
              {role === 'admin' ? 'Administration Portal' : role === 'student' ? 'Student Workspace' : activeCourse.code}
            </span>
            {role === 'faculty' && (
              <>
                <span className="hidden sm:inline text-slate-300">/</span>
                <span className="hidden sm:inline truncate max-w-[200px] md:max-w-none text-slate-600 font-medium">{activeCourse.name}</span>
                <span className="hidden md:inline text-slate-300">/</span>
                <span className="text-slate-400 font-mono hidden md:inline text-[11px]">{activeCourse.room}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role indicator pill */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              role === 'admin'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : role === 'faculty'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student'}
            </span>

            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isSupabaseConfigured
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : 'bg-amber-50 text-amber-700 border border-amber-200/80'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="hidden xs:inline">{isSupabaseConfigured ? 'Cloud DB' : 'Local Demo'}</span>
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium font-mono select-none">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">
                {currentDateTime.toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span className="sm:hidden">
                {currentDateTime.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-800">
                {currentDateTime.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          </div>
        </header>

        {toast.message && (
          <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-5 md:px-8 mt-3.5">
            <div className={`rounded-xl px-4 py-3 text-xs font-semibold shadow-xs border ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-rose-50 text-rose-800 border-rose-200/80'
            }`}>
              {toast.message}
            </div>
          </div>
        )}

        <main className="p-3.5 sm:p-5 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          {role === 'admin' ? (
            /* ================= ADMIN ROLE VIEWS ================= */
            <>
              {activeTab === 'admin' && (
                <AdminRoute role={role}>
                  <AdminDashboard currentSession={session} />
                </AdminRoute>
              )}

              {activeTab === 'academic-setup' && (
                <AdminRoute role={role}>
                  <AdminAcademicSetup />
                </AdminRoute>
              )}

              {activeTab === 'roster' && (
                <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
                  <div className="flex-1 min-w-0 relative w-full">
                    <OrdersTableRoster
                      students={students}
                      onToggleStatus={handleToggleStatus}
                      onMarkAll={handleMarkAll}
                      selectedDate={selectedDate}
                      onDateChange={setSelectedDate}
                      onCommit={handleCommit}
                      isCommitting={isCommitting}
                      hasPendingChanges={pendingChanges.size > 0}
                      onSelectStudentDetail={setActiveDetailStudent}
                      activeDetailStudent={activeDetailStudent}
                      programs={INDIAN_COLLEGE_PROGRAMS}
                      lecturePeriods={LECTURE_PERIODS}
                      selectedProgramId={selectedProgramId}
                      onProgramChange={setSelectedProgramId}
                      selectedSemNumber={selectedSemNumber}
                      onSemChange={setSelectedSemNumber}
                      selectedSubjectCode={selectedSubjectCode}
                      onSubjectChange={setSelectedSubjectCode}
                      selectedSlotId={selectedSlotId}
                      onSlotChange={setSelectedSlotId}
                      activeCourse={activeCourse}
                      role={role}
                    />

                    {activeDetailStudent && (
                      <div className="fixed top-24 right-8 z-40 w-80 hidden 2xl:block">
                        <StudentDetailCard
                          student={activeDetailStudent}
                          onClose={() => setActiveDetailStudent(null)}
                          onToggleStatus={handleToggleStatus}
                        />
                      </div>
                    )}
                  </div>

                  <RightMetricsPanel
                    students={students}
                    course={activeCourse}
                    onSelectDefaulterFilter={() => setActiveTab('warnings')}
                  />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="w-full">
                  <AnalyticsDashboard />
                </div>
              )}

              {activeTab === 'warnings' && (
                <div className="w-full">
                  <WarningDeficitEngine students={students} course={activeCourse} />
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="w-full">
                  <ExportReporting students={students} course={activeCourse} />
                </div>
              )}
            </>
          ) : role === 'faculty' ? (
            /* ================= FACULTY ROLE VIEWS ================= */
            <>
              {activeTab === 'roster' && (
                <div className="w-full">
                  <OrdersTableRoster
                    students={students}
                    onToggleStatus={handleToggleStatus}
                    onMarkAll={handleMarkAll}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onCommit={handleCommit}
                    isCommitting={isCommitting}
                    hasPendingChanges={pendingChanges.size > 0}
                    onSelectStudentDetail={setActiveDetailStudent}
                    activeDetailStudent={activeDetailStudent}
                    programs={INDIAN_COLLEGE_PROGRAMS}
                    lecturePeriods={LECTURE_PERIODS}
                    selectedProgramId={selectedProgramId}
                    onProgramChange={setSelectedProgramId}
                    selectedSemNumber={selectedSemNumber}
                    onSemChange={setSelectedSemNumber}
                    selectedSubjectCode={selectedSubjectCode}
                    onSubjectChange={setSelectedSubjectCode}
                    selectedSlotId={selectedSlotId}
                    onSlotChange={setSelectedSlotId}
                    activeCourse={activeCourse}
                    role={role}
                  />

                  {activeDetailStudent && (
                    <div className="fixed top-24 right-8 z-40 w-80 hidden 2xl:block">
                      <StudentDetailCard
                        student={activeDetailStudent}
                        onClose={() => setActiveDetailStudent(null)}
                        onToggleStatus={handleToggleStatus}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'attendance-grid' && (
                <div className="w-full">
                  <AttendanceGrid
                    students={students}
                    onToggleStatus={handleToggleStatus}
                    onMarkAll={handleMarkAll}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onCommit={handleCommit}
                    isCommitting={isCommitting}
                    hasPendingChanges={pendingChanges.size > 0}
                  />
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="w-full">
                  <AnalyticsDashboard />
                </div>
              )}

              {activeTab === 'warnings' && (
                <div className="w-full">
                  <WarningDeficitEngine students={students} course={activeCourse} />
                </div>
              )}

              {activeTab === 'leave' && (
                <div className="w-full">
                  <FacultyLeaveApprovals activeCourse={activeCourse} />
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="w-full">
                  <ExportReporting students={students} course={activeCourse} />
                </div>
              )}
            </>
          ) : (
            /* ================= STUDENT ROLE VIEWS ================= */
            <div className="w-full">
              <StudentView
                student={students[0] || INITIAL_STUDENTS[0]}
                activeTab={activeTab}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
