import React, { useState } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  X, 
  Wifi, 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  AlertCircle
} from 'lucide-react';

export default function StudentPunchModal({ 
  student, 
  onClose, 
  onPunchSuccess 
}) {
  const [otpInput, setOtpInput] = useState('');
  const [isPunching, setIsPunching] = useState(false);
  const [punched, setPunched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePunch = (e) => {
    e.preventDefault();
    if (otpInput.trim().length !== 4) {
      setErrorMsg('Please enter the 4-digit OTP shown on the classroom screen.');
      return;
    }

    setErrorMsg('');
    setIsPunching(true);

    setTimeout(() => {
      setIsPunching(false);
      setPunched(true);
      if (onPunchSuccess) {
        onPunchSuccess();
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Self-Attendance Check-In
              </h2>
              <p className="text-xs text-slate-400">
                Classroom Geofenced Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {punched ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Attendance Marked Present!
              </h3>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Verified at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Geofence &amp; Device ID validated by University Attendance Gateway.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePunch} className="space-y-4">
              {/* Geofence verified badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3 text-xs text-emerald-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">Classroom LH-204 Geofence: Active</span>
                  <span className="text-[11px] text-emerald-700">Connected to University Campus Wi-Fi</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  Enter 4-Digit Classroom Projector OTP
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • •"
                    className="w-48 text-center text-3xl font-mono font-black tracking-widest bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 rounded-2xl py-2.5 outline-none text-slate-900 focus:bg-white transition-all shadow-inner"
                    autoFocus
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs text-rose-600 font-semibold text-center mt-2">
                    {errorMsg}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Look at the faculty projector screen for the current rotating 4-digit code.
                </p>
              </div>

              <button
                type="submit"
                disabled={isPunching || otpInput.length < 4}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPunching ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {isPunching ? 'Verifying OTP & Geofence...' : 'Punch Attendance Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
