import React from 'react';
import { 
  Printer, 
  X, 
  ShieldAlert, 
  Download, 
  FileText, 
  Building2, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export default function AdminDebarmentNoticeModal({ 
  defaulters, 
  course, 
  threshold = 75,
  onClose 
}) {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const refNumber = `NITE/COE/EXAM-DEBAR/${new Date().getFullYear()}/04`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Toolbar (not printed) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Official Debarment Circular Generator
              </h2>
              <p className="text-[11px] text-slate-400">
                Statutory University Notice for Notice Board &amp; Examination Hall Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Circular Body */}
        <div className="p-8 sm:p-12 overflow-y-auto bg-white font-serif text-slate-900 space-y-6">
          {/* Institutional Letterhead */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
            <span className="text-[11px] font-sans font-bold tracking-widest text-slate-500 uppercase block">
              Affiliated to Dr. A.P.J. Abdul Kalam Technical University &bull; Approved by AICTE, New Delhi
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-sans">
              NATIONAL INSTITUTE OF TECHNOLOGY &amp; ENGINEERING
            </h1>
            <p className="text-xs text-slate-600 font-sans">
              Aryabhata Knowledge Campus, Knowledge Park III, Greater Noida &bull; Web: www.nite.edu.in
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-0.5 rounded-md bg-slate-900 text-white font-sans text-xs font-bold uppercase tracking-wider">
                Office of the Controller of Examinations &amp; Dean Academic Affairs
              </span>
            </div>
          </div>

          {/* Reference & Date Meta */}
          <div className="flex items-center justify-between text-xs font-sans font-semibold text-slate-700 pt-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-slate-400 mr-1.5">Ref No:</span>
              <span className="font-mono text-slate-900">{refNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 mr-1.5">Date:</span>
              <span className="text-slate-900">{currentDate}</span>
            </div>
          </div>

          {/* Circular Heading */}
          <div className="text-center py-2">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-rose-950 underline decoration-2 underline-offset-4 font-sans">
              CONSOLIDATED NOTIFICATION &bull; EXAM DEBARMENT LIST (SESSION 2025–2026)
            </h2>
            <p className="text-xs font-sans text-slate-600 font-semibold mt-1">
              Sub: Withholding of Admit Cards for candidates with Attendance Shortage &lt; {threshold.toFixed(1)}%
            </p>
          </div>

          {/* Legal Ordinance Citation */}
          <div className="text-xs text-slate-800 leading-relaxed space-y-2 font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p>
              In accordance with <strong>University Academic Ordinance Clause 4.2</strong> governing statutory minimum lecture attendance as regulated by Institutional Policy, candidates registered for the <strong>Even Semester Examinations 2026</strong> must have secured a minimum cumulative attendance of <strong>{threshold.toFixed(1)}%</strong> in aggregate and in each registered course.
            </p>
            <p>
              Following the final review by the Faculty Attendance Verification Board, the candidates specified below have failed to satisfy the statutory threshold. Consequently, their examination eligibility is <strong>WITHHELD</strong>, and they are <strong>DEBARRED</strong> from sitting in the upcoming End-Semester Theory and Practical examinations.
            </p>
          </div>

          {/* Official Debarment Table */}
          <div className="font-sans text-xs border border-slate-900 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-slate-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                  <th className="py-2.5 px-3">Univ. Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3 text-center">Classes Attended</th>
                  <th className="py-2.5 px-3 text-center">Attendance %</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {defaulters && defaulters.length > 0 ? (
                  defaulters.map((st, idx) => (
                    <tr key={st.id || idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{st.rollNo}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{st.name}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{course?.code || 'CS-602'}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">
                        {st.effectiveAttended || st.attendedClasses} / {st.effectiveTotal || st.totalClasses}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-rose-700">
                        {st.percentage}%
                      </td>
                      <td className="py-2 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300">
                          DEBARRED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-500 font-sans">
                      No debarred candidates recorded for this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Directives */}
          <div className="font-sans text-[11px] text-slate-600 space-y-1">
            <p><strong>Copy forwarded to:</strong></p>
            <ol className="list-decimal pl-5 space-y-0.5 text-slate-500">
              <li>Hon’ble Vice Chancellor &amp; Director General for kind information.</li>
              <li>Chief Proctor &amp; Head of Department (Computer Science &amp; Engineering).</li>
              <li>Central Examination Superintendent for immediate de-listing from examination attendance rosters.</li>
              <li>Notice Boards (Aryabhata Block, Ramanujan Complex, Central Library &amp; Student Portal).</li>
            </ol>
          </div>

          {/* Official Seals & Signatures */}
          <div className="pt-10 font-sans flex items-end justify-between text-xs text-slate-700">
            <div className="text-center space-y-1">
              <div className="w-24 h-12 border border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400 italic mb-2">
                [Office Stamp]
              </div>
              <span className="block font-bold text-slate-900">Dr. V. K. Aggarwal</span>
              <span className="block text-[10px] text-slate-500">Controller of Examinations</span>
            </div>

            <div className="text-center space-y-1">
              <div className="w-24 h-12 border border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400 italic mb-2">
                [Dean Seal]
              </div>
              <span className="block font-bold text-slate-900">Prof. (Dr.) Evelyn Carter</span>
              <span className="block text-[10px] text-slate-500">Dean of Academic Affairs</span>
            </div>

            <div className="text-center space-y-1">
              <div className="w-24 h-12 border border-slate-300 rounded-md flex items-center justify-center text-[10px] text-slate-400 italic mb-2">
                [Registrar Seal]
              </div>
              <span className="block font-bold text-slate-900">Dr. M. S. Raghav</span>
              <span className="block text-[10px] text-slate-500">Registrar, NITE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
