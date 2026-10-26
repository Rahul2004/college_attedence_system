import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  TrendingUp, 
  BarChart3, 
  Building2, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Info,
  Layers,
  PieChart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users
} from 'lucide-react';

const WEEKLY_DATA = [
  { label: 'Wk 1', percentage: 92.4, conducted: 6, presentAvg: 55 },
  { label: 'Wk 2', percentage: 86.8, conducted: 6, presentAvg: 52 },
  { label: 'Wk 3', percentage: 71.5, conducted: 6, presentAvg: 43 },
  { label: 'Wk 4', percentage: 64.2, conducted: 6, presentAvg: 38 },
  { label: 'Wk 5', percentage: 78.9, conducted: 6, presentAvg: 47 },
  { label: 'Wk 6', percentage: 84.0, conducted: 6, presentAvg: 50 },
  { label: 'Wk 7', percentage: 69.8, conducted: 6, presentAvg: 42 },
  { label: 'Wk 8', percentage: 88.5, conducted: 6, presentAvg: 53 },
  { label: 'Wk 9', percentage: 73.4, conducted: 6, presentAvg: 44 },
  { label: 'Wk 10', percentage: 81.6, conducted: 4, presentAvg: 49 },
];

const MONTHLY_DATA = [
  { label: 'Jan', percentage: 89.2, conducted: 14, defaulters: 2 },
  { label: 'Feb', percentage: 76.5, conducted: 16, defaulters: 5 },
  { label: 'Mar', percentage: 68.4, conducted: 18, defaulters: 8 },
  { label: 'Apr (Cur)', percentage: 82.4, conducted: 6, defaulters: 3 },
];

