import React from 'react';
import { useLocation } from 'react-router-dom';
import StudentView from '../../components/StudentView';
import { useAcademic } from '../../context/AcademicContext';
import { INITIAL_STUDENTS } from '../../data/mockData';

import { saveLeavesToCloud, saveAttendanceToCloud } from '../../lib/syncService';

export default function StudentPortalPage() {
  const location = useLocation();
  const {
    session,
    userProfile,
    users,
    students,
    setStudents,
    attendanceThreshold,
    leaves,
    setLeaves,
    handleToggleStatus,
    setToast,
    selectedProgramId,
    selectedSemNumber,
    selectedSubjectCode
  } = useAcademic();

  const studentEmail = session?.user?.email?.toLowerCase();
  
  // Find student in roster by email, or dynamically construct their real profile from Supabase Auth & userProfile
  const targetStudent = React.useMemo(() => {
    if (studentEmail) {
      const matched = (students || []).find(s => s.email?.toLowerCase() === studentEmail);
      if (matched) return matched;

      // Check admissions forms for real submitted details
      let admissionDetail = null;
      if (typeof window !== 'undefined') {
        try {
          const rawAdmissions = localStorage.getItem('college_student_admissions_forms');
          if (rawAdmissions) {
            const list = JSON.parse(rawAdmissions);
            if (Array.isArray(list)) {
              admissionDetail = list.find(f => f.email?.toLowerCase() === studentEmail);
            }
          }
        } catch {}
      }

      // Check app users directory for matched student
      const matchedUser = (users || []).find(u => u.email?.toLowerCase() === studentEmail && u.role === 'student');

      // Dynamically construct authentic student record for the currently logged-in user
      const metadata = session?.user?.user_metadata || {};
      const profile = userProfile || {};

      const resolvedStudentName = 
        admissionDetail?.fullName || 
        (profile.role === 'student' ? profile.full_name : null) || 
        matchedUser?.name ||
        (metadata.role === 'student' ? metadata.name : null) ||
        (session?.user?.email ? session.user.email.split('@')[0] : 'Student User');

      const studentId = session?.user?.id || 'stu-active';
      return {
        id: studentId,
        rollNo: admissionDetail?.rollNo || profile.roll_no || metadata.rollNo || metadata.roll_no || 'CS-2026',
        name: resolvedStudentName,
        email: session?.user?.email,
        phone: admissionDetail?.phone || profile.emergency_contact || metadata.phone || '+91 98000 00000',
        program: admissionDetail?.branch || admissionDetail?.programName || profile.program_name || metadata.program || 'B.Tech Computer Science & Engineering',
        semester: admissionDetail?.semester || profile.semester || metadata.semester || 'Semester I',
        section: admissionDetail?.section || profile.section || 'A',
        attendancePercentage: 0,
        attendedClasses: 0,
        totalClasses: 0,
        todayStatus: 'ABSENT',
        status: admissionDetail?.status === 'APPROVED' ? 'active' : (profile.status || metadata.status || 'active'),
        academicStanding: 'Enrolled'
      };
    }
    return null;
  }, [studentEmail, students, session, userProfile, users]);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTab = pathParts[1] || 'overview';

  const handleApplyLeave = async (newLeaveApp) => {
    const updated = [newLeaveApp, ...leaves];
    setLeaves(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_app_leaves', JSON.stringify(updated));
    }
    await saveLeavesToCloud(updated);
    setToast({
      type: 'success',
      message: 'Leave application submitted and synced in real-time. Forwarded to Faculty advisor.'
    });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  const handleSelfPunch = async (subjectCode) => {
    if (!targetStudent) return;
    const enrolledProg = targetStudent.programId || selectedProgramId || 'btech-cse';
    const enrolledSem = (targetStudent.semester || 'Semester VI').replace(/semester\s*/i, '').trim();
    const targetSubCode = subjectCode || selectedSubjectCode || 'CS-601';
    const classKey = `${enrolledProg}_${enrolledSem}_${targetSubCode}`;
    const storageKey = `college_students_${classKey}`;

    let roster = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { roster = JSON.parse(saved); } catch {}
      }
    }
    if (!roster || roster.length === 0) {
      roster = enrolledSem === 'VI' ? [...INITIAL_STUDENTS] : [targetStudent];
    }

    const updated = roster.map(s => {
      const isMatch = s.id === targetStudent.id ||
                      (targetStudent.rollNo && s.rollNo === targetStudent.rollNo) ||
                      (targetStudent.email && s.email?.toLowerCase() === targetStudent.email?.toLowerCase());
      if (!isMatch) return s;
      const alreadyPresent = s.todayStatus === 'PRESENT';
      return {
        ...s,
        todayStatus: 'PRESENT',
        attendedClasses: alreadyPresent ? s.attendedClasses : (s.attendedClasses || 0) + 1,
        totalClasses: alreadyPresent ? s.totalClasses : (s.totalClasses || 0) + 1
      };
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    const activeClassKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
    if (classKey === activeClassKey) {
      setStudents(updated);
    }
    await saveAttendanceToCloud(classKey, updated);
    setToast({
      type: 'success',
      message: `Punch verified for ${targetSubCode}! Marked PRESENT and synced in real time.`
    });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  return (
    <div className="w-full">
      <StudentView
        student={targetStudent}
        activeTab={currentTab}
        threshold={attendanceThreshold}
        leaves={leaves}
        onApplyLeave={handleApplyLeave}
        onSelfPunch={handleSelfPunch}
      />
    </div>
  );
}
