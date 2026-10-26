import React from 'react';
import {
  X,
  Maximize2,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Check,
  GraduationCap,
  TrendingUp,
  FileText
} from 'lucide-react';
import AppleActivityRings from './ui/AppleActivityRings';
import AppleWalletStudentId from './ui/AppleWalletStudentId';

export default function StudentDetailCard({ student, onClose, onToggleStatus, threshold = 75 }) {
  if (!student) return null;

  const [activeTab, setActiveTab] = React.useState('rings');
  const reqRatio = threshold / 100;
  const remRatio = 1 - reqRatio;

  const isPresent = student?.todayStatus === 'PRESENT';
  const effectiveAttended = isPresent
    ? (student?.attendedClasses || 0) + 1
    : (student?.attendedClasses || 0);
  const effectiveTotal = (student?.totalClasses || 0) + 1;
  const percentage = effectiveTotal > 0 ? Number(((effectiveAttended / effectiveTotal) * 100).toFixed(1)) : 0;
  const isDefaulter = percentage < threshold;

  const recoveryClasses = isDefaulter
    ? Math.max(0, Math.ceil((reqRatio * effectiveTotal - effectiveAttended) / (remRatio || 0.25)))
    : 0;

  const safeMissable = !isDefaulter
    ? Math.max(0, Math.floor((effectiveAttended - reqRatio * effectiveTotal) / (reqRatio || 0.75)))
    : 0;

  return (
    <div className="bg-white/85 backdrop-blur-2xl rounded-[28px] border border-black/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.12)] p-6 text-[#1D1D1F] w-full animate-in fade-in zoom-in-95 duration-200">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-black/[0.04]">
            #{student.rollNo}
          </span>
          <span className="text-[11px] text-[#86868B] font-medium">Profile View</span>
        </div>

        <div className="flex items-center gap-1.5 text-[#86868B]">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-black/[0.04] rounded-full text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation tabs: Activity Rings | Digital Pass | Academic Standing */}
      <div className="flex items-center gap-2 p-1 bg-[#F5F5F7] rounded-full mt-4 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('rings')}
          className={`flex-1 py-1.5 rounded-full text-center transition-all ${
            activeTab === 'rings' ? 'bg-white shadow-xs text-[#1D1D1F] font-semibold' : 'text-[#86868B]'
          }`}
        >
          Activity Rings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`flex-1 py-1.5 rounded-full text-center transition-all ${
            activeTab === 'wallet' ? 'bg-white shadow-xs text-[#1D1D1F] font-semibold' : 'text-[#86868B]'
          }`}
        >
          Digital Pass
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-1.5 rounded-full text-center transition-all ${
            activeTab === 'stats' ? 'bg-white shadow-xs text-[#1D1D1F] font-semibold' : 'text-[#86868B]'
          }`}
        >
          Details
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'rings' && (
        <div className="py-4">
          <AppleActivityRings
            theoryPercent={percentage}
            labPercent={Math.min(100, Math.round(percentage * 1.05))}
            punctualityPercent={Math.max(60, Math.round(percentage * 0.95))}
            size={130}
          />
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="flex justify-center py-2">
          <AppleWalletStudentId
            student={{
              name: student.name,
              rollNo: student.rollNo,
              department: student.department || 'Computer Science & Engineering',
              attendance: percentage
            }}
            threshold={threshold}
          />
        </div>
      )}

      {/* Stats Breakdown */}
      <div className="py-3.5 space-y-3">
        {/* Attendance Percentage progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Cumulative Rate</span>
            <span className={`font-mono font-bold ${isDefaulter ? 'text-rose-600' : 'text-slate-900'}`}>
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${isDefaulter ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Turnout summary item (like items list in reference) */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Lectures Attended:</span>
            <span className="font-semibold text-slate-800">{effectiveAttended}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Total Conducted:</span>
            <span className="font-semibold text-slate-800">{effectiveTotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Current Status:</span>
            <span className={`font-semibold ${isPresent ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isPresent ? 'Marked Present' : 'Marked Absent'}
            </span>
          </div>
        </div>

        {/* Shortage or Buffer Guidance */}
        <div className={`p-3 rounded-xl border text-xs ${
          isDefaulter
            ? 'bg-rose-50/70 border-rose-200/80 text-rose-800'
            : 'bg-emerald-50/70 border-emerald-200/80 text-emerald-800'
        }`}>
          {isDefaulter ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Shortage Alert: </span>
                Must attend next <strong>{recoveryClasses} lectures</strong> consecutively to reach 75%.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Eligible: </span>
                Buffer intact. Safe margin is {safeMissable} class{safeMissable === 1 ? '' : 'es'}.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions (like Export | Duplicate | Print in Mate) */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => onToggleStatus && onToggleStatus(student.id, isPresent ? 'ABSENT' : 'PRESENT')}
          className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
            isPresent
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {isPresent ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          {isPresent ? 'Toggle Absent' : 'Toggle Present'}
        </button>

        <span className="font-mono text-slate-400 text-[11px]">
          ID: {student.id}
        </span>
      </div>
    </div>
  );
}
