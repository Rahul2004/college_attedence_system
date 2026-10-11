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
  onToggleExpand
}) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Main Sidebar Container:
          - Mobile: fixed drawer (-translate-x-full to translate-x-0)
          - Desktop: smooth width transition between w-64 (expanded) and w-20 (compact)
      */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          ${isExpanded ? 'w-64' : 'w-20'}
          shrink-0 bg-slate-950 text-slate-300
          flex flex-col justify-between py-5 px-3 min-h-screen border-r border-slate-800/80
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="space-y-6">
          {/* Brand Header: Academia + Toggle Button */}
          <div className="flex items-center justify-between px-1.5">
            <div className={`flex items-center gap-2.5 overflow-hidden transition-all duration-300 ${!isExpanded ? 'justify-center w-full' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-200">
                  <span className="font-extrabold text-white text-base tracking-tight block leading-none truncate">
                    Academia
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block mt-1 truncate">
                    {role === 'admin' ? 'Institutional Admin' : role === 'faculty' ? 'Faculty Operations' : 'Student Workspace'}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Chevron Collapse / Expand Button in Sidebar Header */}
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0"
                title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                aria-label="Toggle Sidebar"
              >
                {isExpanded ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onMobileClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Close Mobile Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dynamic Context Header: Course or Roll No or Admin Scope */}
          <div className="px-1">
            <div
              className={`flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-xs text-slate-400 overflow-hidden ${
                !isExpanded ? 'justify-center py-2' : ''
              }`}
              title={role === 'admin' ? 'All Departments & Systems' : role === 'student' ? `Roll: ${currentStudent?.rollNo || 'CS-401'}` : `Course: ${course.code}`}
            >
              {isExpanded ? (
                <span className="text-[11px] truncate">
                  {role === 'admin' ? '✦ University System' : role === 'student' ? `Roll: ${currentStudent?.rollNo || 'CS-401'}` : `⌘ Course: ${course.code}`}
                </span>
              ) : (
                <span className="font-mono text-[11px] font-bold text-slate-300">
                  {role === 'admin' ? 'ADM' : role === 'student' ? 'CS' : course.code.split('-')[0]}
                </span>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5 px-0.5">
            {role === 'admin' ? (
              /* ================= ADMIN NAVIGATION ================= */
              <>
                <button
                  type="button"
                  onClick={() => onTabChange('admin')}
                  title="Institutional Executive Suite"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-purple-950/70 text-purple-200 border border-purple-800/50 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldCheck className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'admin' ? 'text-purple-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Institutional Suite</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('academic-setup')}
                  title="Master Curriculum & Programs"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'academic-setup'
                      ? 'bg-purple-950/70 text-purple-200 border border-purple-800/50 shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'academic-setup' ? 'text-purple-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Academic Setup</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('roster')}
                  title="Universal Attendance Audit"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'roster'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Users className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'roster' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Master Attendance Audit</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('analytics')}
                  title="Campus-Wide Analytics"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BarChart3 className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Campus Analytics</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('warnings')}
                  title="Exam Debarment Board"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    activeTab === 'warnings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'warnings' ? 'text-rose-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Debarment Board</span>}
                  </div>
                  {lowWarningCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 ${
                      !isExpanded ? 'absolute top-1 right-1 px-1 py-0 text-[9px]' : ''
                    }`}>
                      {lowWarningCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('reports')}
                  title="Accreditation & University Reports"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Download className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'reports' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">University Reports</span>}
                  </div>
                </button>
              </>
            ) : role === 'faculty' ? (
              /* ================= FACULTY NAVIGATION ================= */
              <>
                <button
                  type="button"
                  onClick={() => onTabChange('roster')}
                  title="Class Roll Call (Mark Attendance)"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'roster'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Users className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'roster' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Class Roll Call</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('analytics')}
                  title="Subject Analytics & Delivery"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BarChart3 className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'analytics' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Subject Analytics</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('warnings')}
                  title="Shortage Watchlist"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    activeTab === 'warnings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldAlert className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'warnings' ? 'text-rose-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Defaulter Watchlist</span>}
                  </div>
                  {lowWarningCount > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 ${
                      !isExpanded ? 'absolute top-1 right-1 px-1 py-0 text-[9px]' : ''
                    }`}>
                      {lowWarningCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('leave')}
                  title="Student Leave Approvals"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'leave'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'leave' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Leave Approvals</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('reports')}
                  title="Subject Attendance Register"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Download className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'reports' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Attendance Register</span>}
                  </div>
                </button>
              </>
            ) : (
              /* ================= STUDENT NAVIGATION ================= */
              <>
                <button
                  type="button"
                  onClick={() => onTabChange('overview')}
                  title="My Overview"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <LayoutDashboard className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'overview' ? 'text-blue-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">My Overview</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('courses')}
                  title="Subjects"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'courses'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'courses' ? 'text-blue-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Subjects</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('schedule')}
                  title="Class Schedule"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'schedule'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Calendar className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'schedule' ? 'text-blue-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Class Schedule</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('leave')}
                  title="Leave & Excuses"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'leave'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'leave' ? 'text-blue-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Leave & Excuses</span>}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onTabChange('certificates')}
                  title="Hall Ticket & Certs"
                  className={`w-full flex items-center ${isExpanded ? 'justify-between px-3' : 'justify-center px-2'} py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'certificates'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Award className={`w-4.5 h-4.5 shrink-0 ${activeTab === 'certificates' ? 'text-blue-400' : 'text-slate-500'}`} />
                    {isExpanded && <span className="truncate">Hall Ticket &amp; Certs</span>}
                  </div>
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Profile & Role Information */}
        <div className="space-y-3.5 pt-4 border-t border-slate-900 px-1">
          {/* Verified Database Role Badge */}
          {isExpanded ? (
            <div className="py-1 px-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-semibold flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">Access</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                role === 'admin'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : role === 'faculty'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
              }`}>
                {role === 'admin' ? 'Admin' : role === 'faculty' ? 'Faculty' : 'Student'}
              </span>
            </div>
          ) : (
            <div className="flex justify-center" title={`Access: ${role}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${role === 'admin' ? 'bg-purple-500' : role === 'faculty' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
            </div>
          )}

          {/* Dynamic User Profile Card */}
          <div className={`flex items-center ${!isExpanded ? 'justify-center' : 'gap-2.5'}`} title={role === 'admin' ? 'Rahul (Administrator)' : role === 'student' ? (currentStudent?.name || 'Alexander Wright') : 'Prof. R. Vance'}>
            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-700 shrink-0">
              {role === 'admin'
                ? 'RK'
                : role === 'student' 
                ? (currentStudent?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'AW')
                : 'RV'
              }
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-white block truncate">
                  {role === 'admin' ? 'System Administrator' : role === 'student' ? (currentStudent?.name || 'Alexander Wright') : 'Prof. R. Vance'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate font-mono">
                  {role === 'admin' ? (session?.user?.email || 'admin@college.edu.in') : role === 'student' ? `${currentStudent?.rollNo || 'CS-401'} • 2nd Year` : 'Department Chair'}
                </span>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => onLogout?.()}
            title="Sign Out"
            className={`w-full flex items-center ${!isExpanded ? 'justify-center px-1' : 'justify-center gap-1.5 px-2'} text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 py-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-900/50`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
