import React, { useState } from 'react';
import { 
  Check, 
  X, 
  AlertCircle, 
  Search, 
  CheckCheck, 
  Users2,
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function AttendanceGrid({ 
  students, 
  onToggleStatus, 
  onMarkAll,
  selectedDate,
  onDateChange,
  onCommit,
  isCommitting,
  hasPendingChanges
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'WARNING' | 'ABSENT'

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const effectiveAttended = student.todayStatus === 'PRESENT' 
      ? student.attendedClasses + 1 
      : student.attendedClasses;
    const effectiveTotal = student.totalClasses + 1;
    const percentage = (effectiveAttended / effectiveTotal) * 100;
    const isDefaulter = percentage < 75.0;

    if (!matchesSearch) return false;
    if (filter === 'WARNING') return isDefaulter;
    if (filter === 'ABSENT') return student.todayStatus === 'ABSENT';
    return true;
  });

  return (
    <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm mb-8">
      {/* Session Workflow Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Course Attendance Roster
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Active Lecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mark student presence below, then save the session to update records.
          </p>
        </div>

        {/* Date Selector & Session Commit */}
        <div className="flex items-center flex-wrap gap-2.5">
          {onDateChange && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-medium text-slate-500">Date:</span>
              <input
                id="session-date-picker"
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="text-xs font-medium bg-transparent text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {hasPendingChanges && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          )}

          {onCommit && (
            <button
              type="button"
              onClick={onCommit}
              disabled={isCommitting || !hasPendingChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
                isCommitting || !hasPendingChanges
                  ? 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
              }`}
            >
              {isCommitting ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : null}
              {isCommitting ? 'Saving Session...' : 'Save Attendance Session'}
            </button>
          )}
        </div>
      </div>

      {/* Roster Controls: Batch operations & Search/Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-4 pb-4">
        {/* Batch Operations */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onMarkAll('PRESENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/60"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => onMarkAll('ABSENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200/60"
          >
            <X className="w-3.5 h-3.5" />
            Mark All Absent
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/50">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('WARNING')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'WARNING'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              Shortage (&lt; 75%)
            </button>
            <button
              type="button"
              onClick={() => setFilter('ABSENT')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === 'ABSENT'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Absent
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/90 text-slate-600 font-semibold text-xs border-b border-slate-200">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-28">Roll No</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4 text-center w-48">Today's Presence</th>
              <th className="py-3 px-4 text-center w-40">Cumulative Rate</th>
              <th className="py-3 px-4 text-center w-36">Standing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No matching student records found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const isPresent = student.todayStatus === 'PRESENT';
                const effectiveAttended = isPresent 
                  ? student.attendedClasses + 1 
                  : student.attendedClasses;
                const effectiveTotal = student.totalClasses + 1;
                const percentage = Number(((effectiveAttended / effectiveTotal) * 100).toFixed(1));
                const isDefaulter = percentage < 75.0;

                const recoveryClasses = isDefaulter 
                  ? Math.max(0, Math.ceil((0.75 * effectiveTotal - effectiveAttended) / 0.25)) 
                  : 0;

                return (
                  <tr 
                    key={student.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isDefaulter ? 'bg-rose-50/20' : 'bg-white'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Roll No */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {student.rollNo}
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {effectiveAttended} of {effectiveTotal} attended
                      </div>
                    </td>

                    {/* Interactive Toggle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(student.id, 'PRESENT')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(student.id, 'ABSENT')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                            !isPresent
                              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                              : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          Absent
                        </button>
                      </div>
                    </td>

                    {/* Attendance Percentage & Progress Bar */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-mono font-bold text-sm ${
                        isDefaulter ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {percentage}%
                      </span>
                      <div className="w-24 mx-auto bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDefaulter ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </td>

                    {/* Statutory Standing Tag */}
                    <td className="py-3.5 px-4 text-center">
                      {isDefaulter ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-750 border border-rose-200/80 inline-flex items-center gap-1 text-rose-700">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            Shortage (&lt; 75%)
                          </span>
                          <span className="text-[10px] text-rose-600 font-medium mt-1">
                            +{recoveryClasses} classes to reach 75%
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Eligible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
