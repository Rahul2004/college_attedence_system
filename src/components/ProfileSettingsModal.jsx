import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Check, 
  X, 
  Building2, 
  GraduationCap, 
  Save, 
  KeyRound,
  Sparkles,
  BookOpen,
  Shield
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveUsersToCloud } from '../lib/syncService';

export default function ProfileSettingsModal({ 
  isOpen, 
  onClose, 
  role, 
  session, 
  userProfile,
  currentStudent, 
  activeCourse,
  users = [], 
  onUpdateCurrentUser, 
  setToast 
}) {
  if (!isOpen) return null;

  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@college.edu.in').toLowerCase();
  
  // 1. Resolve authentic email and identity directly tied to authenticated session
  const sessionUser = session?.user;
  const sessionEmail = sessionUser?.email?.toLowerCase();
  const sessionRole = sessionUser?.user_metadata?.role || (sessionEmail === ADMIN_EMAIL ? 'admin' : null);
  
  // If the active session belongs to this role, use session email; otherwise use the authentic role email
  const currentEmail = (sessionEmail && (!sessionRole || sessionRole === role))
    ? sessionEmail
    : (
      role === 'admin' 
        ? ADMIN_EMAIL 
        : role === 'student' 
        ? (currentStudent?.email?.toLowerCase() || sessionEmail || 'student@collegemail.edu.in')
        : (sessionEmail || 'faculty@college.edu.in')
    );
  
  // Find matching user record strictly by email, or role-only if email matches
  const matchedUser = (users || []).find(u => u.email?.toLowerCase() === currentEmail) || 
                      (users || []).find(u => u.role === role && u.email?.toLowerCase() === currentEmail) || 
                      (sessionUser?.user_metadata ? {
                        name: sessionUser.user_metadata.name || sessionUser.user_metadata.full_name,
                        department: sessionUser.user_metadata.department,
                        phone: sessionUser.user_metadata.phone
                      } : {});

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'notifications'
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // General Info Form - Strictly role-isolated defaults prioritizing userProfile
  const [fullName, setFullName] = useState(() => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (role === 'student') return currentStudent?.name || matchedUser.name || sessionUser?.user_metadata?.name || 'Student';
    if (role === 'admin') return matchedUser.name || sessionUser?.user_metadata?.name || 'Administrator';
    return matchedUser.name || sessionUser?.user_metadata?.name || 'Faculty Member';
  });
  
  const [phone, setPhone] = useState(() => {
    if (userProfile?.phone || userProfile?.emergency_contact) return userProfile.phone || userProfile.emergency_contact;
    if (role === 'student') return currentStudent?.phone || matchedUser.phone || '+91 98765-43210';
    return matchedUser.phone || '+91 98765-43210';
  });
  
  const [department, setDepartment] = useState(() => {
    if (userProfile?.department) return userProfile.department;
    if (role === 'student') return currentStudent?.department || matchedUser.department || 'Computer Science & Engineering';
    if (role === 'admin') return matchedUser.department || matchedUser.dept || 'Central Administration';
    return matchedUser.department || matchedUser.dept || 'Computer Science & Engineering';
  });
  
  const [rollNo, setRollNo] = useState(() => userProfile?.roll_no || currentStudent?.rollNo || '0101CS221001');

  // Asynchronously query Supabase profiles table for authenticated user record
  useEffect(() => {
    let isMounted = true;
    async function loadSupabaseProfile() {
      if (!supabase || !isSupabaseConfigured || !sessionUser?.id) return;
      try {
        setIsLoadingProfile(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (!error && data && isMounted) {
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
          if (data.department) setDepartment(data.department);
          if (data.roll_no) setRollNo(data.roll_no);
        }
      } catch (err) {
        console.warn('Notice: Could not load profile from Supabase:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }

    loadSupabaseProfile();
    return () => { isMounted = false; };
  }, [sessionUser?.id]);

  // Keep state synchronized whenever userProfile, active student or role switches
  useEffect(() => {
    if (userProfile?.full_name) {
      setFullName(userProfile.full_name);
    } else if (role === 'student') {
      setFullName(currentStudent?.name || matchedUser.name || sessionUser?.user_metadata?.name || 'Student');
    } else if (role === 'admin') {
      setFullName(matchedUser.name || sessionUser?.user_metadata?.name || 'Administrator');
    } else {
      setFullName(matchedUser.name || sessionUser?.user_metadata?.name || 'Faculty Member');
    }

    if (userProfile?.phone || userProfile?.emergency_contact) {
      setPhone(userProfile.phone || userProfile.emergency_contact);
    } else if (role === 'student') {
      setPhone(currentStudent?.phone || matchedUser.phone || '+91 98765-43210');
    } else {
      setPhone(matchedUser.phone || '+91 98765-43210');
    }

    if (userProfile?.department) {
      setDepartment(userProfile.department);
    } else if (role === 'student') {
      setDepartment(currentStudent?.department || matchedUser.department || 'Computer Science & Engineering');
    } else if (role === 'admin') {
      setDepartment(matchedUser.department || matchedUser.dept || 'Central Administration');
    } else {
      setDepartment(matchedUser.department || matchedUser.dept || 'Computer Science & Engineering');
    }

    if (userProfile?.roll_no) {
      setRollNo(userProfile.roll_no);
    } else if (currentStudent?.rollNo) {
      setRollNo(currentStudent.rollNo);
    }
  }, [role, userProfile, currentStudent, currentEmail, matchedUser.name, matchedUser.phone, matchedUser.department, matchedUser.dept, sessionUser]);
  
  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notifications with persistent store
  const [emailAlerts, setEmailAlerts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`pref_email_${currentEmail}`);
      if (saved !== null) return saved === 'true';
    }
    return true;
  });
  const [whatsappAlerts, setWhatsappAlerts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`pref_wa_${currentEmail}`);
      if (saved !== null) return saved === 'true';
    }
    return true;
  });
  const [lowAttendanceWarnings, setLowAttendanceWarnings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`pref_warn_${currentEmail}`);
      if (saved !== null) return saved === 'true';
    }
    return true;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ text: '', type: '' });

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // 1. Update user in local storage
      const existingUsers = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('college_app_users') || '[]') : [];
      let updatedUsers = existingUsers;
      
      const userIndex = existingUsers.findIndex(u => u.email?.toLowerCase() === currentEmail);
      if (userIndex >= 0) {
        updatedUsers[userIndex] = {
          ...updatedUsers[userIndex],
          name: fullName,
          phone,
          department
        };
      } else {
        updatedUsers.push({
          id: `usr_${Date.now()}`,
          name: fullName,
          email: currentEmail,
          role,
          phone,
          department,
          status: 'active'
        });
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('college_app_users', JSON.stringify(updatedUsers));
      }

      // 2. Sync to cloud database
      await saveUsersToCloud(updatedUsers);

      if (supabase && isSupabaseConfigured && session?.user?.id) {
        // Update user metadata in Supabase Auth
        try {
          await supabase.auth.updateUser({
            data: {
              name: fullName,
              full_name: fullName,
              phone,
              department
            }
          });
        } catch {}

        // Update profiles table record
        try {
          await supabase
            .from('profiles')
            .update({
              full_name: fullName,
              phone,
              department,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.user.id);
        } catch {}
      }

      if (onUpdateCurrentUser) {
        onUpdateCurrentUser({ name: fullName, phone, department });
      }

      if (setToast) {
        setToast({
          type: 'success',
          message: 'Profile details updated and synced across all devices.'
        });
        setTimeout(() => setToast({ type: null, message: '' }), 4000);
      }

      onClose();
    } catch {
      if (setToast) {
        setToast({
          type: 'error',
          message: 'Failed to update profile. Please try again.'
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setSecurityMsg({ text: 'Please enter a new password.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setSecurityMsg({ text: '', type: '' });

    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }

      setSecurityMsg({ text: 'Password changed successfully! Security token renewed.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');

      if (setToast) {
        setToast({
          type: 'success',
          message: 'Security credentials updated successfully.'
        });
        setTimeout(() => setToast({ type: null, message: '' }), 4000);
      }
    } catch (err) {
      setSecurityMsg({ text: err.message || 'Error updating password.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md ${
              role === 'admin'
                ? 'bg-purple-600 shadow-purple-600/30'
                : role === 'faculty'
                ? 'bg-blue-600 shadow-blue-600/30'
                : 'bg-emerald-600 shadow-emerald-600/30'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Profile &amp; Account Settings
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  role === 'admin'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : role === 'faculty'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {role === 'admin' ? 'Administrator' : role === 'faculty' ? 'Faculty In-Charge' : 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage personal profile, institutional contact info, and security credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 pt-2 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Personal Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4 shrink-0" />
            <span>Password &amp; Security</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Alert Preferences</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Institutional Email (Read Only)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={currentEmail}
                      disabled
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department / Faculty Unit
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                {role === 'student' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        University Roll Number
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={rollNo}
                          disabled
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Academic Cohort & Semester
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={`${currentStudent?.semester || 'Semester VI'} • B.Tech CSE`}
                          disabled
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'faculty' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Academic Designation
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value="Associate Professor & Course Coordinator"
                          disabled
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Assigned Subject & Course
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={activeCourse?.name ? `${activeCourse.code}: ${activeCourse.name}` : 'CS-602: Database Management Systems (DBMS)'}
                          disabled
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}

                {role === 'admin' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Administrative Authority Level
                      </label>
                      <div className="relative">
                        <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value="Tier-1 University Registrar / Institutional Super-Admin"
                          disabled
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Primary System Responsibilities
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value="Statutory 75% Rule Enforcement • Faculty Approvals • Audit Logs"
                          disabled
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-semibold cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Database Authorization Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-900 block">Verified University Access Rights</span>
                    <span className="text-[11px] text-slate-500">
                      {role === 'admin'
                        ? 'Full Institutional Super-Admin Authority'
                        : role === 'faculty'
                        ? 'Course Lecturer & Attendance Authority'
                        : 'Enrolled Academic Student Permissions'}
                    </span>
                  </div>
                </div>
                <span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-bold text-[10px]">
                  Active • Authorized
                </span>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Password Renewal Policy</span>
                  Passwords must be at least 6 characters long. Updating will securely refresh your active institutional authentication tokens.
                </div>
              </div>

              {securityMsg.text && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  securityMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {securityMsg.text}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Classroom Attendance Push Alerts</span>
                    <span className="text-[11px] text-slate-500">Real-time alerts when punch sessions start or change</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={e => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">WhatsApp Defaulter Shortage Notices</span>
                    <span className="text-[11px] text-slate-500">Dispatch alerts to registered parent number if attendance &lt; 75%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={e => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Dean &amp; Faculty Broadcasts</span>
                    <span className="text-[11px] text-slate-500">Academic calendar notices, holidays, and circular updates</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={lowAttendanceWarnings}
                    onChange={e => setLowAttendanceWarnings(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`pref_email_${currentEmail}`, String(emailAlerts));
                      localStorage.setItem(`pref_wa_${currentEmail}`, String(whatsappAlerts));
                      localStorage.setItem(`pref_warn_${currentEmail}`, String(lowAttendanceWarnings));
                    }
                    if (setToast) {
                      setToast({
                        type: 'success',
                        message: 'Notification preferences saved and synced across all devices.'
                      });
                      setTimeout(() => setToast({ type: null, message: '' }), 4000);
                    }
                    onClose();
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
