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
    <header className="sticky top-4 z-40 mb-8 rounded-2xl border border-slate-200/80 bg-white/80 p-4 sm:p-5 shadow-sm backdrop-blur-xl transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02]">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                ATTEND
              </h1>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-2.5 py-0.5 rounded-full">
                SaaS Enterprise
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all duration-200 hover:shadow-md ${
                isLiveDatabase
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-amber-50 text-amber-700 border border-amber-200/80'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveDatabase ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {isLiveDatabase ? 'Supabase Live' : 'Local Demo'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Academic Attendance Suite • <span className="font-semibold text-slate-700">{course.code}</span> ({course.name})
            </p>
          </div>
        </div>

        {/* Course Info & Role Switcher */}
        <div className="flex items-center flex-wrap gap-6 self-stretch md:self-auto justify-between md:justify-end">
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 pr-6 border-r border-slate-200">
            <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-slate-900">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.date}</span>
            </div>
            <div className="flex items-center gap-1.5 transition-colors duration-200 hover:text-slate-900">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.room}</span>
            </div>
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => onRoleChange('faculty')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.01] ${
                role === 'faculty'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className={`w-3.5 h-3.5 ${role === 'faculty' ? 'text-indigo-600' : 'text-slate-400'} transition-transform duration-200 group-hover:scale-110`} />
              Faculty View
            </button>
            <button
              type="button"
              onClick={() => onRoleChange('student')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.01] ${
                role === 'student'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${role === 'student' ? 'text-indigo-600' : 'text-slate-400'} transition-transform duration-200 group-hover:scale-110`} />
              Student View
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
