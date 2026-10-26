import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, X } from 'lucide-react';

export default function AppleRibbonBanner({
  lowWarningCount = 0,
  threshold = 75,
  onReviewDeficit
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || lowWarningCount === 0) return null;

  return (
    <div className="w-full bg-[#1D1D1F] text-white text-xs py-2.5 px-4 flex items-center justify-between shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-1 text-center">
        <span className="inline-flex items-center gap-1.5 font-medium text-white/90">
          <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse"></span>
          <span>Attendance Advisory:</span>
        </span>
        <span className="text-white/70 hidden sm:inline">
          {lowWarningCount} students are below the institutional {threshold}% statutory threshold and require debarment review.
        </span>
        {onReviewDeficit && (
          <button
            type="button"
            onClick={onReviewDeficit}
            className="text-[#2997FF] hover:underline font-semibold flex items-center gap-1 ml-1"
          >
            Review Board <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="text-white/40 hover:text-white p-1 rounded-full transition-colors ml-2"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
