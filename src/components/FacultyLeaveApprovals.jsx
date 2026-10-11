import React, { useState } from 'react';
import {
  FileText,
  Check,
  X,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Search,
  Filter
} from 'lucide-react';

export default function FacultyLeaveApprovals({ activeCourse }) {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LV-8821',
      studentName: 'Rahul Verma',
      rollNo: '0101CS221003',
      semester: 'Semester VI',
      category: 'Medical Sick Leave',
      subject: 'CS-602: Database Management Systems (DBMS)',
      dates: '12 Sep 2026 – 14 Sep 2026 (3 Days)',
      reason: 'Viral fever accompanied by severe dehydration. Govt. Hospital Doctor prescription verified.',
      status: 'PENDING',
      appliedOn: '15 Sep 2026',
      contact: '+91 97123 45678'
    },
    {
      id: 'LV-8824',
      studentName: 'Vikramaditya Singh',
      rollNo: '0101CS221007',
      semester: 'Semester VI',
      category: 'On-Duty (OD) Tech Fest',
      subject: 'CS-602: Database Management Systems (DBMS)',
      dates: '10 Oct 2026 – 11 Oct 2026 (2 Days)',
      reason: 'Participating in Smart India Hackathon (SIH) Grand Finale with University Dean permission.',
      status: 'PENDING',
      appliedOn: '08 Oct 2026',
      contact: '+91 94140 12345'
    },
    {
      id: 'LV-8819',
      studentName: 'Aditya Roy',
      rollNo: '0101CS221013',
      semester: 'Semester VI',
      category: 'Medical Sick Leave',
      subject: 'CS-602: Database Management Systems (DBMS)',
      dates: '02 Oct 2026 (1 Day)',
      reason: 'Food poisoning consultation at Apollo Clinic.',
      status: 'APPROVED',
      appliedOn: '03 Oct 2026',
      contact: '+91 98310 55443'
    }
  ]);

  const [toastMessage, setToastMessage] = useState('');

  const handleAction = (id, newStatus) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    }));

    setToastMessage(`Leave request ${id} marked as ${newStatus}. Attendance exemption recorded.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Faculty Leave &amp; Medical Excuse Approvals
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {pendingCount} Pending Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review student absence applications for {activeCourse?.code || 'CS-602'} ({activeCourse?.name || 'DBMS'}). Approved leaves grant statutory duty/medical credit.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* List of Applications */}
      <div className="space-y-4">
        {leaveRequests.map(req => {
          const isPending = req.status === 'PENDING';
          const isApproved = req.status === 'APPROVED';
          const isRejected = req.status === 'REJECTED';

          return (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all hover:shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                    {req.studentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {req.studentName}
                      </h3>
                      <span className="font-mono text-xs text-slate-500">
                        ({req.rollNo})
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {req.semester} • Phone: {req.contact}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isRejected
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="py-3 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {req.category}
                  </span>
                  <span className="text-slate-500">&bull; Applied on {req.appliedOn}</span>
                </div>
                <p>
                  <strong className="text-slate-900">Requested Dates:</strong> {req.dates}
                </p>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                  "{req.reason}"
                </p>
              </div>

              {/* Action Buttons */}
              {isPending && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'REJECTED')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject Application
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(req.id, 'APPROVED')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve & Grant Duty Attendance
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
