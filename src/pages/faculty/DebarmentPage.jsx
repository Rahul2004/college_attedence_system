import React from 'react';
import WarningDeficitEngine from '../../components/WarningDeficitEngine';
import { useAcademic } from '../../context/AcademicContext';

export default function DebarmentPage() {
  const { students, activeCourse, attendanceThreshold } = useAcademic();

  return (
    <div className="w-full">
      <WarningDeficitEngine
        students={students}
        course={activeCourse}
        threshold={attendanceThreshold}
      />
    </div>
  );
}
