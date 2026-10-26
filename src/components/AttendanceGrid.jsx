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

  const filteredStudents = (students || []).filter(student => {
    const matchesSearch = 
      (student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student?.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const effectiveAttended = student?.todayStatus === 'PRESENT' 
      ? (student?.attendedClasses || 0) + 1 
      : (student?.attendedClasses || 0);
    const effectiveTotal = (student?.totalClasses || 0) + 1;
    const percentage = effectiveTotal > 0 ? (effectiveAttended / effectiveTotal) * 100 : 0;
    const isDefaulter = percentage < 75.0;

    if (!matchesSearch) return false;
    if (filter === 'WARNING') return isDefaulter;
    if (filter === 'ABSENT') return student?.todayStatus === 'ABSENT';
    return true;
  });

  return (
    <section className="bg-white rounded-sk-card border border-outline p-5 sm:p-6 shadow-sk-card mb-8">
      {/* Session Workflow Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-outline">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-ink tracking-tight font-display">
              Course Attendance Roster
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-soft text-sky-deep border border-sky/20">
              Active Lecture
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 font-sans">
            Mark student presence below, then save the session to update records.
          </p>
        </div>

        {/* Date Selector & Session Commit */}
        <div className="flex items-center flex-wrap gap-2.5">
          {onDateChange && (
            <div className="flex items-center gap-2 bg-surface-sunken border border-outline px-3.5 py-2 rounded-sk-btn">
              <span className="text-xs font-bold text-ink-subtle">Date:</span>
              <input
                id="session-date-picker"
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="text-xs font-bold bg-transparent text-ink focus:outline-none cursor-pointer"
              />
            </div>
          )}

          {hasPendingChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sun-soft text-sun-deep text-xs font-bold border border-sun/30">
              <span className="w-2 h-2 rounded-full bg-sun animate-pulse" />
              Unsaved changes
            </span>
          )}

          {onCommit && (
            <button
              type="button"
              onClick={onCommit}
              disabled={isCommitting || !hasPendingChanges}
              className={`flex items-center gap-2 px-5 py-2 rounded-sk-btn text-xs font-bold shadow-xs transition-all ${
                isCommitting || !hasPendingChanges
                  ? 'bg-surface-sunken text-ink-subtle border border-outline cursor-not-allowed'
                  : 'bg-sky text-white hover:bg-sky-hover shadow-sk-card active:scale-[0.98]'
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sk-btn text-xs font-bold bg-leaf-soft text-leaf-deep hover:bg-leaf/20 transition-colors border border-leaf/30"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => onMarkAll('ABSENT')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sk-btn text-xs font-bold bg-coral-soft text-coral hover:bg-coral/20 transition-colors border border-coral/30"
          >
            <X className="w-3.5 h-3.5" />
            Mark All Absent
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-sk-btn border border-outline bg-surface-sunken focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky/20 focus:border-sky transition-all text-ink placeholder-ink-subtle font-sans"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-surface-sunken p-1 rounded-full border border-outline">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filter === 'ALL'
                  ? 'bg-white text-ink shadow-xs border border-outline'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('WARNING')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filter === 'WARNING'
                  ? 'bg-coral text-white shadow-xs'
                  : 'text-coral hover:bg-coral-soft'
              }`}
            >
              Shortage (&lt; 75%)
            </button>
            <button
              type="button"
              onClick={() => setFilter('ABSENT')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filter === 'ABSENT'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Absent
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-x-auto rounded-sk-card border border-outline">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-sunken text-ink font-bold text-xs border-b border-outline">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 w-28">Roll No</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4 text-center w-48">Today's Presence</th>
              <th className="py-3 px-4 text-center w-40">Cumulative Rate</th>
              <th className="py-3 px-4 text-center w-36">Standing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline text-xs text-ink font-sans">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-ink-subtle">
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
                    className={`hover:bg-surface-sunken/60 transition-colors ${
                      isDefaulter ? 'bg-coral-soft/20' : 'bg-white'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3.5 px-4 text-center font-mono text-ink-subtle font-medium">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Roll No */}
                    <td className="py-3.5 px-4 font-mono font-bold text-ink">
                      {student.rollNo}
                    </td>

                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-ink">
                        {student.name}
                      </div>
                      <div className="text-xs text-ink-subtle mt-0.5">
                        {effectiveAttended} of {effectiveTotal} attended
                      </div>
                    </td>

                    {/* Interactive Toggle */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(student.id, 'PRESENT')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sk-btn font-bold text-xs transition-all ${
                            isPresent
                              ? 'bg-leaf text-white shadow-xs'
                              : 'bg-surface-sunken text-ink-muted hover:bg-leaf-soft hover:text-leaf-deep'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(student.id, 'ABSENT')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sk-btn font-bold text-xs transition-all ${
                            !isPresent
                              ? 'bg-coral text-white shadow-xs'
                              : 'bg-surface-sunken text-ink-muted hover:bg-coral-soft hover:text-coral-deep'
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
                        isDefaulter ? 'text-coral' : 'text-leaf-deep'
                      }`}>
                        {percentage}%
                      </span>
                      <div className="w-24 mx-auto bg-surface-sunken rounded-full h-2 mt-1.5 overflow-hidden border border-outline">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isDefaulter ? 'bg-coral' : 'bg-leaf'
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        />
                      </div>
                    </td>

                    {/* Statutory Standing Tag */}
                    <td className="py-3.5 px-4 text-center">
                      {isDefaulter ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-coral-soft text-coral border border-coral/30 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-coral" />
                            Shortage (&lt; 75%)
                          </span>
                          <span className="text-[10px] text-coral-deep font-semibold mt-1">
                            +{recoveryClasses} classes to reach 75%
                          </span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-leaf-soft text-leaf-deep border border-leaf/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-leaf" />
                          Good Standing
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
