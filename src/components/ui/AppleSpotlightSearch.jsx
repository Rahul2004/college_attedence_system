import React, { useState, useEffect } from 'react';
import { Search, UserCheck, ShieldAlert, BarChart3, X } from 'lucide-react';

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
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-xs transition-opacity"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, roll numbers, or navigation..."
            className="w-full bg-transparent text-slate-900 text-sm placeholder-slate-400 outline-none"
          />
          <kbd className="flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 font-mono border border-slate-200">
            Esc
          </kbd>
        </div>

        {/* Search Results / Quick Actions */}
        <div className="p-2.5 max-h-[380px] overflow-y-auto space-y-2 text-xs">
          {query.trim() === '' ? (
            /* Quick Nav Suggestions */
            <div>
              <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 block">
                Quick navigation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('roster');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 block truncate">Attendance roster</span>
                    <span className="text-[10px] text-slate-500 block truncate">Live class roll call</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('warnings');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 block truncate">Debarment list</span>
                    <span className="text-[10px] text-slate-500 block truncate">Deficit watchlist</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigateTab?.('analytics');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 block truncate">Campus analytics</span>
                    <span className="text-[10px] text-slate-500 block truncate">Aggregate metrics</span>
                  </div>
                </button>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            /* Student Search Hits */
            <div>
              <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 block">
                Matched students ({filteredStudents.length})
              </span>
              <div className="space-y-1 mt-1">
                {filteredStudents.map((std) => (
                  <div
                    key={std.id}
                    onClick={() => {
                      onSelectStudent?.(std);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 group cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-semibold block text-slate-900">
                        {std.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {std.rollNo}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                      (std.attendancePercentage || 0) >= 75
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {std.attendancePercentage || '0.0'}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              No students found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
