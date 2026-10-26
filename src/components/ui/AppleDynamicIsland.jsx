import React, { useState } from 'react';
import { Radio, Users, Clock, AlertTriangle, ChevronDown, ChevronUp, Sparkles, QrCode } from 'lucide-react';

export default function AppleDynamicIsland({
  course,
  presentCount = 0,
  totalStudents = 0,
  lowWarningCount = 0,
  threshold = 75,
  onOpenQr
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const attendancePercent = totalStudents > 0 
    ? Math.round((presentCount / totalStudents) * 100) 
    : 0;

  return (
    <div className="w-full flex justify-center py-2 relative z-30 select-none">
      <div
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
        className={`bg-[#000000] text-white border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExpanded
            ? 'w-[92%] sm:w-[540px] rounded-[32px] p-5 cursor-default'
            : 'w-auto min-w-[280px] sm:min-w-[340px] rounded-full px-4 py-2 hover:scale-[1.02] cursor-pointer'
        }`}
      >
        {!isExpanded ? (
          /* Collapsed Pill State */
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
              </span>
              <span className="font-semibold text-white/90 font-mono tracking-tight text-[11px]">
                {course?.code || 'SESSION'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/70 text-[11px]">
              <span className="font-medium text-white">{presentCount}/{totalStudents}</span>
              <span className="text-white/40">•</span>
              <span className="text-[#34C759] font-medium">{attendancePercent}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors">
              <span className="text-[10px] hidden sm:inline">Details</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        ) : (
          /* Expanded Island State */
          <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C1C1E] flex items-center justify-center text-white border border-white/10">
                  <Radio className="w-5 h-5 text-[#34C759] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    {course?.code || 'LIVE SESSION'}
                    <span className="text-[10px] bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  </h4>
                  <p className="text-xs text-white/60 truncate max-w-[280px]">
                    {course?.name || 'Class Attendance Stream'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                title="Collapse"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Progress inside Island */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-white/50 block font-medium">PRESENT</span>
                <span className="text-xl font-semibold text-[#34C759]">{presentCount}</span>
                <span className="text-[10px] text-white/40 block mt-0.5">Students</span>
              </div>

              <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-white/50 block font-medium">RATE</span>
                <span className="text-xl font-semibold text-white">{attendancePercent}%</span>
                <span className="text-[10px] text-white/40 block mt-0.5">Coverage</span>
              </div>

              <div className="bg-[#1C1C1E] rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] text-white/50 block font-medium">DEFICIT</span>
                <span className={`text-xl font-semibold ${lowWarningCount > 0 ? 'text-[#FF3B30]' : 'text-white'}`}>
                  {lowWarningCount}
                </span>
                <span className="text-[10px] text-white/40 block mt-0.5">&lt; {threshold}% Risk</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between pt-1 gap-2">
              {onOpenQr && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    onOpenQr();
                  }}
                  className="flex-1 py-2 px-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Launch Smart QR
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
