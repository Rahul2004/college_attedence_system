import React from 'react';

export default function AppleActivityRings({
  theoryPercent = 85,
  labPercent = 90,
  punctualityPercent = 78,
  size = 140,
  showLegend = true
}) {
  const strokeWidth = 10;
  const center = size / 2;

  // Ring 1: Theory (Blue / Red outer)
  const r1 = center - strokeWidth;
  const c1 = 2 * Math.PI * r1;
  const offset1 = c1 - (Math.min(theoryPercent, 100) / 100) * c1;

  // Ring 2: Lab / Practical (Green middle)
  const r2 = r1 - strokeWidth - 4;
  const c2 = 2 * Math.PI * r2;
  const offset2 = c2 - (Math.min(labPercent, 100) / 100) * c2;

  // Ring 3: Punctuality (Orange inner)
  const r3 = r2 - strokeWidth - 4;
  const c3 = 2 * Math.PI * r3;
  const offset3 = c3 - (Math.min(punctualityPercent, 100) / 100) * c3;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-[24px] bg-white/70 backdrop-blur-xl border border-black/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* SVG Rings with Apple Watch look */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Ring 1: Theory Track & Value */}
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="#0071E3"
            strokeWidth={strokeWidth}
            strokeOpacity="0.15"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={r1}
            stroke="#0071E3"
            strokeWidth={strokeWidth}
            strokeDasharray={c1}
            strokeDashoffset={offset1}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />

          {/* Ring 2: Lab Track & Value */}
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="#34C759"
            strokeWidth={strokeWidth}
            strokeOpacity="0.15"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={r2}
            stroke="#34C759"
            strokeWidth={strokeWidth}
            strokeDasharray={c2}
            strokeDashoffset={offset2}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />

          {/* Ring 3: Punctuality Track & Value */}
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke="#FF9500"
            strokeWidth={strokeWidth}
            strokeOpacity="0.15"
            fill="none"
          />
          <circle
            cx={center}
            cy={center}
            r={r3}
            stroke="#FF9500"
            strokeWidth={strokeWidth}
            strokeDasharray={c3}
            strokeDashoffset={offset3}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
          />
        </svg>

        {/* Center Target Indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold text-[#86868B] uppercase">Rings</span>
        </div>
      </div>

      {/* Legend / Metrics */}
      {showLegend && (
        <div className="space-y-2 text-xs flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3] shrink-0"></span>
              <span className="text-[#1D1D1F] font-medium">Lectures</span>
            </div>
            <span className="font-semibold text-[#0071E3] font-mono">{theoryPercent}%</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] shrink-0"></span>
              <span className="text-[#1D1D1F] font-medium">Practicals</span>
            </div>
            <span className="font-semibold text-[#34C759] font-mono">{labPercent}%</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500] shrink-0"></span>
              <span className="text-[#1D1D1F] font-medium">Punctuality</span>
            </div>
            <span className="font-semibold text-[#FF9500] font-mono">{punctualityPercent}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
