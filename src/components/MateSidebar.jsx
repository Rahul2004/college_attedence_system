import React from 'react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Download,
  Calendar,
  BookOpen,
  FileText,
  Award,
  Layers,
  GraduationCap,
  CheckSquare,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

export default function MateSidebar({
  activeTab,
  onTabChange,
  lowWarningCount,
  course,
  role,
  currentStudent,
  session,
  onLogout,
  isSidebarOpen = false,
  onMobileClose,
  isExpanded = true,
  onToggleExpand,
  onOpenProfile
}) {
  // On mobile/drawer (when opened via 3-line hamburger menu), always render full expanded labels & text
  const effectiveExpanded = isSidebarOpen || isExpanded;

  return (
    <>
      {/* Universal Backdrop Overlay when 3-line drawer is active */}
      {isSidebarOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Slide-out Navigation Drawer Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-72 max-w-[85vw] sm:w-72
          shrink-0 bg-white/95 backdrop-blur-2xl text-[#1D1D1F]
          flex flex-col justify-between py-5 px-3 min-h-screen border-r border-black/[0.08]
          transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isSidebarOpen ? 'translate-x-0 shadow-[0_30px_60px_rgba(0,0,0,0.3)]' : '-translate-x-full pointer-events-none'}
        `}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-[#1D1D1F] text-white flex items-center justify-center shadow-sm shrink-0 transition-transform duration-200 hover:scale-105">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-[#1D1D1F] text-[15px] tracking-tight block leading-tight">
                  AttendOS
                </span>
                <span className="text-[11px] text-[#86868B] font-medium block truncate">
                  {role === 'admin' ? 'Administration' : role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}
                </span>
              </div>
            </div>

            {/* Close Drawer Button (X) */}
            <button
              type="button"
              onClick={onMobileClose}
              className="p-1.5 rounded-lg text-[#86868B] hover:text-[#1D1D1F] hover:bg-black/[0.04] transition-colors cursor-pointer"
              title="Close Menu"
              aria-label="Close Navigation Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Context Pill */}
          <div className="px-1">
            <div
              className="flex items-center gap-2 bg-[#F5F5F7] border border-black/[0.04] px-3 py-2 rounded-xl text-xs text-[#86868B] overflow-hidden"
              title={role === 'admin' ? 'University System' : role === 'student' ? `Roll: ${currentStudent?.rollNo || 'CS-401'}` : `Course: ${course?.code || 'Active Subject'}`}
            >
              <span className="text-xs font-medium text-[#1D1D1F] truncate">
                {role === 'admin' ? '★ University System' : role === 'student' ? `Roll: ${currentStudent?.rollNo || 'CS-401'}` : `Course: ${course?.code || 'Active Subject'}`}
              </span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 px-0.5">
            {role === 'admin' ? (
              /* ================= ADMIN NAVIGATION ================= */
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle font-display">
                  {effectiveExpanded ? 'Administration' : '•••'}
                </div>

                <button
                  type="button"
                  onClick={() => onTabChange('admin')}
                  title="Institutional Executive Suite"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-berry-soft text-berry-deep border border-berry/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === 'admin' ? 'text-berry' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Admin Dashboard</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('academic-setup')}
                  title="Master Curriculum & Programs"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'academic-setup'
                      ? 'bg-berry-soft text-berry-deep border border-berry/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'academic-setup' ? 'text-berry' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Academic Setup</span>}
                  </div>
                </button>

                <div className="pt-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-subtle font-display">
                  {effectiveExpanded ? 'Monitoring & Reports' : '•••'}
                </div>

                <button
                  type="button"
                  onClick={() => onTabChange('roster')}
                  title="Universal Attendance Audit"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'roster'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className={`w-4 h-4 shrink-0 ${activeTab === 'roster' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Attendance Audit</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('analytics')}
                  title="Campus-Wide Analytics"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'analytics' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Analytics</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('warnings')}
                  title="Exam Debarment Board"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all relative ${
                    activeTab === 'warnings'
                      ? 'bg-coral-soft text-coral-deep border border-coral/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'warnings' ? 'text-coral' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Debarment List</span>}
                  </div>
                  {lowWarningCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-coral text-white">
                      {lowWarningCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('reports')}
                  title="Accreditation & University Reports"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Download className={`w-4 h-4 shrink-0 ${activeTab === 'reports' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Reports</span>}
                  </div>
                </button>
              </>
            ) : role === 'faculty' ? (
              /* ================= FACULTY NAVIGATION ================= */
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle font-display">
                  {effectiveExpanded ? 'Classroom' : '•••'}
                </div>

                <button
                  type="button"
                  onClick={() => onTabChange('roster')}
                  title="Class Roll Call (Mark Attendance)"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'roster'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Users className={`w-4 h-4 shrink-0 ${activeTab === 'roster' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Roll Call</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('attendance-grid')}
                  title="Quick Attendance Grid Matrix"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'attendance-grid'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckSquare className={`w-4 h-4 shrink-0 ${activeTab === 'attendance-grid' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Quick Grid</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('leave')}
                  title="Student Leave Approvals"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'leave'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'leave' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Leave Approvals</span>}
                  </div>
                </button>

                <div className="pt-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink-subtle font-display">
                  {effectiveExpanded ? 'Insights' : '•••'}
                </div>

                <button
                  type="button"
                  onClick={() => onTabChange('analytics')}
                  title="Subject Analytics & Delivery"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'analytics' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Subject Analytics</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('warnings')}
                  title="Shortage Watchlist"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all relative ${
                    activeTab === 'warnings'
                      ? 'bg-coral-soft text-coral-deep border border-coral/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ShieldAlert className={`w-4 h-4 shrink-0 ${activeTab === 'warnings' ? 'text-coral' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Defaulter Watchlist</span>}
                  </div>
                  {lowWarningCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-coral text-white">
                      {lowWarningCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('reports')}
                  title="Subject Attendance Register"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Download className={`w-4 h-4 shrink-0 ${activeTab === 'reports' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Attendance Register</span>}
                  </div>
                </button>
              </>
            ) : (
              /* ================= STUDENT NAVIGATION ================= */
              <>
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle font-display">
                  {effectiveExpanded ? 'Student Portal' : '•••'}
                </div>

                <button
                  type="button"
                  onClick={() => onTabChange('overview')}
                  title="My Attendance Dashboard"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'overview' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">My Dashboard</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('courses')}
                  title="Subject Attendance"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'courses'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'courses' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Subjects &amp; Credits</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('schedule')}
                  title="Class Timetable"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'schedule'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'schedule' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Class Timetable</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('leave')}
                  title="Leave & Medical Excuses"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'leave'
                      ? 'bg-sky-soft text-sky-deep border border-sky/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'leave' ? 'text-sky' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Leave Application</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('certificates')}
                  title="Hall Ticket & Exam Eligibility"
                  className={`w-full flex items-center ${effectiveExpanded ? 'justify-between px-3.5' : 'justify-center px-2'} py-2.5 rounded-sk-btn text-xs font-bold transition-all ${
                    activeTab === 'certificates'
                      ? 'bg-sun-soft text-sun-deep border border-sun/30 shadow-xs'
                      : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Award className={`w-4 h-4 shrink-0 ${activeTab === 'certificates' ? 'text-sun-deep' : 'text-ink-muted'}`} />
                    {effectiveExpanded && <span className="truncate">Exam Hall Ticket</span>}
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Profile & Role Information */}
        <div className="space-y-3 pt-4 border-t border-outline px-1">
          {/* Verified Database Role Badge */}
          {effectiveExpanded ? (
            <div className="py-1 px-3 bg-surface-sunken rounded-full border border-outline text-xs font-bold flex items-center justify-between">
              <span className="text-ink-subtle text-[10px] uppercase tracking-wider">Access</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                role === 'admin'
                  ? 'bg-berry-soft text-berry-deep border border-purple-200'
                  : role === 'faculty'
                  ? 'bg-sky-soft text-sky-deep border border-sky-200'
                  : 'bg-leaf-soft text-leaf-deep border border-green-200'
              }`}>
                {role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student'}
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title={`Access: ${role}`}>
              <span className={`w-3 h-3 rounded-full ${role === 'admin' ? 'bg-berry' : role === 'faculty' ? 'bg-sky' : 'bg-leaf'}`} />
            </div>
          )}

          {/* Dynamic User Profile Card - Skylearn Style with Profile Settings Launcher */}
          <div
            onClick={() => onOpenProfile?.()}
            className={`flex items-center ${!effectiveExpanded ? 'justify-center' : 'gap-2.5'} p-1.5 rounded-xl hover:bg-black/[0.04] cursor-pointer transition-all group`}
            title="Open Profile & Account Settings"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {role === 'admin'
                ? 'AD'
                : role === 'student' 
                ? (currentStudent?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'ST')
                : (session?.user?.user_metadata?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'FA')
              }
            </div>
            {effectiveExpanded && (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-ink block truncate font-display group-hover:text-indigo-600 transition-colors">
                  {role === 'admin' 
                    ? (session?.user?.user_metadata?.name || 'Administrator') 
                    : role === 'student' 
                    ? (currentStudent?.name || 'Student') 
                    : (session?.user?.user_metadata?.name || 'Faculty In-Charge')}
                </span>
                <span className="text-[11px] text-ink-subtle block truncate font-sans">
                  {role === 'admin' 
                    ? (session?.user?.email || 'admin@college.edu.in') 
                    : role === 'student' 
                    ? (currentStudent?.rollNo ? `Roll: ${currentStudent.rollNo}` : (session?.user?.email || 'Student Portal')) 
                    : (session?.user?.email || 'Faculty Portal')}
                </span>
              </div>
            )}
          </div>

          {/* Sign Out Button - Skylearn Coral Accent */}
          <button
            type="button"
            onClick={() => onLogout?.()}
            title="Sign Out"
            className={`w-full flex items-center ${!effectiveExpanded ? 'justify-center px-1' : 'justify-center gap-1.5 px-3'} text-xs font-bold text-coral hover:text-coral-deep hover:bg-coral-soft/50 py-2 rounded-sk-btn transition-colors border border-coral/20`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {effectiveExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
