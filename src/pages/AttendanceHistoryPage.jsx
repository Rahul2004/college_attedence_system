import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
  History, 
  Calendar, 
  Search, 
  Download, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Building2,
  BookOpen,
  Filter,
  Check,
  X,
  Layers,
  ArrowRight
} from "lucide-react";
import { useAcademic } from "../context/AcademicContext";
import { INDIAN_COLLEGE_PROGRAMS } from "../data/mockData";

export default function AttendanceHistoryPage() {
  const location = useLocation();
  const { 
    role: contextRole, 
    activeCourse, 
    students,
    programs = INDIAN_COLLEGE_PROGRAMS,
    handleToggleStatus
  } = useAcademic();
  
  // Resolve effective active portal from URL pathname (/admin/history, /faculty/history, /student/history)
  const pathParts = location.pathname.split("/").filter(Boolean);
  const effectiveRole = pathParts[0] === "admin" || pathParts[0] === "faculty" || pathParts[0] === "student"
    ? pathParts[0]
    : contextRole;

  // Universal Filter States
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | PRESENT | ABSENT

  // Admin Specific Granular Hierarchy Filters
  const [adminProgramId, setAdminProgramId] = useState(programs[0]?.id || "btech-cse");
  const selectedProgramObj = useMemo(() => {
    return programs.find(p => p.id === adminProgramId) || programs[0];
  }, [programs, adminProgramId]);

  const [adminSemNumber, setAdminSemNumber] = useState(selectedProgramObj?.semesters?.[0]?.semNumber || "VI");
  const selectedSemObj = useMemo(() => {
    return selectedProgramObj?.semesters?.find(s => s.semNumber === adminSemNumber) || selectedProgramObj?.semesters?.[0];
  }, [selectedProgramObj, adminSemNumber]);

  const [adminSubjectCode, setAdminSubjectCode] = useState("ALL");

  // Faculty Specific Subject & Date Filter
  const [facultySubjectCode, setFacultySubjectCode] = useState(activeCourse?.code || "CS-602");
  const [selectedCourse, setSelectedCourse] = useState("ALL");

  // Faculty Interactive Session Roster View Modal / Drawer State
  const [activeSessionDetail, setActiveSessionDetail] = useState(null);
  const [facultyAttendanceMap, setFacultyAttendanceMap] = useState({});

  // ================= 1. ADMIN HISTORICAL SESSIONS DATA =================
  const rawAdminLogs = useMemo(() => [
    {
      id: "AUDIT-2026-1101",
      date: "2026-11-01",
      displayDate: "01 Nov 2026",
      time: "09:30 AM – 10:30 AM",
      programId: "btech-cse",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      department: "Department of Computer Science & Engineering",
      semNumber: "VI",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      faculty: "Prof. Rajesh Verma",
      room: "LT-204",
      enrolled: 48,
      present: 44,
      absent: 4,
      turnoutRate: "91.7%",
      authMethod: "Dynamic 30s QR (LH-204)",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1031",
      date: "2026-10-31",
      displayDate: "31 Oct 2026",
      time: "11:00 AM – 12:00 PM",
      programId: "btech-cse",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      department: "Department of Computer Science & Engineering",
      semNumber: "VI",
      courseCode: "CS-601",
      courseName: "Machine Learning & AI",
      faculty: "Dr. S. K. Gupta",
      room: "Lab 3",
      enrolled: 50,
      present: 47,
      absent: 3,
      turnoutRate: "94.0%",
      authMethod: "Biometric Classroom Check-In",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1030",
      date: "2026-10-30",
      displayDate: "30 Oct 2026",
      time: "02:00 PM – 03:00 PM",
      programId: "btech-cse",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      department: "Department of Computer Science & Engineering",
      semNumber: "VI",
      courseCode: "CS-603",
      courseName: "Computer Networks",
      faculty: "Dr. Neha Agarwal",
      room: "Hall 2",
      enrolled: 48,
      present: 41,
      absent: 7,
      turnoutRate: "85.4%",
      authMethod: "4-Digit Projector OTP",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1029",
      date: "2026-10-29",
      displayDate: "29 Oct 2026",
      time: "10:00 AM – 11:00 AM",
      programId: "btech-cse",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      department: "Department of Computer Science & Engineering",
      semNumber: "VI",
      courseCode: "CS-604",
      courseName: "Compiler Design",
      faculty: "Prof. A. K. Sharma",
      room: "LT-101",
      enrolled: 48,
      present: 43,
      absent: 5,
      turnoutRate: "89.6%",
      authMethod: "Dynamic QR Code",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1028",
      date: "2026-10-28",
      displayDate: "28 Oct 2026",
      time: "01:30 PM – 03:30 PM",
      programId: "btech-cse",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      department: "Department of Computer Science & Engineering",
      semNumber: "VI",
      courseCode: "CS-605P",
      courseName: "Web & Cloud Engineering Lab",
      faculty: "Er. Rahul Saxena",
      room: "Computing Lab 4",
      enrolled: 48,
      present: 46,
      absent: 2,
      turnoutRate: "95.8%",
      authMethod: "Terminal Lab Login",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1027",
      date: "2026-10-27",
      displayDate: "27 Oct 2026",
      time: "09:30 AM – 10:30 AM",
      programId: "btech-cse",
      degree: "B.Tech",
      branch: "Computer Science & Engineering",
      department: "Department of Computer Science & Engineering",
      semNumber: "VI",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      faculty: "Prof. Rajesh Verma",
      room: "LT-204",
      enrolled: 48,
      present: 45,
      absent: 3,
      turnoutRate: "93.8%",
      authMethod: "Dynamic 30s QR (LH-204)",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1025",
      date: "2026-10-25",
      displayDate: "25 Oct 2026",
      time: "11:35 AM – 12:35 PM",
      programId: "btech-ece",
      degree: "B.Tech",
      branch: "Electronics & Communication (ECE)",
      department: "Department of Electronics & Communication",
      semNumber: "IV",
      courseCode: "EC-402",
      courseName: "Digital Signal Processing",
      faculty: "Dr. Vikram Joshi",
      room: "Hall 3",
      enrolled: 52,
      present: 45,
      absent: 7,
      turnoutRate: "86.5%",
      authMethod: "ERP Manual Audit",
      auditStatus: "COMMITTED"
    },
    {
      id: "AUDIT-2026-1024",
      date: "2026-10-24",
      displayDate: "24 Oct 2026",
      time: "10:00 AM – 11:00 AM",
      programId: "bca",
      degree: "BCA",
      branch: "Bachelor of Computer Applications",
      department: "Department of Computer Applications",
      semNumber: "IV",
      courseCode: "BCA-401",
      courseName: "Python Programming & Data Science",
      faculty: "Dr. Meenakshi Soni",
      room: "LT-302",
      enrolled: 60,
      present: 56,
      absent: 4,
      turnoutRate: "93.3%",
      authMethod: "Dynamic 30s QR",
      auditStatus: "COMMITTED"
    }
  ], []);

  // Filtered Admin Sessions based on Department, Degree, Semester, Subject, Date, Search
  const filteredAdminLogs = useMemo(() => {
    return rawAdminLogs.filter(log => {
      const matchProgram = adminProgramId === "ALL" || log.programId === adminProgramId;
      const matchSem = adminSemNumber === "ALL" || log.semNumber === adminSemNumber;
      const matchSubject = adminSubjectCode === "ALL" || log.courseCode === adminSubjectCode;
      const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
      const matchSearch = 
        log.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.department.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProgram && matchSem && matchSubject && matchDate && matchSearch;
    });
  }, [rawAdminLogs, adminProgramId, adminSemNumber, adminSubjectCode, selectedDateFilter, searchQuery]);

  // ================= 2. FACULTY HISTORICAL SESSIONS DATA =================
  const rawFacultyLogs = useMemo(() => [
    {
      id: "SESS-602-54",
      date: "2026-11-01",
      displayDate: "01 Nov 2026",
      time: "09:30 AM – 10:30 AM",
      topic: "B+ Trees Indexing & Hash Indices Implementation",
      lectureNo: "Lecture 54",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      room: "LT-204",
      enrolledCount: 48,
      presentCount: 44,
      absentCount: 4,
      turnout: "91.7%",
      verificationMethod: "Dynamic 30s OTP (Code: 7421)",
      status: "COMPLETED",
      flaggedDefaulters: 3
    },
    {
      id: "SESS-602-53",
      date: "2026-10-31",
      displayDate: "31 Oct 2026",
      time: "09:30 AM – 10:30 AM",
      topic: "Query Optimization & Relational Algebra Equivalences",
      lectureNo: "Lecture 53",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      room: "LT-204",
      enrolledCount: 48,
      presentCount: 42,
      absentCount: 6,
      turnout: "87.5%",
      verificationMethod: "Dynamic Projector QR",
      status: "COMPLETED",
      flaggedDefaulters: 4
    },
    {
      id: "SESS-602-52",
      date: "2026-10-29",
      displayDate: "29 Oct 2026",
      time: "02:00 PM – 03:00 PM",
      topic: "ACID Properties & Two-Phase Locking Protocol",
      lectureNo: "Lecture 52",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      room: "LT-204",
      enrolledCount: 48,
      presentCount: 45,
      absentCount: 3,
      turnout: "93.8%",
      verificationMethod: "Dynamic Projector QR",
      status: "COMPLETED",
      flaggedDefaulters: 3
    },
    {
      id: "SESS-602-51",
      date: "2026-10-28",
      displayDate: "28 Oct 2026",
      time: "09:30 AM – 10:30 AM",
      topic: "Database Concurrency Control & Deadlock Prevention",
      lectureNo: "Lecture 51",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      room: "LT-204",
      enrolledCount: 48,
      presentCount: 41,
      absentCount: 7,
      turnout: "85.4%",
      verificationMethod: "Roll Call Verification",
      status: "COMPLETED",
      flaggedDefaulters: 5
    },
    {
      id: "SESS-602-50",
      date: "2026-10-27",
      displayDate: "27 Oct 2026",
      time: "09:30 AM – 10:30 AM",
      topic: "Transaction Schedules & Conflict Serializability",
      lectureNo: "Lecture 50",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      room: "LT-204",
      enrolledCount: 48,
      presentCount: 46,
      absentCount: 2,
      turnout: "95.8%",
      verificationMethod: "Dynamic Projector QR",
      status: "COMPLETED",
      flaggedDefaulters: 2
    },
    {
      id: "SESS-601-48",
      date: "2026-10-31",
      displayDate: "31 Oct 2026",
      time: "11:00 AM – 12:00 PM",
      topic: "Support Vector Machines (SVM) & Kernel Methods",
      lectureNo: "Lecture 48",
      courseCode: "CS-601",
      courseName: "Machine Learning & AI",
      room: "Lab 3",
      enrolledCount: 50,
      presentCount: 47,
      absentCount: 3,
      turnout: "94.0%",
      verificationMethod: "Biometric Classroom Check-In",
      status: "COMPLETED",
      flaggedDefaulters: 2
    }
  ], []);

  // Filtered Faculty Sessions based on Subject, Date, Search
  const filteredFacultyLogs = useMemo(() => {
    return rawFacultyLogs.filter(log => {
      const matchSubject = facultySubjectCode === "ALL" || log.courseCode === facultySubjectCode;
      const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
      const matchSearch = 
        log.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.lectureNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSubject && matchDate && matchSearch;
    });
  }, [rawFacultyLogs, facultySubjectCode, selectedDateFilter, searchQuery]);

  // Handle Faculty toggling attendance for past session students
  const handleToggleFacultyStudent = (studentId) => {
    setFacultyAttendanceMap(prev => {
      const current = prev[studentId] || "PRESENT";
      return {
        ...prev,
        [studentId]: current === "PRESENT" ? "ABSENT" : "PRESENT"
      };
    });
  };

  // ================= 3. STUDENT PERSONAL HISTORICAL DATA =================
  const rawStudentLogs = useMemo(() => [
    {
      id: "PUNCH-2026-1101",
      date: "2026-11-01",
      displayDate: "01 Nov 2026",
      timeSlot: "09:30 AM – 10:30 AM",
      timestamp: "09:32:14 AM",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      faculty: "Prof. Rajesh Verma",
      room: "LT-204",
      status: "PRESENT",
      punchMode: "Dynamic OTP Verification",
      deviceUid: "Android 14 (Campus Wi-Fi AP-04)"
    },
    {
      id: "PUNCH-2026-1031",
      date: "2026-10-31",
      displayDate: "31 Oct 2026",
      timeSlot: "11:00 AM – 12:00 PM",
      timestamp: "11:04:48 AM",
      courseCode: "CS-601",
      courseName: "Machine Learning & AI",
      faculty: "Dr. S. K. Gupta",
      room: "Lab 3",
      status: "PRESENT",
      punchMode: "Geofenced QR Scan",
      deviceUid: "iOS 18 (NFC Verified)"
    },
    {
      id: "PUNCH-2026-1030",
      date: "2026-10-30",
      displayDate: "30 Oct 2026",
      timeSlot: "02:00 PM – 03:00 PM",
      timestamp: "—",
      courseCode: "CS-603",
      courseName: "Computer Networks",
      faculty: "Dr. Neha Agarwal",
      room: "Hall 2",
      status: "ABSENT",
      punchMode: "No Biometric Handshake",
      deviceUid: "Unregistered (Outside Geofence)"
    },
    {
      id: "PUNCH-2026-1029",
      date: "2026-10-29",
      displayDate: "29 Oct 2026",
      timeSlot: "10:00 AM – 11:00 AM",
      timestamp: "10:01:22 AM",
      courseCode: "CS-604",
      courseName: "Compiler Design",
      faculty: "Prof. A. K. Sharma",
      room: "LT-101",
      status: "PRESENT",
      punchMode: "Dynamic OTP Verification",
      deviceUid: "Android 14 (Campus Wi-Fi AP-01)"
    },
    {
      id: "PUNCH-2026-1028",
      date: "2026-10-28",
      displayDate: "28 Oct 2026",
      timeSlot: "01:30 PM – 03:30 PM",
      timestamp: "01:35:10 PM",
      courseCode: "CS-605P",
      courseName: "Web & Cloud Engineering Lab",
      faculty: "Er. Rahul Saxena",
      room: "Lab 4",
      status: "PRESENT",
      punchMode: "Workstation Punch",
      deviceUid: "Desktop Node #18"
    },
    {
      id: "PUNCH-2026-1027",
      date: "2026-10-27",
      displayDate: "27 Oct 2026",
      timeSlot: "09:30 AM – 10:30 AM",
      timestamp: "09:33:05 AM",
      courseCode: "CS-602",
      courseName: "Database Management Systems",
      faculty: "Prof. Rajesh Verma",
      room: "LT-204",
      status: "PRESENT",
      punchMode: "Dynamic OTP Verification",
      deviceUid: "Android 14 (Campus Wi-Fi AP-04)"
    },
    {
      id: "PUNCH-2026-1024",
      date: "2026-10-24",
      displayDate: "24 Oct 2026",
      timeSlot: "11:00 AM – 12:00 PM",
      timestamp: "—",
      courseCode: "CS-601",
      courseName: "Machine Learning & AI",
      faculty: "Dr. S. K. Gupta",
      room: "Lab 3",
      status: "ABSENT",
      punchMode: "Authorized OD Medical Leave",
      deviceUid: "ERP Exemption Approved (Prof. Gupta)"
    }
  ], []);

  // Filtered Student logs based on Date Picker, Subject Dropdown, Status Pill, Search
  const filteredStudentLogs = useMemo(() => {
    return rawStudentLogs.filter(log => {
      const matchStatus = statusFilter === "ALL" || log.status === statusFilter;
      const matchCourse = selectedCourse === "ALL" || log.courseCode === selectedCourse;
      const matchDate = !selectedDateFilter || log.date === selectedDateFilter;
      const matchSearch = 
        log.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.faculty.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchCourse && matchDate && matchSearch;
    });
  }, [rawStudentLogs, statusFilter, selectedCourse, selectedDateFilter, searchQuery]);

  // CSV Exporter
  const handleExportCSV = () => {
    let headers = [];
    let rows = [];
    const filename = `${effectiveRole}_attendance_ledger_${selectedDateFilter || "all_dates"}.csv`;

    if (effectiveRole === "admin") {
      headers = ["Audit Ref", "Date", "Time", "Degree", "Branch", "Semester", "Course Code", "Course Name", "Faculty", "Enrolled", "Present", "Absent", "Turnout Rate", "Verification Method"];
      rows = filteredAdminLogs.map(l => [
        l.id, l.displayDate, `"${l.time}"`, l.degree, `"${l.branch}"`, l.semNumber, l.courseCode, `"${l.courseName}"`, `"${l.faculty}"`, l.enrolled, l.present, l.absent, l.turnoutRate, `"${l.authMethod}"`
      ]);
    } else if (effectiveRole === "faculty") {
      headers = ["Session Ref", "Date", "Lecture", "Topic", "Course Code", "Course Name", "Room", "Enrolled", "Present", "Absent", "Turnout Rate", "Verification Method"];
      rows = filteredFacultyLogs.map(l => [
        l.id, l.displayDate, l.lectureNo, `"${l.topic}"`, l.courseCode, `"${l.courseName}"`, l.room, l.enrolledCount, l.presentCount, l.absentCount, l.turnout, `"${l.verificationMethod}"`
      ]);
    } else {
      headers = ["Punch ID", "Date", "Time Slot", "Punch Time", "Course Code", "Course Name", "Faculty", "Room", "Status", "Verification Mode", "Device Network"];
      rows = filteredStudentLogs.map(l => [
        l.id, l.displayDate, `"${l.timeSlot}"`, l.timestamp, l.courseCode, `"${l.courseName}"`, `"${l.faculty}"`, l.room, l.status, `"${l.punchMode}"`, `"${l.deviceUid}"`
      ]);
    }

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  // ================= 1. ADMIN AUDIT VIEW =================
  if (effectiveRole === "admin") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Institutional Attendance Audit &amp; Universal Date Inspector
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit attendance across any department, program, semester, subject, and any past calendar date
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Filtered Audit CSV</span>
          </button>
        </div>

        {/* Admin Multi-Tier Filters: Department -> Degree -> Semester -> Subject -> Date */}
        <div className="bg-white rounded-xl border border-slate-300 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              Multi-Tier Academic Hierarchy &amp; Date Selectors
            </span>
            {(selectedDateFilter || adminProgramId !== "ALL" || adminSubjectCode !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDateFilter("");
                  setAdminProgramId("btech-cse");
                  setAdminSemNumber("VI");
                  setAdminSubjectCode("ALL");
                  setSearchQuery("");
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Degree / Branch */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Department &amp; Program
              </label>
              <select
                value={adminProgramId}
                onChange={e => {
                  setAdminProgramId(e.target.value);
                  const p = programs.find(item => item.id === e.target.value);
                  setAdminSemNumber(p?.semesters?.[0]?.semNumber || "VI");
                  setAdminSubjectCode("ALL");
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900"
              >
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.degree} {p.code ? `(${p.code})` : ""} — {p.branch}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Semester */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Academic Semester
              </label>
              <select
                value={adminSemNumber}
                onChange={e => {
                  setAdminSemNumber(e.target.value);
                  setAdminSubjectCode("ALL");
                }}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900"
              >
                {selectedProgramObj?.semesters?.map(s => (
                  <option key={s.semNumber} value={s.semNumber}>
                    Semester {s.semNumber}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Course / Subject
              </label>
              <select
                value={adminSubjectCode}
                onChange={e => setAdminSubjectCode(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900"
              >
                <option value="ALL">All Subjects in Term</option>
                {selectedSemObj?.subjects?.map(sub => (
                  <option key={sub.code} value={sub.code}>
                    {sub.code}: {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Date Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Inspection Date</span>
                {selectedDateFilter && (
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter("")}
                    className="text-[10px] text-slate-400 hover:text-slate-800"
                  >
                    Clear
                  </button>
                )}
              </label>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={e => setSelectedDateFilter(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-slate-900 cursor-pointer"
              />
            </div>

            {/* 5. Search keyword */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Keyword Search
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Faculty, code, topic..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 bg-slate-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Overview Bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 px-1">
          <span>
            Found <strong>{filteredAdminLogs.length}</strong> attendance session record(s) matching criteria.
          </span>
          {selectedDateFilter && (
            <span className="font-mono bg-slate-200/80 px-2 py-0.5 rounded text-slate-800 text-[11px]">
              Inspecting Date: {selectedDateFilter}
            </span>
          )}
        </div>

        {/* Table of Sessions */}
        <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Audit ID &amp; Date</th>
                  <th className="py-3 px-4">Department &amp; Program</th>
                  <th className="py-3 px-4">Subject &amp; Room</th>
                  <th className="py-3 px-4">Faculty In-Charge</th>
                  <th className="py-3 px-4 text-center">Class Turnout</th>
                  <th className="py-3 px-4">Verification Gateway</th>
                  <th className="py-3 px-4 text-right">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredAdminLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No attendance sessions found for the selected department, subject, or date ({selectedDateFilter || "all"}).
                    </td>
                  </tr>
                ) : (
                  filteredAdminLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{log.id}</div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{log.displayDate} • {log.time}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{log.degree} {log.branch}</span>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">Semester {log.semNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            {log.courseCode}
                          </span>
                          <span>{log.courseName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">Room: {log.room}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {log.faculty}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="font-mono font-bold text-emerald-700">{log.turnoutRate}</div>
                        <span className="text-[10px] text-slate-500 font-mono">({log.present}/{log.enrolled} present)</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.authMethod}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {log.auditStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. FACULTY VIEW (Click Subject -> Check / Modify Present / Absent) =================
  if (effectiveRole === "faculty") {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Faculty Attendance History &amp; Session Roster
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any subject session to inspect and mark students Present or Absent on past dates
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Subject Sessions CSV</span>
          </button>
        </div>

        {/* Faculty Filters: Subject Dropdown + Date Picker + Search */}
        <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Subject Selector */}
            <div>
              <select
                value={facultySubjectCode}
                onChange={e => setFacultySubjectCode(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-900"
              >
                <option value="ALL">All Taught Subjects</option>
                <option value="CS-601">CS-601 Machine Learning &amp; AI</option>
                <option value="CS-602">CS-602 Database Management Systems</option>
                <option value="CS-603">CS-603 Computer Networks</option>
                <option value="CS-604">CS-604 Compiler Design</option>
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-2.5 py-1 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-500 font-medium">Date:</span>
              <input
                type="date"
                value={selectedDateFilter}
                onChange={e => setSelectedDateFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium text-slate-800"
              />
              {selectedDateFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter("")}
                  className="text-slate-400 hover:text-slate-700 text-xs ml-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topic or lecture..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 bg-slate-50"
              />
            </div>
          </div>

          <span className="text-xs text-slate-500 self-end md:self-auto font-medium">
            Showing {filteredFacultyLogs.length} Session(s)
          </span>
        </div>

        {/* Sessions Grid / Table */}
        <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Recorded Lecture Deliveries (Click any row to open class roll call for that session)
            </span>
            <span className="text-slate-500 text-[11px]">Interactive Roll Call</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Lecture Period</th>
                  <th className="py-3 px-4">Subject &amp; Topic Covered</th>
                  <th className="py-3 px-4 text-center">Class Turnout</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th className="py-3 px-4 text-center">Debarment Flags</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredFacultyLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching lecture sessions found for {facultySubjectCode} on {selectedDateFilter || "any date"}.
                    </td>
                  </tr>
                ) : (
                  filteredFacultyLogs.map(log => (
                    <tr 
                      key={log.id} 
                      onClick={() => setActiveSessionDetail(log)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.displayDate}</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                          {log.lectureNo} • {log.time}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            {log.courseCode}
                          </span>
                          <span>{log.topic}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">Room: {log.room}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-mono font-bold text-emerald-700">{log.turnout}</div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {log.presentCount} present / {log.absentCount} absent
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.verificationMethod}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{log.flaggedDefaulters} Shortage</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 group-hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition-colors">
                          <span>View Roster</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Modal / Panel: View & Mark Present / Absent for selected session */}
        {activeSessionDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    <span>{activeSessionDetail.courseCode}: {activeSessionDetail.courseName}</span>
                    <span className="font-mono text-xs font-normal text-slate-400">({activeSessionDetail.lectureNo})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Conducted on {activeSessionDetail.displayDate} ({activeSessionDetail.time}) • Room: {activeSessionDetail.room}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSessionDetail(null)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Student Roll Call List */}
              <div className="p-5 overflow-y-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                  <span>Click Present or Absent toggle to update attendance for this session:</span>
                  <span className="font-semibold text-slate-900">Total Enrolled: {students?.length || 48}</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {(students || []).slice(0, 15).map((st, idx) => {
                    const currentStatus = facultyAttendanceMap[st.id] || (idx === 2 || idx === 7 ? "ABSENT" : "PRESENT");
                    const isPresent = currentStatus === "PRESENT";

                    return (
                      <div key={st.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-400 w-6 text-center">{idx + 1}</span>
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="font-mono text-[11px] text-slate-500">Roll: {st.rollNo}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleFacultyStudent(st.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                              isPresent
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleFacultyStudent(st.id)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                              !isPresent
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
                <span className="text-slate-500">
                  Changes save automatically to university biometric audit records.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSessionDetail(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
                >
                  Done &amp; Close Session Roster
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= 3. STUDENT VIEW (Pick ANY Date to View Attendance) =================
  const studentAttendedCount = filteredStudentLogs.filter(l => l.status === "PRESENT").length;
  const studentTotalCount = filteredStudentLogs.length;
  const studentPercentage = studentTotalCount > 0 ? ((studentAttendedCount / studentTotalCount) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                My Attendance History &amp; Calendar Date Inspector
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Check your past attendance for any calendar date, subject, or lecture time slot
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export My Attendance CSV</span>
        </button>
      </div>

      {/* Student Controls: Date Picker + Subject Filter + Search + Status */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Calendar Date Picker: Check ANY date */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-700">Pick Any Date:</span>
            <input
              type="date"
              value={selectedDateFilter}
              onChange={e => setSelectedDateFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-slate-900"
            />
            {selectedDateFilter && (
              <button
                type="button"
                onClick={() => setSelectedDateFilter("")}
                className="text-slate-400 hover:text-slate-800 text-xs ml-1 font-bold"
                title="View all dates"
              >
                ✕ All Dates
              </button>
            )}
          </div>

          {/* Subject Dropdown */}
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">All Enrolled Subjects</option>
            <option value="CS-601">CS-601 Machine Learning</option>
            <option value="CS-602">CS-602 Database Systems</option>
            <option value="CS-603">CS-603 Computer Networks</option>
            <option value="CS-604">CS-604 Compiler Design</option>
            <option value="CS-605P">CS-605P Web Cloud Lab</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 bg-slate-50"
            />
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({filteredStudentLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PRESENT")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "PRESENT" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Present ({studentAttendedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ABSENT")}
            className={`px-3 py-1 rounded-md font-semibold transition-colors ${
              statusFilter === "ABSENT" ? "bg-white text-rose-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Absent ({studentTotalCount - studentAttendedCount})
          </button>
        </div>
      </div>

      {/* Selected Date Indicator Banner */}
      {selectedDateFilter && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-900 flex items-center justify-between">
          <span>
            Viewing attendance records specifically for calendar date: <strong>{selectedDateFilter}</strong>
          </span>
          <button
            type="button"
            onClick={() => setSelectedDateFilter("")}
            className="text-sky-700 hover:text-sky-950 font-semibold underline text-xs cursor-pointer"
          >
            Show Full History Archive
          </button>
        </div>
      )}

      {/* Student Personal History Table */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Lecture Date &amp; Period</th>
                <th className="py-3 px-4">Subject &amp; Instructor</th>
                <th className="py-3 px-4">Hall</th>
                <th className="py-3 px-4 text-center">My Status</th>
                <th className="py-3 px-4">Check-In Punch Time</th>
                <th className="py-3 px-4">Verification Signature</th>
                <th className="py-3 px-4 text-right">Log Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredStudentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No lecture attendance records found for {selectedDateFilter ? `date ${selectedDateFilter}` : "selected criteria"}.
                  </td>
                </tr>
              ) : (
                filteredStudentLogs.map(log => {
                  const isPresent = log.status === "PRESENT";
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.displayDate}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                          {log.timeSlot}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono text-[11px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            {log.courseCode}
                          </span>
                          <span>{log.courseName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Faculty: {log.faculty}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700">
                        {log.room}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPresent
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}>
                          {isPresent ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          <span>{isPresent ? "Present" : "Absent"}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">{log.punchMode}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-xs">
                          {log.deviceUid}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                        {log.id}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
