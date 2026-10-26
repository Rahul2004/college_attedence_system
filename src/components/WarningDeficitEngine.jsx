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

export default function WarningDeficitEngine({ students = [], onDispatchAlert, course, threshold = 75 }) {
  const [issuedNotices, setIssuedNotices] = useState({});
  const [activeWhatsAppStudent, setActiveWhatsAppStudent] = useState(null);
  const [isDebarmentNoticeOpen, setIsDebarmentNoticeOpen] = useState(false);

  const reqRatio = threshold / 100;
  const remRatio = 1 - reqRatio;

  const defaulters = (students || [])
    .map(student => {
      const isPresent = student?.todayStatus === 'PRESENT';
      const effectiveAttended = isPresent 
        ? (student?.attendedClasses || 0) + 1 
        : (student?.attendedClasses || 0);
      const effectiveTotal = (student?.totalClasses || 0) + 1;
      const percentage = effectiveTotal > 0 ? Number(((effectiveAttended / effectiveTotal) * 100).toFixed(1)) : 0;
      
      const recoveryNeeded = percentage < threshold 
        ? Math.max(0, Math.ceil((reqRatio * effectiveTotal - effectiveAttended) / (remRatio || 0.25)))
        : 0;

      return {
        ...student,
        effectiveAttended,
        effectiveTotal,
        percentage,
        recoveryNeeded,
        isDefaulter: percentage < threshold
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
    <div className="bg-white rounded-sk-card border border-outline p-5 sm:p-6 shadow-sk-card mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-outline gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sk-btn bg-coral-soft text-coral flex items-center justify-center border border-coral/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-ink font-display">
              Attendance Deficit &amp; Shortage Alerts
            </h2>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Track students below the 75% attendance criterion, project recovery requirements, and send advisories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsDebarmentNoticeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-sk-btn text-xs font-bold bg-ink text-white hover:bg-ink-muted transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-sun" />
            Official Debarment Circular (PDF)
          </button>

          <button
            type="button"
            onClick={handleIssueAllNotices}
            disabled={defaulters.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-sk-btn text-xs font-bold bg-coral text-white hover:bg-coral-deep transition-colors shadow-sm shadow-coral/20 disabled:opacity-50"
          >
            <BellRing className="w-3.5 h-3.5" />
            Send Advisory to All ({defaulters.length})
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="rounded-sk-card border border-coral/30 bg-coral-soft/50 p-4 shadow-xs">
          <span className="text-xs font-extrabold text-coral uppercase tracking-wider font-sans">
            Students with Shortage
          </span>
          <div className="text-3xl font-extrabold text-coral mt-1 font-display">
            {defaulters.length} Students
          </div>
          <p className="text-xs text-coral-deep mt-1 font-sans">
            Currently below required {threshold}% statutory minimum.
          </p>
        </div>

        <div className="rounded-sk-card border border-outline bg-surface-sunken p-4 shadow-xs">
          <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-sans">
            Mandated Threshold
          </span>
          <div className="text-3xl font-extrabold text-ink mt-1 font-display">
            {threshold.toFixed(1)}%
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Minimum required by University Ordinances (Institutional Policy).
          </p>
        </div>

        <div className="rounded-sk-card border border-outline bg-surface-sunken p-4 shadow-xs">
          <span className="text-xs font-bold text-ink-subtle uppercase tracking-wider font-sans">
            Highest Recovery Need
          </span>
          <div className="text-3xl font-extrabold text-ink mt-1 font-display">
            {defaulters.length > 0 ? Math.max(...defaulters.map(d => d.recoveryNeeded)) : 0} Lectures
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Maximum classes required to restore eligibility.
          </p>
        </div>
      </div>

      {/* Defaulter Table */}
      <div className="overflow-x-auto rounded-sk-card border border-outline">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-sunken text-ink font-bold text-xs border-b border-outline">
              <th className="py-3 px-4 w-28">Roll No</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4 text-center w-32">Current Rate</th>
              <th className="py-3 px-4 text-center w-40">Required Streak</th>
              <th className="py-3 px-4 text-center w-32">Status</th>
              <th className="py-3 px-4 text-center w-44">Notice Dispatch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline text-xs text-ink font-sans">
            {defaulters.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-leaf font-bold bg-leaf-soft/30">
                  Zero statutory defaulters! All cohort members meet the 75% attendance threshold.
                </td>
              </tr>
            ) : (
              defaulters.map((student) => {
                const notice = issuedNotices[student.id];

                return (
                  <tr key={student.id} className="hover:bg-coral-soft/30 bg-white transition-colors">
                    {/* Roll No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      {student.rollNo}
                    </td>

                    {/* Student Info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink">
                        {student.name}
                      </div>
                      <div className="text-xs text-ink-subtle">
                        {student.effectiveAttended} of {student.effectiveTotal} lectures attended
                      </div>
                    </td>

                    {/* Current % */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-coral">
                        {student.percentage}%
                      </span>
                      <div className="text-[10px] text-coral-deep font-semibold">
                        -{(threshold - student.percentage).toFixed(1)}% deficit
                      </div>
                    </td>

                    {/* Recovery Needed */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-block bg-surface-sunken border border-outline px-3 py-1 rounded-sk-btn">
                        <span className="font-bold text-ink text-xs">
                          +{student.recoveryNeeded}
                        </span>
                        <span className="text-[10px] block text-ink-subtle">
                          next lectures
                        </span>
                      </div>
                    </td>

                    {/* Debarment Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-coral-soft text-coral border border-coral/30">
                        Debarred
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveWhatsAppStudent(student)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-sk-btn text-xs font-bold bg-leaf-soft text-leaf-deep hover:bg-leaf/20 border border-leaf/30 transition-colors shadow-xs"
                          title="Send official attendance notice to parent WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-leaf" />
                          WhatsApp Alert
                        </button>

                        {notice ? (
                          <span className="text-[10px] font-bold text-leaf-deep">
                            ✓ Ref: {notice.noticeId}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleIssueNotice(student.id)}
                            className="text-[10px] text-ink-subtle hover:text-ink underline"
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
          threshold={threshold}
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
          threshold={threshold}
          onClose={() => setIsDebarmentNoticeOpen(false)}
        />
      )}
    </div>
  );
}
