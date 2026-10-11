import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronDown,
  Bell,
  Mail,
  ShieldCheck,
  Globe,
  Radio,
  FileSpreadsheet,
  Plus,
  Send,
  Printer,
  Download,
  Building2,
  UserCheck,
  AlertCircle,
  Paperclip,
  QrCode
} from 'lucide-react';
import StudentBunkCalculator from './StudentBunkCalculator';
import StudentPunchModal from './StudentPunchModal';

export default function StudentView({ student, activeTab = 'overview' }) {
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS-602');

  // Leave application form state
  const [leaveCategory, setLeaveCategory] = useState('Medical');
  const [leaveStartDate, setLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveEndDate, setLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [leaveSubject, setLeaveSubject] = useState('CS-602: Database Management Systems (DBMS)');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveSubmitted, setLeaveSubmitted] = useState(false);
  const [leavesList, setLeavesList] = useState([
    {
      id: 'LV-8821',
      category: 'Medical Sick Leave',
      subject: 'CS-602 DBMS',
      dates: '12 Sep 2026 – 14 Sep 2026 (3 Days)',
      reason: 'Viral fever accompanied by severe fatigue. Medical certificate attached.',
      status: 'Approved',
      approvedBy: 'Prof. Rajesh Verma',
      dateApplied: '15 Sep 2026'
    },
    {
      id: 'LV-8822',
      category: 'On-Duty (OD) Sports',
      subject: 'CS-601 Machine Learning',
      dates: '28 Sep 2026 (1 Day)',
      reason: 'Inter-College State Cricket Tournament representation for University.',
      status: 'Approved',
      approvedBy: 'Dr. S. K. Gupta',
      dateApplied: '25 Sep 2026'
    }
  ]);
  const [attachedDocName, setAttachedDocName] = useState('apollo_hospital_fitness_slip.pdf');
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [todayMarkedPresent, setTodayMarkedPresent] = useState(student.todayStatus === 'PRESENT');

  const isTodayPresent = todayMarkedPresent || student.todayStatus === 'PRESENT';
  const effectiveAttended = isTodayPresent
    ? student.attendedClasses + 1
    : student.attendedClasses;
  const effectiveTotal = student.totalClasses + 1;
  const percentage = Number(((effectiveAttended / effectiveTotal) * 100).toFixed(1));
  const isDefaulter = percentage < 75.0;

  const recoveryClasses = isDefaulter
    ? Math.max(0, Math.ceil((0.75 * effectiveTotal - effectiveAttended) / 0.25))
    : 0;

  const safeMissable = !isDefaulter
    ? Math.max(0, Math.floor((effectiveAttended - 0.75 * effectiveTotal) / 0.75))
    : 0;

  // Real Indian College Subjects for B.Tech Semester VI
  const indianSubjects = [
    {
      code: 'CS-601',
      name: 'Machine Learning & Artificial Intelligence',
      faculty: 'Dr. S. K. Gupta, Ph.D. (IIT Delhi)',
      attended: 42,
      total: 48,
      percentage: 87.5,
      credits: 4,
      room: 'LT-201 (Ramanujan Complex)',
      type: 'Core Theory',
      status: 'Eligible',
      icon: 'globe'
    },
    {
      code: 'CS-602',
      name: 'Database Management Systems (DBMS)',
      faculty: 'Prof. Rajesh Verma, M.Tech',
      attended: effectiveAttended,
      total: effectiveTotal,
      percentage: percentage,
      credits: 4,
      room: 'LT-204 (Aryabhata Block)',
      type: 'Core Theory',
      status: isDefaulter ? 'Warning' : 'Eligible',
      icon: 'clipboard'
    },
    {
      code: 'CS-603',
      name: 'Computer Networks & Cloud Computing',
      faculty: 'Dr. Neha Agarwal, Ph.D. (BITS Pilani)',
      attended: 40,
      total: 46,
      percentage: 86.9,
      credits: 3,
      room: 'Room 302 (Kalam Block)',
      type: 'Core Theory',
      status: 'Eligible',
      icon: 'megaphone'
    },
    {
      code: 'CS-604',
      name: 'Compiler Design & Automata Theory',
      faculty: 'Prof. A. K. Sharma, M.Tech',
      attended: 37,
      total: 46,
      percentage: 80.4,
      credits: 4,
      room: 'LT-202 (Aryabhata Block)',
      type: 'Core Theory',
      status: 'Eligible',
      icon: 'globe'
    },
    {
      code: 'CS-605P',
      name: 'Full Stack Web & Cloud Lab',
      faculty: 'Er. Rahul Saxena, Senior Lecturer',
      attended: 22,
      total: 24,
      percentage: 91.6,
      credits: 2,
      room: 'Lab-4 (Turing Computing Center)',
      type: 'Practical Lab',
      status: 'Eligible',
      icon: 'clipboard'
    }
  ];

  // Weekly Timetable (Monday through Friday)
  const timetableDays = [
    {
      day: 'Monday',
      slots: [
        { time: '09:15 – 10:15', code: 'CS-601', name: 'Machine Learning', room: 'LT-201', faculty: 'Dr. S. K. Gupta' },
        { time: '10:15 – 11:15', code: 'CS-602', name: 'Database Management Systems', room: 'LT-204', faculty: 'Prof. Rajesh Verma' },
        { time: '11:30 – 12:30', code: 'CS-603', name: 'Computer Networks', room: 'Room 302', faculty: 'Dr. Neha Agarwal' },
        { time: '01:30 – 02:30', code: 'CS-604', name: 'Compiler Design', room: 'LT-202', faculty: 'Prof. A. K. Sharma' },
        { time: '02:30 – 04:30', code: 'CS-605P', name: 'Web & Cloud Lab', room: 'Lab-4', faculty: 'Er. Rahul Saxena' },
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { time: '09:15 – 10:15', code: 'CS-602', name: 'Database Management Systems', room: 'LT-204', faculty: 'Prof. Rajesh Verma' },
        { time: '10:15 – 11:15', code: 'CS-601', name: 'Machine Learning', room: 'LT-201', faculty: 'Dr. S. K. Gupta' },
        { time: '11:30 – 12:30', code: 'CS-604', name: 'Compiler Design', room: 'LT-202', faculty: 'Prof. A. K. Sharma' },
        { time: '01:30 – 02:30', code: 'CS-603', name: 'Computer Networks', room: 'Room 302', faculty: 'Dr. Neha Agarwal' },
        { time: '02:30 – 04:30', code: 'TUT', name: 'Algorithm Tutorial & Coding Clinic', room: 'Room 205', faculty: 'Er. Vivek Mehra' },
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { time: '09:15 – 10:15', code: 'CS-603', name: 'Computer Networks', room: 'Room 302', faculty: 'Dr. Neha Agarwal' },
        { time: '10:15 – 11:15', code: 'CS-604', name: 'Compiler Design', room: 'LT-202', faculty: 'Prof. A. K. Sharma' },
        { time: '11:30 – 12:30', code: 'CS-601', name: 'Machine Learning', room: 'LT-201', faculty: 'Dr. S. K. Gupta' },
        { time: '01:30 – 02:30', code: 'CS-602', name: 'Database Management Systems', room: 'LT-204', faculty: 'Prof. Rajesh Verma' },
        { time: '02:30 – 04:30', code: 'LIB', name: 'Library & Online Research Period', room: 'Central Library', faculty: 'Librarian' },
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { time: '09:15 – 10:15', code: 'CS-601', name: 'Machine Learning', room: 'LT-201', faculty: 'Dr. S. K. Gupta' },
        { time: '10:15 – 11:15', code: 'CS-602', name: 'Database Management Systems', room: 'LT-204', faculty: 'Prof. Rajesh Verma' },
        { time: '11:30 – 12:30', code: 'CS-603', name: 'Computer Networks', room: 'Room 302', faculty: 'Dr. Neha Agarwal' },
        { time: '01:30 – 02:30', code: 'CS-604', name: 'Compiler Design', room: 'LT-202', faculty: 'Prof. A. K. Sharma' },
        { time: '02:30 – 04:30', code: 'CS-605P', name: 'Cloud Computing Hands-on', room: 'Lab-4', faculty: 'Er. Rahul Saxena' },
      ]
    },
    {
      day: 'Friday',
      slots: [
        { time: '09:15 – 10:15', code: 'CS-604', name: 'Compiler Design', room: 'LT-202', faculty: 'Prof. A. K. Sharma' },
        { time: '10:15 – 11:15', code: 'CS-603', name: 'Computer Networks', room: 'Room 302', faculty: 'Dr. Neha Agarwal' },
        { time: '11:30 – 12:30', code: 'CS-602', name: 'Database Management Systems', room: 'LT-204', faculty: 'Prof. Rajesh Verma' },
        { time: '01:30 – 02:30', code: 'CS-601', name: 'Machine Learning Seminar', room: 'LT-201', faculty: 'Dr. S. K. Gupta' },
        { time: '02:30 – 04:30', code: 'PROJ', name: 'Capstone Minor Project Review', room: 'Project Room', faculty: 'HOD CSE' },
      ]
    }
  ];

  const handleApplyLeave = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const newLeave = {
      id: `LV-${Math.floor(1000 + Math.random() * 9000)}`,
      category: leaveCategory,
      subject: leaveSubject,
      dates: `${leaveStartDate} to ${leaveEndDate}`,
      reason: leaveReason.trim(),
      status: 'Pending Verification',
      approvedBy: 'Under Faculty Review',
      dateApplied: new Date().toLocaleDateString('en-IN')
    };

    setLeavesList([newLeave, ...leavesList]);
    setLeaveReason('');
    setLeaveSubmitted(true);
    setTimeout(() => setLeaveSubmitted(false), 4000);
  };

  // ================= 1. TAB: SUBJECTS & DETAILED SYLLABUS =================
  if (activeTab === 'courses') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              My Registered Subjects & Attendance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Semester VI • B.Tech Computer Science & Engineering • Academic Term 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              5 Courses Enrolled (17 Credits)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {indianSubjects.map(sub => {
            const isUnder = sub.percentage < 75.0;
            return (
              <div key={sub.code} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {sub.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUnder
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isUnder ? 'Shortage Warning (< 75%)' : 'Exam Eligible'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug mb-1">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Faculty: <strong className="text-slate-700 font-semibold">{sub.faculty}</strong>
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-indigo-500" />
                      {sub.room}
                    </span>
                    <span>•</span>
                    <span>{sub.credits} Credits ({sub.type})</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">
                      Attended: {sub.attended} / {sub.total} classes
                    </span>
                    <span className={`font-mono font-bold ${isUnder ? 'text-rose-600' : 'text-slate-900'}`}>
                      {sub.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnder ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bunk & Target Attendance Calculator */}
        <div className="pt-4">
          <StudentBunkCalculator student={student} subjects={indianSubjects} />
        </div>
      </div>
    );
  }

  // ================= 2. TAB: WEEKLY TIMETABLE SCHEDULE =================
  if (activeTab === 'schedule') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Weekly Lecture Timetable
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Aryabhata Block • Department of Computer Science & Engineering
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            Even Semester 2026 Timetable
          </span>
        </div>

        <div className="space-y-4">
          {timetableDays.map(td => (
            <div key={td.day} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  {td.day}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {td.slots.map((slot, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 block">
                      {slot.time}
                    </span>
                    <span className="font-bold text-xs text-slate-900 block mt-1 truncate" title={slot.name}>
                      {slot.code}: {slot.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                      {slot.room} • {slot.faculty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= 3. TAB: APPLY FOR LEAVE & MEDICAL EXCUSES =================
  if (activeTab === 'leave') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Student Leave & Medical Excuse Desk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Apply for Medical, On-Duty (OD), or authorized absence with faculty approval.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apply Leave Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              Submit Leave Application
            </h3>

            {leaveSubmitted && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Leave application submitted to Subject Faculty for approval!
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Leave Category
                </label>
                <select
                  value={leaveCategory}
                  onChange={e => setLeaveCategory(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Medical Sick Leave">Medical / Sick Leave</option>
                  <option value="On-Duty (OD) Hackathon">On-Duty (OD) Tech Fest / Hackathon</option>
                  <option value="On-Duty (OD) Sports">On-Duty (OD) Sports Representation</option>
                  <option value="Family Emergency">Urgent Family Matter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject / Faculty Course
                </label>
                <select
                  value={leaveSubject}
                  onChange={e => setLeaveSubject(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="CS-602: Database Management Systems (DBMS)">CS-602: DBMS (Prof. Rajesh Verma)</option>
                  <option value="CS-601: Machine Learning & AI">CS-601: Machine Learning (Dr. S. K. Gupta)</option>
                  <option value="CS-603: Computer Networks">CS-603: Computer Networks (Dr. Neha Agarwal)</option>
                  <option value="CS-604: Compiler Design">CS-604: Compiler Design (Prof. A. K. Sharma)</option>
                  <option value="CS-605P: Web & Cloud Lab">CS-605P: Web Lab (Er. Rahul Saxena)</option>
                  <option value="All Subjects (Full Day Leave)">All Classes on Scheduled Dates</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={e => setLeaveEndDate(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason & Document Summary
                </label>
                <textarea
                  rows="3"
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="Detail reason, doctor prescription ref, or event name..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              {/* Medical / OD Certificate Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                    Attach Medical / OD Proof Slip
                  </span>
                  {attachedDocName && (
                    <span className="text-[10px] text-emerald-600 font-bold">Attached ✓</span>
                  )}
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex items-center justify-between text-xs cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={e => {
                      if (e.target.files?.[0]) setAttachedDocName(e.target.files[0].name);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-600 truncate font-medium">
                      {attachedDocName || 'Upload Hospital / Fitness Slip (PDF / PNG)'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 shrink-0">
                    Browse
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-[0.99]"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Application
              </button>
            </form>
          </div>

          {/* Applied Leaves History */}
          <div className="lg:col-span-2 space-y-3.5">
            <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center justify-between">
              <span>My Leave History &amp; Approvals</span>
              <span className="text-xs font-normal text-slate-500">{leavesList.length} Requests</span>
            </h3>

            {leavesList.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {item.id}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {item.category}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    item.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 mb-2">
                  <p><strong className="text-slate-700">Course:</strong> {item.subject}</p>
                  <p><strong className="text-slate-700">Dates:</strong> {item.dates}</p>
                  <p className="text-slate-500 italic">"{item.reason}"</p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Applied on {item.dateApplied}</span>
                  <span className="text-slate-600 font-medium">Reviewer: {item.approvedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================= 4. TAB: HALL TICKET & EXAM ELIGIBILITY CERTIFICATE =================
  if (activeTab === 'certificates') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Examination Hall Ticket & Eligibility Clearance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              End-Semester Examination Clearance Certificate (Statutory 75% Rule Verification)
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / Download Hall Ticket
          </button>
        </div>

        {/* Official Hall Ticket Document Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
          {/* Header of University */}
          <div className="text-center pb-6 border-b-2 border-slate-200">
            <span className="text-[11px] uppercase tracking-widest text-slate-500 font-bold block">
              Dr. A.P.J. Abdul Kalam Technical University &bull; Examination Board
            </span>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              NATIONAL INSTITUTE OF TECHNOLOGY & ENGINEERING
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Official Admit Card & Hall Ticket • Even Semester Examination 2026
            </p>
          </div>

          {/* Student Identification & Clearance Seal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100 items-center">
            <div className="md:col-span-2 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Candidate Name:</span>
                  <strong className="text-slate-900 font-bold text-sm">{student.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">University Roll No:</span>
                  <strong className="font-mono text-slate-900 font-bold text-sm">{student.rollNo}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Degree & Branch:</span>
                  <span className="text-slate-800 font-semibold">B.Tech (CSE) • 3rd Year</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Semester:</span>
                  <span className="text-slate-800 font-semibold">Semester VI (Even Term 2026)</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 block text-[11px]">Examination Center:</span>
                <span className="text-slate-800 font-medium">Aryabhata Complex, Hall 4 (Center Code: 0101)</span>
              </div>
            </div>

            {/* Verification Stamp Badge */}
            <div className="text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                isDefaulter
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {isDefaulter ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <span className={`text-xs font-extrabold uppercase tracking-wider block ${
                isDefaulter ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {isDefaulter ? 'DEBARRED (SHORTAGE)' : 'VERIFIED & CLEARED'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-1">
                Attendance: {percentage}% (Min: 75%)
              </span>
            </div>
          </div>

          {/* Exam Schedule Table */}
          <div className="pt-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
              Approved Examination Papers
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Paper Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Exam Date</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {indianSubjects.map(sub => (
                    <tr key={sub.code} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{sub.code}</td>
                      <td className="py-2 px-3 text-slate-800">{sub.name}</td>
                      <td className="py-2 px-3 text-slate-500">18 May 2026 (09:30 AM)</td>
                      <td className="py-2 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sub.percentage >= 75.0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {sub.percentage >= 75.0 ? 'Cleared' : 'Withheld'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <span className="block font-semibold text-slate-800">Seal of Examination Controller</span>
              <span className="text-[10px] text-slate-400">AKTU Affiliated Unit</span>
            </div>
            <div className="text-right">
              <span className="block font-semibold text-slate-800">Dean of Academic Affairs</span>
              <span className="text-[10px] text-slate-400">Digitally Verified</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 5. DEFAULT TAB: OVERVIEW DASHBOARD =================
  return (
    <div className="space-y-6">
      {/* 2-Column Student Experience layout matching Ace Academy */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Column: Hero Welcome Banner + My Courses Cards + Academic Certifications */}
        <div className="flex-1 min-w-0 space-y-6 w-full">
          {/* 1. Large Blue Welcome Banner (like "Welcome back, Diane!" in reference) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white p-7 sm:p-8 shadow-lg shadow-indigo-600/15">
            <div className="relative z-10 max-w-md">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                {student.department} • Semester VI
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight text-white">
                Welcome back, {student.name.split(' ')[0]}!
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 font-medium leading-relaxed">
                {isDefaulter
                  ? `Your current attendance is ${percentage}%. You need ${recoveryClasses} consecutive attended classes to restore statutory exam eligibility.`
                  : `You've achieved ${percentage}% cumulative attendance, well above the 75% examination threshold! You can safely miss up to ${safeMissable} classes.`}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white border border-white/20">
                  <span className={`w-2 h-2 rounded-full ${isTodayPresent ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span>
                    Today's Status: {isTodayPresent ? 'Marked Present' : 'Marked Absent'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPunchModalOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-white text-indigo-700 hover:bg-blue-50 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{isTodayPresent ? 'Self Check-in Verified ✓' : 'Punch Attendance (OTP / QR)'}</span>
                </button>
              </div>
            </div>

            {/* 3D Graduation Cap Decorative Graphic */}
            <div className="absolute right-4 -bottom-3 sm:bottom-0 opacity-80 sm:opacity-100 pointer-events-none">
              <div className="w-36 h-36 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xs">
                <GraduationCap className="w-20 h-20 text-white/90 transform -rotate-12" />
              </div>
            </div>
          </div>

          {/* 2. Subjects Section (Indian College Curriculum) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Registered Subjects &amp; Attendance
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {indianSubjects.length} Registered Courses
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {indianSubjects.slice(0, 3).map(course => {
                const isSelected = selectedCourseCode === course.code;
                const isUnder = course.percentage < 75.0;

                return (
                  <div
                    key={course.code}
                    onClick={() => setSelectedCourseCode(course.code)}
                    className={`cursor-pointer rounded-2xl p-5 transition-all flex flex-col justify-between border bg-white ${
                      isSelected
                        ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/10'
                        : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Icon Container */}
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-3 shadow-xs font-mono font-bold text-xs">
                        {course.code}
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {course.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.faculty}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {/* Progress Bar */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 text-[11px]">
                          {course.attended}/{course.total} classes
                        </span>
                        <span className={`font-mono font-bold text-xs ${isUnder ? 'text-rose-600' : 'text-slate-900'}`}>
                          {course.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUnder ? 'bg-rose-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, course.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Achievements & Statutory Certificates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Exam Standing &amp; Hall Ticket
              </h3>
              <span className="text-xs font-semibold text-slate-500">Academic Records</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                    Statutory Compliance
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    Semester Exam Hall Ticket
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isDefaulter ? 'Pending clearance (< 75%)' : 'Verified & Eligible for Exams'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Institutional Record
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    Semester VI Attendance Clearance
                  </h4>
                  <p className="text-xs text-slate-500">
                    {effectiveAttended} of {effectiveTotal} Lectures Accounted
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Timetable Calendar + Upcoming Lectures */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 tracking-tight mb-3">
              Today's Schedule
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono font-bold text-indigo-600 block">09:15 AM – 10:15 AM</span>
                <span className="font-semibold text-slate-800">CS-601: Machine Learning &amp; AI</span>
                <span className="text-[10px] text-slate-400 block">LT-201 • Dr. S. K. Gupta</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono font-bold text-indigo-600 block">10:15 AM – 11:15 AM</span>
                <span className="font-semibold text-slate-800">CS-602: DBMS</span>
                <span className="text-[10px] text-slate-400 block">LT-204 • Prof. Rajesh Verma</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono font-bold text-indigo-600 block">02:30 PM – 04:30 PM</span>
                <span className="font-semibold text-slate-800">CS-605P: Web &amp; Cloud Lab</span>
                <span className="text-[10px] text-slate-400 block">Lab-4 • Er. Rahul Saxena</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bunk Calculator in Student Overview */}
      <div className="w-full">
        <StudentBunkCalculator student={student} subjects={indianSubjects} />
      </div>

      {/* Student Self-Attendance Check-in Modal */}
      {isPunchModalOpen && (
        <StudentPunchModal
          student={student}
          onClose={() => setIsPunchModalOpen(false)}
          onPunchSuccess={() => {
            setTodayMarkedPresent(true);
          }}
        />
      )}
    </div>
  );
}
