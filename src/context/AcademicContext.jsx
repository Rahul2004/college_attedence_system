import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  broadcastCloudEvent,
  subscribeToCloudEvents,
  fetchSystemSettings,
  saveSystemSettingToCloud,
  fetchCloudUsers,
  fetchCloudPrograms,
  fetchCloudAttendance,
  saveAttendanceToCloud,
  fetchCloudLeaves,
  saveLeavesToCloud,
  fetchCloudDisputes,
  saveDisputesToCloud,
  fetchCloudAnnouncements,
  saveAnnouncementsToCloud,
  fetchCloudAuditLogs,
  recordAuditLog,
  fetchCloudAdmissionsForms,
  saveAdmissionsFormsToCloud
} from '../lib/syncService';
import { INITIAL_STUDENTS, COURSE_METADATA, INDIAN_COLLEGE_PROGRAMS, LECTURE_PERIODS } from '../data/mockData';

const AcademicContext = createContext(null);

export function AcademicProvider({ children }) {
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@college.edu.in').toLowerCase();

  // 1. Session & Role Persistence
  const [session, setSession] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_active_session');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return null;
  });

  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('college_active_role');
      if (savedRole) return savedRole;
    }
    return 'student';
  });

  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_active_profile');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_active_session');
      if (saved) return false;
    }
    return !supabase ? false : true;
  });
  const [students, setStudents] = useState([]);
  const [activeDetailStudent, setActiveDetailStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [toast, setToast] = useState({ type: null, message: '' });
  const [isCommitting, setIsCommitting] = useState(false);

  // 2. Attendance Threshold with Real-time Sync
  const [attendanceThreshold, setAttendanceThreshold] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_min_attendance_threshold');
      if (saved) return Number(saved);
    }
    return 75.0;
  });

  // 3. Programs Master State
  const [programs, setPrograms] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_programs_master');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return INDIAN_COLLEGE_PROGRAMS;
  });

  // 4. Users Directory
  const [users, setUsers] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_app_users');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: 'usr-1', email: 'director.admin@univ.edu', role: 'admin', status: 'active', name: 'Dr. Evelyn Carter', dept: 'Central Administration', lastActive: 'Just now' },
      { id: 'usr-2', email: 'prof.vance@univ.edu', role: 'faculty', status: 'active', name: 'Prof. R. Vance', dept: 'Computer Science', lastActive: '12m ago' },
      { id: 'usr-3', email: 'dr.sharma@univ.edu', role: 'faculty', status: 'active', name: 'Dr. Anil Sharma', dept: 'Electrical Engineering', lastActive: '1h ago' },
      { id: 'usr-4', email: 'aarav.sharma@collegemail.edu.in', role: 'student', status: 'active', name: 'Aarav Sharma', dept: 'Computer Science', lastActive: '3h ago' },
      { id: 'usr-5', email: 'priya.patel@collegemail.edu.in', role: 'student', status: 'active', name: 'Priya Patel', dept: 'Information Technology', lastActive: '5h ago' },
      { id: 'usr-6', email: 'new.lecturer@univ.edu', role: 'faculty', status: 'pending', name: 'Mark Thompson', dept: 'Mechanical Engineering', lastActive: 'Yesterday' },
      { id: 'usr-7', email: 'student.pending@univ.edu', role: 'student', status: 'pending', name: 'Liam Davies', dept: 'Civil Engineering', lastActive: '2d ago' },
    ];
  });

  // 5. Leaves State
  const [leaves, setLeaves] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_app_leaves');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: 'leave-1', studentId: 'stu-1', studentName: 'Alexander Wright', rollNo: 'CS-401', reason: 'Medical Checkup & viral fever', type: 'Medical Leave', startDate: '2026-10-18', endDate: '2026-10-20', status: 'PENDING', appliedAt: '2026-10-17', medicalDocUrl: null },
      { id: 'leave-2', studentId: 'stu-3', studentName: 'Rohan Verma', rollNo: 'CS-403', reason: 'Inter-College Hackathon participation', type: 'Duty Leave (Academic Event)', startDate: '2026-10-15', endDate: '2026-10-16', status: 'APPROVED', appliedAt: '2026-10-14', medicalDocUrl: null },
    ];
  });

  // 6. Attendance Disputes State
  const [disputes, setDisputes] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_attendance_disputes');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'disp-101',
        studentId: 'stu-1',
        studentName: 'Alexander Wright',
        rollNo: 'CS-601',
        subjectCode: 'CS-602',
        subjectName: 'Database Management Systems',
        classDate: '2026-10-24',
        reason: 'Biometric fingerprint reader failed due to sensor moisture. I was seated in row 3 with Prof. Verma.',
        status: 'PENDING',
        appliedAt: '2026-10-24T14:30:00Z',
        reviewedBy: null,
        reviewedAt: null,
        resolutionNote: null
      }
    ];
  });

  // 7. Campus Announcements State
  const [announcements, setAnnouncements] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_campus_announcements');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'ann-1',
        title: 'Mid-Term Statutory Attendance Audit (75% Rule)',
        content: 'Dean Academic Affairs has released the provisional defaulters list. Students with < 75% attendance must submit dispute requests by this Friday.',
        priority: 'URGENT',
        audience: 'ALL',
        author: 'Dean Academics',
        publishedAt: '2026-10-25'
      },
      {
        id: 'ann-2',
        title: 'National Holiday – Campus Academic Schedule Suspended',
        content: 'All undergraduate lecture periods and practical laboratories will remain suspended on the upcoming public holiday. Classes resume as per regular timetable.',
        priority: 'NORMAL',
        audience: 'ALL',
        author: 'Registrar Office',
        publishedAt: '2026-10-24'
      }
    ];
  });

  // 8. Administrative Audit Log State
  const [auditLogs, setAuditLogs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_system_audit_logs');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'log-1',
        actorEmail: 'admin@college.edu.in',
        role: 'admin',
        action: 'STATUTORY_THRESHOLD_UPDATED',
        details: 'Attendance statutory minimum threshold verified at 75.0%',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // 9. Student Admissions Applications State
  const [admissionsForms, setAdmissionsForms] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('college_student_admissions_forms');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [];
  });

  // 6. Active Class Filter State (Defaults to Semester I BAS-101 where newly enrolled students begin)
  const [selectedProgramId, setSelectedProgramId] = useState('btech-cse');
  const [selectedSemNumber, setSelectedSemNumber] = useState('I');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('BAS-101');
  const [selectedSlotId, setSelectedSlotId] = useState('P1');

  const selectedProgram = programs.find(p => p.id === selectedProgramId) || null;
  const selectedSem = selectedProgram?.semesters?.find(s => s.semNumber === selectedSemNumber) || null;
  const selectedSubject = selectedSem?.subjects?.find(s => s.code === selectedSubjectCode) || null;
  const selectedSlot = LECTURE_PERIODS.find(l => l.id === selectedSlotId) || null;
  const isClassConfigured = Boolean(selectedProgramId && selectedSemNumber && selectedSubjectCode && selectedSlotId);

  // Dynamic faculty identity resolution:
  // Strictly display the authenticated user's actual name and details if logged in as Faculty or Admin
  const dynamicFacultyName = (role === 'faculty' || role === 'admin')
    ? (userProfile?.full_name || session?.user?.user_metadata?.name || (role === 'faculty' ? 'Prof. Rajesh Verma' : 'Administrator'))
    : (selectedSubject?.faculty || 'Faculty In-Charge');

  const activeCourse = {
    ...COURSE_METADATA,
    degree: selectedProgram?.degree || '',
    branch: selectedProgram?.branch || '',
    code: selectedSubject?.code || '',
    name: selectedSubject?.name || '',
    faculty: dynamicFacultyName,
    room: selectedSubject?.room || '',
    semester: selectedSem?.semLabel || '',
    timeSlot: selectedSlot ? `${selectedSlot.time} (${selectedSlot.label})` : '',
    credits: selectedSubject?.credits || 0,
    type: selectedSubject?.type || '',
  };

  // Real-time Cloud Synchronization
  useEffect(() => {
    // 1. Fetch Cloud Settings
    fetchSystemSettings().then(cloudVal => {
      if (cloudVal && !isNaN(cloudVal) && Number(cloudVal) > 0) {
        setAttendanceThreshold(Number(cloudVal));
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_min_attendance_threshold', cloudVal.toString());
        }
      } else {
        setAttendanceThreshold(75.0);
      }
    });

    // 2. Fetch Cloud Users
    fetchCloudUsers().then(cloudUsers => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers(cloudUsers);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_app_users', JSON.stringify(cloudUsers));
        }
      }
    });

    // 3. Fetch Cloud Curriculum Programs
    fetchCloudPrograms().then(cloudPrograms => {
      if (cloudPrograms && cloudPrograms.length > 0) {
        setPrograms(cloudPrograms);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_programs_master', JSON.stringify(cloudPrograms));
        }
      }
    });

    // 4. Fetch Cloud Leaves Directory
    fetchCloudLeaves().then(cloudLeaves => {
      if (cloudLeaves && Array.isArray(cloudLeaves) && cloudLeaves.length > 0) {
        setLeaves(cloudLeaves);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_app_leaves', JSON.stringify(cloudLeaves));
        }
      }
    });

    // 4b. Fetch Cloud Disputes & Announcements
    fetchCloudDisputes().then(cloudDisputes => {
      if (cloudDisputes && Array.isArray(cloudDisputes) && cloudDisputes.length > 0) {
        setDisputes(cloudDisputes);
        if (typeof window !== 'undefined') localStorage.setItem('college_attendance_disputes', JSON.stringify(cloudDisputes));
      }
    });

    fetchCloudAnnouncements().then(cloudAnn => {
      if (cloudAnn && Array.isArray(cloudAnn) && cloudAnn.length > 0) {
        setAnnouncements(cloudAnn);
        if (typeof window !== 'undefined') localStorage.setItem('college_campus_announcements', JSON.stringify(cloudAnn));
      }
    });

    fetchCloudAuditLogs().then(cloudLogs => {
      if (cloudLogs && Array.isArray(cloudLogs) && cloudLogs.length > 0) {
        setAuditLogs(cloudLogs);
        if (typeof window !== 'undefined') localStorage.setItem('college_system_audit_logs', JSON.stringify(cloudLogs));
      }
    });

    fetchCloudAdmissionsForms().then(cloudForms => {
      if (cloudForms && Array.isArray(cloudForms)) {
        setAdmissionsForms(cloudForms);
        if (typeof window !== 'undefined') localStorage.setItem('college_student_admissions_forms', JSON.stringify(cloudForms));
      }
    });

    // 5. Listen to Global Supabase Realtime WebSocket events
    const cloudChannel = subscribeToCloudEvents((eventType, payload) => {
      if (eventType === 'THRESHOLD_UPDATE') {
        setAttendanceThreshold(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_min_attendance_threshold', String(payload));
      } else if (eventType === 'USERS_UPDATE') {
        setUsers(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_app_users', JSON.stringify(payload));
      } else if (eventType === 'LEAVES_UPDATE') {
        setLeaves(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_app_leaves', JSON.stringify(payload));
      } else if (eventType === 'PROGRAMS_UPDATE') {
        setPrograms(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_programs_master', JSON.stringify(payload));
      } else if (eventType === 'DISPUTES_UPDATE') {
        setDisputes(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_attendance_disputes', JSON.stringify(payload));
      } else if (eventType === 'ANNOUNCEMENTS_UPDATE') {
        setAnnouncements(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_campus_announcements', JSON.stringify(payload));
      } else if (eventType === 'AUDIT_LOG_UPDATE') {
        setAuditLogs(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_system_audit_logs', JSON.stringify(payload));
      } else if (eventType === 'ADMISSIONS_FORMS_UPDATE') {
        setAdmissionsForms(payload);
        if (typeof window !== 'undefined') localStorage.setItem('college_student_admissions_forms', JSON.stringify(payload));
      } else if (eventType === 'STUDENTS_UPDATE') {
        const currentClassKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
        // Strict Subject Isolation: Only update in-memory state if event matches currently active subject/class
        if (payload?.classKey && payload.classKey !== currentClassKey) {
          // Cache the update for the other subject in localStorage so it's fresh when switched to
          if (typeof window !== 'undefined' && payload?.students) {
            localStorage.setItem(`college_students_${payload.classKey}`, JSON.stringify(payload.students));
          }
          return;
        }
        if (payload?.students) {
          setStudents(payload.students);
        } else if (Array.isArray(payload) && !payload?.classKey) {
          // Legacy payload without classKey: only accept if explicit
          setStudents(payload);
        }
      }
    });

    let broadcastChannel = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('attendos_realtime_sync');
        broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'THRESHOLD_UPDATE') setAttendanceThreshold(payload);
          else if (type === 'USERS_UPDATE') setUsers(payload);
          else if (type === 'LEAVES_UPDATE') setLeaves(payload);
          else if (type === 'PROGRAMS_UPDATE') setPrograms(payload);
          else if (type === 'ADMISSIONS_FORMS_UPDATE') setAdmissionsForms(payload);
          else if (type === 'STUDENTS_UPDATE') {
            const currentClassKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
            // Strict Subject Isolation for multi-tab browser sync
            if (payload?.classKey && payload.classKey !== currentClassKey) {
              if (typeof window !== 'undefined' && payload?.students) {
                localStorage.setItem(`college_students_${payload.classKey}`, JSON.stringify(payload.students));
              }
              return;
            }
            if (payload?.students) setStudents(payload.students);
            else if (Array.isArray(payload) && !payload?.classKey) setStudents(payload);
          }
        };
      }
    } catch {}

    const handleStorageEvent = (e) => {
      if (!e.newValue) return;
      try {
        if (e.key === 'college_min_attendance_threshold') setAttendanceThreshold(Number(e.newValue));
        else if (e.key === 'college_app_users') setUsers(JSON.parse(e.newValue));
        else if (e.key === 'college_app_leaves') setLeaves(JSON.parse(e.newValue));
        else if (e.key === 'college_programs_master') setPrograms(JSON.parse(e.newValue));
        else if (e.key === 'college_student_admissions_forms') setAdmissionsForms(JSON.parse(e.newValue));
      } catch {}
    };

    window.addEventListener('storage', handleStorageEvent);

    // 6. Network Reconnection Sync: Automatically re-fetch database state when connectivity restores
    const handleOnline = () => {
      fetchSystemSettings().then(cloudVal => {
        if (cloudVal && !isNaN(cloudVal)) setAttendanceThreshold(cloudVal);
      });
      fetchCloudUsers().then(cloudUsers => {
        if (cloudUsers && cloudUsers.length > 0) setUsers(cloudUsers);
      });
      fetchCloudPrograms().then(cloudPrograms => {
        if (cloudPrograms && cloudPrograms.length > 0) setPrograms(cloudPrograms);
      });
      fetchCloudLeaves().then(cloudLeaves => {
        if (cloudLeaves && Array.isArray(cloudLeaves) && cloudLeaves.length > 0) setLeaves(cloudLeaves);
      });
      const classKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
      fetchCloudAttendance(classKey).then(cloudList => {
        if (cloudList && Array.isArray(cloudList) && cloudList.length > 0) setStudents(cloudList);
      });
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('online', handleOnline);
      if (broadcastChannel) broadcastChannel.close();
      if (cloudChannel && supabase) supabase.removeChannel(cloudChannel);
    };
  }, [selectedProgramId, selectedSemNumber, selectedSubjectCode]);

  // Supabase Auth Hydration
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const resolveRoleAndSetSession = async (currentSession) => {
      // If student is in admission flow, do NOT set session to avoid triggering router redirection
      if (typeof window !== 'undefined' && localStorage.getItem('college_in_admission_flow') === 'true') {
        setLoading(false);
        return;
      }

      if (currentSession?.user) {
        let resolvedRole = null;
        let resolvedStatus = currentSession.user.user_metadata?.status || 'active';
        let resolvedProfile = null;

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (profile) {
            resolvedProfile = profile;
            if (profile.role) resolvedRole = profile.role;
            if (profile.status) resolvedStatus = profile.status;
          }
        } catch {}

        if (!resolvedRole) {
          if (currentSession.user?.email?.toLowerCase() === ADMIN_EMAIL) resolvedRole = 'admin';
          else resolvedRole = currentSession.user.user_metadata?.role || 'student';
        }

        const userEmail = currentSession.user?.email?.toLowerCase();

        // 1. Guard against hard-suspended accounts
        if (resolvedStatus === 'suspended') {
          await supabase.auth.signOut();
          setSession(null);
          setUserProfile(null);
          setRole('student');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('college_active_session');
            localStorage.removeItem('college_active_role');
            localStorage.removeItem('college_active_profile');
          }
          setLoading(false);
          return;
        }

        // 2. Check if user has been revoked or deleted by Administrator in local storage
        try {
          const rawUsers = localStorage.getItem('college_app_users');
          if (rawUsers && userEmail) {
            const parsedUsers = JSON.parse(rawUsers);
            if (Array.isArray(parsedUsers)) {
              const matched = parsedUsers.find(u => u.email?.toLowerCase() === userEmail);
              if (matched && (matched.status === 'deleted' || matched.status === 'suspended')) {
                await supabase.auth.signOut();
                setSession(null);
                setUserProfile(null);
                setRole('student');
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('college_active_session');
                  localStorage.removeItem('college_active_role');
                  localStorage.removeItem('college_active_profile');
                }
                setLoading(false);
                return;
              }
            }
          }
        } catch {}

        let resolvedName = currentSession.user.user_metadata?.name;
        let resolvedDept = currentSession.user.user_metadata?.department || '';
        let resolvedRollNo = currentSession.user.user_metadata?.rollNo || '';

        // 3. Check if user is approved in admissions forms or users directory
        try {
          const rawAdmissions = localStorage.getItem('college_student_admissions_forms');
          if (rawAdmissions && userEmail) {
            const parsedForms = JSON.parse(rawAdmissions);
            if (Array.isArray(parsedForms)) {
              const matchedForm = parsedForms.find(f => f.email?.toLowerCase() === userEmail);
              if (matchedForm) {
                if (matchedForm.fullName) resolvedName = matchedForm.fullName;
                if (matchedForm.branch || matchedForm.department) resolvedDept = matchedForm.branch || matchedForm.department;
                if (matchedForm.rollNo) resolvedRollNo = matchedForm.rollNo;
                if (matchedForm.status === 'APPROVED') {
                  resolvedStatus = 'active';
                } else if (matchedForm.status === 'WAITING_APPROVAL') {
                  resolvedStatus = 'pending_approval';
                }
              }
            }
          }

          const rawUsers = localStorage.getItem('college_app_users');
          if (rawUsers && userEmail) {
            const parsedUsers = JSON.parse(rawUsers);
            if (Array.isArray(parsedUsers)) {
              const matchedUser = parsedUsers.find(u => u.email?.toLowerCase() === userEmail);
              if (matchedUser) {
                if (matchedUser.name) resolvedName = matchedUser.name;
                if (matchedUser.dept) resolvedDept = matchedUser.dept;
                if (matchedUser.rollNo) resolvedRollNo = matchedUser.rollNo;
                if (matchedUser.status === 'active') {
                  resolvedStatus = 'active';
                }
              }
            }
          }
        } catch {}

        const profileObj = resolvedProfile ? {
          ...resolvedProfile,
          status: resolvedStatus,
          full_name: resolvedName || resolvedProfile.full_name || currentSession.user.email?.split('@')[0],
          roll_no: resolvedRollNo || resolvedProfile.roll_no || '',
          department: resolvedDept || resolvedProfile.department || ''
        } : {
          id: currentSession.user.id,
          email: currentSession.user.email,
          role: resolvedRole,
          status: resolvedStatus,
          full_name: resolvedName || currentSession.user.email?.split('@')[0],
          roll_no: resolvedRollNo || '',
          department: resolvedDept || ''
        };

        setSession(currentSession);
        setUserProfile(profileObj);
        setRole(resolvedRole);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_active_role', resolvedRole);
          localStorage.setItem('college_active_session', JSON.stringify(currentSession));
          localStorage.setItem('college_active_profile', JSON.stringify(profileObj));
        }
      } else {
        // No active Supabase cloud session: check if local institutional session exists before clearing
        let localSess = null;
        let localRole = null;
        let localProf = null;
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('college_active_session');
          if (raw) {
            try { localSess = JSON.parse(raw); } catch {}
          }
          localRole = localStorage.getItem('college_active_role');
          const rawProf = localStorage.getItem('college_active_profile');
          if (rawProf) {
            try { localProf = JSON.parse(rawProf); } catch {}
          }
        }

        if (localSess && localSess.user) {
          setSession(localSess);
          setUserProfile(localProf);
          if (localRole) setRole(localRole);
        } else {
          // Genuinely logged out
          setSession(null);
          setUserProfile(null);
          setRole('student');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('college_active_session');
            localStorage.removeItem('college_active_role');
            localStorage.removeItem('college_active_profile');
          }
        }
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      // During password recovery or signup email verification, do NOT auto-login or redirect to dashboard!
      // Let the user stay on the AuthScreen to complete their admission form.
      if (event === 'PASSWORD_RECOVERY') {
        return;
      }
      if (typeof window !== 'undefined' && localStorage.getItem('college_in_admission_flow') === 'true') {
        return;
      }
      resolveRoleAndSetSession(sess);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (typeof window !== 'undefined' && localStorage.getItem('college_in_admission_flow') === 'true') {
        return;
      }
      resolveRoleAndSetSession(data?.session || null);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  // Load Students Cache & Cloud Database (with Dynamic Integration of Approved Admissions)
  useEffect(() => {
    let isCurrent = true;
    // Strict Subject Isolation: Reset uncommitted changes and selected student card on subject change
    setPendingChanges(new Set());
    setActiveDetailStudent(null);

    if (!isClassConfigured) {
      setStudents([]);
      return;
    }

    const classKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
    const storageKey = `college_students_${classKey}`;
    let cached = null;
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        try { cached = JSON.parse(raw); } catch {}
      }
    }

    // Helper to merge approved real students with class roster
    const mergeWithAdmissions = (baseList, forms) => {
      const approvedForms = (forms || []).filter(f => {
        if (f.status !== 'APPROVED') return false;
        // Check program match (tolerant to id or branch name)
        const matchProg = !f.programId || f.programId === selectedProgramId ||
          (f.branch && f.branch.toLowerCase().includes(selectedProgramId.replace('btech-', '')));
        // Check semester match: "Semester I" vs "I"
        const formSemNorm = (f.semester || '').replace(/semester\s*/i, '').trim();
        const curSemNorm = (selectedSemNumber || '').replace(/semester\s*/i, '').trim();
        const matchSem = !formSemNorm || formSemNorm.toLowerCase() === curSemNorm.toLowerCase();
        return matchProg && matchSem;
      });

      const merged = [...(baseList || [])];
      for (const form of approvedForms) {
        const studentId = form.id || `stu-${form.rollNo || form.email}`;
        const existingIdx = merged.findIndex(s => s.id === studentId || (form.rollNo && s.rollNo === form.rollNo) || (form.email && s.email === form.email));
        const formattedStudent = {
          id: studentId,
          name: form.fullName || form.name || 'Student',
          rollNo: form.rollNo || '00000',
          email: form.email || '',
          phone: form.phone || '+91 99999 99999',
          department: form.branch || form.department || selectedProgram?.branch || 'Computer Science & Engineering',
          programId: selectedProgramId,
          semester: `Semester ${selectedSemNumber}`,
          gender: form.gender || 'Not specified',
          state: 'Institutional Enrolled',
          attendedClasses: 0,
          totalClasses: 0,
          todayStatus: 'ABSENT',
          status: 'active'
        };

        if (existingIdx >= 0) {
          // Preserve any existing attendance record while updating real student metadata
          merged[existingIdx] = {
            ...formattedStudent,
            ...merged[existingIdx],
            name: form.fullName || merged[existingIdx].name,
            rollNo: form.rollNo || merged[existingIdx].rollNo,
            email: form.email || merged[existingIdx].email,
            department: form.branch || form.department || merged[existingIdx].department
          };
        } else {
          // Add newly joined approved student to the top of the roster
          merged.unshift(formattedStudent);
        }
      }
      return merged;
    };

    // For Semesters other than VI (or if cache has data), don't show the hardcoded Semester VI demo list
    const fallbackBase = selectedSemNumber === 'VI' ? INITIAL_STUDENTS : [];
    const baseList = (cached && cached.length > 0) ? cached : fallbackBase;
    const initialList = mergeWithAdmissions(baseList, admissionsForms);
    if (isCurrent) {
      setStudents(initialList);
      setActiveDetailStudent(initialList[0] || null);
    }

    // Fetch from Supabase Cloud as single source of truth (guarded against race conditions)
    fetchCloudAttendance(classKey).then(cloudList => {
      if (!isCurrent) return; // Prevent race conditions if user has already switched to another subject!

      const sourceList = (cloudList && Array.isArray(cloudList) && cloudList.length > 0)
        ? cloudList
        : (cached && cached.length > 0 ? cached : fallbackBase);

      const finalMerged = mergeWithAdmissions(sourceList, admissionsForms);
      if (finalMerged && finalMerged.length > 0) {
        setStudents(finalMerged);
        setActiveDetailStudent(finalMerged[0] || null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(finalMerged));
        }
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [selectedProgramId, selectedSemNumber, selectedSubjectCode, isClassConfigured, admissionsForms]);

  const saveStudentsCache = (updatedList) => {
    if (typeof window !== 'undefined' && isClassConfigured) {
      const classKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
      const storageKey = `college_students_${classKey}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
    }
  };

  const handleToggleStatus = async (studentId, nextStatus) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id !== studentId) return s;
        const targetStatus = nextStatus || (s.todayStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT');
        return { ...s, todayStatus: targetStatus };
      });
      saveStudentsCache(updated);
      return updated;
    });
    setPendingChanges(prev => new Set(prev).add(studentId));
  };

  const handleMarkAll = (status) => {
    setStudents(prev => {
      const updated = prev.map(s => ({ ...s, todayStatus: status }));
      saveStudentsCache(updated);
      return updated;
    });
    setPendingChanges(new Set(students.map(s => s.id)));
  };

  const handleCommit = async () => {
    if (pendingChanges.size === 0) return;
    setIsCommitting(true);
    const committed = students.map(s => {
      if (pendingChanges.has(s.id)) {
        const isPresent = s.todayStatus === 'PRESENT';
        return {
          ...s,
          attendedClasses: isPresent ? s.attendedClasses + 1 : s.attendedClasses,
          totalClasses: s.totalClasses + 1,
          todayStatus: isPresent ? 'PRESENT' : 'ABSENT'
        };
      }
      return s;
    });
    setStudents(committed);
    saveStudentsCache(committed);
    setPendingChanges(new Set());

    // Save to Supabase Cloud & broadcast to all connected devices in real time
    const classKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
    await saveAttendanceToCloud(classKey, committed);

    setIsCommitting(false);
    setToast({ type: 'success', message: 'Attendance committed and synced in real-time across all portals.' });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  const handleLogout = async () => {
    try {
      if (supabase) await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setUserProfile(null);
    setRole('student');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('college_active_session');
      localStorage.removeItem('college_active_role');
      localStorage.removeItem('college_active_profile');
      localStorage.removeItem('college_dev_bypass');
    }
  };

  const handleResolveDispute = async (disputeId, decision, teacherNote) => {
    let resolvedDispute = null;
    const updated = disputes.map(d => {
      if (d.id !== disputeId) return d;
      resolvedDispute = {
        ...d,
        status: decision, // 'APPROVED' | 'REJECTED'
        reviewedBy: session?.user?.email || 'faculty@college.edu.in',
        reviewedAt: new Date().toISOString(),
        resolutionNote: teacherNote || ''
      };
      return resolvedDispute;
    });

    setDisputes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_attendance_disputes', JSON.stringify(updated));
    }
    await saveDisputesToCloud(updated);

    // If APPROVED, auto-correct the student's attendance to PRESENT for that date/session strictly for the disputed subject!
    if (decision === 'APPROVED' && resolvedDispute) {
      const targetSubCode = resolvedDispute.subjectCode || selectedSubjectCode;
      const targetClassKey = `${selectedProgramId}_${selectedSemNumber}_${targetSubCode}`;
      const targetStorageKey = `college_students_${targetClassKey}`;

      let targetRoster = [];
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(targetStorageKey);
        if (raw) {
          try { targetRoster = JSON.parse(raw); } catch {}
        }
      }
      if (!targetRoster || targetRoster.length === 0) {
        targetRoster = (selectedSubjectCode === targetSubCode) ? [...students] : (selectedSemNumber === 'VI' ? [...INITIAL_STUDENTS] : []);
      }

      const studentIndex = targetRoster.findIndex(s => s.id === resolvedDispute.studentId || s.rollNo === resolvedDispute.rollNo);
      if (studentIndex >= 0) {
        const s = targetRoster[studentIndex];
        const updatedStudent = {
          ...s,
          todayStatus: 'PRESENT',
          attendedClasses: s.todayStatus === 'PRESENT' ? s.attendedClasses : (s.attendedClasses || 0) + 1
        };
        targetRoster[studentIndex] = updatedStudent;
        if (typeof window !== 'undefined') {
          localStorage.setItem(targetStorageKey, JSON.stringify(targetRoster));
        }
        saveAttendanceToCloud(targetClassKey, targetRoster);

        // Strictly update in-memory active students ONLY if currently viewing the disputed subject
        if (selectedSubjectCode === targetSubCode) {
          setStudents(targetRoster);
        }
      }
    }

    // Log the audit event
    await recordAuditLog(
      session?.user?.email || 'faculty@college.edu.in',
      role,
      `ATTENDANCE_DISPUTE_${decision}`,
      `Dispute ${disputeId} for ${resolvedDispute?.studentName} (${resolvedDispute?.rollNo}) marked ${decision}. Reason: ${teacherNote || 'N/A'}`
    );

    setToast({
      type: 'success',
      message: `Dispute ${decision === 'APPROVED' ? 'Approved & Attendance Adjusted' : 'Rejected'}. Synced to student dashboard in real-time.`
    });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_active_role', newRole);
    }
    
    // Find authentic user record from users list matching both role AND status
    const matchedUser = (users || []).find(u => u.role === newRole && u.status !== 'deleted') || {
      id: `usr-${newRole}`,
      email: newRole === 'admin' ? ADMIN_EMAIL : newRole === 'faculty' ? 'faculty@college.edu.in' : 'student@college.edu.in',
      name: newRole === 'admin' ? 'College Administrator' : newRole === 'faculty' ? 'Prof. Rajesh Verma' : 'Aarav Sharma',
      role: newRole,
      dept: newRole === 'admin' ? 'Central Administration' : 'Computer Science & Engineering',
      phone: '+91 98765-43210'
    };

    const newSession = {
      user: {
        id: matchedUser.id || `usr-${newRole}`,
        email: matchedUser.email,
        user_metadata: {
          role: newRole,
          name: matchedUser.name,
          department: matchedUser.dept || matchedUser.department
        }
      }
    };

    const newProfile = {
      id: newSession.user.id,
      email: newSession.user.email,
      role: newRole,
      status: 'active',
      full_name: matchedUser.name,
      department: matchedUser.dept || matchedUser.department || '',
      roll_no: matchedUser.rollNo || (newRole === 'student' ? 'CS-2026' : '')
    };

    setSession(newSession);
    setUserProfile(newProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_active_session', JSON.stringify(newSession));
      localStorage.setItem('college_active_profile', JSON.stringify(newProfile));
    }
  };

  const lowWarningCount = (students || []).filter(s => {
    if (!s) return false;
    const attended = s.todayStatus === 'PRESENT' ? (s.attendedClasses || 0) + 1 : (s.attendedClasses || 0);
    return (((attended / ((s.totalClasses || 0) + 1))) * 100) < attendanceThreshold;
  }).length;

  const updateUserProfile = async (updates) => {
    // 1. Update userProfile state immediately
    setUserProfile(prev => {
      const merged = { ...(prev || {}), ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('college_active_profile', JSON.stringify(merged));
      }
      return merged;
    });

    // 2. Update session user metadata
    setSession(prev => {
      if (!prev?.user) return prev;
      const updatedSess = {
        ...prev,
        user: {
          ...prev.user,
          user_metadata: {
            ...(prev.user.user_metadata || {}),
            name: updates.full_name || updates.name || prev.user.user_metadata?.name,
            phone: updates.phone || prev.user.user_metadata?.phone,
            department: updates.department || prev.user.user_metadata?.department
          }
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('college_active_session', JSON.stringify(updatedSess));
      }
      return updatedSess;
    });

    // 3. Update public.profiles table in Supabase
    if (supabase && session?.user?.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.user.id);
      } catch (err) {
        console.warn('Could not update profile in Supabase:', err);
      }

      // Also update auth user metadata in Supabase Auth
      try {
        await supabase.auth.updateUser({
          data: {
            name: updates.full_name || updates.name,
            phone: updates.phone,
            department: updates.department
          }
        });
      } catch {}
    }
  };

  const reloadUserProfile = async () => {
    if (!session?.user?.id && !session?.user?.email) return;
    try {
      let resolvedStatus = 'pending_approval';
      const userEmail = session.user.email?.toLowerCase();

      // Check admissions forms
      const rawAdmissions = localStorage.getItem('college_student_admissions_forms');
      if (rawAdmissions && userEmail) {
        try {
          const forms = JSON.parse(rawAdmissions);
          const found = forms.find(f => f.email?.toLowerCase() === userEmail);
          if (found && found.status === 'APPROVED') {
            resolvedStatus = 'active';
          }
        } catch {}
      }

      // Check app users
      const rawUsers = localStorage.getItem('college_app_users');
      if (rawUsers && userEmail) {
        try {
          const usersList = JSON.parse(rawUsers);
          const foundUser = usersList.find(u => u.email?.toLowerCase() === userEmail);
          if (foundUser && foundUser.status === 'active') {
            resolvedStatus = 'active';
          }
        } catch {}
      }

      if (supabase && session?.user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (prof) {
          const mergedProf = {
            ...prof,
            status: prof.status === 'active' || resolvedStatus === 'active' ? 'active' : (prof.status || resolvedStatus)
          };
          setUserProfile(mergedProf);
          if (mergedProf.role) setRole(mergedProf.role);
          if (typeof window !== 'undefined') {
            localStorage.setItem('college_active_profile', JSON.stringify(mergedProf));
            if (mergedProf.role) localStorage.setItem('college_active_role', mergedProf.role);
          }
          return;
        }
      }

      // If no supabase profile row found yet, update userProfile with resolvedStatus
      setUserProfile(prev => {
        const updated = {
          ...(prev || {}),
          status: resolvedStatus
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_active_profile', JSON.stringify(updated));
        }
        return updated;
      });
    } catch (err) {
      console.warn('Failed to reload profile:', err);
    }
  };

  // Phase 3 Optimization: Memoize the context value to eliminate unneeded re-render cascades
  const contextValue = useMemo(() => ({
    session, setSession,
    role, setRole,
    userProfile, setUserProfile,
    updateUserProfile,
    reloadUserProfile,
    switchRole,
    loading,
    students, setStudents,
    activeDetailStudent, setActiveDetailStudent,
    selectedDate, setSelectedDate,
    pendingChanges,
    toast, setToast,
    isCommitting,
    attendanceThreshold, setAttendanceThreshold,
    programs, setPrograms,
    users, setUsers,
    leaves, setLeaves,
    disputes, setDisputes,
    announcements, setAnnouncements,
    auditLogs, setAuditLogs,
    admissionsForms, setAdmissionsForms,
    handleResolveDispute,
    selectedProgramId, setSelectedProgramId,
    selectedSemNumber, setSelectedSemNumber,
    selectedSubjectCode, setSelectedSubjectCode,
    selectedSlotId, setSelectedSlotId,
    activeCourse,
    isClassConfigured,
    lowWarningCount,
    handleToggleStatus,
    handleMarkAll,
    handleCommit,
    handleLogout
  }), [
    session, role, userProfile, loading, students, activeDetailStudent,
    selectedDate, pendingChanges, toast, isCommitting, attendanceThreshold,
    programs, users, leaves, disputes, announcements, auditLogs, admissionsForms,
    selectedProgramId, selectedSemNumber, selectedSubjectCode, selectedSlotId,
    activeCourse, isClassConfigured, lowWarningCount
  ]);

  return (
    <AcademicContext.Provider value={contextValue}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) throw new Error('useAcademic must be used within AcademicProvider');
  return context;
}
