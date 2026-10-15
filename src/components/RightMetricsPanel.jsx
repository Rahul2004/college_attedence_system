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

export default function RightMetricsPanel({ students = [], course, onSelectDefaulterFilter }) {
  const safeStudents = students || [];
  const totalStudents = safeStudents.length;
  const presentCount = safeStudents.filter(s => s.todayStatus === 'PRESENT').length;
  const absentCount = totalStudents - presentCount;
  const overallRate = totalStudents > 0
    ? Math.round((presentCount / totalStudents) * 100)
    : 0;

  // Defaulter count (< 75%)
  const defaulters = safeStudents.filter(student => {
    const effectiveAttended = student.todayStatus === 'PRESENT'
      ? student.attendedClasses + 1
      : student.attendedClasses;
    const effectiveTotal = student.totalClasses + 1;
    const percentage = (effectiveAttended / effectiveTotal) * 100;
    return percentage < 75.0;
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
    <aside className="w-full lg:w-72 space-y-4 shrink-0">
      {/* 1. Today's Attendance Metric */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
            Today's Attendance
          </span>
          <span className="text-slate-400 font-mono text-xs">{course.code}</span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-slate-900 font-mono">{overallRate}%</span>
          <span className="text-xs text-slate-500">({presentCount}/{totalStudents} present)</span>
        </div>

        {/* Clean progress bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${overallRate}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{presentCount} Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span>{absentCount} Absent</span>
          </div>
        </div>
      </div>

      {/* 2. 75% Compliance Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2.5">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
            75% Exam Eligibility
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-emerald-800">
            <span className="font-medium">Eligible (&ge;75%)</span>
            <span className="font-bold font-mono">{compliantCount} Students ({compliantPct}%)</span>
          </div>

          <div
            onClick={onSelectDefaulterFilter}
            className="flex items-center justify-between p-2 rounded-lg bg-rose-50 text-rose-800 cursor-pointer hover:bg-rose-100 transition"
          >
            <span className="font-medium">Shortage (&lt;75%)</span>
            <span className="font-bold font-mono">{defaulters.length} Students ({deficitPct}%)</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Overview Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs mb-2.5 pb-2 border-b border-slate-100">
          <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
            Academic Summary
          </span>
          <span className="text-slate-400 text-xs">This semester</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Conducted</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
              {course.conductedClasses || 52}
            </span>
            <span className="text-[10px] text-slate-400">Total lectures</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Enrolled</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
              {totalStudents}
            </span>
            <span className="text-[10px] text-slate-400">Class size</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Avg. Attendance</span>
            <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
              81.4%
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">+1.8% vs last week</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Shortage Count</span>
            <span className="text-base font-bold font-mono text-rose-600 mt-0.5 block">
              {defaulters.length}
            </span>
            <span className="text-[10px] text-rose-600 font-medium">Require advisory</span>
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
