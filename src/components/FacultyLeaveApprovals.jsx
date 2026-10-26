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

export default function FacultyLeaveApprovals({ 
  activeCourse, 
  leaves: propLeaves, 
  onUpdateLeaveStatus, 
  disputes: propDisputes, 
  onResolveDispute 
}) {
  const [activeApprovalTab, setActiveApprovalTab] = useState('leaves'); // 'leaves' | 'disputes'
  const [internalLeaves, setInternalLeaves] = useState([
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
      studentName: 'Aarav Sharma',
      rollNo: '0101CS221001',
      semester: 'Semester VI',
      category: 'Medical Sick Leave',
      subject: 'CS-602: Database Management Systems (DBMS)',
      dates: '02 Oct 2026 (1 Day)',
      reason: 'Food poisoning consultation at Apollo Clinic.',
      status: 'APPROVED',
      appliedOn: '03 Oct 2026',
      contact: '+91 98765 43210'
    }
  ]);

  const [toastMessage, setToastMessage] = useState('');

  const leaveRequests = propLeaves || internalLeaves;
  const disputeRequests = propDisputes || [];

  const handleAction = (id, newStatus) => {
    if (onUpdateLeaveStatus) {
      onUpdateLeaveStatus(id, newStatus, activeCourse?.faculty || 'Prof. Rajesh Verma');
    } else {
      setInternalLeaves(prev => prev.map(req => {
        if (req.id === id) {
          return { ...req, status: newStatus };
        }
        return req;
      }));
    }

    setToastMessage(`Leave request ${id} marked as ${newStatus}. Attendance exemption recorded and synced.`);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'PENDING').length;
  const pendingDisputesCount = disputeRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Student Approvals &amp; Dispute Redressal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review student leave applications and audit disputed classroom attendance marks for {activeCourse?.code || 'CS-602'}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveApprovalTab('leaves')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeApprovalTab === 'leaves'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Leave Applications ({pendingLeavesCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveApprovalTab('disputes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeApprovalTab === 'disputes'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Attendance Disputes ({pendingDisputesCount})</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* DISPUTES REVIEW QUEUE */}
      {activeApprovalTab === 'disputes' && (
        <div className="space-y-4">
          {disputeRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Pending Attendance Disputes</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                All student attendance records are verified. Disputed absent marks submitted by students will appear here for audit.
              </p>
            </div>
          ) : (
            disputeRequests.map(disp => {
              const isPending = disp.status === 'PENDING';
              const isApproved = disp.status === 'APPROVED';
              const isRejected = disp.status === 'REJECTED';

              return (
                <div key={disp.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs">
                        {disp.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{disp.studentName}</h3>
                          <span className="font-mono text-xs text-slate-500">({disp.rollNo})</span>
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                            {disp.subjectCode}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Disputed Class Date: <strong className="text-slate-800">{disp.classDate}</strong> • Applied: {new Date(disp.appliedAt).toLocaleDateString()}
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
                        {disp.status}
                      </span>
                    </div>
                  </div>

                  <div className="py-3 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl mt-3 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">Student Explanation &amp; Claim:</span>
                    <p className="italic leading-relaxed">"{disp.reason}"</p>
                  </div>

                  {disp.reviewedBy && (
                    <div className="mt-2 text-[11px] text-slate-500 font-mono">
                      Decision by {disp.reviewedBy} at {new Date(disp.reviewedAt).toLocaleString()}
                    </div>
                  )}

                  {isPending && onResolveDispute && (
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => onResolveDispute(disp.id, 'REJECTED', 'Biometric log confirmed absent; claim unsubstantiated')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject Claim
                      </button>
                      <button
                        type="button"
                        onClick={() => onResolveDispute(disp.id, 'APPROVED', 'Verified by instructor; attendance adjusted to Present')}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve &amp; Mark Present
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* LEAVES REVIEW QUEUE */}
      {activeApprovalTab === 'leaves' && (
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
      )}
    </div>
  );
}
