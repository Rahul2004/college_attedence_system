import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  FileText, 
  Check, 
  ExternalLink 
} from 'lucide-react';

export default function ExportReporting({ students = [], course, threshold = 75 }) {
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const reqRatio = threshold / 100;
  const remRatio = 1 - reqRatio;

  const handleExportRosterCSV = () => {
    const headers = [
      "Roll No",
      "Student Name",
      "Today Status",
      "Attended Classes",
      "Total Conducted",
      "Effective Rate (%)",
      "Standing",
      "Recovery Needed"
    ];

    const rows = (students || []).map(student => {
      const isPresent = student?.todayStatus === 'PRESENT';
      const effectiveAttended = isPresent ? (student?.attendedClasses || 0) + 1 : (student?.attendedClasses || 0);
      const effectiveTotal = (student?.totalClasses || 0) + 1;
      const percentage = effectiveTotal > 0 ? ((effectiveAttended / effectiveTotal) * 100).toFixed(1) : '0.0';
      const isDefaulter = Number(percentage) < threshold;
      const recoveryNeeded = isDefaulter 
        ? Math.max(0, Math.ceil((reqRatio * effectiveTotal - effectiveAttended) / (remRatio || 0.25))) 
        : 0;

      return [
        `"${student?.rollNo || 'N/A'}"`,
        `"${student?.name || 'Student'}"`,
        `"${student?.todayStatus || 'ABSENT'}"`,
        effectiveAttended,
        effectiveTotal,
        `"${percentage}%"`,
        isDefaulter ? `"DEFICIT (<${threshold}%)"` : '"COMPLIANT"',
        recoveryNeeded
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const courseCode = course?.code || 'CS-602';
    triggerDownload(csvContent, `Attendance_Roster_${courseCode}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportDefaultersCSV = () => {
    const headers = [
      "Notice Ref",
      "Roll No",
      "Student Name",
      "Course Code",
      "Attendance %",
      "Threshold %",
      "Deficit %",
      "Required Lectures"
    ];

    const defaulters = (students || []).filter(student => {
      const isPresent = student?.todayStatus === 'PRESENT';
      const effectiveAttended = isPresent ? (student?.attendedClasses || 0) + 1 : (student?.attendedClasses || 0);
      const effectiveTotal = (student?.totalClasses || 0) + 1;
      const percentage = effectiveTotal > 0 ? (effectiveAttended / effectiveTotal) * 100 : 0;
      return percentage < threshold;
    });

    const courseCode = course?.code || 'CS-602';

    const rows = defaulters.map((student, idx) => {
      const isPresent = student?.todayStatus === 'PRESENT';
      const effectiveAttended = isPresent ? (student?.attendedClasses || 0) + 1 : (student?.attendedClasses || 0);
      const effectiveTotal = (student?.totalClasses || 0) + 1;
      const percentage = effectiveTotal > 0 ? ((effectiveAttended / effectiveTotal) * 100).toFixed(1) : '0.0';
      const recoveryNeeded = Math.max(0, Math.ceil((reqRatio * effectiveTotal - effectiveAttended) / (remRatio || 0.25)));

      return [
        `"DEBAR-${1000 + idx}"`,
        `"${student?.rollNo || 'N/A'}"`,
        `"${student?.name || 'Student'}"`,
        `"${courseCode}"`,
        `"${percentage}%"`,
        `"${threshold.toFixed(1)}%"`,
        `"-${(threshold - Number(percentage)).toFixed(1)}%"`,
        recoveryNeeded
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    triggerDownload(csvContent, `Shortage_Notice_${courseCode}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Export Utilities & Administrative Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate compliance reports for academic audit teams and examination boards.
          </p>
        </div>

        {downloadSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Check className="w-4 h-4" />
            <span>Exported: {downloadSuccess}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Export 1: Daily Roster */}
        <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-3 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">
              Full Attendance Roster
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete student dataset with today's live presence, cumulative attendances, and rate calculations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportRosterCSV}
            className="mt-5 w-full py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-200 hover:border-slate-900 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Roster
          </button>
        </div>

        {/* Export 2: Defaulter Report */}
        <div className="border border-rose-200/80 rounded-xl p-5 bg-rose-50/30 hover:bg-rose-50/50 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center mb-3 shadow-xs">
              <FileText className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-semibold text-sm text-rose-900">
              Deficit & Debarment Report
            </h3>
            <p className="text-xs text-rose-700/80 mt-1 leading-relaxed">
              Targeted list of all students under 75.0% threshold with calculated recovery session burdens for formal advising.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportDefaultersCSV}
            className="mt-5 w-full py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            Download Defaulters CSV
          </button>
        </div>

        {/* Export 3: Print Sheet */}
        <div className="border border-slate-200/80 rounded-xl p-5 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center mb-3 shadow-xs">
              <Printer className="w-5 h-5 text-slate-700" />
            </div>
            <h3 className="font-semibold text-sm text-slate-900">
              Printer-Friendly Summary
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Clean verification document formatted for academic registrar sign-off and notice boards.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="mt-5 w-full py-2.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 shadow-sm shadow-slate-900/20"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Official Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
