import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sparkles, UserCheck } from 'lucide-react';
import MateSidebar from '../components/MateSidebar';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import AppleSpotlightSearch from '../components/ui/AppleSpotlightSearch';
import AppleSiriIntelligenceModal from '../components/ui/AppleSiriIntelligenceModal';
import AppleDynamicIsland from '../components/ui/AppleDynamicIsland';
import { useAcademic } from '../context/AcademicContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_STUDENTS } from '../data/mockData';

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    session,
    role,
    setRole,
    switchRole,
    students,
    activeCourse,
    attendanceThreshold,
    lowWarningCount,
    handleLogout,
    toast,
    setToast,
    leaves,
    users,
    setUsers,
    programs,
    announcements = [],
    setActiveDetailStudent
  } = useAcademic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isSiriOpen, setIsSiriOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Derive active tab from URL path (e.g. /faculty/roster -> activeTab = 'roster')
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab = pathParts[1] || (role === 'admin' ? 'admin' : role === 'faculty' ? 'roster' : 'overview');

  const handleTabChange = (tab) => {
    setIsSidebarOpen(false);
    navigate(`/${role}/${tab}`);
  };

  // Resolve student matching authenticated session email, or dynamically construct authentic student object
  const authenticatedStudent = React.useMemo(() => {
    const studentEmail = session?.user?.email?.toLowerCase();
    if (studentEmail) {
      const matched = (students || []).find(s => s.email?.toLowerCase() === studentEmail);
      if (matched) return matched;

      const metadata = session?.user?.user_metadata || {};
      return {
        id: session?.user?.id || 'stu-active',
        rollNo: metadata.rollNo || metadata.roll_no || 'CS-2026',
        name: metadata.name || session?.user?.email?.split('@')[0] || 'Student User',
        email: session?.user?.email,
        phone: metadata.phone || '+91 98000 00000',
        program: metadata.program || 'B.Tech Computer Science & Engineering',
        semester: metadata.semester || 'Semester VI',
        section: 'A',
        attendancePercentage: 82.5,
        attendedClasses: 33,
        totalClasses: 40,
        todayStatus: 'PRESENT',
        status: metadata.status || 'active'
      };
    }
    return students[0] || INITIAL_STUDENTS[0];
  }, [students, session]);

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans flex text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* 1. Left Navigation Sidebar */}
      <MateSidebar
        activeTab={currentTab}
        onTabChange={handleTabChange}
        lowWarningCount={lowWarningCount}
        course={activeCourse}
        role={role}
        currentStudent={authenticatedStudent}
        session={session}
        isSidebarOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(prev => !prev)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onLogout={async () => {
          await handleLogout();
          navigate('/login', { replace: true });
        }}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full transition-all duration-300 bg-[#F5F5F7]">
        <header className="h-16 bg-white/75 backdrop-blur-2xl border-b border-black/[0.08] px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all">
          <div className="flex items-center gap-2.5 text-xs text-[#86868B]">
            {/* Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2 text-ink hover:text-sky-deep rounded-xl hover:bg-black/[0.04] active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            <span className="font-bold text-ink text-sm font-display tracking-tight">
              {role === 'admin' ? 'Administration Portal' : role === 'student' ? 'Student Workspace' : activeCourse.code || 'Faculty Portal'}
            </span>
            {role === 'faculty' && activeCourse.name && (
              <>
                <span className="hidden sm:inline text-outline-strong">•</span>
                <span className="hidden sm:inline truncate max-w-[200px] md:max-w-none text-ink-muted font-medium">{activeCourse.name}</span>
                <span className="hidden md:inline text-outline-strong">•</span>
                <span className="text-ink-subtle font-mono hidden md:inline text-[11px] bg-surface-sunken px-2 py-0.5 rounded-full">{activeCourse.room}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border ${
              isSupabaseConfigured
                ? 'bg-leaf-soft text-leaf-deep border-leaf-soft'
                : 'bg-sun-soft text-sun-deep border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-leaf' : 'bg-sun'}`} />
              <span className="hidden xs:inline">{isSupabaseConfigured ? 'Supabase Live' : 'Demo Local'}</span>
            </span>



            {/* Profile Settings Quick Button */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
              title="Open Profile Settings"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Spotlight Search Shortcut */}
            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8E8ED]/80 hover:bg-[#E8E8ED] text-[#1D1D1F] text-xs font-medium border border-black/[0.04] transition-all"
              title="Command Search (Ctrl + K)"
            >
              <span className="text-[#86868B]">Search</span>
              <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded shadow-2xs font-mono text-[#86868B] border border-black/[0.06]">
                ⌘K
              </kbd>
            </button>

            {/* AI Assistant */}
            <button
              type="button"
              onClick={() => setIsSiriOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Open AttendOS AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>

            {/* Direct Header Sign Out */}
            <button
              type="button"
              onClick={async () => {
                await handleLogout();
                navigate('/login', { replace: true });
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer"
              title="Sign Out of Portal"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* 1. Live Session Attendance Status Pill (Faculty Classroom Stream) */}
        {role === 'faculty' && (
          <AppleDynamicIsland
            course={activeCourse}
            presentCount={(students || []).filter(s => s.todayStatus === 'PRESENT').length}
            totalStudents={(students || []).length}
            lowWarningCount={lowWarningCount || 0}
            threshold={attendanceThreshold || 75}
          />
        )}

        {/* Global Toast */}
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

        {/* Live Campus Announcements Banner (Student & Faculty Views) */}
        {role !== 'admin' && announcements.length > 0 && announcements[0]?.priority === 'URGENT' && (
          <div className="max-w-7xl mx-auto w-full px-3.5 sm:px-5 md:px-8 mt-3.5">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md">
                  Official Notice
                </span>
                <span className="font-semibold text-slate-800">
                  {announcements[0]?.title}:
                </span>
                <span className="text-slate-600 hidden md:inline truncate max-w-xl">
                  {announcements[0]?.content}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {announcements[0]?.author}
              </span>
            </div>
          </div>
        )}

        {/* 3. Page Content Outlet (Renders the active route's Page component) */}
        <main className="p-3.5 sm:p-5 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <AppleSpotlightSearch
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        students={students}
        onSelectStudent={(student) => setActiveDetailStudent(student)}
        onNavigateTab={(tab) => handleTabChange(tab)}
      />

      <AppleSiriIntelligenceModal
        isOpen={isSiriOpen}
        onClose={() => setIsSiriOpen(false)}
        role={role}
        context={
          role === 'student'
            ? {
                student: students[0] || INITIAL_STUDENTS[0],
                percentage: students[0]?.totalClasses ? Math.round(((students[0]?.attendedClasses || 0) / (students[0]?.totalClasses || 1)) * 100) : 85,
                threshold: attendanceThreshold,
                isTodayPresent: (students[0]?.todayStatus || 'PRESENT') === 'PRESENT',
                isDefaulter: (students[0]?.attendedClasses || 0) / (students[0]?.totalClasses || 1) * 100 < attendanceThreshold,
                recoveryClasses: Math.max(0, Math.ceil((attendanceThreshold / 100 * (students[0]?.totalClasses || 50) - (students[0]?.attendedClasses || 40)) / 0.25)),
                safeMissable: Math.max(0, Math.floor(((students[0]?.attendedClasses || 40) - (attendanceThreshold / 100 * (students[0]?.totalClasses || 50))) / 0.75)),
                leaves: leaves
              }
            : role === 'faculty'
            ? {
                activeCourse: activeCourse,
                students: students,
                presentCount: students.filter(s => s.todayStatus === 'PRESENT').length,
                absentCount: students.filter(s => s.todayStatus !== 'PRESENT').length,
                lowWarningCount: lowWarningCount,
                threshold: attendanceThreshold,
                defaulters: students.filter(s => {
                  const attended = s.todayStatus === 'PRESENT' ? s.attendedClasses + 1 : s.attendedClasses;
                  return ((attended / (s.totalClasses + 1)) * 100) < attendanceThreshold;
                }).map(s => ({
                  name: s.name,
                  rollNo: s.rollNo,
                  percentage: Math.round(((s.todayStatus === 'PRESENT' ? s.attendedClasses + 1 : s.attendedClasses) / (s.totalClasses + 1)) * 100)
                })),
                pendingLeaves: leaves.filter(l => l.status === 'PENDING')
              }
            : {
                termSetting: 'Spring 2026',
                attendanceThreshold: attendanceThreshold,
                totalUsers: users.length,
                totalFaculty: users.filter(u => u.role === 'faculty').length,
                totalPending: users.filter(u => u.status === 'pending').length,
                programsCount: programs.length
              }
        }
      />

      {/* 4. Dedicated Profile & Account Settings Modal (All 3 Roles) */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        role={role}
        session={session}
        currentStudent={authenticatedStudent}
        activeCourse={activeCourse}
        users={users}
        onUpdateCurrentUser={(updated) => {
          if (role === 'student' && setStudents) {
            setStudents(prev => prev.map(s => (s.id === authenticatedStudent.id || s.rollNo === authenticatedStudent.rollNo) ? { ...s, ...updated } : s));
          }
          if (setUsers) {
            const targetEmail = session?.user?.email?.toLowerCase() || (role === 'student' ? authenticatedStudent.email : 'faculty@college.edu.in');
            setUsers(prev => prev.map(u => u.email?.toLowerCase() === targetEmail?.toLowerCase() ? { ...u, ...updated } : u));
          }
        }}
        setToast={setToast}
      />
    </div>
  );
}