const DEPARTMENT_COMPARISONS = [
  { dept: 'Computer Science (CS-602)', code: 'CSE', rate: 82.4, defaulterCount: 4, status: 'Compliant' },
  { dept: 'Electrical Engineering', code: 'EE', rate: 76.1, defaulterCount: 7, status: 'At Risk' },
  { dept: 'Mechanical Engineering', code: 'ME', rate: 88.9, defaulterCount: 1, status: 'Optimal' },
  { dept: 'Civil Engineering', code: 'CE', rate: 71.8, defaulterCount: 9, status: 'Deficit' },
  { dept: 'Information Technology', code: 'IT', rate: 84.5, defaulterCount: 3, status: 'Compliant' },
];

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('WEEKLY');
  const [logData, setLogData] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      setLoadingLogs(true);
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('date, status')
          .order('date', { ascending: false })
          .limit(30);
        if (!error && data) setLogData(data);
      } catch {
        // Fall back gracefully to internal benchmarks
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  const activeTrendData = timeframe === 'WEEKLY' ? WEEKLY_DATA : MONTHLY_DATA;

  return (
    <div className="space-y-6 mb-8">
      <div className="bg-white rounded-[24px] border border-black/[0.08] p-5 sm:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
        {/* Header and Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 border-b border-black/[0.06] gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E8F2FF] text-[#0071E3] flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-xl font-semibold text-[#1D1D1F] tracking-tight">
                Attendance Trends &amp; Demographic Benchmarks
              </h2>
            </div>
            <p className="text-xs text-[#86868B] mt-1 pl-10.5">
              Historical compliance cycles and cross-department turnout metrics.
            </p>
          </div>

          <div className="flex items-center p-1 bg-[#E8E8ED]/80 backdrop-blur-md rounded-full self-start sm:self-auto w-full sm:w-auto border border-black/[0.04]">
            <button
              type="button"
              onClick={() => setTimeframe('WEEKLY')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 text-center ${timeframe === 'WEEKLY'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Weekly Trajectory
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('MONTHLY')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 text-center ${timeframe === 'MONTHLY'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Monthly Summary
            </button>
          </div>
        </div>

        {/* Chart Area */}
        <div className="mt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 mb-3 gap-2">
            <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
              {timeframe === 'WEEKLY' ? 'Weekly Cumulative Turnout (%)' : 'Monthly Cohort Average (%)'}
            </span>
            <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-indigo-600 rounded-xs inline-block"></span>
                Eligible (&ge; 75%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-rose-500 rounded-xs inline-block"></span>
                Shortage (&lt; 75%)
              </span>
              <span className="text-rose-500 font-medium">--- 75% Threshold</span>
            </div>
          </div>

          {/* Bar Chart Canvas with horizontal scroll support on small screens */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:p-6">
            <div className="min-w-[500px] relative">
              {/* 75% Reference Guide Line */}
              <div 
                className="absolute left-0 right-0 border-b border-dashed border-rose-400/80 z-10 pointer-events-none"
                style={{ bottom: '75%' }}
              >
                <span className="absolute right-3 -top-5 text-[10px] font-semibold text-rose-600 bg-white px-2 py-0.5 rounded-md border border-rose-200 shadow-xs">
                  75.0% Exam Threshold
                </span>
              </div>

              {/* Visual Columns */}
              <div className="h-56 flex items-end justify-between gap-3 sm:gap-5 pt-8 pb-1">
                {activeTrendData.map((item, index) => {
                  const isUnder = item.percentage < 75.0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Hover Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-center pointer-events-none z-20 absolute -top-8 left-1/2 -translate-x-1/2">
                        <div className="bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-md whitespace-nowrap">
                          {item.percentage}% ({item.conducted} sessions)
                        </div>
                      </div>

                      {/* Percentage Value */}
                      <span className="text-[10px] sm:text-[11px] font-mono font-semibold mb-1 text-slate-700">
                        {item.percentage}%
                      </span>

                      {/* Single Animated Bar */}
                      <div
                        className={`w-full max-w-[42px] rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-90 ${isUnder
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/20'
                          : 'bg-indigo-600 shadow-sm shadow-indigo-600/20'
                        }`}
                        style={{ height: `${item.percentage}%` }}
                      />

                      {/* Label (e.g. Wk 1, Jan) */}
                      <span className="mt-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Historical Logs from Supabase */}
          <div className="mt-4 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Historical Log Source:</span>{' '}
            {loadingLogs ? (
              <span>Loading attendance_logs...</span>
            ) : logData.length > 0 ? (
              <span className="font-mono text-indigo-600">
                {logData.length} records fetched from attendance_logs
              </span>
            ) : (
              <span>No historical log records yet (submit a session to populate).</span>
            )}
          </div>
        </div>

        {/* Section 2: Department Comparisons */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Cross-Department Turnout Benchmarks
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPARTMENT_COMPARISONS.map((dept, idx) => {
              const isCritical = dept.rate < 75.0;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 transition-all ${isCritical
                    ? 'border-rose-200 bg-rose-50/30'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
                        {dept.code}
                      </span>
                      <h4 className="font-semibold text-xs text-slate-900 mt-0.5">
                        {dept.dept}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isCritical 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {dept.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-xl font-bold font-mono ${
                        isCritical ? 'text-rose-600' : 'text-slate-900'
                      }`}>
                        {dept.rate}%
                      </span>
                      <span className="text-[10px] text-slate-400">average</span>
                    </div>

                    <span className={`text-xs font-semibold ${isCritical ? 'text-rose-600' : 'text-slate-500'}`}>
                      {dept.defaulterCount} Defaulters
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : 'bg-indigo-600'}`}
                      style={{ width: `${Math.min(100, dept.rate)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Dual Advanced Visualizations (Day-of-Week Turnout & Status Distribution Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 2: Day-of-Week Attendance Heat / Velocity Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Day-of-Week Attendance Pattern
                </h3>
                <p className="text-[11px] text-slate-500">
                  Average lecture turnout by weekday
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              Peak: Tue (94.2%)
            </span>
          </div>

          <div className="mt-5 space-y-3.5">
            {[
              { day: 'Monday', rate: 79.4, count: '48/60', isPeak: false },
              { day: 'Tuesday', rate: 94.2, count: '57/60', isPeak: true },
              { day: 'Wednesday', rate: 86.5, count: '52/60', isPeak: false },
              { day: 'Thursday', rate: 82.1, count: '49/60', isPeak: false },
              { day: 'Friday', rate: 68.3, count: '41/60', isPeak: false, isLow: true },
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-xs w-20">{d.day}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({d.count})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${d.isLow ? 'text-rose-600' : d.isPeak ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {d.rate}%
                    </span>
                    {d.isLow && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        Low
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      d.isLow ? 'bg-rose-500' : d.isPeak ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${d.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Friday afternoon slots show recurrent 6.7% deficit under the statutory limit.</span>
          </p>
        </div>

        {/* Graph 3: Cohort Compliance Breakdown (Donut Chart Style) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cohort Eligibility Distribution
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Exam readiness across all enrolled students
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/70">
                60 Enrolled
              </span>
            </div>

            {/* Circular Gauge / Donut Breakdown */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                {/* SVG Donut */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                  {/* Compliant Tier (>=85%): 65% -> dash 155 */}
                  <circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="#4F46E5" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="83.5"
                    strokeLinecap="round"
                  />
                  {/* Safe Tier (75-84%): 22% -> offset */}
                  <circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="#10B981" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="186.2"
                    strokeLinecap="round"
                  />
                  {/* Deficit Tier (<75%): 13% -> offset */}
                  <circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="#EF4444" strokeWidth="12"
                    strokeDasharray="238.7" strokeDashoffset="207.6"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900 font-mono leading-none">87%</span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Eligible</span>
                </div>
              </div>

              {/* Legend & Breakdown Table */}
              <div className="w-full sm:w-auto flex-1 space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50/50 border border-indigo-100/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    <span className="font-semibold text-slate-800">Honor Roll (&ge; 85%)</span>
                  </div>
                  <span className="font-mono font-bold text-indigo-700">39 (65%)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-800">Compliant (75-84%)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">13 (22%)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/50 border border-rose-100/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="font-semibold text-slate-800">Debarred / Risk (&lt; 75%)</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700">8 (13%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">Next Exam Audit:</span>
            <span className="font-semibold text-slate-800 text-[11px]">October 12, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
