import React from 'react';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Clock, 
  BarChart3,
  Smartphone,
  Laptop
} from 'lucide-react';

export default function RoleSelectionHub({ onSelectRole, currentRole }) {
  const roles = [
    {
      id: 'student',
      title: 'Student Portal',
      subtitle: 'Personal Attendance & Digital Campus Pass',
      badge: 'Self-Service',
      badgeColor: 'bg-[#EBF9EE] text-[#34C759] border-[#34C759]/20',
      icon: GraduationCap,
      accent: '#34C759',
      features: [
        'Live Attendance Analytics & Target Tracking',
        'Multi-Tier Radial Activity Metric Rings',
        'Holographic 3D Digital Student Pass',
        'Leave & Medical Duty Applications'
      ],
      description: 'Clean, distraction-free environment tailored for mobile & tablet checking on the go.'
    },
    {
      id: 'faculty',
      title: 'Faculty Workspace',
      subtitle: 'Classroom Attendance & Live Marking',
      badge: 'Daily Lecture',
      badgeColor: 'bg-[#E8F2FF] text-[#0071E3] border-[#0071E3]/20',
      icon: UserCheck,
      accent: '#0071E3',
      features: [
        'One-Tap Attendance Grid & Roster',
        'Dynamic Rotating QR Code (Anti-proxy)',
        'Live Dynamic Island Status Pill',
        'Single-click WhatsApp Deficit Warnings'
      ],
      description: 'Streamlined desktop & tablet optimized register with fast bulk operations.'
    },
    {
      id: 'admin',
      title: 'Executive Admin Suite',
      subtitle: 'Institutional Governance & Audit',
      badge: 'Restricted',
      badgeColor: 'bg-[#F6EDFC] text-[#AF52DE] border-[#AF52DE]/20',
      icon: ShieldCheck,
      accent: '#AF52DE',
      features: [
        'Universal Semester & Program Curriculum Config',
        'Exam Debarment Notice Generation (75% Rule)',
        'Campus-wide Analytics & Deficit Trends',
        'Bulk CSV / Excel Student Importer'
      ],
      description: 'High-density institutional dashboard designed for college administration.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col justify-between p-4 sm:p-6 md:p-12">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center font-bold shadow-md">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1D1D1F]">
              AttendOS
            </h1>
            <p className="text-xs text-[#86868B]">Clean Multi-Device Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#86868B] bg-white/70 backdrop-blur-xl px-3 py-1.5 rounded-full border border-black/[0.06]">
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
          <span>Adaptive Fluid Interface Architecture</span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="max-w-4xl mx-auto w-full text-center my-8 sm:my-12">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#0071E3] bg-[#E8F2FF] px-3.5 py-1 rounded-full border border-[#0071E3]/20">
          Tailored Workspaces
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] mt-3 sm:mt-4 leading-tight">
          Select your dedicated environment.
        </h2>
        <p className="text-sm sm:text-base text-[#86868B] max-w-xl mx-auto mt-3">
          Every role has an uncluttered, responsive interface built specifically for mobile, tablet, and desktop viewports.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        {roles.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.id;

          return (
            <div
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              className={`group relative overflow-hidden rounded-[28px] p-7 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-white shadow-[0_24px_60px_rgba(0,0,0,0.1)] border-2 border-[#0071E3] scale-[1.02]'
                  : 'bg-white/80 backdrop-blur-2xl border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1'
              }`}
            >
              {/* Background ambient gradient */}
              <div 
                className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: r.accent }}
              />

              <div>
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: r.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-bold tracking-tight text-[#1D1D1F]">
                    {r.title}
                  </h3>
                  <p className="text-xs text-[#86868B] font-medium mt-1">
                    {r.subtitle}
                  </p>
                  <p className="text-xs text-[#6E6E73] mt-3 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                {/* Features Checklist */}
                <div className="mt-6 pt-5 border-t border-black/[0.06] space-y-2.5">
                  {r.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#1D1D1F]">
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: r.accent }} />
                      <span className="font-medium truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-[#1D1D1F] text-white shadow-md'
                      : 'bg-[#F5F5F7] group-hover:bg-[#1D1D1F] group-hover:text-white text-[#1D1D1F]'
                  }`}
                >
                  <span>Enter {r.title.split(' ')[0]} Space</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="max-w-6xl mx-auto w-full text-center py-6 text-xs text-[#86868B] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#86868B]" />
          <span>Mobile Optimized</span>
          <span>•</span>
          <Laptop className="w-4 h-4 text-[#86868B]" />
          <span>Desktop Enhanced</span>
        </div>
        <p>© 2026 Institutional Attendance System • Clean Isolated Workspaces</p>
      </div>
    </div>
  );
}
