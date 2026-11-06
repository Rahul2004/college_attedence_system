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
    // Generate styled printable window with institutional letterhead
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const courseCode = course?.code || 'CS-602';
    const courseTitle = course?.title || 'Distributed Systems & Cloud Computing';
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const rowsHtml = (students || []).map(student => {
      const isPresent = student?.todayStatus === 'PRESENT';
      const effectiveAttended = isPresent ? (student?.attendedClasses || 0) + 1 : (student?.attendedClasses || 0);
      const effectiveTotal = (student?.totalClasses || 0) + 1;
      const percentage = effectiveTotal > 0 ? ((effectiveAttended / effectiveTotal) * 100).toFixed(1) : '0.0';
      const isDefaulter = Number(percentage) < threshold;

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #1e293b;">
          <td style="padding: 8px 12px; font-weight: 600;">${student?.rollNo || 'N/A'}</td>
          <td style="padding: 8px 12px;">${student?.name || 'Student'}</td>
          <td style="padding: 8px 12px; text-align: center;">${student?.todayStatus || 'ABSENT'}</td>
          <td style="padding: 8px 12px; text-align: center;">${effectiveAttended}/${effectiveTotal}</td>
          <td style="padding: 8px 12px; text-align: right; font-weight: bold; color: ${isDefaulter ? '#b91c1c' : '#047857'};">${percentage}%</td>
          <td style="padding: 8px 12px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; background: ${isDefaulter ? '#fee2e2; color: #991b1b;' : '#d1fae5; color: #065f46;'}">
              ${isDefaulter ? 'SHORTAGE (<' + threshold + '%)' : 'ELIGIBLE'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Institutional Attendance Sheet - ${courseCode}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header-box { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-start; }
            .badge { display: inline-block; background: #0f172a; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; }
            .sign-box { margin-top: 50px; display: flex; justify-content: space-between; padding-top: 30px; font-size: 12px; font-weight: 600; color: #334155; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <div>
              <span class="badge">Official Institutional Circular</span>
              <h1 style="margin: 8px 0 4px 0; font-size: 22px; font-weight: 800;">UNIVERSITY ATTENDANCE & EXAMINATION AUDIT</h1>
              <p style="margin: 0; font-size: 13px; color: #64748b;">Department of Computer Science & Engineering • Academic Year 2026</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #475569;">
              <p style="margin: 0;"><strong>Date:</strong> ${today}</p>
              <p style="margin: 4px 0 0 0;"><strong>Course:</strong> ${courseCode} (${courseTitle})</p>
              <p style="margin: 4px 0 0 0;"><strong>Min Required:</strong> ${threshold.toFixed(1)}%</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Full Name</th>
                <th style="text-align: center;">Today Status</th>
                <th style="text-align: center;">Attended/Total</th>
                <th style="text-align: right;">Cumulative %</th>
                <th style="text-align: center;">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="sign-box">
            <div>____________________________<br/>Course Instructor Signature</div>
            <div>____________________________<br/>Head of Department (HOD)</div>
            <div>____________________________<br/>Dean of Academic Affairs</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
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
    <div className="bg-white rounded-xl border border-slate-300 p-5 sm:p-6 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
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
        <div className="border border-slate-200/80 rounded-lg p-5 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between border border-slate-200">
          <div>
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center mb-3 shadow-xs">
              <FileSpreadsheet className="w-5 h-5 text-slate-800" />
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
            className="mt-5 w-full py-2.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-300 hover:border-slate-900 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV Roster
          </button>
        </div>

        {/* Export 2: Defaulter Report */}
        <div className="border border-rose-200 rounded-lg p-5 bg-rose-50/40 hover:bg-rose-50/70 transition-colors flex flex-col justify-between">
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
            className="mt-5 w-full py-2.5 text-xs font-semibold rounded-lg bg-rose-700 hover:bg-rose-800 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Download Defaulters CSV
          </button>
        </div>

        {/* Export 3: Print Sheet */}
        <div className="border border-slate-200/80 rounded-lg p-5 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between border border-slate-200">
          <div>
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-300 flex items-center justify-center mb-3 shadow-xs">
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
            className="mt-5 w-full py-2.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Official Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
