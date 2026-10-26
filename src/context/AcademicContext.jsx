import React, { createContext, useContext, useState, useEffect } from 'react';
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
  recordAuditLog
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

  // 6. Active Class Filter State
  const [selectedProgramId, setSelectedProgramId] = useState('btech-cse');
  const [selectedSemNumber, setSelectedSemNumber] = useState('VI');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState('CS-602');
  const [selectedSlotId, setSelectedSlotId] = useState('P2');

  const selectedProgram = programs.find(p => p.id === selectedProgramId) || null;
  const selectedSem = selectedProgram?.semesters?.find(s => s.semNumber === selectedSemNumber) || null;
  const selectedSubject = selectedSem?.subjects?.find(s => s.code === selectedSubjectCode) || null;
  const selectedSlot = LECTURE_PERIODS.find(l => l.id === selectedSlotId) || null;
  const isClassConfigured = Boolean(selectedProgramId && selectedSemNumber && selectedSubjectCode && selectedSlotId);

  const activeCourse = {
    ...COURSE_METADATA,
    degree: selectedProgram?.degree || '',
    branch: selectedProgram?.branch || '',
    code: selectedSubject?.code || '',
    name: selectedSubject?.name || '',
    faculty: selectedSubject?.faculty || '',
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
      if (cloudVal && !isNaN(cloudVal)) {
        setAttendanceThreshold(cloudVal);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_min_attendance_threshold', cloudVal.toString());
        }
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
      } else if (eventType === 'STUDENTS_UPDATE') {
        if (payload?.students) {
          setStudents(payload.students);
        } else if (Array.isArray(payload)) {
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
          else if (type === 'STUDENTS_UPDATE') {
            if (payload?.students) setStudents(payload.students);
            else if (Array.isArray(payload)) setStudents(payload);
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
      if (currentSession?.user) {
        let resolvedRole = null;
        let resolvedStatus = currentSession.user.user_metadata?.status || 'active';

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, status')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (profile?.role) resolvedRole = profile.role;
          if (profile?.status) resolvedStatus = profile.status;
        } catch {}

        if (!resolvedRole) {
          if (currentSession.user?.email?.toLowerCase() === ADMIN_EMAIL) resolvedRole = 'admin';
          else resolvedRole = currentSession.user.user_metadata?.role || 'student';
        }

        const userEmail = currentSession.user?.email?.toLowerCase();

        // 1. Guard against Pending or Suspended accounts
        if (resolvedStatus === 'pending' || resolvedStatus === 'suspended') {
          await supabase.auth.signOut();
          setSession(null);
          setRole('student');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('college_active_session');
            localStorage.removeItem('college_active_role');
          }
          setLoading(false);
          return;
        }

        // 2. Check if user has been revoked or removed by Administrator in local storage
        try {
          const rawUsers = localStorage.getItem('college_app_users');
          if (rawUsers && userEmail) {
            const parsedUsers = JSON.parse(rawUsers);
            if (Array.isArray(parsedUsers)) {
              const matched = parsedUsers.find(u => u.email?.toLowerCase() === userEmail);
              if (matched && (matched.status === 'deleted' || matched.status === 'suspended' || matched.status === 'pending')) {
                await supabase.auth.signOut();
                setSession(null);
                setRole('student');
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('college_active_session');
                  localStorage.removeItem('college_active_role');
                }
                setLoading(false);
                return;
              }
            }
          }
        } catch {}

        setSession(currentSession);
        setRole(resolvedRole);
        if (typeof window !== 'undefined') {
          localStorage.setItem('college_active_role', resolvedRole);
          localStorage.setItem('college_active_session', JSON.stringify(currentSession));
        }
      } else {
        // No active Supabase cloud session: check if local institutional session exists before clearing
        let localSess = null;
        let localRole = null;
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('college_active_session');
          if (raw) {
            try { localSess = JSON.parse(raw); } catch {}
          }
          localRole = localStorage.getItem('college_active_role');
        }

        if (localSess && localSess.user) {
          setSession(localSess);
          if (localRole) setRole(localRole);
        } else {
          // Genuinely logged out
          setSession(null);
          setRole('student');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('college_active_session');
            localStorage.removeItem('college_active_role');
          }
        }
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      // During password recovery, do NOT auto-login or redirect to dashboard!
      // Let the user stay on the AuthScreen to choose their new password.
      if (event === 'PASSWORD_RECOVERY') {
        return;
      }
      resolveRoleAndSetSession(sess);
    });

    supabase.auth.getSession().then(({ data }) => {
      resolveRoleAndSetSession(data?.session || null);
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  // Load Students Cache & Cloud Database
  useEffect(() => {
    if (!isClassConfigured) {
      setStudents([]);
      setActiveDetailStudent(null);
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

    const initialList = cached && cached.length > 0 ? cached : INITIAL_STUDENTS;
    setStudents(initialList);
    setActiveDetailStudent(initialList[0] || null);

    // Fetch from Supabase Cloud as single source of truth
    fetchCloudAttendance(classKey).then(cloudList => {
      if (cloudList && Array.isArray(cloudList) && cloudList.length > 0) {
        setStudents(cloudList);
        setActiveDetailStudent(cloudList[0] || null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, JSON.stringify(cloudList));
        }
      }
    });
  }, [selectedProgramId, selectedSemNumber, selectedSubjectCode, isClassConfigured]);

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
    setRole('student');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('college_active_session');
      localStorage.removeItem('college_active_role');
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

    // If APPROVED, auto-correct the student's attendance to PRESENT for that date/session!
    if (decision === 'APPROVED' && resolvedDispute) {
      setStudents(prevStudents => {
        const studentIndex = prevStudents.findIndex(s => s.id === resolvedDispute.studentId || s.rollNo === resolvedDispute.rollNo);
        if (studentIndex >= 0) {
          const s = prevStudents[studentIndex];
          const updatedStudent = {
            ...s,
            todayStatus: 'PRESENT',
            attendedClasses: s.todayStatus === 'PRESENT' ? s.attendedClasses : s.attendedClasses + 1
          };
          const nextList = [...prevStudents];
          nextList[studentIndex] = updatedStudent;
          saveStudentsCache(nextList);
          const classKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
          saveAttendanceToCloud(classKey, nextList);
          return nextList;
        }
        return prevStudents;
      });
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
    
    // Find authentic user record from users list for this role
    const matchedUser = users.find(u => u.role === newRole) || {
      id: `usr-${newRole}`,
      email: newRole === 'admin' ? ADMIN_EMAIL : newRole === 'faculty' ? 'prof.vance@univ.edu' : 'aarav.sharma@collegemail.edu.in',
      name: newRole === 'admin' ? 'Dr. Evelyn Carter' : newRole === 'faculty' ? 'Prof. Rajesh Verma' : 'Aarav Sharma',
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

    setSession(newSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_active_session', JSON.stringify(newSession));
    }
  };

  const lowWarningCount = (students || []).filter(s => {
    if (!s) return false;
    const attended = s.todayStatus === 'PRESENT' ? (s.attendedClasses || 0) + 1 : (s.attendedClasses || 0);
    return (((attended / ((s.totalClasses || 0) + 1))) * 100) < attendanceThreshold;
  }).length;

  return (
    <AcademicContext.Provider value={{
      session, setSession,
      role, setRole,
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
    }}>
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) throw new Error('useAcademic must be used within AcademicProvider');
  return context;
}
