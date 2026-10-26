import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Minimize2, 
  Maximize2,
  HelpCircle,
  FileText,
  TrendingUp,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { askGeminiAssistant } from '../../lib/gemini';

export default function AppleSiriIntelligenceModal({
  isOpen,
  onClose,
  role = 'student',
  context = {}
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const apiKeyInput = localStorage.getItem('attendos_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
  const messagesEndRef = useRef(null);

  // Suggested quick prompts per role
  const quickPrompts = role === 'student' 
    ? [
        "Am I eligible for my semester exam hall ticket?",
        "Draft a formal medical leave letter for my professor",
        "How many classes can I safely miss without defaulting?",
        "Calculate how many classes I need to reach 80% attendance"
      ]
    : role === 'faculty'
    ? [
        "Which students in today's class are at critical risk?",
        "Draft a WhatsApp attendance warning for defaulters' parents",
        "Summarize attendance statistics for this subject",
        "How many students have medical exemptions pending?"
      ]
    : [
        "Generate a debarment circular draft for under-75% students",
        "What is the institutional attendance health across departments?",
        "Explain AICTE / UGC attendance compliance rules",
        "Suggest attendance improvement strategies for engineering"
      ];

  // Initialize welcome message when modal opens or role changes
  useEffect(() => {
    if (isOpen) {
      const roleGreeting = role === 'student'
        ? `Hi ${context.student?.name?.split(' ')[0] || 'there'}! I'm your AttendOS AI Copilot. I can analyze your attendance, calculate your exam eligibility, or draft medical leave letters for you.`
        : role === 'faculty'
        ? `Welcome Professor. I'm your Classroom AI Assistant for ${context.activeCourse?.code || 'CS-602'}. I can analyze batch shortages, draft parental notices, or summarize attendance trends.`
        : `Greetings Administrator. AttendOS Institutional Intelligence is ready to audit compliance, analyze departmental metrics, and draft official notifications.`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: roleGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, role, context.student?.name, context.activeCourse?.code]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const activeKey = localStorage.getItem('attendos_gemini_api_key') || apiKeyInput;
      const aiReply = await askGeminiAssistant(query.trim(), context, role, activeKey, updatedMessages);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: "I encountered an issue processing your request. Please try again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const roleThemeColor = role === 'admin'
    ? 'from-purple-600 via-pink-600 to-indigo-600'
    : role === 'faculty'
    ? 'from-blue-600 via-indigo-600 to-sky-500'
    : 'from-emerald-600 via-teal-600 to-cyan-600';

  const roleBadgeText = role === 'admin'
    ? 'Admin Intelligence Suite'
    : role === 'faculty'
    ? 'Faculty Classroom Intelligence'
    : 'Student Academic Copilot';

  const isCloudAiConnected = apiKeyInput && (apiKeyInput.startsWith('AQ.') || apiKeyInput.startsWith('AIzaSy'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.3)] border border-black/[0.08] w-full max-w-2xl h-[85vh] max-h-[720px] flex flex-col overflow-hidden relative">
        
        {/* Apple Intelligence Header with Siri-like Glow */}
        <div className="relative bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0 overflow-hidden">
          {/* Subtle Dynamic Ambient Glow */}
          <div className={`absolute -top-10 left-1/4 w-72 h-20 bg-gradient-to-r ${roleThemeColor} opacity-40 blur-2xl pointer-events-none rounded-full`} />

          <div className="relative flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl bg-gradient-to-br ${roleThemeColor} flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 ring-2 ring-white/20`}>
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight font-display">
                  AttendOS AI Copilot
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/10">
                  {roleBadgeText}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCloudAiConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {isCloudAiConnected ? '● Cloud Gemini Live' : '● Local Assistant'}
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                {role === 'student'
                  ? `Private context for ${context.student?.name || 'Student'}`
                  : role === 'faculty'
                  ? `Active Class: ${context.activeCourse?.code || 'CS-602'}`
                  : `Institutional Audit & Governance`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-sans">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${roleThemeColor} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs`}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] group relative ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 shadow-sm'
                    : 'bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.04] rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs'
                }`}>
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/[0.04] text-[10px] text-[#86868B]">
                    <span>{msg.time}</span>
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, idx)}
                        className="opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-[#0071E3] font-semibold"
                        title="Copy Response"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-[#86868B] animate-pulse">
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${roleThemeColor} flex items-center justify-center text-white shrink-0 shadow-xs`}>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-[#F5F5F7] px-4 py-2.5 rounded-2xl rounded-tl-xs border border-black/[0.04] flex items-center gap-2">
                <span>Thinking &amp; analyzing your academic data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Role-Specific Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-black/[0.04] bg-[#F5F5F7]/80 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-medium bg-white hover:bg-slate-50 text-[#1D1D1F] border border-black/[0.06] shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 bg-white border-t border-black/[0.06] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              role === 'student'
                ? "Ask AI: 'How many classes can I miss?', 'Draft medical leave'..."
                : role === 'faculty'
                ? "Ask AI: 'Show top defaulters', 'Draft parent warning'..."
                : "Ask AI: 'Generate debarment notice', 'Audit compliance'..."
            }
            className="flex-1 px-4 py-2.5 text-xs bg-[#F5F5F7] rounded-full border border-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 text-[#1D1D1F] placeholder-[#86868B]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
