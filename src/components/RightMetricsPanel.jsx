import React from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

export default function RightMetricsPanel({ students = [], course, onSelectDefaulterFilter, threshold = 75 }) {
  const safeStudents = students || [];
  const totalStudents = safeStudents.length;
  const presentCount = safeStudents.filter(s => s.todayStatus === 'PRESENT').length;
  const absentCount = totalStudents - presentCount;
  const overallRate = totalStudents > 0
    ? Math.round((presentCount / totalStudents) * 100)
    : 0;

  // Defaulter count (< threshold)
  const defaulters = safeStudents.filter(student => {
    const effectiveAttended = student.todayStatus === 'PRESENT'
      ? student.attendedClasses + 1
      : student.attendedClasses;
    const effectiveTotal = student.totalClasses + 1;
    const percentage = (effectiveAttended / effectiveTotal) * 100;
    return percentage < threshold;
  });

  const compliantCount = totalStudents - defaulters.length;
  const compliantPct = totalStudents > 0 ? Math.round((compliantCount / totalStudents) * 100) : 0;
  const deficitPct = totalStudents > 0 ? Math.round((defaulters.length / totalStudents) * 100) : 0;

  // Svg semi-circle calculation
  // Radius = 60, circumference = 2 * PI * 60 = 376.99
  // Semi-circle length = 188.5
  const semiCircumference = 188.5;
  const strokeDashoffset = semiCircumference - (semiCircumference * (overallRate / 100));

  return (
    <aside className="w-full lg:w-80 space-y-5 shrink-0">
      {/* 1. Today's Attendance Metric */}
      <div className="bg-white rounded-sk-card border border-outline p-5 shadow-sk-card">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-bold text-sky-deep text-[11px] uppercase tracking-wider font-display">
            Today's Attendance
          </span>
          <span className="text-ink-subtle font-mono text-xs bg-surface-sunken px-2 py-0.5 rounded-full">{course?.code || 'CS-602'}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-extrabold text-ink font-mono">{overallRate}%</span>
          <span className="text-xs font-semibold text-ink-muted">({presentCount}/{totalStudents} present)</span>
        </div>

        {/* Skylearn Animated Progress Bar: 8px tall, 999px radius, sky-soft track with leaf fill */}
        <div className="w-full h-2.5 bg-sky-soft rounded-full overflow-hidden mb-3.5">
          <div
            className="bg-leaf h-full rounded-full transition-all duration-480 ease-out"
            style={{ width: `${overallRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-ink-muted pt-3 border-t border-outline font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-leaf" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-outline-strong" />
            <span>{absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* 2. Compliance Card - Leaf / Coral Accessible */}
      <div className="bg-white rounded-sk-card border border-outline p-5 shadow-sk-card">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-ink-muted text-[11px] uppercase tracking-wider font-display">
            {threshold}% Exam Eligibility
          </span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-sk-btn bg-leaf-soft text-leaf-deep border border-green-200">
            <span className="font-bold">Eligible (&ge;{threshold}%)</span>
            <span className="font-extrabold font-mono">{compliantCount} Students ({compliantPct}%)</span>
          </div>

          <div
            onClick={onSelectDefaulterFilter}
            className="flex items-center justify-between p-2.5 rounded-sk-btn bg-coral-soft text-coral-deep border border-red-200 cursor-pointer hover:bg-red-200 transition-all duration-200"
          >
            <span className="font-bold">Shortage (&lt;{threshold}%)</span>
            <span className="font-extrabold font-mono">{defaulters.length} Students ({deficitPct}%)</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Overview Grid */}
      <div className="bg-white rounded-sk-card border border-outline p-5 shadow-sk-card">
        <div className="flex items-center justify-between text-xs mb-3 pb-2.5 border-b border-outline">
          <span className="font-bold text-ink-muted text-[11px] uppercase tracking-wider font-display">
            Academic Summary
          </span>
          <span className="text-ink-subtle text-xs bg-surface-sunken px-2 py-0.5 rounded-full">This term</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 text-xs">
          <div>
            <span className="text-ink-muted block text-[11px] font-medium">Conducted</span>
            <span className="text-lg font-extrabold font-mono text-ink mt-0.5 block">
              {course?.conductedClasses || 52}
            </span>
            <span className="text-[10px] text-ink-subtle">Total lectures</span>
          </div>

          <div>
            <span className="text-ink-muted block text-[11px] font-medium">Enrolled</span>
            <span className="text-lg font-extrabold font-mono text-ink mt-0.5 block">
              {totalStudents}
            </span>
            <span className="text-[10px] text-ink-subtle">Class size</span>
          </div>

          <div>
            <span className="text-ink-muted block text-[11px] font-medium">Avg. Attendance</span>
            <span className="text-lg font-extrabold font-mono text-ink mt-0.5 block">
              {totalStudents > 0
                ? (
                    safeStudents.reduce((acc, curr) => {
                      const effAtt = curr.todayStatus === 'PRESENT' ? curr.attendedClasses + 1 : curr.attendedClasses;
                      const effTot = curr.totalClasses + 1;
                      return acc + (effTot > 0 ? (effAtt / effTot) * 100 : 0);
                    }, 0) / totalStudents
                  ).toFixed(1)
                : '0.0'}%
            </span>
            <span className="text-[10px] text-leaf-deep font-bold">Class Aggregate</span>
          </div>

          <div>
            <span className="text-ink-muted block text-[11px] font-medium">Shortage Count</span>
            <span className="text-lg font-extrabold font-mono text-coral-deep mt-0.5 block">
              {defaulters.length}
            </span>
            <span className="text-[10px] text-coral-deep font-semibold">Need advisory</span>
          </div>
        </div>
      </div>

      {/* 4. Attention Spotlight Card (like TOP SELLERS in Mate) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-100">
          <span className="font-bold tracking-wider uppercase text-slate-400 text-[10px]">
            Priority Advisories
          </span>
          <span className="text-xs text-rose-600 font-semibold font-mono">
            {defaulters.length} Students
          </span>
        </div>

        <div className="space-y-2.5">
          {defaulters.slice(0, 3).map(student => {
            const effectiveAttended = student.todayStatus === 'PRESENT'
              ? student.attendedClasses + 1
              : student.attendedClasses;
            const pct = Math.round((effectiveAttended / (student.totalClasses + 1)) * 100);
            return (
              <div
                key={student.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                    {student.name[0]}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 truncate block">
                      {student.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{student.rollNo}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-rose-600 text-xs">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
