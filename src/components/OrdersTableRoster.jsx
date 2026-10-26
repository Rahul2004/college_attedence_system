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
  role = 'faculty',
  threshold = 75
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'WARNING' | 'ABSENT' | 'PRESENT'
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false); // Collapsed on mobile for clean view

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
    const isDefaulter = percentage < threshold;

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
      {/* ================= SKYLEARN COURSE & SUBJECT SELECTOR ================= */}
      {programs && programs.length > 0 && (
        <div className="mb-6 rounded-[24px] border border-black/[0.08] bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#0071E3] animate-pulse" />
              <span className="text-sm font-semibold text-[#1D1D1F]">Class Active:</span>
              <span className="text-xs font-medium text-[#1D1D1F] bg-[#F5F5F7] px-3 py-1 rounded-full border border-black/[0.04]">
                {currentProgram ? `${currentProgram.degree} ${currentProgram.code}` : 'Select Course'}
                {currentSemester ? ` • ${currentSemester.semLabel}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentSubject && (
                <span className="font-semibold text-xs text-[#0071E3] bg-[#E8F2FF] px-2.5 py-1 rounded-full truncate max-w-[200px]">
                  {currentSubject.code} ({currentSubject.room || 'LT-204'})
                </span>
              )}
              {/* Toggle to change course configuration */}
              <button
                type="button"
                onClick={() => setIsConfigExpanded(prev => !prev)}
                className="text-xs text-[#86868B] hover:text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#E8E8ED] px-3 py-1 rounded-full border border-black/[0.04] transition-all font-medium"
              >
                {isConfigExpanded ? 'Hide Filter' : 'Change Class'}
              </button>
            </div>
          </div>

          {/* Collapsible 4 Dropdowns (hidden by default on mobile unless clicked) */}
          {isConfigExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 animate-in fade-in duration-200">
            {/* 1. Program */}
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 font-display">
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
                className="w-full text-xs font-semibold text-ink bg-surface-sunken hover:bg-white focus:bg-white border border-outline focus:border-sky focus:ring-4 focus:ring-sky-soft rounded-sk-btn px-3 py-2 outline-none transition-all cursor-pointer"
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
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 font-display">
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
                className="w-full text-xs font-semibold text-ink bg-surface-sunken hover:bg-white focus:bg-white border border-outline focus:border-sky focus:ring-4 focus:ring-sky-soft rounded-sk-btn px-3 py-2 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 font-display">
                Subject
              </label>
              <select
                id="subject-selector"
                value={selectedSubjectCode || ''}
                disabled={!selectedSemNumber}
                onChange={(e) => onSubjectChange?.(e.target.value)}
                className="w-full text-xs font-semibold text-ink bg-surface-sunken hover:bg-white focus:bg-white border border-outline focus:border-sky focus:ring-4 focus:ring-sky-soft rounded-sk-btn px-3 py-2 outline-none transition-all cursor-pointer truncate disabled:opacity-50 disabled:cursor-not-allowed"
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
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5 font-display">
                Lecture Period
              </label>
              <select
                id="period-selector"
                value={selectedSlotId || ''}
                disabled={!selectedSubjectCode}
                onChange={(e) => onSlotChange?.(e.target.value)}
                className="w-full text-xs font-semibold text-ink bg-surface-sunken hover:bg-white focus:bg-white border border-outline focus:border-sky focus:ring-4 focus:ring-sky-soft rounded-sk-btn px-3 py-2 outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </div>
      )}

      {/* Top Header Row of the Table View: Title + Actions (like "Orders" + Import/Export) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
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
        <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
          {onDateChange && (
            <div className="flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2 bg-white border border-outline px-3.5 py-2 rounded-sk-btn shadow-xs text-xs text-ink-muted">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky" />
                <span className="font-bold text-ink">Date:</span>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={e => onDateChange(e.target.value)}
                className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer text-xs"
              />
            </div>
          )}

          {hasPendingChanges && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-sun-soft text-sun-deep text-xs font-bold border border-amber-200 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sun-deep" />
              Unsaved
            </span>
          )}

          {/* Live Dynamic QR & OTP Mode Launcher Button - Skylearn Sun/Reward style */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-sk-btn text-xs font-bold bg-sun hover:bg-sun-bright text-ink border border-amber-300 shadow-sk-card transition-all active:scale-95"
            title="Launch Projector Screen Dynamic QR & OTP mode for classroom roll call"
          >
            <QrCode className="w-4 h-4 text-ink" />
            <span>Live QR &amp; OTP Mode</span>
          </button>

          {onCommit && (
            <button
              type="button"
              onClick={onCommit}
              disabled={isCommitting || !hasPendingChanges}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-sk-btn text-xs font-bold transition-all shadow-sk-card ${
                isCommitting || !hasPendingChanges
                  ? 'bg-surface-sunken text-ink-subtle border border-outline cursor-not-allowed'
                  : 'bg-sky hover:bg-sky-deep active:bg-sky-deep text-white border-b-2 border-sky-bright active:scale-95'
              }`}
            >
              {isCommitting ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isCommitting ? 'Saving Records...' : 'Save Session'}
            </button>
          )}
        </div>
      </div>

      {/* Filter Row Pills: Type (Status) / Search / Filter Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Skylearn 999px Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-sunken rounded-full border border-outline text-xs font-bold transition-all duration-240">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                filterType === 'ALL'
                  ? 'bg-sky text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All Students ({students.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('WARNING')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                filterType === 'WARNING'
                  ? 'bg-coral text-white shadow-xs font-bold'
                  : 'text-ink-muted hover:text-coral-deep'
              }`}
            >
              Shortage &lt; {threshold}%
            </button>

            <button
              type="button"
              onClick={() => setFilterType('ABSENT')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                filterType === 'ABSENT'
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Absent Today
            </button>

            <button
              type="button"
              onClick={() => setFilterType('PRESENT')}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                filterType === 'PRESENT'
                  ? 'bg-leaf text-white shadow-xs'
                  : 'text-ink-muted hover:text-leaf-deep'
              }`}
            >
              Present
            </button>
          </div>
        </div>

        {/* Search input styled with Skylearn accessible inputs */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-white rounded-sk-sm border border-outline focus:outline-none focus:border-sky focus:ring-4 focus:ring-sky-soft transition-all text-ink placeholder-ink-subtle font-sans"
          />
        </div>
      </div>

      {/* Main Table Card with Skylearn 20px radius and soft elevation */}
      <div className="bg-white rounded-sk-card border border-outline shadow-sk-card overflow-hidden">
        <div className="overflow-x-auto -webkit-overflow-scrolling-touch scrollbar-thin scrollbar-thumb-outline-strong scrollbar-track-transparent">
          <table className="w-full min-w-[640px] border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-outline bg-surface-sunken/80 backdrop-blur-md text-ink-muted font-bold font-display select-none">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => el && (el.indeterminate = isSomeSelected)}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded-md text-sky border-outline-strong focus:ring-sky-soft cursor-pointer"
                  />
                </th>

                {/* Roll No */}
                <th className="py-3.5 px-4 font-mono font-bold text-ink-muted w-28">
                  Roll No
                </th>

                {/* Student */}
                <th className="py-3.5 px-4 text-ink">
                  Student Name
                </th>

                {/* Department / Group */}
                <th className="py-3.5 px-4 text-ink-muted hidden md:table-cell">
                  Department
                </th>

                {/* Status Toggle */}
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

            <tbody className="divide-y divide-outline text-ink">
              {!selectedProgramId || !selectedSemNumber || !selectedSubjectCode ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-sky-soft text-sky flex items-center justify-center mb-3 shadow-sk-card">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-ink font-display mb-1">Select Class &amp; Subject</h3>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        Please choose a <strong>Program</strong>, <strong>Semester</strong>, and <strong>Subject</strong> above to start recording attendance.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-surface-sunken flex items-center justify-center text-ink-subtle mb-3">
                        <Users className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-ink font-display mb-1">No Students Found</h3>
                      <p className="text-xs text-ink-muted leading-relaxed">
                        No students match your criteria. You can add more students via Admin Portal.
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
                  const isDefaulter = percentage < threshold;
                  const isDetailActive = activeDetailStudent && activeDetailStudent.id === student.id;

                  // Initials for avatar chip
                  const initials = student.name
                    ? student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'ST';

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudentDetail && onSelectStudentDetail(student)}
                      className={`cursor-pointer transition-all duration-200 group hover:bg-sky-50/50 ${
                        isDetailActive
                          ? 'bg-sky-soft/60 font-medium'
                          : isChecked
                          ? 'bg-surface-sunken'
                          : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(student.id, e)}
                          className="w-4 h-4 rounded text-sky border-outline-strong focus:ring-sky-soft cursor-pointer"
                        />
                      </td>

                      {/* Roll Number */}
                      <td className="py-3 px-4 font-mono font-bold text-ink-muted whitespace-nowrap">
                        #{student.rollNo}
                      </td>

                      {/* Student info with clean avatar bubble */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-soft text-sky-deep font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-ink group-hover:text-sky-deep transition-colors text-xs">
                              {student.name}
                            </span>
                            <div className="text-[11px] text-ink-subtle font-normal font-sans">
                              {student.email || `${student.rollNo.toLowerCase()}@univ.edu`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-ink-muted hidden md:table-cell whitespace-nowrap font-medium">
                        {student.department || 'Computer Science'}
                      </td>

                      {/* Status Button: Skylearn Leaf / Coral Accessible Pill */}
                      <td className="py-3 px-4 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggleStatus(student.id, isPresent ? 'ABSENT' : 'PRESENT')}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            isPresent
                              ? 'bg-leaf-soft text-leaf-deep border-green-200 hover:bg-green-200'
                              : 'bg-coral-soft text-coral-deep border-red-200 hover:bg-red-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-leaf-deep stroke-[3]" />
                              <span>Present</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 text-coral-deep stroke-[3]" />
                              <span>Absent</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Attendance Percentage Column */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono font-bold text-xs ${
                            isDefaulter ? 'text-coral-deep' : 'text-ink'
                          }`}>
                            {percentage}%
                          </span>
                          <span className="text-[10px] text-ink-subtle font-normal">
                            {effectiveAttended}/{effectiveTotal} lectures
                          </span>
                        </div>
                      </td>

                      {/* Standing Eligibility */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                          isDefaulter
                            ? 'bg-coral-soft text-coral-deep border-red-200'
                            : 'bg-leaf-soft text-leaf-deep border-green-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isDefaulter ? 'bg-coral' : 'bg-leaf'}`} />
                          {isDefaulter ? `Shortage (< ${threshold}%)` : 'Eligible'}
                        </span>
                      </td>

                      {/* Context dots */}
                      <td className="py-3 px-4 text-center text-ink-subtle hover:text-ink">
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
