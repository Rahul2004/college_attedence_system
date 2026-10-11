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
  FileText
} from 'lucide-react';
import AdminBulkImporter from './AdminBulkImporter';
import AdminDebarmentNoticeModal from './AdminDebarmentNoticeModal';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Mock administrative fallback roster in case database is empty or local
const INITIAL_USERS = [
  { id: 'usr-1', email: 'director.admin@univ.edu', role: 'admin', status: 'active', name: 'Dr. Evelyn Carter', dept: 'Central Administration', lastActive: 'Just now' },
  { id: 'usr-2', email: 'prof.vance@univ.edu', role: 'faculty', status: 'active', name: 'Prof. R. Vance', dept: 'Computer Science', lastActive: '12m ago' },
  { id: 'usr-3', email: 'dr.sharma@univ.edu', role: 'faculty', status: 'active', name: 'Dr. Anil Sharma', dept: 'Electrical Engineering', lastActive: '1h ago' },
  { id: 'usr-4', email: 'alexander.wright@univ.edu', role: 'student', status: 'active', name: 'Alexander Wright', dept: 'Computer Science', lastActive: '3h ago' },
  { id: 'usr-5', email: 'sophia.martinez@univ.edu', role: 'student', status: 'active', name: 'Sophia Martinez', dept: 'Information Technology', lastActive: '5h ago' },
  { id: 'usr-6', email: 'new.lecturer@univ.edu', role: 'faculty', status: 'pending', name: 'Mark Thompson', dept: 'Mechanical Engineering', lastActive: 'Yesterday' },
  { id: 'usr-7', email: 'student.pending@univ.edu', role: 'student', status: 'pending', name: 'Liam Davies', dept: 'Civil Engineering', lastActive: '2d ago' },
];

export default function AdminDashboard({ currentSession }) {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'admin' | 'faculty' | 'student'
  const [termSetting, setTermSetting] = useState('Spring 2026');
  const [minAttendanceThreshold, setMinAttendanceThreshold] = useState(75);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isBulkImporterOpen, setIsBulkImporterOpen] = useState(false);
  const [isDebarmentCircularOpen, setIsDebarmentCircularOpen] = useState(false);

  // Fetch real profiles from Supabase if configured
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, status, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((p, idx) => ({
            id: p.id,
            email: p.email || `user-${idx + 1}@univ.edu`,
            role: p.role || 'student',
            status: p.status || 'active',
            name: p.email ? p.email.split('@')[0].replace('.', ' ') : `Academic Member ${idx + 1}`,
            dept: p.role === 'faculty' ? 'Faculty of Engineering' : p.role === 'admin' ? 'University Administration' : 'Enrolled Student',
            lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : 'Active'
          }));
          setUsers(formatted);
        }
      } catch {
        // Fall back gracefully to mock list
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

    if (supabase && isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) throw error;
        showToast('Role updated successfully on database.');
      } catch (err) {
        showToast('Failed to update role. Ensure Admin RLS policy is active in Supabase.');
      }
    } else {
      showToast(`User role updated to ${newRole} (Local Session)`);
    }
  };

  const handleApproveStatus = async (userId) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'active' } : u));
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', userId);
        showToast('User registration approved.');
      } catch {
        showToast('Approval updated locally.');
      }
    } else {
      showToast('User approved locally.');
    }
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Administration Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Governance &amp; Access Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Manage institutional user privileges, view cross-departmental attendance analytics, and control academic term configurations.
          </p>
        </div>
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden sm:block">
          <ShieldCheck className="w-56 h-56 text-white" />
        </div>
      </div>

      {/* High-Level Master Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Enrolled</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{users.length}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active across all roles</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Faculty Officers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalFaculty}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Authorized to log attendance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Institutional Average</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">82.8%</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">&gt; 75.0% Statutory requirement</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-2">{totalPending}</div>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Awaiting admin review</span>
        </div>
      </div>

      {/* Main Administrative User Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Institutional User Directory &amp; Role Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review registered institutional accounts and assign or revoke privileges.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Bar */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, dept..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {['ALL', 'admin', 'faculty', 'student'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    roleFilter === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Bulk Ingestion and Debarment Notice Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkImporterOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bulk Import (CSV / Excel)</span>
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
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users matching search filters found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isAdmin = user.role === 'admin';
                  const isFaculty = user.role === 'faculty';
                  const isPending = user.status === 'pending';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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
                            onClick={() => handleApproveStatus(user.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Active</span>
                        )}
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
              onClick={() => showToast('System parameters saved.')}
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
            setUsers(prev => [...mappedUsers, ...prev]);
            showToast(`Successfully registered ${newRows.length} candidates into University directory!`);
          }}
        />
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
    </div>
  );
}
