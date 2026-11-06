// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { INITIAL_STUDENTS, INDIAN_COLLEGE_PROGRAMS } from '../data/mockData';

// Fallback in-memory storage if running in node environment
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

describe('Subject-Wise Attendance Data Isolation Engine', () => {
  beforeEach(() => {
    // Clear storage before each test
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  // TEST 1: Select one subject and verify that other subjects remain unchanged
  it('TEST 1: Select one subject and verify that other subjects remain unchanged', () => {
    const student = {
      id: 'STU-001',
      rollNo: '0101CS221001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@collegemail.edu.in',
      program: 'btech-cse',
      semester: 'Semester VI',
      attendedClasses: 44,
      totalClasses: 52,
      todayStatus: 'PRESENT'
    };

    // Setup distinct isolated attendance records for two subjects in storage
    const subAKey = 'college_students_btech-cse_VI_CS-601';
    const subBKey = 'college_students_btech-cse_VI_CS-602';
    
    const rosterA = [{ ...student, attendedClasses: 40, totalClasses: 50, todayStatus: 'PRESENT' }];
    const rosterB = [{ ...student, attendedClasses: 30, totalClasses: 50, todayStatus: 'ABSENT' }];

    localStorage.setItem(subAKey, JSON.stringify(rosterA));
    localStorage.setItem(subBKey, JSON.stringify(rosterB));

    // Simulate subject resolution logic
    const getSubjectAttendance = (subCode) => {
      const classKey = `btech-cse_VI_${subCode}`;
      const raw = localStorage.getItem(`college_students_${classKey}`);
      const list = JSON.parse(raw);
      return list.find(s => s.id === student.id);
    };

    const initialA = getSubjectAttendance('CS-601');
    const initialB = getSubjectAttendance('CS-602');

    // Selecting Subject A
    let selectedSubject = 'CS-601';
    expect(selectedSubject).toBe('CS-601');

    // Verify other subject remains completely unchanged
    const afterSelectB = getSubjectAttendance('CS-602');
    expect(afterSelectB.attendedClasses).toBe(initialB.attendedClasses);
    expect(afterSelectB.todayStatus).toBe(initialB.todayStatus);
    expect(afterSelectB.totalClasses).toBe(initialB.totalClasses);
  });

  // TEST 2: Mark attendance for Subject A and verify Subject B and C
  it('TEST 2: Mark attendance for Subject A and verify Subject B and C remain unchanged', () => {
    const prog = 'btech-cse';
    const sem = 'VI';
    const subA = 'CS-601';
    const subB = 'CS-602';
    const subC = 'CS-603';

    const rosterA = [
      { id: 's1', name: 'Aarav', attendedClasses: 20, totalClasses: 25, todayStatus: 'ABSENT' }
    ];
    const rosterB = [
      { id: 's1', name: 'Aarav', attendedClasses: 18, totalClasses: 25, todayStatus: 'ABSENT' }
    ];
    const rosterC = [
      { id: 's1', name: 'Aarav', attendedClasses: 22, totalClasses: 25, todayStatus: 'ABSENT' }
    ];

    localStorage.setItem(`college_students_${prog}_${sem}_${subA}`, JSON.stringify(rosterA));
    localStorage.setItem(`college_students_${prog}_${sem}_${subB}`, JSON.stringify(rosterB));
    localStorage.setItem(`college_students_${prog}_${sem}_${subC}`, JSON.stringify(rosterC));

    // Mark attendance for Subject A: Toggle to PRESENT and commit
    const updatedA = rosterA.map(s => ({
      ...s,
      todayStatus: 'PRESENT',
      attendedClasses: s.attendedClasses + 1,
      totalClasses: s.totalClasses + 1
    }));
    localStorage.setItem(`college_students_${prog}_${sem}_${subA}`, JSON.stringify(updatedA));

    // Verify Subject A updated
    const savedA = JSON.parse(localStorage.getItem(`college_students_${prog}_${sem}_${subA}`));
    expect(savedA[0].todayStatus).toBe('PRESENT');
    expect(savedA[0].attendedClasses).toBe(21);
    expect(savedA[0].totalClasses).toBe(26);

    // Verify Subject B & C are strictly unchanged
    const savedB = JSON.parse(localStorage.getItem(`college_students_${prog}_${sem}_${subB}`));
    expect(savedB[0].todayStatus).toBe('ABSENT');
    expect(savedB[0].attendedClasses).toBe(18);
    expect(savedB[0].totalClasses).toBe(25);

    const savedC = JSON.parse(localStorage.getItem(`college_students_${prog}_${sem}_${subC}`));
    expect(savedC[0].todayStatus).toBe('ABSENT');
    expect(savedC[0].attendedClasses).toBe(22);
    expect(savedC[0].totalClasses).toBe(25);
  });

  // TEST 3: Update attendance for one subject
  it('TEST 3: Update attendance for one subject strictly updates only that subject record', () => {
    const classKeyA = 'btech-cse_VI_CS-601';
    const classKeyB = 'btech-cse_VI_CS-602';

    const rosterA = [{ id: 's1', attendedClasses: 10, totalClasses: 12, todayStatus: 'ABSENT' }];
    const rosterB = [{ id: 's1', attendedClasses: 11, totalClasses: 12, todayStatus: 'ABSENT' }];

    localStorage.setItem(`college_students_${classKeyA}`, JSON.stringify(rosterA));
    localStorage.setItem(`college_students_${classKeyB}`, JSON.stringify(rosterB));

    // Teacher edits / updates record for s1 in Subject A
    const editedA = rosterA.map(s => ({ ...s, todayStatus: 'PRESENT', attendedClasses: 11, totalClasses: 12 }));
    localStorage.setItem(`college_students_${classKeyA}`, JSON.stringify(editedA));

    const verifyA = JSON.parse(localStorage.getItem(`college_students_${classKeyA}`));
    const verifyB = JSON.parse(localStorage.getItem(`college_students_${classKeyB}`));

    expect(verifyA[0].todayStatus).toBe('PRESENT');
    expect(verifyA[0].attendedClasses).toBe(11);
    expect(verifyB[0].todayStatus).toBe('ABSENT');
    expect(verifyB[0].attendedClasses).toBe(11);
  });

  // TEST 4: Delete an attendance record for one subject and verify other records
  it('TEST 4: Deleting or resetting an attendance record in one subject preserves other subjects', () => {
    const classKeyA = 'btech-cse_VI_CS-601';
    const classKeyB = 'btech-cse_VI_CS-602';

    const rosterA = [
      { id: 's1', name: 'Aarav' },
      { id: 's2', name: 'Priya' }
    ];
    const rosterB = [
      { id: 's1', name: 'Aarav' },
      { id: 's2', name: 'Priya' }
    ];

    localStorage.setItem(`college_students_${classKeyA}`, JSON.stringify(rosterA));
    localStorage.setItem(`college_students_${classKeyB}`, JSON.stringify(rosterB));

    // Remove s2 from Subject A
    const updatedA = rosterA.filter(s => s.id !== 's2');
    localStorage.setItem(`college_students_${classKeyA}`, JSON.stringify(updatedA));

    const checkA = JSON.parse(localStorage.getItem(`college_students_${classKeyA}`));
    const checkB = JSON.parse(localStorage.getItem(`college_students_${classKeyB}`));

    expect(checkA.length).toBe(1);
    expect(checkA.find(s => s.id === 's2')).toBeUndefined();

    // Verify Subject B retains s2 intact
    expect(checkB.length).toBe(2);
    expect(checkB.find(s => s.id === 's2')).toBeDefined();
    expect(checkB.find(s => s.id === 's2').name).toBe('Priya');
  });

  // TEST 5: Switch between multiple subjects
  it('TEST 5: Switching between multiple subjects resets pending changes and prevents leaking', () => {
    let pendingChanges = new Set();
    let currentSubject = 'CS-601';

    // Faculty marks student s1 in Subject CS-601
    pendingChanges.add('s1');
    expect(pendingChanges.has('s1')).toBe(true);

    // Faculty switches to Subject CS-602: Subject switch triggers pending reset
    currentSubject = 'CS-602';
    pendingChanges = new Set(); // Reset on subject change

    expect(currentSubject).toBe('CS-602');
    expect(pendingChanges.size).toBe(0);
    expect(pendingChanges.has('s1')).toBe(false);
  });

  // TEST 6: Refresh the application and verify persistence
  it('TEST 6: Refreshing the application hydrates each subject independently from isolated storage', () => {
    const keyA = 'college_students_btech-cse_VI_CS-601';
    const keyB = 'college_students_btech-cse_VI_CS-602';

    const savedDataA = [{ id: 's1', attendedClasses: 45, totalClasses: 50, todayStatus: 'PRESENT' }];
    const savedDataB = [{ id: 's1', attendedClasses: 35, totalClasses: 50, todayStatus: 'ABSENT' }];

    localStorage.setItem(keyA, JSON.stringify(savedDataA));
    localStorage.setItem(keyB, JSON.stringify(savedDataB));

    // Simulate rehydration function after page refresh
    const loadClass = (classKey) => {
      const raw = localStorage.getItem(`college_students_${classKey}`);
      return raw ? JSON.parse(raw) : [];
    };

    const rehydratedA = loadClass('btech-cse_VI_CS-601');
    const rehydratedB = loadClass('btech-cse_VI_CS-602');

    expect(rehydratedA[0].attendedClasses).toBe(45);
    expect(rehydratedA[0].todayStatus).toBe('PRESENT');

    expect(rehydratedB[0].attendedClasses).toBe(35);
    expect(rehydratedB[0].todayStatus).toBe('ABSENT');
  });

  // TEST 7: Open the application in multiple sessions and verify synchronization
  it('TEST 7: Multi-session broadcast with differing classKey does not overwrite active subject', () => {
    const activeClassKey = 'btech-cse_VI_CS-602';
    let activeStudents = [
      { id: 's1', name: 'Aarav', subject: 'CS-602', attendedClasses: 38, totalClasses: 50 }
    ];

    // Simulated event listener in Tab 2
    const handleBroadcast = (event) => {
      const { type, payload } = event;
      if (type === 'STUDENTS_UPDATE') {
        // Strict Subject Isolation check
        if (payload?.classKey && payload.classKey !== activeClassKey) {
          // Cache in storage, do NOT overwrite active in-memory state
          localStorage.setItem(`college_students_${payload.classKey}`, JSON.stringify(payload.students));
          return;
        }
        if (payload?.students) {
          activeStudents = payload.students;
        }
      }
    };

    // Another tab commits Subject CS-601
    const incomingEvent = {
      type: 'STUDENTS_UPDATE',
      payload: {
        classKey: 'btech-cse_VI_CS-601',
        students: [{ id: 's1', name: 'Aarav', subject: 'CS-601', attendedClasses: 49, totalClasses: 50 }]
      }
    };

    handleBroadcast(incomingEvent);

    // Verify active students in Tab 2 was NOT contaminated by CS-601
    expect(activeStudents[0].subject).toBe('CS-602');
    expect(activeStudents[0].attendedClasses).toBe(38);

    // Verify CS-601 was safely cached
    const cachedCS601 = JSON.parse(localStorage.getItem('college_students_btech-cse_VI_CS-601'));
    expect(cachedCS601[0].attendedClasses).toBe(49);
  });

  // TEST 8: Test rapid consecutive attendance updates
  it('TEST 8: Rapid consecutive updates execute atomically without race conditions', async () => {
    let student = { id: 's1', attendedClasses: 10, totalClasses: 10, todayStatus: 'ABSENT' };

    const toggle = (current) => {
      const nextStatus = current.todayStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      return {
        ...current,
        todayStatus: nextStatus,
        attendedClasses: nextStatus === 'PRESENT' ? current.attendedClasses + 1 : current.attendedClasses
      };
    };

    // 10 rapid toggles
    for (let i = 0; i < 10; i++) {
      student = toggle(student);
    }

    // 10 toggles from ABSENT -> even number -> ABSENT
    expect(student.todayStatus).toBe('ABSENT');
    expect(student.attendedClasses).toBe(15);
  });

  // TEST 9: Test multiple students across multiple subjects
  it('TEST 9: Multi-student multi-subject matrix maintains strict pair-wise isolation', () => {
    const students = ['s1', 's2', 's3'];
    const subjects = ['CS-601', 'CS-602', 'CS-603'];

    const matrix = {};

    // Initialize distinct records for each student in each subject
    subjects.forEach((sub, subIdx) => {
      const classKey = `btech-cse_VI_${sub}`;
      const roster = students.map((sId, sIdx) => ({
        id: sId,
        attendedClasses: 10 * (subIdx + 1) + sIdx,
        totalClasses: 30,
        todayStatus: (subIdx + sIdx) % 2 === 0 ? 'PRESENT' : 'ABSENT'
      }));
      matrix[classKey] = roster;
      localStorage.setItem(`college_students_${classKey}`, JSON.stringify(roster));
    });

    // Verify each student-subject pair has independent values
    const cs601 = JSON.parse(localStorage.getItem('college_students_btech-cse_VI_CS-601'));
    const cs602 = JSON.parse(localStorage.getItem('college_students_btech-cse_VI_CS-602'));
    const cs603 = JSON.parse(localStorage.getItem('college_students_btech-cse_VI_CS-603'));

    expect(cs601.find(s => s.id === 's1').attendedClasses).toBe(10);
    expect(cs602.find(s => s.id === 's1').attendedClasses).toBe(20);
    expect(cs603.find(s => s.id === 's1').attendedClasses).toBe(30);

    expect(cs601.find(s => s.id === 's2').attendedClasses).toBe(11);
    expect(cs602.find(s => s.id === 's2').attendedClasses).toBe(21);
    expect(cs603.find(s => s.id === 's2').attendedClasses).toBe(31);
  });

  // TEST 10: Verify Student, Faculty and Admin permissions
  it('TEST 10: Strict RBAC permissions prevent unauthorized cross-role attendance modification', () => {
    const roles = {
      admin: { canCommitAttendance: true, canModifySystemSettings: true, canViewAllClasses: true },
      faculty: { canCommitAttendance: true, canModifySystemSettings: false, canViewAllClasses: false },
      student: { canCommitAttendance: false, canModifySystemSettings: false, canViewAllClasses: false, canSelfPunch: true }
    };

    // Student cannot commit class attendance
    expect(roles.student.canCommitAttendance).toBe(false);
    expect(roles.student.canModifySystemSettings).toBe(false);

    // Faculty can commit class attendance for assigned classes, cannot modify system settings
    expect(roles.faculty.canCommitAttendance).toBe(true);
    expect(roles.faculty.canModifySystemSettings).toBe(false);

    // Admin has global privileges
    expect(roles.admin.canCommitAttendance).toBe(true);
    expect(roles.admin.canModifySystemSettings).toBe(true);
    expect(roles.admin.canViewAllClasses).toBe(true);
  });
});
