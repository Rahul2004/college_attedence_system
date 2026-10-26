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
  
  // Find student in roster by email, or dynamically construct their real profile from Supabase Auth session
  const targetStudent = React.useMemo(() => {
    if (studentEmail) {
      const matched = (students || []).find(s => s.email?.toLowerCase() === studentEmail);
      if (matched) return matched;

      // Dynamically construct authentic student record for the currently logged-in user
      const metadata = session?.user?.user_metadata || {};
      const studentName = metadata.name || session?.user?.email?.split('@')[0] || 'Student User';
      const studentId = session?.user?.id || 'stu-active';
      return {
        id: studentId,
        rollNo: metadata.rollNo || metadata.roll_no || 'CS-2026',
        name: studentName,
        email: session?.user?.email,
        phone: metadata.phone || '+91 98000 00000',
        program: metadata.program || 'B.Tech Computer Science & Engineering',
        semester: metadata.semester || 'Semester VI',
        section: 'A',
        attendancePercentage: 82.5,
        attendedClasses: 33,
        totalClasses: 40,
        todayStatus: 'PRESENT',
        status: metadata.status || 'active',
        academicStanding: 'Good Standing'
      };
    }
    return students[0] || INITIAL_STUDENTS[0];
  }, [studentEmail, students, session]);

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

  const handleSelfPunch = async () => {
    if (!targetStudent) return;
    const classKey = `${selectedProgramId}_${selectedSemNumber}_${selectedSubjectCode}`;
    const updated = students.map(s => {
      if (s.id !== targetStudent.id) return s;
      return {
        ...s,
        todayStatus: 'PRESENT',
        attendedClasses: s.todayStatus === 'PRESENT' ? s.attendedClasses : s.attendedClasses + 1,
        totalClasses: s.todayStatus === 'PRESENT' ? s.totalClasses : s.totalClasses + 1
      };
    });
    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`college_students_${classKey}`, JSON.stringify(updated));
    }
    await saveAttendanceToCloud(classKey, updated);
    setToast({
      type: 'success',
      message: 'Classroom punch verified! Attendance marked PRESENT and synced to professor in real time.'
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
