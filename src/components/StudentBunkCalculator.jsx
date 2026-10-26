import React, { useState } from 'react';
import { 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Flame, 
  Coffee, 
  RotateCcw,
  TrendingUp,
  Percent
} from 'lucide-react';

export default function StudentBunkCalculator({ student, subjects }) {
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('ALL');
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [simulatedAttendedDelta, setSimulatedAttendedDelta] = useState(0);
  const [simulatedTotalDelta, setSimulatedTotalDelta] = useState(0);

  // Compute stats based on selected subject or aggregate
  let baseAttended = 0;
  let baseTotal = 0;

  if (selectedSubjectCode === 'ALL') {
    if (subjects && subjects.length > 0) {
      baseAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
      baseTotal = subjects.reduce((sum, s) => sum + s.total, 0);
    } else {
      baseAttended = student?.attendedClasses || 40;
      baseTotal = student?.totalClasses || 52;
    }
  } else {
    const sub = subjects?.find(s => s.code === selectedSubjectCode);
    baseAttended = sub ? sub.attended : student?.attendedClasses || 40;
    baseTotal = sub ? sub.total : student?.totalClasses || 52;
  }

  // Apply simulated "What-If" future lectures
  const currentAttended = baseAttended + simulatedAttendedDelta;
  const currentTotal = baseTotal + simulatedTotalDelta;
  const currentPercentage = currentTotal > 0 
    ? Number(((currentAttended / currentTotal) * 100).toFixed(1)) 
    : 0;

  const targetRatio = targetPercentage / 100;
  const denominator = Math.max(0.01, 1 - targetRatio);

  // 1. If below target: Classes needed without missing
  const classesNeededToAttend = currentPercentage < targetPercentage
    ? Math.max(0, Math.ceil((targetRatio * currentTotal - currentAttended) / denominator))
    : 0;

  // 2. If above target: Safe bunkable classes
  const safeClassesToBunk = currentPercentage >= targetPercentage
    ? Math.max(0, Math.floor((currentAttended - targetRatio * currentTotal) / (targetRatio || 0.75)))
    : 0;

  const handleSimulateAttend = () => {
    setSimulatedAttendedDelta(prev => prev + 1);
    setSimulatedTotalDelta(prev => prev + 1);
  };

  const handleSimulateMiss = () => {
    setSimulatedTotalDelta(prev => prev + 1);
  };

  const handleResetSimulation = () => {
    setSimulatedAttendedDelta(0);
    setSimulatedTotalDelta(0);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Bunk &amp; Attendance Target Predictor
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                What-If Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calculate exactly how many classes you can skip or must attend to hit your goal
            </p>
          </div>
        </div>

        {/* Scope Selector */}
        <select
          value={selectedSubjectCode}
          onChange={e => {
            setSelectedSubjectCode(e.target.value);
            handleResetSimulation();
          }}
          className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
        >
          <option value="ALL">All Subjects Aggregate</option>
          {subjects?.map(s => (
            <option key={s.code} value={s.code}>
              {s.code}: {s.name.split(' ')[0]} ({s.percentage}%)
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Target Slider & Result Card */}
        <div className="lg:col-span-7 space-y-5">
          {/* Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-700">Target Attendance Goal:</span>
              <span className="text-indigo-600 font-bold font-mono text-sm px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100">
                {targetPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="60"
              max="90"
              step="1"
              value={targetPercentage}
              onChange={e => setTargetPercentage(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
              <span>60% (Condonation)</span>
              <span className="text-rose-500 font-bold">75% (Mandatory University Rule)</span>
              <span>85% (Scholarship)</span>
              <span>90% (Distinction)</span>
            </div>
          </div>

          {/* Large Result Box */}
          {currentPercentage < targetPercentage ? (
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/70 p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4 text-rose-600" />
                Attendance Deficit Alert
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-950 tracking-tight">
                Attend next <span className="underline text-rose-700">{classesNeededToAttend} consecutive classes</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                You are currently at <strong>{currentPercentage}%</strong> ({currentAttended}/{currentTotal} classes). To reach your target of <strong>{targetPercentage}%</strong>, you cannot afford to miss any lectures until you attend <strong>{classesNeededToAttend} more</strong>!
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <Coffee className="w-4 h-4 text-emerald-600" />
                Safe Bunk Margin Available
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                You can safely bunk <span className="underline text-emerald-700">{safeClassesToBunk} classes</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                You are currently at <strong>{currentPercentage}%</strong> ({currentAttended}/{currentTotal} classes). You have a buffer of <strong>{safeClassesToBunk} lectures</strong> that you can skip while still maintaining &ge; <strong>{targetPercentage}%</strong>!
              </p>
            </div>
          )}
        </div>

        {/* Right Column: "What-If" Future Lecture Simulator */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              Attendance Target Simulator
            </h4>
            {(simulatedAttendedDelta !== 0 || simulatedTotalDelta !== 0) && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Simulate attending or skipping upcoming classes to see your predicted rate:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleSimulateAttend}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-800 text-xs font-bold transition-all shadow-xs flex flex-col items-center justify-center gap-1 active:scale-[0.98]"
            >
              <span className="text-emerald-600 text-base font-extrabold">+1 Attended</span>
              <span className="text-[10px] text-slate-400 font-normal">Go to class</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateMiss}
              className="p-3 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-800 text-xs font-bold transition-all shadow-xs flex flex-col items-center justify-center gap-1 active:scale-[0.98]"
            >
              <span className="text-rose-600 text-base font-extrabold">+1 Missed / Bunked</span>
              <span className="text-[10px] text-slate-400 font-normal">Skip class</span>
            </button>
          </div>

          {/* Current Predicted Rate Strip */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500">Simulated Attendance:</span>
            <span className={`font-mono font-extrabold text-sm ${currentPercentage >= targetPercentage ? 'text-emerald-600' : 'text-rose-600'}`}>
              {currentPercentage}% ({currentAttended}/{currentTotal})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
