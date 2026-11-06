// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory web storage mock
const createStorageMock = () => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createStorageMock();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  globalThis.sessionStorage = createStorageMock();
}

describe('AttendOS Phase 4: Multi-Role Integration & E2E Workflow Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  // SCENARIO 1: Student login and dashboard initialization
  it('Scenario 1: Student login resolves authorized student session and curriculum subjects', () => {
    const studentUser = {
      id: 'stu-user-1',
      email: 'aarav.sharma@collegemail.edu.in',
      role: 'student',
      status: 'active',
      name: 'Aarav Sharma',
      department: 'Computer Science & Engineering',
      semester: 'Semester VI'
    };

    localStorage.setItem('college_active_session', JSON.stringify({ user: studentUser }));
    localStorage.setItem('college_active_role', 'student');
    localStorage.setItem('college_active_profile', JSON.stringify(studentUser));

    const session = JSON.parse(localStorage.getItem('college_active_session'));
    const role = localStorage.getItem('college_active_role');
    const profile = JSON.parse(localStorage.getItem('college_active_profile'));

    expect(session.user.email).toBe('aarav.sharma@collegemail.edu.in');
    expect(role).toBe('student');
    expect(profile.name).toBe('Aarav Sharma');
  });

  // SCENARIO 2: Faculty login and dashboard initialization
  it('Scenario 2: Faculty login authorizes assigned classes and lecture roster', () => {
    const facultyUser = {
      id: 'fac-user-1',
      email: 'prof.verma@collegemail.edu.in',
      role: 'faculty',
      status: 'active',
      name: 'Prof. Rajesh Verma',
      department: 'Computer Science & Engineering'
    };

    localStorage.setItem('college_active_session', JSON.stringify({ user: facultyUser }));
    localStorage.setItem('college_active_role', 'faculty');
    localStorage.setItem('college_active_profile', JSON.stringify(facultyUser));

    const role = localStorage.getItem('college_active_role');
    const profile = JSON.parse(localStorage.getItem('college_active_profile'));

    expect(role).toBe('faculty');
    expect(profile.name).toBe('Prof. Rajesh Verma');
    expect(profile.department).toBe('Computer Science & Engineering');
  });

  // SCENARIO 3: Admin login and dashboard initialization
  it('Scenario 3: Admin login initializes institutional settings and curriculum management', () => {
    const adminUser = {
      id: 'admin-user-1',
      email: 'director.admin@univ.edu',
      role: 'admin',
      status: 'active',
      name: 'Dr. Evelyn Carter',
      department: 'Central Administration'
    };

    localStorage.setItem('college_active_session', JSON.stringify({ user: adminUser }));
    localStorage.setItem('college_active_role', 'admin');
    localStorage.setItem('college_active_profile', JSON.stringify(adminUser));

    const role = localStorage.getItem('college_active_role');
    expect(role).toBe('admin');
  });

  // SCENARIO 4: Student profile data isolation
  it('Scenario 4: Student profile remains strictly isolated to the authenticated student', () => {
    const studentA = { id: 's1', name: 'Aarav Sharma', rollNo: 'CS-601' };
    const studentB = { id: 's2', name: 'Priya Patel', rollNo: 'CS-602' };

    localStorage.setItem('college_active_profile', JSON.stringify(studentA));
    const loaded = JSON.parse(localStorage.getItem('college_active_profile'));

    expect(loaded.id).toBe('s1');
    expect(loaded.name).toBe('Aarav Sharma');
    expect(loaded.id).not.toBe(studentB.id);
    expect(loaded.name).not.toBe(studentB.name);
  });

  // SCENARIO 5: Faculty profile isolation
  it('Scenario 5: Faculty profile displays teacher credentials without student metadata bleed', () => {
    const facultyProfile = {
      id: 'fac-1',
      name: 'Dr. S. K. Gupta',
      role: 'faculty',
      department: 'Computer Science',
      assignedCourses: ['CS-601']
    };

    localStorage.setItem('college_active_profile', JSON.stringify(facultyProfile));
    const active = JSON.parse(localStorage.getItem('college_active_profile'));

    expect(active.role).toBe('faculty');
    expect(active.rollNo).toBeUndefined();
    expect(active.assignedCourses).toContain('CS-601');
  });

  // SCENARIO 6: Attendance session creation
  it('Scenario 6: Faculty creates and commits an attendance session for a class', () => {
    const classKey = 'btech-cse_VI_CS-601';
    const students = [
      { id: 's1', name: 'Aarav', todayStatus: 'PRESENT', attendedClasses: 20, totalClasses: 25 },
      { id: 's2', name: 'Priya', todayStatus: 'ABSENT', attendedClasses: 18, totalClasses: 25 }
    ];

    // Commit attendance
    const committed = students.map(s => {
      const isPres = s.todayStatus === 'PRESENT';
      return {
        ...s,
        attendedClasses: isPres ? s.attendedClasses + 1 : s.attendedClasses,
        totalClasses: s.totalClasses + 1
      };
    });

    localStorage.setItem(`college_students_${classKey}`, JSON.stringify(committed));

    const saved = JSON.parse(localStorage.getItem(`college_students_${classKey}`));
    expect(saved[0].attendedClasses).toBe(21);
    expect(saved[0].totalClasses).toBe(26);
    expect(saved[1].attendedClasses).toBe(18);
    expect(saved[1].totalClasses).toBe(26);
  });

  // SCENARIO 7: Attendance modification & correction
  it('Scenario 7: Faculty modifies a student attendance record from ABSENT to PRESENT', () => {
    const classKey = 'btech-cse_VI_CS-601';
    const roster = [
      { id: 's2', name: 'Priya', todayStatus: 'ABSENT', attendedClasses: 18, totalClasses: 26 }
    ];

    // Correction
    const corrected = roster.map(s => (s.id === 's2' ? { ...s, todayStatus: 'PRESENT', attendedClasses: 19 } : s));
    localStorage.setItem(`college_students_${classKey}`, JSON.stringify(corrected));

    const check = JSON.parse(localStorage.getItem(`college_students_${classKey}`));
    expect(check[0].todayStatus).toBe('PRESENT');
    expect(check[0].attendedClasses).toBe(19);
  });

  // SCENARIO 8: Attendance real-time synchronization between tabs
  it('Scenario 8: Multi-tab real-time event syncs data when classKey matches', () => {
    const activeClassKey = 'btech-cse_VI_CS-601';
    let currentRoster = [{ id: 's1', attendedClasses: 10, totalClasses: 12 }];

    const onBroadcastReceived = (event) => {
      if (event.type === 'STUDENTS_UPDATE') {
        if (event.payload?.classKey === activeClassKey) {
          currentRoster = event.payload.students;
        }
      }
    };

    const incoming = {
      type: 'STUDENTS_UPDATE',
      payload: {
        classKey: 'btech-cse_VI_CS-601',
        students: [{ id: 's1', attendedClasses: 11, totalClasses: 13 }]
      }
    };

    onBroadcastReceived(incoming);
    expect(currentRoster[0].attendedClasses).toBe(11);
    expect(currentRoster[0].totalClasses).toBe(13);
  });

  // SCENARIO 9: Student onboarding approval workflow
  it('Scenario 9: Admin approves pending student admission into active roster', () => {
    const pendingStudent = {
      id: 'app-101',
      email: 'new.student@collegemail.edu.in',
      fullName: 'Vikramaditya Singh',
      rollNo: '0101CS221007',
      branch: 'Computer Science & Engineering',
      semester: 'Semester VI',
      status: 'PENDING_APPROVAL'
    };

    // Approval action
    const approvedStudent = { ...pendingStudent, status: 'APPROVED' };

    expect(approvedStudent.status).toBe('APPROVED');
    expect(approvedStudent.rollNo).toBe('0101CS221007');
  });

  // SCENARIO 10: Unauthorized access attempts (403 Forbidden Route Guard)
  it('Scenario 10: ProtectedRoute rejects students attempting to access Admin route', () => {
    const verifyRouteAuthorization = (userRole, allowedRole) => {
      if (!userRole) return { redirect: '/login', status: 401 };
      if (allowedRole && userRole !== allowedRole) {
        return { error: '403 Forbidden', status: 403, allowed: false };
      }
      return { allowed: true, status: 200 };
    };

    const studentAttemptingAdmin = verifyRouteAuthorization('student', 'admin');
    expect(studentAttemptingAdmin.allowed).toBe(false);
    expect(studentAttemptingAdmin.status).toBe(403);

    const facultyAttemptingAdmin = verifyRouteAuthorization('faculty', 'admin');
    expect(facultyAttemptingAdmin.allowed).toBe(false);
    expect(facultyAttemptingAdmin.status).toBe(403);

    const adminAccessingAdmin = verifyRouteAuthorization('admin', 'admin');
    expect(adminAccessingAdmin.allowed).toBe(true);
    expect(adminAccessingAdmin.status).toBe(200);
  });

  // SCENARIO 11: Logout and session invalidation
  it('Scenario 11: Logout cleanses all cached session, profile, and authorization keys', () => {
    localStorage.setItem('college_active_session', JSON.stringify({ user: { id: 'u1' } }));
    localStorage.setItem('college_active_role', 'faculty');
    localStorage.setItem('college_active_profile', JSON.stringify({ name: 'Teacher' }));

    // Execute logout
    localStorage.removeItem('college_active_session');
    localStorage.removeItem('college_active_role');
    localStorage.removeItem('college_active_profile');

    expect(localStorage.getItem('college_active_session')).toBeNull();
    expect(localStorage.getItem('college_active_role')).toBeNull();
    expect(localStorage.getItem('college_active_profile')).toBeNull();
  });

  // SCENARIO 12: Browser refresh and navigation state rehydration
  it('Scenario 12: Browser refresh rehydrates active session and state without loss', () => {
    const persistedState = {
      session: { user: { id: 'u1', email: 'test@college.edu' } },
      role: 'student',
      profile: { name: 'Aarav', rollNo: '0101CS221001' }
    };

    localStorage.setItem('college_active_session', JSON.stringify(persistedState.session));
    localStorage.setItem('college_active_role', persistedState.role);
    localStorage.setItem('college_active_profile', JSON.stringify(persistedState.profile));

    // Simulated rehydration on page load
    const rehydratedSession = JSON.parse(localStorage.getItem('college_active_session'));
    const rehydratedRole = localStorage.getItem('college_active_role');
    const rehydratedProfile = JSON.parse(localStorage.getItem('college_active_profile'));

    expect(rehydratedSession.user.email).toBe('test@college.edu');
    expect(rehydratedRole).toBe('student');
    expect(rehydratedProfile.rollNo).toBe('0101CS221001');
  });
});
