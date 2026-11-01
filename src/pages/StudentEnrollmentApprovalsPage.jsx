import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  GraduationCap,
  Building2,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { 
  saveSystemSettingToCloud, 
  saveUsersToCloud, 
  fetchCloudAdmissionsForms,
  saveAdmissionsFormsToCloud 
} from '../lib/syncService';

export default function StudentEnrollmentApprovalsPage() {
  const location = useLocation();
  const {
    role: contextRole,
    users = [],
    setUsers,
    setToast,
    admissionsForms,
    setAdmissionsForms
  } = useAcademic();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeRole = ['admin', 'faculty'].includes(pathParts[0])
    ? pathParts[0]
    : contextRole;

  // Local state for admissions forms fetched from cloud / localStorage
  const [applications, setApplications] = useState(() => {
    if (admissionsForms && Array.isArray(admissionsForms) && admissionsForms.length > 0) {
      return admissionsForms;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_student_admissions_forms');
      if (saved) {
        try { 
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return [];
  });

  // Keep state in sync with context and fetch directly from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    fetchCloudAdmissionsForms().then(cloudForms => {
      if (isMounted && cloudForms && Array.isArray(cloudForms) && cloudForms.length > 0) {
        setApplications(cloudForms);
        if (setAdmissionsForms) setAdmissionsForms(cloudForms);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_student_admissions_forms', JSON.stringify(cloudForms));
        }
      }
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (admissionsForms && Array.isArray(admissionsForms) && admissionsForms.length > 0) {
      setApplications(admissionsForms);
    }
  }, [admissionsForms]);

  const [selectedApp, setSelectedApp] = useState(applications[0] || null);

  useEffect(() => {
    if (!selectedApp && applications.length > 0) {
      setSelectedApp(applications[0]);
    }
  }, [applications]);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | WAITING_APPROVAL | APPROVED | REJECTED
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchSearch =
        app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.branch?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'ALL' || app.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, filterStatus]);

  const handleApproveApplication = async (app) => {
    const updated = applications.map(a => a.id === app.id ? { ...a, status: 'APPROVED' } : a);
    setApplications(updated);
    if (setAdmissionsForms) setAdmissionsForms(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('college_student_admissions_forms', JSON.stringify(updated));
    }
    await saveAdmissionsFormsToCloud(updated);

    // Also activate or update user record in users directory so student can immediately log in
    const existingIndex = users.findIndex(u => u.email?.toLowerCase() === app.email?.toLowerCase());
    let updatedUsers = [...users];
    if (existingIndex >= 0) {
      updatedUsers[existingIndex] = {
        ...updatedUsers[existingIndex],
        status: 'active',
        name: app.fullName,
        dept: app.branch || app.department,
        rollNo: app.rollNo
      };
    } else {
      updatedUsers = [
        {
          id: `usr-${Date.now()}`,
          name: app.fullName,
          email: app.email,
          role: 'student',
          status: 'active',
          dept: app.branch || app.department,
          rollNo: app.rollNo,
          lastActive: 'Just approved'
        },
        ...users
      ];
    }
    setUsers(updatedUsers);
    await saveUsersToCloud(updatedUsers);

    // Update Supabase auth profiles table so userProfile.status becomes 'active'
    try {
      if (supabase && isSupabaseConfigured) {
        await supabase
          .from('profiles')
          .update({
            status: 'active',
            role: 'student',
            full_name: app.fullName,
            roll_no: app.rollNo,
            department: app.branch || app.department,
            updated_at: new Date().toISOString()
          })
          .eq('email', app.email?.toLowerCase());
      }
    } catch (e) {
      console.warn('Update cloud profile on approve notice:', e);
    }

    if (setToast) {
      setToast({
        type: 'success',
        message: `Application for ${app.fullName} (${app.rollNo}) approved! Account status is now ACTIVE — student can log in.`
      });
      setTimeout(() => setToast({ type: null, message: '' }), 4500);
    }
  };

  const handleRejectApplication = async (app) => {
    const updated = applications.map(a => a.id === app.id ? { ...a, status: 'REJECTED' } : a);
    setApplications(updated);
    if (setAdmissionsForms) setAdmissionsForms(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('college_student_admissions_forms', JSON.stringify(updated));
    }
    await saveAdmissionsFormsToCloud(updated);

    if (setToast) {
      setToast({
        type: 'rose',
        message: `Application for ${app.fullName} marked REJECTED.`
      });
      setTimeout(() => setToast({ type: null, message: '' }), 3500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Student Enrollment Forms &amp; Approvals Desk
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {activeRole} Review
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Review complete A-to-Z admission forms submitted by newly registered students before granting account access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              const cloudForms = await fetchCloudAdmissionsForms();
              if (cloudForms && Array.isArray(cloudForms)) {
                setApplications(cloudForms);
                if (setAdmissionsForms) setAdmissionsForms(cloudForms);
                localStorage.setItem('college_student_admissions_forms', JSON.stringify(cloudForms));
                if (setToast) {
                  setToast({ type: 'success', message: 'Admissions list refreshed from cloud.' });
                  setTimeout(() => setToast({ type: null, message: '' }), 2500);
                }
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
            title="Refresh from Supabase Cloud"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Sync Cloud</span>
          </button>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            {applications.filter(a => a.status === 'WAITING_APPROVAL').length} Pending Approval
          </span>
        </div>
      </div>

      {/* Main Grid: Left Master List / Right Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Applications Master List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
          {/* Search & Status Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, roll no, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              {['ALL', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition cursor-pointer text-[11px] ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'WAITING_APPROVAL' ? 'Waiting' : st === 'APPROVED' ? 'Approved' : 'Rejected'}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No student enrollment forms matching criteria.
              </div>
            ) : (
              filteredApplications.map(app => {
                const isSelected = selectedApp?.id === app.id;
                const isWaiting = app.status === 'WAITING_APPROVAL';
                const isApproved = app.status === 'APPROVED';

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {app.fullName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isWaiting
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {isWaiting ? 'Waiting' : app.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                      <span>{app.rollNo}</span>
                      <span>{app.branch?.substring(0, 24)}...</span>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      Submitted: {app.submittedAtFormatted || 'Recent'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Full A-to-Z Application Form Review */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Application Header & Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedApp.fullName}
                    </h2>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300">
                      {selectedApp.rollNo}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    Application ID: {selectedApp.id} • {selectedApp.submittedAtFormatted}
                  </span>
                </div>

                {selectedApp.status === 'WAITING_APPROVAL' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRejectApplication(selectedApp)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveApplication(selectedApp)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approve &amp; Activate</span>
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedApp.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {selectedApp.status === 'APPROVED' ? 'Active & Approved' : 'Rejected'}
                  </span>
                )}
              </div>

              {/* Form Details Preview - 3 Structured Sections */}
              <div className="space-y-5 text-xs">
                
                {/* 1. Identity & Contact */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Personal Profile &amp; Contact</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Full Name:</span>
                      <strong className="text-slate-900">{selectedApp.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Email Address:</span>
                      <strong className="text-slate-900 truncate block font-mono">{selectedApp.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Phone / WhatsApp:</span>
                      <strong className="text-slate-900">{selectedApp.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Date of Birth:</span>
                      <strong className="text-slate-900">{selectedApp.dob || 'Not provided'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Gender:</span>
                      <strong className="text-slate-900">{selectedApp.gender || 'Male'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Blood Group:</span>
                      <strong className="text-slate-900">{selectedApp.bloodGroup || 'O+'}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. Academic Enrollment */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                    <span>Academic Program Allocation</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Degree &amp; Program:</span>
                      <strong className="text-slate-900">{selectedApp.programName || selectedApp.branch}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Department:</span>
                      <strong className="text-slate-900">{selectedApp.department}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Assigned Roll No:</span>
                      <strong className="text-slate-900 font-mono">{selectedApp.rollNo}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Semester &amp; Section:</span>
                      <strong className="text-slate-900">{selectedApp.semester} • {selectedApp.section}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Batch Year:</span>
                      <strong className="text-slate-900">{selectedApp.admissionBatch}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Guardian & Residential */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-600" />
                    <span>Guardian &amp; Permanent Address</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Parent / Guardian:</span>
                      <strong className="text-slate-900">{selectedApp.guardianName || 'N/A'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Emergency Contact:</span>
                      <strong className="text-slate-900">{selectedApp.guardianPhone || 'N/A'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block text-[11px]">Permanent Address:</span>
                      <strong className="text-slate-900">{selectedApp.address || 'Address provided upon admission registration'}</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              Select an enrollment application on the left to review form details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

