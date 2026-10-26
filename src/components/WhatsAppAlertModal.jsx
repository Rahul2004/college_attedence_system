import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  CheckCheck, 
  X, 
  PhoneCall, 
  ShieldAlert, 
  Copy, 
  Check, 
  Globe2 
} from 'lucide-react';

export default function WhatsAppAlertModal({ 
  defaulter, 
  course, 
  threshold = 75,
  onClose, 
  onDispatched 
}) {
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [parentPhone, setParentPhone] = useState(defaulter?.parentContact || '+91 98765-43210');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const studentName = defaulter?.name || 'Aarav Sharma';
  const rollNo = defaulter?.rollNo || 'CS-601';
  const attendanceRate = defaulter?.percentage || 68.4;
  const courseCode = course?.code || 'CS-602';
  const courseName = course?.name || 'Database Management Systems';
  const facultyName = course?.faculty || 'Prof. Rajesh Verma';
  const recoveryNeeded = defaulter?.recoveryNeeded || 4;

  const englishMessage = `*OFFICIAL UNIVERSITY ATTENDANCE ADVISORY*
National Institute of Technology & Engineering
Office of Dean Academic Affairs

Dear Parent / Guardian of *${studentName}* (Roll No: *${rollNo}*),

This is an urgent academic notice regarding your ward's attendance in *${courseCode}: ${courseName}*.

• Current Attendance: *${attendanceRate}%*
• Mandatory University Threshold: *${threshold.toFixed(1)}%*
• Status: *CRITICAL SHORTAGE (Risk of Exam Debarment)*

Your ward is required to attend the next *${recoveryNeeded} consecutive lectures* without fail to restore statutory clearance.

Kindly discuss this with your ward. For inquiries, meet Faculty In-Charge *${facultyName}* in Aryabhata Complex.

Ref: NIT/ATTN-ALERT/${rollNo}/${new Date().getFullYear()}`;

  const hindiMessage = `*आधिकारिक विश्वविद्यालय उपस्थिति सूचना*
राष्ट्रीय प्रौद्योगिकी एवं अभियांत्रिकी संस्थान
शैक्षणिक कार्यलय (Dean Academics)

प्रिय अभिभावक, छात्र *${studentName}* (अनुक्रमांक: *${rollNo}*),

यह आपके सुपुत्र/सुपुत्री की *${courseCode}: ${courseName}* विषय में उपस्थिति संबंधी महत्वपूर्ण सूचना है।

• वर्तमान उपस्थिति: *${attendanceRate}%*
• विश्वविद्यालय अनिवार्य न्यूनतम सीमा: *${threshold.toFixed(1)}%*
• स्थिति: *गंभीर कमी (परीक्षा से वंचित होने का जोखिम)*

परीक्षा में बैठने की अनुमति हेतु आपके बच्चे को आगामी *${recoveryNeeded} कक्षाएं* लगातार उपस्थित रहनी होंगी।

कृपया इस पर संज्ञान लें। सहायता हेतु विषय प्राध्यापक *${facultyName}* से संपर्क करें।

संदर्भ: NIT/ATTN-ALERT/${rollNo}/${new Date().getFullYear()}`;

  const activeMessage = language === 'en' ? englishMessage : hindiMessage;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      if (onDispatched) {
        onDispatched(defaulter.id);
      }
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    const cleanPhone = parentPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(activeMessage);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                WhatsApp &amp; SMS Parent Alert
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                  Official Dispatch
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                Notify parent/guardian about &lt; 75% attendance shortage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Student Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Recipient Ward:</span>
              <strong className="text-sm font-bold text-slate-900">{studentName}</strong>
              <span className="text-slate-500 font-mono ml-2">({rollNo})</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold font-mono">
                {attendanceRate}% Attendance
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                +{recoveryNeeded} Streak Needed
              </span>
            </div>
          </div>

          {/* Phone Number & Language Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                Parent Registered Contact
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                className="w-full text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                Language Format
              </label>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    language === 'en'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    language === 'hi'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  हिंदी (Hindi)
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Chat Bubble Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              WhatsApp Message Preview
            </label>
            <div className="bg-[#e5ddd5] p-4 rounded-2xl border border-slate-200/80 shadow-inner">
              <div className="bg-white rounded-2xl rounded-tl-xs p-4 shadow-sm border border-slate-200/60 max-w-lg text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                {activeMessage}
                <div className="mt-2 text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className={`w-3.5 h-3.5 ${isSent ? 'text-blue-500' : 'text-slate-400'}`} />
                </div>
              </div>
            </div>
          </div>

          {isSent && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Official attendance advisory successfully dispatched to parent contact!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied' : 'Copy Text'}
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleOpenWhatsAppWeb}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Open WhatsApp Web
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || isSent}
              className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50"
            >
              {isSending ? (
                <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isSending ? 'Dispatching...' : isSent ? 'Sent Successfully' : 'Send WhatsApp Advisory'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
