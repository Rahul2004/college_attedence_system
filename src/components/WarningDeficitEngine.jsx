import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Send, 
  CheckCircle, 
  ShieldAlert, 
  BellRing,
  HelpCircle,
  FileWarning,
  MessageSquare,
  FileText,
  Printer
} from 'lucide-react';
import WhatsAppAlertModal from './WhatsAppAlertModal';
import AdminDebarmentNoticeModal from './AdminDebarmentNoticeModal';

export default function WarningDeficitEngine({ students, onDispatchAlert, course }) {
  const [issuedNotices, setIssuedNotices] = useState({});
  const [activeWhatsAppStudent, setActiveWhatsAppStudent] = useState(null);
  const [isDebarmentNoticeOpen, setIsDebarmentNoticeOpen] = useState(false);

  const defaulters = students
    .map(student => {
      const isPresent = student.todayStatus === 'PRESENT';
      const effectiveAttended = isPresent 
        ? student.attendedClasses + 1 
        : student.attendedClasses;
      const effectiveTotal = student.totalClasses + 1;
      const percentage = Number(((effectiveAttended / effectiveTotal) * 100).toFixed(1));
      
      const recoveryNeeded = percentage < 75.0 
        ? Math.max(0, Math.ceil((0.75 * effectiveTotal - effectiveAttended) / 0.25))
        : 0;

      return {
        ...student,
        effectiveAttended,
        effectiveTotal,
        percentage,
        recoveryNeeded,
        isDefaulter: percentage < 75.0
      };
    })
    .filter(s => s.isDefaulter)
    .sort((a, b) => a.percentage - b.percentage);

  const handleIssueNotice = (studentId) => {
    setIssuedNotices(prev => ({
      ...prev,
      [studentId]: {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        noticeId: `WARN-${Math.floor(1000 + Math.random() * 9000)}`
      }
    }));
    if (onDispatchAlert) {
      onDispatchAlert(studentId);
    }
  };

  const handleIssueAllNotices = () => {
    const updated = { ...issuedNotices };
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    defaulters.forEach((d, idx) => {
      if (!updated[d.id]) {
        updated[d.id] = {
          timestamp: now,
          noticeId: `WARN-${3000 + idx}`
        };
      }
    });
    setIssuedNotices(updated);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Attendance Deficit &amp; Shortage Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track students below the 75% attendance criterion, project recovery requirements, and send advisories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsDebarmentNoticeOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            Official Debarment Circular (PDF)
          </button>

          <button
            type="button"
            onClick={handleIssueAllNotices}
            disabled={defaulters.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20 disabled:opacity-50"
          >
            <BellRing className="w-3.5 h-3.5" />
            Send Advisory to All ({defaulters.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            Students with Shortage
          </span>
          <div className="text-3xl font-extrabold text-rose-700 mt-1">
            {defaulters.length} Students
          </div>
          <p className="text-xs text-rose-600/80 mt-1">
            Currently below required 75% minimum.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Mandated Threshold
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            75.0%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Minimum required by University Ordinances.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Highest Recovery Need
          </span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {defaulters.length > 0 ? Math.max(...defaulters.map(d => d.recoveryNeeded)) : 0} Lectures
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maximum classes required to restore eligibility.
          </p>
        </div>
      </div>

      {/* Defaulter Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <th className="py-3 px-4 w-28">Roll No</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4 text-center w-32">Current Rate</th>
              <th className="py-3 px-4 text-center w-40">Required Streak</th>
              <th className="py-3 px-4 text-center w-32">Status</th>
              <th className="py-3 px-4 text-center w-44">Notice Dispatch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {defaulters.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-emerald-600 bg-emerald-50/30 font-semibold">
                  Zero statutory defaulters! All cohort members meet the 75% attendance threshold.
                </td>
              </tr>
            ) : (
              defaulters.map((student) => {
                const notice = issuedNotices[student.id];

                return (
                  <tr key={student.id} className="hover:bg-rose-50/30 bg-white transition-colors">
                    {/* Roll No */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {student.rollNo}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {student.effectiveAttended} of {student.effectiveTotal} lectures attended
                      </div>
                    </td>

                    {/* Current % */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-rose-600">
                        {student.percentage}%
                      </span>
                      <div className="text-[10px] text-rose-500 font-medium">
                        -{(75.0 - student.percentage).toFixed(1)}% deficit
                      </div>
                    </td>

                    {/* Recovery Needed */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        <span className="font-bold text-slate-800 text-xs">
                          +{student.recoveryNeeded}
                        </span>
                        <span className="text-[10px] block text-slate-400">
                          next lectures
                        </span>
                      </div>
                    </td>

                    {/* Debarment Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Debarred
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveWhatsAppStudent(student)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs"
                          title="Send official attendance notice to parent WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          WhatsApp Alert
                        </button>

                        {notice ? (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            ✓ Ref: {notice.noticeId}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleIssueNotice(student.id)}
                            className="text-[10px] text-slate-500 hover:text-slate-800 underline"
                          >
                            Mark ERP Notice Dispatched
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* WhatsApp Modal */}
      {activeWhatsAppStudent && (
        <WhatsAppAlertModal
          defaulter={activeWhatsAppStudent}
          course={course}
          onClose={() => setActiveWhatsAppStudent(null)}
          onDispatched={(stId) => {
            handleIssueNotice(stId);
          }}
        />
      )}

      {/* Official Exam Debarment Notice Modal */}
      {isDebarmentNoticeOpen && (
        <AdminDebarmentNoticeModal
          defaulters={defaulters}
          course={course}
          onClose={() => setIsDebarmentNoticeOpen(false)}
        />
      )}
    </div>
  );
}
