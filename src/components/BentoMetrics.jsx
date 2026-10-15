import React from 'react';
import { 
  BookOpen, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function BentoMetrics({ metrics = {} }) {
  const { totalStudents = 0, totalClasses = 0, presentToday = 0, lowWarningCount = 0 } = metrics || {};
  const attendanceRate = totalStudents > 0
    ? ((presentToday / totalStudents) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Metric 1: Total Classes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Course Statistics
            </p>
            <h3 className="text-sm font-semibold text-slate-700 mt-1 transition-colors duration-200">Conducted Classes</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200/60">
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </div>
        </div>

        <div className="mt-6 flex items-baseline gap-4">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {totalClasses}
          </span>
          <span className="text-xs font-medium text-slate-500">
            Recorded Lectures
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 transition-all duration-200">
          <span>Active Cohort</span>
          <span className="font-semibold text-slate-800">{totalStudents} Students Enrolled</span>
        </div>
      </div>

      {/* Metric 2: Present Today */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Today's Attendance Summary
            </p>
            <h3 className="text-sm font-semibold text-slate-700 mt-1">Present Today</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-6 flex items-baseline gap-4">
          <span className="text-4xl font-extrabold text-emerald-600 tracking-tight">
            {presentToday}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            / {totalStudents} attending ({attendanceRate}%)
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 transition-all duration-200">
          <span>Absent Count</span>
          <span className="font-semibold text-rose-600">
            {totalStudents - presentToday} Students Absent
          </span>
        </div>
      </div>

      {/* Metric 3: Low Warnings (< 75%) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Shortage Alerts
            </p>
            <h3 className="text-sm font-semibold text-slate-700 mt-1">Below Minimum (&lt; 75%)</h3>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
            lowWarningCount > 0 
              ? 'bg-rose-50 text-rose-600 border-rose-100' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {lowWarningCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="mt-6 flex items-baseline gap-4">
          <span className={`text-4xl font-extrabold tracking-tight ${
            lowWarningCount > 0 ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {lowWarningCount}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {lowWarningCount === 1 ? 'Student with shortage' : 'Students with shortage'}
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 transition-all duration-200">
          <span>Minimum Attendance Rule</span>
          <span className="font-semibold text-slate-800">75.0% Required</span>
        </div>
      </div>
    </div>
  );
}
