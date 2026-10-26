import React, { useState } from 'react';
import { ShieldCheck, Wifi, Award, QrCode } from 'lucide-react';

export default function AppleWalletStudentId({
  student = {
    name: 'Aarav Sharma',
    rollNo: 'CS-2024-042',
    department: 'Computer Science & Engineering',
    semester: '6th Semester',
    attendance: 88.5
  },
  threshold = 75
}) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth 3D tilt calculation (-10 to +10 deg)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div className="perspective-1000 py-4 select-none">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="relative w-full max-w-[380px] h-[225px] rounded-[24px] p-6 text-white overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer bg-gradient-to-br from-[#1C1C1E] via-[#2C2C2E] to-[#121214] border border-white/15"
      >
        {/* Holographic Specular Shine on hover */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(circle 240px at ${rotate.y * 15 + 50}% ${rotate.x * -15 + 50}%, rgba(255,255,255,0.8), transparent 80%)`
          }}
        />

        {/* Apple subtle background gradient orb */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#0071E3]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header: NFC / University & Badge */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/15 backdrop-blur-md">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-white/50 block leading-none">
                INSTITUTIONAL PASS
              </span>
              <span className="text-xs font-semibold tracking-tight text-white/90">
                CAMPUS ACCESS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/60">
            <Wifi className="w-4 h-4 rotate-90" />
            <span className="text-[10px] font-mono border border-white/20 px-2 py-0.5 rounded-full">
              NFC
            </span>
          </div>
        </div>

        {/* Card Body: Student Details */}
        <div className="mt-7 relative z-10">
          <h3 className="text-xl font-bold tracking-tight text-white truncate">
            {student.name || 'Enrolled Student'}
          </h3>
          <p className="text-xs text-white/60 font-mono mt-0.5">
            {student.rollNo || 'CS-2024-000'}
          </p>
        </div>

        {/* Card Footer: Department & Attendance Status */}
        <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between relative z-10 pt-3 border-t border-white/10">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-white/50 block">PROGRAM</span>
            <span className="text-xs font-medium text-white/90 truncate block max-w-[200px]">
              {student.department || 'Computer Science'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-white/50 block">ATTENDANCE</span>
            <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
              (student.attendance || 0) >= threshold
                ? 'bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30'
                : 'bg-[#FF3B30]/20 text-[#FF3B30] border border-[#FF3B30]/30'
            }`}>
              {student.attendance || '0.0'}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
