import React from 'react';
import AttendanceGrid from '../../components/AttendanceGrid';
import { useAcademic } from '../../context/AcademicContext';

export default function QuickGridPage() {
  const { students, handleToggleStatus, activeCourse, attendanceThreshold } = useAcademic();

  return (
    <div className="w-full">
      <AttendanceGrid
        students={students}
        course={activeCourse}
        threshold={attendanceThreshold}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
