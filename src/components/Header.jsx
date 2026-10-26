import React from 'react';
import {
  UserCheck,
  GraduationCap,
  MapPin,
  Layers,
  Calendar
} from 'lucide-react';

export default function Header({ role, onRoleChange, course, isLiveDatabase = false }) {
  return (
    <header className="sticky top-4 z-40 mb-8 rounded-[24px] border border-black/[0.08] bg-white/70 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-[14px] bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-lg shadow-md transition-all duration-300 hover:scale-[1.04]">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
                ATTEND
              </h1>
              <span className="text-[11px] font-semibold text-[#0071E3] bg-[#E8F2FF] border border-[#0071E3]/20 px-2.5 py-0.5 rounded-full">
                OS
              </span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all duration-200 ${
                isLiveDatabase
                  ? 'bg-[#EBF9EE] text-[#34C759] border border-[#34C759]/20'
                  : 'bg-[#FFF5E5] text-[#FF9500] border border-[#FF9500]/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isLiveDatabase ? 'bg-[#34C759]' : 'bg-[#FF9500]'}`}></span>
                {isLiveDatabase ? 'Supabase Live' : 'Local Demo'}
              </span>
            </div>
            <p className="text-xs text-[#86868B] font-normal mt-0.5">
              Academic Attendance Suite • <span className="font-medium text-[#1D1D1F]">{course.code}</span> ({course.name})
            </p>
          </div>
        </div>

        {/* Course Info & Role Switcher */}
        <div className="flex items-center flex-wrap gap-6 self-stretch md:self-auto justify-between md:justify-end">
          <div className="hidden lg:flex items-center gap-6 text-xs text-[#86868B] pr-6 border-r border-black/[0.08]">
            <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-[#1D1D1F]">
              <MapPin className="w-3.5 h-3.5 text-[#86868B]" />
              <span>{course.room}</span>
            </div>
          </div>

          {/* Role & Session Identity Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              role === 'admin'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : role === 'faculty'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {role === 'admin' ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Administrator
                </>
              ) : role === 'faculty' ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Faculty In-Charge
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  Student Member
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
