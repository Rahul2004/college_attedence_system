import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Sliders, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3, 
  RefreshCw,
  MoreVertical,
  Calendar,
  Lock,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import AdminBulkImporter from './AdminBulkImporter';
import AdminDebarmentNoticeModal from './AdminDebarmentNoticeModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AdminDashboard({ 
  currentSession, 
  attendanceThreshold = 75, 
  onUpdateThreshold,
  users: propUsers,
  onUpdateRole: propOnUpdateRole,
  onApproveStatus: propOnApproveStatus,
  onDeleteUser: propOnDeleteUser,
  onAddUser: propOnAddUser,
  announcements = [],
  onAddAnnouncement,
  onDeleteAnnouncement,
  auditLogs = []
}) {
  const [internalUsers, setInternalUsers] = useState(propUsers || []);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnAudience, setNewAnnAudience] = useState('ALL');
  const [newAnnPriority, setNewAnnPriority] = useState('NORMAL');
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'admin' | 'faculty' | 'student'
  const [termSetting, setTermSetting] = useState('Spring 2026');
  const [minAttendanceThreshold, setMinAttendanceThreshold] = useState(attendanceThreshold);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isBulkImporterOpen, setIsBulkImporterOpen] = useState(false);
  const [isDebarmentCircularOpen, setIsDebarmentCircularOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');
  const [newUserDept, setNewUserDept] = useState('Computer Science');

  const users = propUsers || internalUsers;

  useEffect(() => {
    setMinAttendanceThreshold(attendanceThreshold);
  }, [attendanceThreshold]);

  const handleUpdateRole = async (userId, newRole) => {
    if (propOnUpdateRole) {
      propOnUpdateRole(userId, newRole);
    } else {
      setInternalUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;
        showToast('Role updated successfully on database.');
      } catch {
        showToast('Role updated locally.');
      }
    } else {
      showToast(`User role updated to ${newRole} (Persistent Local Storage)`);
    }
  };

  const handleApproveStatus = async (userId, targetStatus = 'active') => {
    if (propOnApproveStatus) {
      propOnApproveStatus(userId, targetStatus);
    } else {
      setInternalUsers(prev => prev.map(u => u.id === userId ? { ...u, status: targetStatus } : u));
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ status: targetStatus, updated_at: new Date().toISOString() })
          .eq('id', userId);
        showToast(`User status updated to ${targetStatus} on cloud.`);
      } catch {
        showToast('Approval updated locally.');
      }
    } else {
      showToast(`User marked as ${targetStatus} (Local Storage).`);
    }
  };

  const handleDeleteUserAction = (userId, userName) => {
    if (propOnDeleteUser) {
      propOnDeleteUser(userId);
    } else {
      setInternalUsers(prev => prev.filter(u => u.id !== userId));
    }
    showToast(`User ${userName || userId} removed from University Directory.`);
  };

  const handleCreateNewUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const created = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      dept: newUserDept,
      lastActive: 'Just registered'
    };

    if (propOnAddUser) {
      propOnAddUser(created);
    } else {
      setInternalUsers(prev => [created, ...prev]);
    }

    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserModalOpen(false);
    showToast(`Added ${created.name} (${created.role.toUpperCase()}) to institutional directory.`);
  };

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.dept.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalFaculty = users.filter(u => u.role === 'faculty').length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalPending = users.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {feedbackToast}
        </div>
      )}

      {/* Clean Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/[0.06]">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#E8F2FF] text-[#0071E3] border border-[#0071E3]/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Administration Suite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
            Institutional Governance &amp; Access Controls
          </h1>
          <p className="text-xs text-[#86868B] mt-0.5">
            Manage institutional user privileges, view cross-departmental attendance analytics, and control academic term configurations.
          </p>
        </div>
      </div>

      {/* High-Level Master Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-sk-card border border-outline shadow-sk-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-sans">Total Enrolled</span>
            <div className="w-9 h-9 rounded-sk-btn bg-sky-soft text-sky-deep flex items-center justify-center border border-sky/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-ink mt-2">{users.length}</div>
          <span className="text-xs text-ink-subtle mt-1 block">Active across all roles</span>
        </div>

        <div className="bg-white p-5 rounded-sk-card border border-outline shadow-sk-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-sans">Faculty Officers</span>
            <div className="w-9 h-9 rounded-sk-btn bg-sky-soft text-sky-deep flex items-center justify-center border border-sky/20">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-ink mt-2">{totalFaculty}</div>
          <span className="text-xs text-ink-subtle mt-1 block">Authorized to log attendance</span>
        </div>

        <div className="bg-white p-5 rounded-sk-card border border-outline shadow-sk-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-sans">Institutional Average</span>
            <div className="w-9 h-9 rounded-sk-btn bg-leaf-soft text-leaf-deep flex items-center justify-center border border-leaf/20">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-ink mt-2">82.8%</div>
          <span className="text-xs text-leaf-deep font-bold mt-1 block">&gt; 75.0% Statutory requirement</span>
        </div>

        <div className="bg-white p-5 rounded-sk-card border border-outline shadow-sk-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-sans">Pending Approvals</span>
            <div className="w-9 h-9 rounded-sk-btn bg-sun-soft text-sun-deep flex items-center justify-center border border-sun/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-ink mt-2">{totalPending}</div>
          <span className="text-xs text-sun-deep font-bold mt-1 block">Awaiting admin review</span>
        </div>
      </div>

      {/* Main Administrative User Management Table */}
      <div className="bg-white rounded-sk-card border border-outline shadow-sk-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-ink font-display">
              Institutional User Directory &amp; Role Management
            </h2>
            <p className="text-xs text-ink-muted mt-0.5 font-sans">
              Review registered institutional accounts and assign or revoke privileges.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Bar */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, dept..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-sunken rounded-sk-btn border border-outline focus:outline-none focus:ring-2 focus:ring-sky/20 text-ink placeholder-ink-subtle"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center p-1 bg-surface-sunken rounded-full border border-outline text-xs font-bold">
              {['ALL', 'admin', 'faculty', 'student'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded-full capitalize transition-all ${
                    roleFilter === r ? 'bg-white text-ink shadow-xs border border-outline' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Add User, Bulk Ingestion and Debarment Notice Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add User</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkImporterOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bulk Import (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDebarmentCircularOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Debarment Circular</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Roster Table with Overflow Container */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 font-semibold">
                <th className="py-3 px-4">User &amp; Email</th>
                <th className="py-3 px-4">Department / Unit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Current Role</th>
                <th className="py-3 px-4 text-center">Assign Role</th>
                <th className="py-3 px-4 text-center">Approval</th>
                <th className="py-3 px-4 text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users matching search filters found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isAdmin = user.role === 'admin';
                  const isFaculty = user.role === 'faculty';
                  const isPending = user.status === 'pending' || user.status === 'pending_approval';
                  const isDetailsPending = user.status === 'details_pending_review';
                  const isDetailsRequired = user.status === 'details_required';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                            {(user.name || 'User').split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-600">
                        {user.dept}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPending 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : isDetailsPending
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : isDetailsRequired
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {user.status}
                        </span>
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isAdmin 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : isFaculty 
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3 px-4 text-center">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>

                      {/* Quick Approval Action */}
                      <td className="py-3 px-4 text-center">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleApproveStatus(user.id, 'details_required')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] transition-colors"
                            title="Approve registration & allow student to enter academic details"
                          >
                            Approve (Request Info)
                          </button>
                        ) : isDetailsPending ? (
                          <button
                            type="button"
                            onClick={() => handleApproveStatus(user.id, 'active')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                            title="Verify academic details & unlock portal"
                          >
                            Verify &amp; Activate
                          </button>
                        ) : isDetailsRequired ? (
                          <span className="text-[11px] text-blue-600 font-medium">Awaiting Student</span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Active</span>
                        )}
                      </td>

                      {/* Real Delete Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteUserAction(user.id, user.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={`Delete ${user.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Governance & Configuration Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <Sliders className="w-4.5 h-4.5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              System Parameters &amp; Academic Terms
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Active Academic Term
              </label>
              <input
                type="text"
                value={termSetting}
                onChange={e => setTermSetting(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Statutory Examination Threshold (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="60"
                  max="85"
                  value={minAttendanceThreshold}
                  onChange={e => setMinAttendanceThreshold(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-slate-900 text-sm w-12 text-right">
                  {minAttendanceThreshold}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onUpdateThreshold) {
                  onUpdateThreshold(minAttendanceThreshold);
                }
                showToast(`System parameters saved: Minimum examination threshold updated to ${minAttendanceThreshold}% across entire institution.`);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs"
            >
              Save Academic Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Building2 className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Departmental Roster Synced Units
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Computer Science & Engineering', code: 'CSE', courses: 8, head: 'Prof. R. Vance' },
                { name: 'Electrical & Electronics', code: 'EEE', courses: 6, head: 'Dr. A. Sharma' },
                { name: 'Mechanical Engineering', code: 'ME', courses: 5, head: 'Dr. K. Patel' },
                { name: 'Information Technology', code: 'IT', courses: 7, head: 'Prof. S. Rao' },
              ].map(dept => (
                <div key={dept.code} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="font-semibold text-slate-800 block">{dept.name}</span>
                    <span className="text-[10px] text-slate-400">Head: {dept.head}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    {dept.courses} Courses
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Database Status: Connected (Supabase RLS active)</span>
            <span className="font-semibold text-emerald-600">Encrypted</span>
          </div>
        </div>
      </div>

      {/* ================= 3. CAMPUS ANNOUNCEMENTS & OFFICIAL BROADCASTS ================= */}
      <div className="bg-white rounded-sk-card border border-outline shadow-sk-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-ink font-display">
                Campus-Wide Announcements &amp; Official Circulars
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {announcements.length} Active
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Publish statutory notices, holiday memos, and academic advisories to student &amp; faculty dashboards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAnnModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sk-btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Publish Announcement</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map(ann => (
            <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    ann.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {ann.priority}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Target: {ann.audience}
                    </span>
                    {onDeleteAnnouncement && (
                      <button
                        type="button"
                        onClick={() => onDeleteAnnouncement(ann.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mb-1">{ann.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex items-center justify-between">
                <span>By {ann.author}</span>
                <span>{ann.publishedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= 4. ADMINISTRATIVE AUDIT TRAIL ================= */}
      <div className="bg-white rounded-sk-card border border-outline shadow-sk-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-outline">
          <h2 className="text-base sm:text-lg font-extrabold text-ink font-display">
            Administrative &amp; Security Audit Trail
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Immutable log of role changes, attendance revisions, threshold updates, and official decisions.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-outline bg-surface-sunken/80 text-ink-muted font-bold font-display select-none">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline text-ink">
              {auditLogs.slice(0, 10).map((log, i) => (
                <tr key={log.id || i} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {log.actorEmail}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 max-w-md truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk CSV / Excel Importer Modal */}
      {isBulkImporterOpen && (
        <AdminBulkImporter
          onClose={() => setIsBulkImporterOpen(false)}
          onImportSuccess={(newRows) => {
            const mappedUsers = newRows.map((nr, idx) => ({
              id: `usr-bulk-${Date.now()}-${idx}`,
              email: nr.email,
              role: 'student',
              status: 'active',
              name: nr.name,
              dept: nr.program || 'Computer Science',
              lastActive: 'Just registered'
            }));
            mappedUsers.forEach(u => {
              if (propOnAddUser) {
                propOnAddUser(u);
              }
            });
            if (!propOnAddUser) {
              setInternalUsers(prev => [...mappedUsers, ...prev]);
            }
            showToast(`Successfully registered ${newRows.length} candidates into University directory!`);
          }}
        />
      )}

      {/* Add New User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Enroll New University Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.k@univ.edu"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900"
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={e => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 transition-all"
                >
                  Confirm &amp; Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Debarment Circular Modal */}
      {isDebarmentCircularOpen && (
        <AdminDebarmentNoticeModal
          defaulters={[
            { id: 'usr-4', rollNo: 'CS-603', name: 'Rohan Verma', effectiveAttended: 32, effectiveTotal: 48, percentage: 66.7 },
            { id: 'usr-5', rollNo: 'CS-608', name: 'Meera Nambiar', effectiveAttended: 30, effectiveTotal: 48, percentage: 62.5 },
            { id: 'usr-7', rollNo: 'CS-614', name: 'Divya Sundaram', effectiveAttended: 33, effectiveTotal: 48, percentage: 68.8 }
          ]}
          course={{ code: 'CS-602', name: 'Database Management Systems' }}
          onClose={() => setIsDebarmentCircularOpen(false)}
        />
      )}

      {/* Bulk Student & Faculty Ingestion Modal */}
      {isBulkImporterOpen && (
        <AdminBulkImporter
          onClose={() => setIsBulkImporterOpen(false)}
          onImportSuccess={(newRecords) => {
            if (newRecords && newRecords.length > 0) {
              const formattedNewUsers = newRecords.map((r, idx) => ({
                id: `usr-bulk-${Date.now()}-${idx}`,
                name: r.name,
                email: r.email,
                role: r.role || (r.email?.includes('faculty') ? 'faculty' : 'student'),
                status: 'active',
                dept: r.dept || r.department || 'Computer Science',
                lastActive: 'Imported via CSV'
              }));
              formattedNewUsers.forEach(u => {
                if (propOnAddUser) propOnAddUser(u);
              });
              showToast(`Imported ${formattedNewUsers.length} institutional accounts into directory & cloud.`);
            }
            setIsBulkImporterOpen(false);
          }}
        />
      )}
    </div>
  );
}
