import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sparkles, UserCheck, Zap, Shield, GraduationCap } from 'lucide-react';
import MateSidebar from '../components/MateSidebar';
import ProfileSettingsModal from '../components/ProfileSettingsModal';
import AppleSpotlightSearch from '../components/ui/AppleSpotlightSearch';
import AppleSiriIntelligenceModal from '../components/ui/AppleSiriIntelligenceModal';
import AppleDynamicIsland from '../components/ui/AppleDynamicIsland';
import { useAcademic } from '../context/AcademicContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_STUDENTS } from '../data/mockData';

import StudentOnboardingStateView from '../components/StudentOnboardingStateView';
import StudentAcademicDetailsModal from '../components/StudentAcademicDetailsModal';

export default function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    session,
    role,
    userProfile,
    updateUserProfile,
    reloadUserProfile,
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

  // Developer Bypass Check
  const isDevBypass =
    role === 'developer' ||
    role === 'dev' ||
    session?.isDeveloper ||
    session?.user?.user_metadata?.isDeveloper ||
    (typeof window !== 'undefined' && localStorage.getItem('college_dev_bypass') === 'true');

  // Student Onboarding State Gatekeeper
  // If user is a student and status is NOT active, render the dedicated onboarding view (bypassed in dev mode)
  const currentStatus = userProfile?.status || session?.user?.user_metadata?.status || 'active';
  if (role === 'student' && !isDevBypass && currentStatus !== 'active') {
    if (currentStatus === 'details_required') {
      return (
        <StudentAcademicDetailsModal
          profile={userProfile}
          onSubmitSuccess={() => reloadUserProfile()}
        />
      );
    }
    return (
      <StudentOnboardingStateView
        profile={userProfile}
        onRefreshProfile={() => reloadUserProfile()}
      />
    );
  }

  // Derive active tab from URL path (e.g. /faculty/roster -> activeTab = 'roster')
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab = pathParts[1] || (role === 'admin' ? 'admin' : role === 'faculty' ? 'roster' : 'overview');
  const activePortal = pathParts[0] || (role === 'developer' ? 'admin' : role);

  const handleTabChange = (tab) => {
    setIsSidebarOpen(false);
    navigate(`/${activePortal}/${tab}`);
  };

  // Resolve student matching authenticated session email, or dynamically construct authentic student object
  const authenticatedStudent = React.useMemo(() => {
    const studentEmail = session?.user?.email?.toLowerCase();
    if (studentEmail) {
      const matched = (students || []).find(s => s.email?.toLowerCase() === studentEmail);
      if (matched) return matched;

      const metadata = session?.user?.user_metadata || {};
      const profile = userProfile || {};
      return {
        id: session?.user?.id || 'stu-active',
        rollNo: profile.roll_no || metadata.rollNo || metadata.roll_no || 'CS-2026',
        name: profile.full_name || metadata.name || session?.user?.email?.split('@')[0] || 'Student User',
        email: session?.user?.email,
        phone: profile.emergency_contact || metadata.phone || '+91 98000 00000',
        program: profile.program_name || metadata.program || 'B.Tech Computer Science & Engineering',
        semester: profile.semester || metadata.semester || 'Semester VI',
        section: profile.section || 'A',
        attendancePercentage: 0,
        attendedClasses: 0,
        totalClasses: 0,
        todayStatus: 'ABSENT',
        status: profile.status || metadata.status || 'active'
      };
    }
    return null;
  }, [students, session, userProfile]);

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans flex text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* 1. Left Navigation Sidebar */}
      <MateSidebar
        activeTab={currentTab}
        onTabChange={handleTabChange}
        lowWarningCount={lowWarningCount}
        course={activeCourse}
        role={role === 'developer' ? activePortal : role}
        isDevMode={isDevBypass}
        currentStudent={authenticatedStudent}
        session={session}
        userProfile={userProfile}
        isSidebarOpen={isSidebarOpen}
        onMobileClose={() => setIsSidebarOpen(false)}
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(prev => !prev)}
        onOpenProfile={() => navigate(`/${activePortal}/profile`)}
        onLogout={async () => {
          await handleLogout();
          navigate('/login', { replace: true });
        }}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto w-full transition-all duration-300 bg-[#F5F5F7]">
        <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-all">
          {/* Left Title & Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Toggle (Visible on mobile and tablet) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="xl:hidden p-1.5 sm:p-2 text-slate-800 hover:text-sky-700 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">
              {role === 'admin' ? 'Administration' : role === 'student' ? 'Student Workspace' : activeCourse.code || 'Faculty Portal'}
            </span>
            {role === 'faculty' && activeCourse.name && (
              <>
                <span className="hidden md:inline text-slate-300">|</span>
                <span className="hidden md:inline truncate max-w-[220px] text-slate-600 font-normal text-xs">{activeCourse.name}</span>
                <span className="hidden lg:inline text-slate-300">|</span>
                <span className="text-slate-600 font-mono hidden lg:inline text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{activeCourse.room}</span>
              </>
            )}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cloud Sync Status Indicator */}
            <span
              title={isSupabaseConfigured ? 'Real-time Supabase Cloud Synced' : 'Local Device Sandbox Active'}
              className={`text-[11px] font-medium px-2 py-1 rounded-full flex items-center gap-1.5 border shrink-0 ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSupabaseConfigured ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              <span className="hidden md:inline">{isSupabaseConfigured ? 'Cloud Synced' : 'Local Sandbox'}</span>
            </span>

            {/* Profile Settings Quick Button */}
            <button
              type="button"
              onClick={() => navigate(`/${activePortal}/profile`)}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-300 shadow-xs transition-colors cursor-pointer shrink-0"
              title="Open Profile Settings"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span className="hidden sm:inline">Profile</span>
            </button>

            {/* Spotlight Search Shortcut (Desktop only) */}
            <button
              type="button"
              onClick={() => setIsSpotlightOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shrink-0"
              title="Command Search (Ctrl + K)"
            >
              <span className="text-slate-500">Search</span>
              <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded font-mono text-slate-600 border border-slate-300">
                Ctrl K
              </kbd>
            </button>

            {/* Institutional Academic Assistant (Clean minimal on mobile) */}
            <button
              type="button"
              onClick={() => setIsSiriOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-medium border border-slate-800 transition-colors cursor-pointer shrink-0"
              title="Open Academic Regulations & Leave Help Desk"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Portal Assistant</span>
            </button>

            {/* Direct Header Sign Out */}
            <button
              type="button"
              onClick={async () => {
                await handleLogout();
                navigate('/login', { replace: true });
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 text-xs font-semibold border border-red-200 transition-colors cursor-pointer shrink-0"
              title="Sign Out of Portal"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Developer Bypass Portal Switcher Banner */}
        {isDevBypass && (
          <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-amber-950 sticky top-16 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[10px] bg-amber-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Zap className="w-3 h-3 fill-current" /> Dev Bypass Active
              </span>
              <span className="text-slate-600 hidden md:inline text-xs">
                Bypass all role restrictions enabled — switch active portal in 1 click:
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  navigate('/admin/admin');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activePortal === 'admin'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('faculty');
                  navigate('/faculty/roster');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activePortal === 'faculty'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('student');
                  navigate('/student/overview');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activePortal === 'student'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  localStorage.removeItem('college_dev_bypass');
                  await handleLogout();
                  navigate('/login', { replace: true });
                }}
                className="px-2 py-1 rounded-md text-xs font-medium text-slate-500 hover:text-red-700 hover:bg-red-50 ml-1 transition cursor-pointer"
                title="Exit Developer Mode & Sign Out"
              >
                Exit
              </button>
            </div>
          </div>
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
        <main className="p-3 sm:p-5 md:p-8 flex-1 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden">
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


    </div>
  );
}
