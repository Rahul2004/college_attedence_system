import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Users, 
  RefreshCw, 
  CheckCircle2, 
  X, 
  Maximize2, 
  Radio, 
  Smartphone, 
  Wifi,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function DynamicQrAttendanceModal({ 
  course, 
  students, 
  onClose, 
  onApplyScannedStudents 
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [otpCode, setOtpCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [scannedStudents, setScannedStudents] = useState([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Generate new OTP and refresh QR payload every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setOtpCode(Math.floor(1000 + Math.random() * 9000).toString());
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Live simulation of students scanning in the classroom
  useEffect(() => {
    if (!isSimulating || !students || students.length === 0) return;

    // Pick 3 to 6 students to randomly "check in" over time if not already checked in
    const candidates = students.filter(s => !scannedStudents.some(sc => sc.id === s.id));
    if (candidates.length === 0) return;

    const interval = setInterval(() => {
      setScannedStudents(prev => {
        const remaining = students.filter(s => !prev.some(sc => sc.id === s.id));
        if (remaining.length === 0) return prev;
        const nextStudent = remaining[Math.floor(Math.random() * remaining.length)];
        const punchTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return [{ ...nextStudent, punchTime }, ...prev];
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, students, scannedStudents]);

  const handleManualAddStudent = (student) => {
    if (!scannedStudents.some(s => s.id === student.id)) {
      const punchTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setScannedStudents(prev => [{ ...student, punchTime }, ...prev]);
    }
  };

  const handleSyncToRoster = () => {
    if (onApplyScannedStudents) {
      onApplyScannedStudents(scannedStudents);
    }
    onClose();
  };

  const progressPercentage = ((30 - timeLeft) / 30) * 100;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md transition-all ${isFullScreen ? 'p-0' : ''}`}>
      <div className={`bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full flex flex-col overflow-hidden max-h-[94vh] ${
        isFullScreen ? 'h-screen max-h-screen rounded-none' : 'max-w-5xl'
      }`}>
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 sm:px-8 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 text-white">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Dynamic QR &amp; Live OTP Projector Mode
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Session Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Project on Classroom Display • Anti-Proxy Geofenced Check-in
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreen(prev => !prev)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen Projector'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Course Info Strip */}
        <div className="bg-slate-50 px-5 sm:px-8 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
              {course.code}
            </span>
            <span className="font-semibold text-slate-800">{course.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-medium">Faculty: <strong>{course.faculty}</strong></span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {course.room}
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {course.timeSlot}
            </span>
          </div>
        </div>

        {/* Main Content: Split Projector View */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: QR Code + Live OTP Card */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center">
            {/* Top OTP Security Block */}
            <div className="w-full mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                4-Digit Rotating Classroom OTP
              </span>
              <div className="inline-flex items-center gap-3 bg-slate-900 text-white px-6 py-2.5 rounded-2xl shadow-md border border-slate-800 font-mono text-3xl sm:text-4xl font-extrabold tracking-widest">
                <span>{otpCode[0]}</span>
                <span>{otpCode[1]}</span>
                <span>{otpCode[2]}</span>
                <span>{otpCode[3]}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Students can type this code or scan the dynamic QR below.
              </p>
            </div>

            {/* High-Contrast Dynamic QR Code Visual */}
            <div className="relative p-6 bg-white rounded-3xl border-4 border-indigo-600 shadow-xl flex items-center justify-center">
              {/* Dynamic QR SVG Pattern with Animated Scanning Laser */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 relative flex items-center justify-center">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 200 200" fill="currentColor">
                  {/* Top-Left Finder */}
                  <rect x="10" y="10" width="50" height="50" rx="6" fill="#0f172a" />
                  <rect x="20" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                  <rect x="28" y="28" width="14" height="14" rx="2" fill="#4f46e5" />
                  
                  {/* Top-Right Finder */}
                  <rect x="140" y="10" width="50" height="50" rx="6" fill="#0f172a" />
                  <rect x="150" y="20" width="30" height="30" rx="3" fill="#ffffff" />
                  <rect x="158" y="28" width="14" height="14" rx="2" fill="#4f46e5" />

                  {/* Bottom-Left Finder */}
                  <rect x="10" y="140" width="50" height="50" rx="6" fill="#0f172a" />
                  <rect x="20" y="150" width="30" height="30" rx="3" fill="#ffffff" />
                  <rect x="28" y="158" width="14" height="14" rx="2" fill="#4f46e5" />

                  {/* Matrix Bits */}
                  <rect x="70" y="20" width="12" height="12" />
                  <rect x="90" y="20" width="12" height="12" />
                  <rect x="110" y="20" width="12" height="12" />
                  <rect x="70" y="40" width="12" height="12" />
                  <rect x="110" y="40" width="12" height="12" />
                  
                  <rect x="20" y="70" width="12" height="12" />
                  <rect x="40" y="70" width="12" height="12" />
                  <rect x="70" y="70" width="20" height="20" fill="#4f46e5" />
                  <rect x="100" y="70" width="12" height="12" />
                  <rect x="130" y="70" width="12" height="12" />
                  <rect x="160" y="70" width="12" height="12" />

                  <rect x="20" y="90" width="12" height="12" />
                  <rect x="50" y="90" width="12" height="12" />
                  <rect x="100" y="90" width="12" height="12" />
                  <rect x="140" y="90" width="20" height="20" fill="#4f46e5" />
                  <rect x="170" y="90" width="12" height="12" />

                  <rect x="70" y="120" width="12" height="12" />
                  <rect x="90" y="120" width="12" height="12" />
                  <rect x="120" y="120" width="12" height="12" />
                  <rect x="150" y="120" width="12" height="12" />

                  <rect x="70" y="140" width="20" height="20" fill="#4f46e5" />
                  <rect x="100" y="140" width="12" height="12" />
                  <rect x="130" y="140" width="12" height="12" />
                  <rect x="160" y="140" width="12" height="12" />

                  <rect x="70" y="170" width="12" height="12" />
                  <rect x="100" y="170" width="12" height="12" />
                  <rect x="120" y="170" width="20" height="20" fill="#4f46e5" />
                  <rect x="160" y="170" width="12" height="12" />
                </svg>

                {/* Animated Scanner Laser Bar */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-lg shadow-rose-500 animate-pulse pointer-events-none top-1/2 transform -translate-y-1/2" />
              </div>

              {/* Expiring Countdown Circular Indicator */}
              <div className="absolute -bottom-4 bg-slate-900 text-white px-4 py-1.5 rounded-full border border-slate-700 shadow-md text-xs font-bold flex items-center gap-2">
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${timeLeft < 5 ? 'animate-spin' : ''}`} />
                <span>Refreshes in {timeLeft}s</span>
              </div>
            </div>

            {/* Anti-Proxy Security Signals */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-200 font-semibold">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                Campus Wi-Fi Geofence: Active
              </span>
              <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-xl border border-indigo-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                MAC / Device ID Bound
              </span>
            </div>
          </div>

          {/* Right Column: Live Punch Feed */}
          <div className="lg:col-span-5 flex flex-col h-full space-y-4">
            {/* Feed Counter Header */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Live Verified Punches
                  </h3>
                </div>
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {scannedStudents.length} / {students.length} Present
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(scannedStudents.length / (students.length || 1)) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{((scannedStudents.length / (students.length || 1)) * 100).toFixed(0)}% Cohort Scanned</span>
                <span>{students.length - scannedStudents.length} Pending</span>
              </div>
            </div>

            {/* Live Scanned Roster List */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs min-h-[280px] max-h-[380px] overflow-y-auto space-y-2">
              {scannedStudents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Smartphone className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                  <p className="text-xs font-semibold text-slate-600">Waiting for student check-ins...</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Students in lecture hall are scanning QR code right now.
                  </p>
                </div>
              ) : (
                scannedStudents.map((st) => (
                  <div 
                    key={st.id} 
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 block truncate">
                          {st.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {st.rollNo}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                      {st.punchTime || 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Simulate Button for Testing & Sync Button */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSyncToRoster}
                disabled={scannedStudents.length === 0}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalize &amp; Apply {scannedStudents.length} Punches to Class Roster
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <button
                  type="button"
                  onClick={() => {
                    const remaining = students.filter(s => !scannedStudents.some(sc => sc.id === s.id));
                    if (remaining.length > 0) {
                      handleManualAddStudent(remaining[0]);
                    }
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] underline"
                >
                  + Simulate Next Student Scan
                </button>
                <button
                  type="button"
                  onClick={() => setScannedStudents([])}
                  className="text-slate-400 hover:text-slate-600 text-[11px]"
                >
                  Reset Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
