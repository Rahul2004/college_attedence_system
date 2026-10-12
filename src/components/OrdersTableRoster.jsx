import React, { useState } from 'react';
import {
  Users,
  Check,
  X,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  CheckSquare,
  Square,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Save,
  Download,
  Printer,
  Maximize2,
  BookOpen,
  GraduationCap,
  Clock,
  Building2,
  UserCheck,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import DynamicQrAttendanceModal from './DynamicQrAttendanceModal';

export default function OrdersTableRoster({
  students,
  onToggleStatus,
  onMarkAll,
  selectedDate,
  onDateChange,
  onCommit,
  isCommitting,
  hasPendingChanges,
  onSelectStudentDetail,
  activeDetailStudent,
  programs = [],
  lecturePeriods = [],
  selectedProgramId = 'btech-cse',
  onProgramChange,
  selectedSemNumber = 'VI',
  onSemChange,
  selectedSubjectCode = 'CS-602',
  onSubjectChange,
  selectedSlotId = 'P2',
  onSlotChange,
  activeCourse,
  role = 'faculty'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WARNING' | 'ABSENT' | 'PRESENT'
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const effectiveAttended = student.todayStatus === 'PRESENT'
      ? student.attendedClasses + 1
      : student.attendedClasses;
    const effectiveTotal = student.totalClasses + 1;
    const percentage = (effectiveAttended / effectiveTotal) * 100;
    const isDefaulter = percentage < 75.0;

    if (!matchesSearch) return false;
    if (filterType === 'WARNING') return isDefaulter;
    if (filterType === 'ABSENT') return student.todayStatus === 'ABSENT';
    if (filterType === 'PRESENT') return student.todayStatus === 'PRESENT';
    return true;
  });

  // Select all checkbox logic
  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id));
  const isSomeSelected = filteredStudents.some(s => selectedIds.has(s.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBatchMarkSelected = (status) => {
    selectedIds.forEach(id => {
      onToggleStatus(id, status);
    });
  };

  // Resolve active program, semester, subject, and lecture period
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0] || null;
  const currentSemesters = currentProgram?.semesters || [];
  const currentSemester = currentSemesters.find(s => s.semNumber === selectedSemNumber) || currentSemesters[0] || null;
  const currentSubjects = currentSemester?.subjects || [];
  const currentSubject = currentSubjects.find(sub => sub.code === selectedSubjectCode) || currentSubjects[0] || null;
  const currentSlot = lecturePeriods.find(l => l.id === selectedSlotId) || lecturePeriods[0] || null;

  return (
    <div className="relative">
      {/* ================= COMPACT COURSE & SUBJECT SELECTOR ================= */}
      {programs && programs.length > 0 && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Class Selection:</span>
              <span className="text-xs text-slate-500">
                {currentProgram ? `${currentProgram.degree} ${currentProgram.code}` : 'Select Course'}
                {currentSemester ? ` • ${currentSemester.semLabel}` : ''}
              </span>
            </div>
            {currentSubject && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">{currentSubject.code} - {currentSubject.name}</span>
                {currentSubject.faculty && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">{currentSubject.faculty}</span>
                  </>
                )}
                {currentSubject.room && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">{currentSubject.room}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Clean 4 Dropdowns with Default Unselected States */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* 1. Program */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Program
              </label>
              <select
                id="program-selector"
                value={selectedProgramId || ''}
                onChange={(e) => {
                  const newProgId = e.target.value;
                  onProgramChange?.(newProgId);
                  onSemChange?.('');
                  onSubjectChange?.('');
                }}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 transition cursor-pointer"
              >
                <option value="">-- Select Program --</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.degree} {p.code} — {p.branch}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Semester */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Semester
              </label>
              <select
                id="semester-selector"
                value={selectedSemNumber || ''}
                disabled={!selectedProgramId}
                onChange={(e) => {
                  const newSem = e.target.value;
                  onSemChange?.(newSem);
                  onSubjectChange?.('');
                }}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Semester --</option>
                {currentSemesters.map((s) => (
                  <option key={s.semNumber} value={s.semNumber}>
                    {s.semLabel}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Subject */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Subject
              </label>
              <select
                id="subject-selector"
                value={selectedSubjectCode || ''}
                disabled={!selectedSemNumber}
                onChange={(e) => onSubjectChange?.(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 transition cursor-pointer truncate disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Subject --</option>
                {currentSubjects.map((sub) => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Slot */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Lecture Period
              </label>
              <select
                id="period-selector"
                value={selectedSlotId || ''}
                disabled={!selectedSubjectCode}
                onChange={(e) => onSlotChange?.(e.target.value)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-blue-600 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Select Lecture Period --</option>
                {lecturePeriods.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label} ({slot.time})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Row of the Table View: Title + Actions (like "Orders" + Import/Export) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Students Roster
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
              {filteredStudents.length} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time session records, statutory compliance, and batch attendance roll call.
          </p>
        </div>

        {/* Action Buttons: Date picker + Save Session */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          {onDateChange && (
            <div className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-500">Date:</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-xs"
              />
            </div>
          )}

          {hasPendingChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/80 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}

          {/* Live Dynamic QR & OTP Mode Launcher Button */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs transition-all active:scale-[0.98]"
            title="Launch Projector Screen Dynamic QR & OTP mode for classroom roll call"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Live QR &amp; OTP Mode</span>
          </button>

          {onCommit && (
            <button
              type="button"
              onClick={onCommit}
              disabled={isCommitting || !hasPendingChanges}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isCommitting || !hasPendingChanges
                  ? 'bg-slate-100 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]'
              }`}
            >
              {isCommitting ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {isCommitting ? 'Saving...' : 'Save Session'}
            </button>
          )}
        </div>
      </div>

      {/* Filter Row Pills: Type (Status) / Search / Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills with Badge Count */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-semibold transition-all duration-200">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                filterType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Students ({students.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('WARNING')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                filterType === 'WARNING'
                  ? 'bg-white text-rose-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Shortage &lt; 75%
            </button>

            <button
              type="button"
              onClick={() => setFilterType('ABSENT')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                filterType === 'ABSENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Absent Today
            </button>

            <button
              type="button"
              onClick={() => setFilterType('PRESENT')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                filterType === 'PRESENT'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Present
            </button>
          </div>
        </div>

        {/* Search input styled like Mate reference */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur-md text-slate-700 font-semibold tracking-wide select-none transition-all duration-200">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => el && (el.indeterminate = isSomeSelected)}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900/20 cursor-pointer"
                  />
                </th>

                {/* Roll No */}
                <th className="py-3.5 px-4 font-mono font-medium text-slate-500 w-28">
                  Roll No
                </th>

                {/* Student */}
                <th className="py-3.5 px-4 text-slate-600">
                  Student Name
                </th>

                {/* Department / Group */}
                <th className="py-3.5 px-4 text-slate-500 hidden md:table-cell">
                  Department
                </th>

                {/* Status Toggle (Like Status column in Mate reference: green tick + Paid) */}
                <th className="py-3.5 px-4 text-center w-36">
                  Today's Status
                </th>

                {/* Attendance Rate */}
                <th className="py-3.5 px-4 text-center w-36">
                  Attendance Rate
                </th>

                {/* Standing Tag */}
                <th className="py-3.5 px-4 text-center w-32">
                  Eligibility
                </th>

                {/* Action options */}
                <th className="py-3.5 px-4 text-center w-12">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {!selectedProgramId || !selectedSemNumber || !selectedSubjectCode ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">Select Class &amp; Subject</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Please select <strong>Program</strong>, <strong>Semester</strong>, <strong>Subject</strong>, and <strong>Period</strong> from above to view and mark attendance.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                        <Users className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-1">No Students Found</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        There are no registered students in this branch &amp; semester. Add students via Admin Portal.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isChecked = selectedIds.has(student.id);
                  const isPresent = student.todayStatus === 'PRESENT';
                  const effectiveAttended = isPresent
                    ? student.attendedClasses + 1
                    : student.attendedClasses;
                  const effectiveTotal = student.totalClasses + 1;
                  const percentage = Number(((effectiveAttended / effectiveTotal) * 100).toFixed(1));
                  const isDefaulter = percentage < 75.0;
                  const isDetailActive = activeDetailStudent && activeDetailStudent.id === student.id;

                  // Initials for avatar chip
                  const initials = student.name
                    ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'ST';

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudentDetail && onSelectStudentDetail(student)}
                      className={`cursor-pointer transition-all duration-150 group hover:bg-slate-50/70 hover:shadow-sm ${
                        isDetailActive
                          ? 'bg-slate-100/70 font-medium shadow-sm'
                          : isChecked
                          ? 'bg-slate-50'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(student.id, e)}
                          className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900/20 cursor-pointer"
                        />
                      </td>

                      {/* Roll Number (Styled like #192541 in reference) */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        #{student.rollNo}
                      </td>

                      {/* Student info with clean avatar bubble */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center border border-slate-200/80 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {student.name}
                            </span>
                            <div className="text-[11px] text-slate-400 font-normal">
                              {student.email || `${student.rollNo.toLowerCase()}@univ.edu`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {student.department || 'Computer Science'}
                      </td>

                      {/* Status: Clean icon + Label like '✓ Paid' in Mate */}
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(student.id, isPresent ? 'ABSENT' : 'PRESENT')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200/80 hover:bg-rose-100'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Attendance Percentage Column */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono font-bold text-xs ${
                            isDefaulter ? 'text-rose-600' : 'text-slate-800'
                          }`}>
                            {percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {effectiveAttended}/{effectiveTotal} lectures
                          </span>
                        </div>
                      </td>

                      {/* Standing Eligibility */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          isDefaulter
                            ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDefaulter ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {isDefaulter ? 'Shortage (< 75%)' : 'Eligible'}
                        </span>
                      </td>

                      {/* Context dots */}
                      <td className="py-3 px-4 text-center text-slate-400 hover:text-slate-700">
                        <MoreHorizontal className="w-4 h-4 mx-auto" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Meta Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onMarkAll('PRESENT')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
            >
              Mark All Present
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onMarkAll('ABSENT')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Action Dock (like the black popup in reference: [Selected: 5 | Export | Print | Mark]) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 text-xs font-semibold border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <span className="text-slate-300 pr-2 border-r border-slate-800">
            Selected: <strong className="text-white font-mono">{selectedIds.size}</strong>
          </span>

          <button
            type="button"
            onClick={() => handleBatchMarkSelected('PRESENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Mark Present
          </button>

          <button
            type="button"
            onClick={() => handleBatchMarkSelected('ABSENT')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Mark Absent
          </button>
        </div>
      )}

      {/* Dynamic QR & OTP Classroom Projector Modal */}
      {isQrModalOpen && (
        <DynamicQrAttendanceModal
          course={activeCourse}
          students={students}
          onClose={() => setIsQrModalOpen(false)}
          onApplyScannedStudents={(scanned) => {
            scanned.forEach(s => {
              onToggleStatus(s.id, 'PRESENT');
            });
          }}
        />
      )}
    </div>
  );
}
