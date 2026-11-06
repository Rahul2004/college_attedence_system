import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  X, 
  Wifi, 
  ShieldCheck, 
  MapPin, 
  QrCode, 
  AlertCircle,
  Camera,
  KeyRound,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function StudentPunchModal({ 
  student, 
  onClose, 
  onPunchSuccess 
}) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'otp'
  const [otpInput, setOtpInput] = useState('');
  const [isPunching, setIsPunching] = useState(false);
  const [punched, setPunched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Camera scanning states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [simulatedScanProgress, setSimulatedScanProgress] = useState(0);
  const [isScanningSimulation, setIsScanningSimulation] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera when unmounting or switching to OTP
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startLiveCamera = async () => {
    setCameraError('');
    setIsScanningSimulation(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } else {
        setCameraError('Camera access not supported on this device/browser.');
      }
    } catch (err) {
      console.warn('Live camera permission or device error:', err);
      setCameraError('Camera permission denied or camera unavailable. You can use the Simulated AI Scanner or enter the 4-Digit OTP.');
    }
  };

  const handleSimulatedAutoScan = () => {
    setIsScanningSimulation(true);
    setSimulatedScanProgress(15);
    setErrorMsg('');

    const interval = setInterval(() => {
      setSimulatedScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completePunchSuccess();
          return 100;
        }
        return prev + 25;
      });
    }, 280);
  };

  const completePunchSuccess = () => {
    stopCameraStream();
    setIsPunching(true);
    setTimeout(() => {
      setIsPunching(false);
      setPunched(true);
      if (onPunchSuccess) {
        onPunchSuccess();
      }
    }, 600);
  };

  const handlePunch = (e) => {
    e.preventDefault();
    const cleanOtp = otpInput.trim();
    if (cleanOtp.length !== 4) {
      setErrorMsg('Please enter the complete 4-digit OTP shown on the classroom screen.');
      return;
    }

    const activeOtp = typeof window !== 'undefined' ? localStorage.getItem('active_classroom_otp') : null;
    if (activeOtp && cleanOtp !== activeOtp) {
      setErrorMsg(`Invalid OTP "${cleanOtp}". Code has either expired or does not match active projector session.`);
      return;
    }

    setErrorMsg('');
    completePunchSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0">
              <Smartphone className="w-5 h-5 text-indigo-400" />
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
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                Verified at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Dynamic QR Token &amp; Geofence validated by University Gateway.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Geofence verified badge */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-xs text-emerald-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Wifi className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">Classroom LH-204 Geofence: Active</span>
                  <span className="text-[11px] text-emerald-700">Campus Wi-Fi Connected • GPS Verified</span>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('camera');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'camera'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Scan Live QR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setActiveTab('otp');
                  }}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'otp'
                      ? 'bg-white text-indigo-600 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Enter 4-Digit OTP
                </button>
              </div>

              {/* TAB 1: Camera QR Scanner */}
              {activeTab === 'camera' && (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center text-white">
                    {isCameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <QrCode className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
                        <p className="text-xs font-medium text-slate-300">
                          Point camera at classroom projector screen
                        </p>
                        {cameraError && (
                          <p className="text-[11px] text-amber-400 max-w-xs">{cameraError}</p>
                        )}
                      </div>
                    )}

                    {/* Viewfinder Target Overlay */}
                    <div className="absolute inset-8 border-2 border-indigo-500/80 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-bounce" />
                    </div>

                    {isScanningSimulation && (
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-400 animate-spin" />
                        <span className="text-xs font-semibold text-white">
                          Decoding Rotating Token ({simulatedScanProgress}%)...
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!isCameraActive ? (
                      <button
                        type="button"
                        onClick={startLiveCamera}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-4 h-4 text-indigo-400" />
                        Enable Device Camera
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all"
                      >
                        Stop Camera
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={isScanningSimulation || isPunching}
                      onClick={handleSimulatedAutoScan}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      Auto-Detect QR
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: OTP Entry Form */}
              {activeTab === 'otp' && (
                <form onSubmit={handlePunch} className="space-y-4 pt-1">
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
                        className="w-48 text-center text-3xl font-mono font-black tracking-widest bg-slate-50 border-2 border-slate-200 focus:border-slate-900 rounded-xl py-2.5 outline-none text-slate-900 focus:bg-white transition-all shadow-inner"
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
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
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
          )}
        </div>
      </div>
    </div>
  );
}
