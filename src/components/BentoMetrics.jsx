import React from 'react';
import { 
  BookOpen, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function BentoMetrics({ metrics = {}, threshold = 75 }) {
  const { totalStudents = 0, totalClasses = 0, presentToday = 0, lowWarningCount = 0 } = metrics || {};
  const attendanceRate = totalStudents > 0
    ? ((presentToday / totalStudents) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {/* Metric 1: Total Classes */}
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[24px] border border-black/[0.06] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-between">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-[#0071E3]/5 rounded-full blur-2xl group-hover:bg-[#0071E3]/10 transition-all duration-500"></div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              Curriculum Insights
            </span>
            <h3 className="text-base font-semibold text-[#1D1D1F] tracking-tight mt-0.5">
              Conducted Classes
            </h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F5F5F7] group-hover:bg-[#E8F2FF] flex items-center justify-center text-[#1D1D1F] group-hover:text-[#0071E3] transition-all duration-300">
            <BookOpen className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        <div className="mt-8 flex items-baseline gap-3 relative z-10">
          <span className="text-4xl sm:text-5xl font-semibold text-[#1D1D1F] tracking-tight">
            {totalClasses}
          </span>
          <span className="text-xs font-medium text-[#86868B]">
            Recorded Sessions
          </span>
        </div>

        <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#86868B] relative z-10">
          <span>Active Cohort</span>
          <span className="font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-3 py-1 rounded-full border border-black/[0.04]">
            {totalStudents} Enrolled
          </span>
        </div>
      </div>

      {/* Metric 2: Present Today */}
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[24px] border border-black/[0.06] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-between">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 bg-[#34C759]/5 rounded-full blur-2xl group-hover:bg-[#34C759]/10 transition-all duration-500"></div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              Live Attendance
            </span>
            <h3 className="text-base font-semibold text-[#1D1D1F] tracking-tight mt-0.5">
              Present Today
            </h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#F5F5F7] group-hover:bg-[#EBF9EE] flex items-center justify-center text-[#1D1D1F] group-hover:text-[#34C759] transition-all duration-300">
            <Users className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>

        <div className="mt-8 flex items-baseline gap-3 relative z-10">
          <span className="text-4xl sm:text-5xl font-semibold text-[#1D1D1F] tracking-tight">
            {presentToday}
          </span>
          <span className="text-xs font-medium text-[#34C759] bg-[#EBF9EE] px-2.5 py-0.5 rounded-full">
            {attendanceRate}% rate
          </span>
        </div>

        <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#86868B] relative z-10">
          <span>Absenteeism</span>
          <span className="font-semibold text-[#FF3B30] bg-[#FFECEB] px-3 py-1 rounded-full border border-red-100">
            {totalStudents - presentToday} Absent
          </span>
        </div>
      </div>

      {/* Metric 3: Low Warnings (< 75%) */}
      <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-[24px] border border-black/[0.06] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-between">
        <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-28 h-28 rounded-full blur-2xl transition-all duration-500 ${
          lowWarningCount > 0 ? 'bg-[#FF3B30]/5 group-hover:bg-[#FF3B30]/10' : 'bg-[#34C759]/5 group-hover:bg-[#34C759]/10'
        }`}></div>

        <div className="flex items-start justify-between relative z-10">
          <div>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${
              lowWarningCount > 0 ? 'text-[#FF3B30]' : 'text-[#34C759]'
            }`}>
              {lowWarningCount > 0 ? 'Debarment Risk' : 'Cohort Health'}
            </span>
            <h3 className="text-base font-semibold text-[#1D1D1F] tracking-tight mt-0.5">
              Below Threshold (&lt; {threshold}%)
            </h3>
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            lowWarningCount > 0 
              ? 'bg-[#FFECEB] text-[#FF3B30] group-hover:scale-105' 
              : 'bg-[#EBF9EE] text-[#34C759] group-hover:scale-105'
          }`}>
            {lowWarningCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className="mt-8 flex items-baseline gap-3 relative z-10">
          <span className={`text-4xl sm:text-5xl font-semibold tracking-tight ${
            lowWarningCount > 0 ? 'text-[#FF3B30]' : 'text-[#34C759]'
          }`}>
            {lowWarningCount}
          </span>
          <span className="text-xs font-medium text-[#86868B]">
            {lowWarningCount > 0 ? 'Students in Deficit' : 'Optimal Standing'}
          </span>
        </div>

        <div className="mt-6 pt-4 border-t border-black/[0.05] flex items-center justify-between text-xs text-[#86868B] relative z-10">
          <span>Action Required</span>
          <span className={`font-semibold px-3 py-1 rounded-full border ${
            lowWarningCount > 0
              ? 'text-[#FF3B30] bg-[#FFECEB] border-red-100'
              : 'text-[#34C759] bg-[#EBF9EE] border-emerald-100'
          }`}>
            {lowWarningCount > 0 ? 'Send Warning SMS' : 'No Critical Flags'}
          </span>
        </div>
      </div>
    </div>
  );
}
