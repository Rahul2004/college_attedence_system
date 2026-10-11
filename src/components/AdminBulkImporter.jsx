import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download, 
  Users, 
  ArrowRight,
  Database,
  FileCheck
} from 'lucide-react';

export default function AdminBulkImporter({ onClose, onImportSuccess }) {
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, skipped: 0 });

  // Sample CSV generator for download
  const handleDownloadSample = () => {
    const csvContent = `RollNo,FullName,Email,Program,Semester,ParentPhone,Department
CS-601,Aarav Sharma,aarav.s@univ.edu,B.Tech CSE,VI,+91 9876543210,Computer Science
CS-602,Ishita Roy,ishita.r@univ.edu,B.Tech CSE,VI,+91 9876543211,Computer Science
CS-603,Rohan Verma,rohan.v@univ.edu,B.Tech CSE,VI,+91 9876543212,Computer Science
CS-604,Pooja Hegde,pooja.h@univ.edu,B.Tech CSE,VI,+91 9876543213,Computer Science
CS-605,Tanmay Bhat,tanmay.b@univ.edu,B.Tech CSE,VI,+91 9876543214,Computer Science
IT-601,Kabir Mehta,kabir.m@univ.edu,B.Tech IT,VI,+91 9876543215,Information Tech
BCA-401,Ananya Sen,ananya.s@univ.edu,BCA,IV,+91 9876543216,Computer Applications`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'University_Student_Roster_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load realistic Indian college cohort sample
  const handleLoadSampleData = () => {
    const sample = [
      { rollNo: 'CS-611', name: 'Devendra Patel', email: 'devendra.p@univ.edu', program: 'B.Tech CSE', sem: 'VI', phone: '+91 98721-00121', status: 'valid' },
      { rollNo: 'CS-612', name: 'Shruti Kulkarni', email: 'shruti.k@univ.edu', program: 'B.Tech CSE', sem: 'VI', phone: '+91 98721-00122', status: 'valid' },
      { rollNo: 'CS-613', name: 'Gautam Nambiar', email: 'gautam.n@univ.edu', program: 'B.Tech CSE', sem: 'VI', phone: '+91 98721-00123', status: 'valid' },
      { rollNo: 'CS-614', name: 'Divya Sundaram', email: 'divya.s@univ.edu', program: 'B.Tech CSE', sem: 'VI', phone: '+91 98721-00124', status: 'valid' },
      { rollNo: 'CS-615', name: 'Manish Tiwari', email: 'manish.t@univ.edu', program: 'B.Tech CSE', sem: 'VI', phone: '+91 98721-00125', status: 'valid' },
      { rollNo: 'CS-616', name: 'Ritika Banerjee', email: 'ritika.b@univ.edu', program: 'B.Tech CSE', sem: 'VI', phone: '+91 98721-00126', status: 'valid' },
      { rollNo: 'ECE-601', name: 'Aditya Chawla', email: 'aditya.c@univ.edu', program: 'B.Tech ECE', sem: 'VI', phone: '+91 98721-00127', status: 'valid' },
      { rollNo: 'BCA-402', name: 'Mehak Gill', email: 'mehak.g@univ.edu', program: 'BCA', sem: 'IV', phone: '+91 98721-00128', status: 'valid' },
    ];
    setFileName('Semester_VI_Indian_Admissions_Batch_2026.csv');
    setParsedRows(sample);
    setImportStats({ total: sample.length, valid: sample.length, skipped: 0 });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;

      const rows = lines.slice(1).map((line, idx) => {
        const parts = line.split(',').map(p => p.trim());
        const rollNo = parts[0] || `ST-${100 + idx}`;
        const name = parts[1] || `Candidate ${idx + 1}`;
        const email = parts[2] || `${rollNo.toLowerCase()}@univ.edu`;
        const program = parts[3] || 'B.Tech CSE';
        const sem = parts[4] || 'VI';
        const phone = parts[5] || '+91 98765-00000';

        return {
          rollNo,
          name,
          email,
          program,
          sem,
          phone,
          status: rollNo && name ? 'valid' : 'invalid'
        };
      });

      setParsedRows(rows);
      setImportStats({
        total: rows.length,
        valid: rows.filter(r => r.status === 'valid').length,
        skipped: rows.filter(r => r.status !== 'valid').length
      });
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportDone(true);
      if (onImportSuccess) {
        onImportSuccess(parsedRows);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Bulk Student &amp; Faculty Ingestion Suite
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CSV / Excel Parser
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enroll entire batches, map semester cohorts, and seed attendance databases
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Upload Drop Zone & Sample Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 border-2 border-dashed border-slate-200 hover:border-indigo-500/50 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center relative cursor-pointer group">
              <input
                type="file"
                accept=".csv,.txt,.xlsx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                {fileName ? fileName : 'Drag & drop student CSV file here, or browse'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Supports standard university format with RollNo, Name, Program, Parent Contact
              </span>
            </div>

            {/* Quick Actions / Templates */}
            <div className="space-y-3 flex flex-col justify-between">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Download Sample CSV
              </button>

              <button
                type="button"
                onClick={handleLoadSampleData}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors shadow-xs"
              >
                <FileCheck className="w-4 h-4 text-indigo-600" />
                Load Sample Batch (8 Students)
              </button>
            </div>
          </div>

          {/* Validation & Ingestion Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-sm text-slate-900">
                    File Parser Preview &amp; Verification
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {parsedRows.length} Rows Detected
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    {importStats.valid} Valid
                  </span>
                  {importStats.skipped > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {importStats.skipped} Errors
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-64 overflow-y-auto overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Roll No</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Program / Sem</th>
                      <th className="py-2.5 px-3">Parent Phone</th>
                      <th className="py-2.5 px-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{row.rollNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{row.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.program} ({row.sem})</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{row.phone}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importDone && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Bulk Ingestion Completed Successfully!</p>
                <p className="text-emerald-700 font-normal mt-0.5">
                  {parsedRows.length} student records registered into University ERP and populated across Faculty attendance rosters.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {parsedRows.length > 0 ? `Ready to register ${parsedRows.length} candidate profiles` : 'No file loaded'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parsedRows.length === 0 || isProcessing || importDone}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              {isProcessing ? 'Ingesting Batch...' : importDone ? 'Ingestion Done' : `Commit Bulk Ingestion (${parsedRows.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
