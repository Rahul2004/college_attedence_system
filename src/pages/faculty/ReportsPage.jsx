import React from 'react';
import ExportReporting from '../../components/ExportReporting';
import { useAcademic } from '../../context/AcademicContext';

export default function ReportsPage() {
  const { students, activeCourse, attendanceThreshold } = useAcademic();

  return (
    <div className="w-full">
      <ExportReporting
        students={students}
        course={activeCourse}
        threshold={attendanceThreshold}
      />
    </div>
  );
}
