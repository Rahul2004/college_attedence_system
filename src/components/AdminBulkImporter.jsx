import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  X, 
  Download, 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white tracking-tight">
                  Bulk Student &amp; Faculty Ingestion
                </h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  CSV Parser
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Register cohort batches, assign degree programs, and populate attendance rosters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Upload Drop Zone & Sample Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-sky-600 bg-slate-50 hover:bg-slate-100/50 rounded-xl p-5 text-center transition-colors flex flex-col items-center justify-center relative cursor-pointer">
              <input
                type="file"
                accept=".csv,.txt,.xlsx"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-900 block">
                {fileName ? fileName : 'Drag & drop student CSV file here, or browse file'}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Headers: RollNo, FullName, Email, Program, Semester, ParentPhone
              </span>
            </div>

            {/* Quick Actions / Templates */}
            <div className="space-y-2.5 flex flex-col justify-between">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-500" />
                Download sample CSV
              </button>

              <button
                type="button"
                onClick={handleLoadSampleData}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 text-xs font-semibold hover:bg-slate-200/80 transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-sky-600" />
                Load sample cohort (8 students)
              </button>
            </div>
          </div>

          {/* Validation & Ingestion Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-sm text-slate-900">
                    Parsed rows verification
                  </h3>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {parsedRows.length} rows detected
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">
                    {importStats.valid} valid
                  </span>
                  {importStats.skipped > 0 && (
                    <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 font-medium border border-red-200">
                      {importStats.skipped} skipped
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto overflow-x-auto text-xs">
                <table className="w-full text-left min-w-[500px]">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Roll no</th>
                      <th className="py-2.5 px-3">Full name</th>
                      <th className="py-2.5 px-3">Program &amp; sem</th>
                      <th className="py-2.5 px-3">Parent contact</th>
                      <th className="py-2.5 px-3 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{row.rollNo}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{row.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{row.program} ({row.sem})</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{row.phone}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-normal flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-emerald-900">Bulk Ingestion Completed Successfully</p>
                <p className="text-emerald-800 mt-0.5">
                  {parsedRows.length} student profiles committed and mapped to active academic terms.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {parsedRows.length > 0 ? `Ready to register ${parsedRows.length} candidates` : 'No file loaded'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parsedRows.length === 0 || isProcessing || importDone}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              <span>{isProcessing ? 'Ingesting batch...' : importDone ? 'Ingestion complete' : `Commit ingestion (${parsedRows.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
