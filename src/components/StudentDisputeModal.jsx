import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Send, 
  Calendar, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  X, 
  FileText, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { saveDisputesToCloud, recordAuditLog } from '../lib/syncService';

export default function StudentDisputeModal({ 
  isOpen, 
  onClose, 
  student, 
  subjects = [], 
  onDisputeSubmitted, 
  setToast 
}) {
  if (!isOpen) return null;

  const [subjectCode, setSubjectCode] = useState(subjects[0]?.code || 'CS-602');
  const [classDate, setClassDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedSubject = subjects.find(s => s.code === subjectCode) || subjects[0] || { name: 'Subject' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Please explain why this attendance record requires review.');
      return;
    }
    if (reason.trim().length < 15) {
      setErrorMsg('Please provide a detailed explanation (minimum 15 characters).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const newDispute = {
      id: `disp-${Date.now()}`,
      studentId: student?.id || 'stu-student',
      studentName: student?.name || 'Aarav Sharma',
      rollNo: student?.rollNo || 'CS-601',
      subjectCode,
      subjectName: selectedSubject.name,
      classDate,
      reason: reason.trim(),
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
      reviewedBy: null,
      reviewedAt: null,
      resolutionNote: null
    };

    try {
      const existing = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('college_attendance_disputes') || '[]') : [];
      const updated = [newDispute, ...existing];
      if (typeof window !== 'undefined') {
        localStorage.setItem('college_attendance_disputes', JSON.stringify(updated));
      }

      await saveDisputesToCloud(updated);
      await recordAuditLog(
        student?.email || `${student?.rollNo?.toLowerCase()}@univ.edu`,
        'student',
        'ATTENDANCE_DISPUTE_FILED',
        `Dispute filed for ${subjectCode} on ${classDate}`
      );

      if (onDisputeSubmitted) {
        onDisputeSubmitted(newDispute);
      }

      setSubmitted(true);
      if (setToast) {
        setToast({
          type: 'success',
          message: 'Correction request submitted! Forwarded to course faculty for audit.'
        });
        setTimeout(() => setToast({ type: null, message: '' }), 4000);
      }
    } catch {
      setErrorMsg('Failed to submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
              <AlertTriangle className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Attendance Correction Request
                </h2>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                  Official Audit
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Dispute an incorrect absent mark with course instructor
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-200 hover:text-white hover:bg-amber-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Dispute Request Lodged!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Your request for <strong>{subjectCode}</strong> on <strong>{classDate}</strong> has been logged. The instructor has been notified to audit the biometric register.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  University Policy: Attendance disputes must be lodged within 7 days of the lecture period. Submitting fraudulent claims is subject to disciplinary action.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Subject / Course
                  </label>
                  <select
                    value={subjectCode}
                    onChange={e => setSubjectCode(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition"
                  >
                    {subjects.map(s => (
                      <option key={s.code} value={s.code}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Classroom Lecture Date
                  </label>
                  <input
                    type="date"
                    value={classDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => setClassDate(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason &amp; Corroborating Details
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Present in LT-204, sat in 2nd row; biometric QR did not sync due to Wi-Fi timeout..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-amber-600 outline-none transition resize-none placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  Submit Dispute
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
