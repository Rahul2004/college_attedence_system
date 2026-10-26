import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ShieldAlert, BarChart3, QrCode, X, Command } from 'lucide-react';

export default function AppleSpotlightSearch({
  isOpen = false,
  onClose,
  students = [],
  onSelectStudent,
  onNavigateTab
}) {
  const [query, setQuery] = useState('');

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStudents = query.trim()
    ? students.filter(s => 
        s.name?.toLowerCase().includes(query.toLowerCase()) || 
        s.rollNo?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/40 backdrop-blur-md transition-all">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[24px] border border-black/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/[0.06]">
          <Search className="w-5 h-5 text-[#86868B]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search (Students, Roll No, Navigation)..."
            className="w-full bg-transparent text-[#1D1D1F] text-base placeholder-[#86868B] outline-none"
          />
          <div className="flex items-center gap-1 bg-[#F5F5F7] px-2 py-0.5 rounded-md text-[10px] text-[#86868B] font-mono border border-black/[0.04]">
            ESC
          </div>
        </div>

        {/* Search Results / Quick Actions */}
        <div className="p-3 max-h-[380px] overflow-y-auto space-y-2 text-xs">
          {query.trim() === '' ? (
            /* Quick Nav Suggestions */
            <div>
              <span className="text-[10px] font-semibold text-[#86868B] uppercase px-3 py-1 block">
                Quick Shortcuts
              </span>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('roster');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:bg-black/[0.04] transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-[#0071E3]" />
                  <div>
                    <span className="font-medium text-[#1D1D1F] block">Attendance Roster</span>
                    <span className="text-[10px] text-[#86868B]">Mark today's punches</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('warnings');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:bg-black/[0.04] transition-colors"
                >
                  <ShieldAlert className="w-4 h-4 text-[#FF3B30]" />
                  <div>
                    <span className="font-medium text-[#1D1D1F] block">Debarment Board</span>
                    <span className="text-[10px] text-[#86868B]">Review students in deficit</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('analytics');
                    onClose();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl text-left hover:bg-black/[0.04] transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-[#34C759]" />
                  <div>
                    <span className="font-medium text-[#1D1D1F] block">Campus Analytics</span>
                    <span className="text-[10px] text-[#86868B]">Trends and metrics</span>
                  </div>
                </button>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            /* Student Search Hits */
            <div>
              <span className="text-[10px] font-semibold text-[#86868B] uppercase px-3 py-1 block">
                Matched Students ({filteredStudents.length})
              </span>
              <div className="space-y-1 mt-1">
                {filteredStudents.map((std) => (
                  <div
                    key={std.id}
                    onClick={() => {
                      onSelectStudent?.(std);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0071E3] hover:text-white group cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-semibold block text-[#1D1D1F] group-hover:text-white">
                        {std.name}
                      </span>
                      <span className="text-[11px] text-[#86868B] group-hover:text-white/80 font-mono">
                        {std.rollNo}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                      (std.attendancePercentage || 0) >= 75
                        ? 'bg-[#EBF9EE] text-[#34C759] group-hover:bg-white/20 group-hover:text-white'
                        : 'bg-[#FFECEB] text-[#FF3B30] group-hover:bg-white/20 group-hover:text-white'
                    }`}>
                      {std.attendancePercentage || '0.0'}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-[#86868B]">
              No student found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
