import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  UserCheck,
  AlertCircle,
  FileCheck2,
  LogOut,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAcademic } from '../context/AcademicContext';

export default function StudentOnboardingStateView({ profile, onRefreshProfile }) {
  const { session, handleLogout } = useAcademic();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const status = profile?.status || 'pending_approval';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshProfile) {
      await onRefreshProfile();
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending_approval':
        return {
          badge: 'Registration Pending Review',
          badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-300',
          icon: Clock,
          iconBg: 'bg-amber-100 text-amber-700',
          title: 'Your Account is Awaiting Department Approval',
          description:
            'Thank you for registering with the University Attendance Portal. Your identity and email verification have been recorded. An assigned faculty member or department administrator must review and accept your registration before college details can be submitted.',
          stepNumber: 1,
          nextStepText: 'Department review in progress. You will receive access to submit your program & roll number once accepted.'
        };
      case 'details_pending_review':
        return {
          badge: 'Academic Details Under Verification',
          badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-300',
          icon: FileCheck2,
          iconBg: 'bg-indigo-100 text-indigo-700',
          title: 'Academic Details Submitted & Under Review',
          description:
            'You have submitted your enrollment records (program, semester, roll number, and emergency details). The academic registry is validating your enrollment against the university admissions database.',
          stepNumber: 3,
          nextStepText: 'Once verified by your faculty coordinator, your student attendance dashboard, timetable, and leave requests will unlock automatically.'
        };
      case 'rejected':
        return {
          badge: 'Registration Rejected',
          badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-300',
          icon: AlertCircle,
          iconBg: 'bg-rose-100 text-rose-700',
          title: 'Registration Request Not Approved',
          description:
            profile?.review_notes ||
            'Your registration or enrollment details were not accepted by the department. Please verify your college credentials or contact the dean of academic affairs.',
          stepNumber: 0,
          nextStepText: 'Contact your college admissions office or department head to resolve discrepancies.'
        };
      case 'suspended':
        return {
          badge: 'Account Suspended',
          badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-300',
          icon: AlertCircle,
          iconBg: 'bg-rose-100 text-rose-700',
          title: 'Institutional Access Temporarily Suspended',
          description:
            profile?.review_notes ||
            'This account has been flagged or suspended by the university administration. Please report to the administrative office.',
          stepNumber: 0,
          nextStepText: 'Administrative audit required.'
        };
      default:
        return {
          badge: 'Review in Progress',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Clock,
          iconBg: 'bg-slate-100 text-slate-700',
          title: 'Account Status Under Review',
          description: 'Your account is being processed by the college management system.',
          stepNumber: 1,
          nextStepText: 'Please wait while administrators complete verification.'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-xl w-full">
        {/* University Header Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
              Indian Institute of Technology &amp; Science
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Autonomous College Attendance &amp; Academic Governance System
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${config.badgeColor}`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {config.badge}
            </span>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : 'Refresh Status'}</span>
            </button>
          </div>

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${config.iconBg} shadow-sm`}>
              <StatusIcon className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {config.title}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              {config.description}
            </p>
          </div>

          {/* State Timeline Progress */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Onboarding Progress
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mb-1 shadow-xs">
                  ✓
                </div>
                <span className="text-[10px] font-bold text-slate-800">Email OTP</span>
                <span className="text-[9px] text-emerald-600 font-medium">Verified</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    status === 'pending_approval'
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                      : status === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-white'
                  }`}
                >
                  {status === 'pending_approval' ? '2' : status === 'rejected' ? '✕' : '✓'}
                </div>
                <span className="text-[10px] font-bold text-slate-800">Dept Review</span>
                <span
                  className={`text-[9px] font-medium ${
                    status === 'pending_approval'
                      ? 'text-amber-600'
                      : status === 'rejected'
                      ? 'text-rose-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {status === 'pending_approval' ? 'In Review' : status === 'rejected' ? 'Rejected' : 'Approved'}
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    status === 'details_pending_review'
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                      : status === 'active'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {status === 'active' ? '✓' : '3'}
                </div>
                <span className="text-[10px] font-bold text-slate-800">Academics</span>
                <span
                  className={`text-[9px] font-medium ${
                    status === 'details_pending_review'
                      ? 'text-indigo-600'
                      : status === 'active'
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  }`}
                >
                  {status === 'details_pending_review' ? 'Verifying' : status === 'active' ? 'Verified' : 'Pending'}
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  4
                </div>
                <span className="text-[10px] font-bold text-slate-800">Dashboard</span>
                <span className="text-[9px] text-slate-400 font-medium">
                  {status === 'active' ? 'Active' : 'Locked'}
                </span>
              </div>
            </div>
          </div>

          {/* User & Session Details */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Registered Email:</span>
              <strong className="text-slate-800 font-mono">{session?.user?.email || profile?.email}</strong>
            </div>
            {profile?.full_name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Full Name:</span>
                <strong className="text-slate-800">{profile.full_name}</strong>
              </div>
            )}
            {profile?.department && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <strong className="text-slate-800">{profile.department}</strong>
              </div>
            )}
            {profile?.program_name && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Program:</span>
                <strong className="text-slate-800">{profile.program_name}</strong>
              </div>
            )}
            {profile?.roll_no && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Roll No:</span>
                <strong className="text-slate-800 font-mono">{profile.roll_no}</strong>
              </div>
            )}
            {profile?.review_notes && status === 'rejected' && (
              <div className="pt-2 border-t border-slate-200/60 text-rose-700">
                <span className="font-bold block">Reviewer Feedback:</span>
                <p className="mt-0.5 italic">{profile.review_notes}</p>
              </div>
            )}
          </div>

          {/* Next Steps Note */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{config.nextStepText}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={async () => {
                await handleLogout();
                window.location.href = '/login';
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

            <span className="text-[11px] text-slate-400 font-mono">
              Status ID: {status}
            </span>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="text-center text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Protected by Institutional Row-Level Security &amp; Supabase Verification</span>
        </p>
      </div>
    </div>
  );
}
