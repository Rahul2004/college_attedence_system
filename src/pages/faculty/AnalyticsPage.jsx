import React from 'react';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';
import { useAcademic } from '../../context/AcademicContext';

export default function AnalyticsPage() {
  const { students, activeCourse, attendanceThreshold } = useAcademic();

  return (
    <div className="w-full">
      <AnalyticsDashboard
        students={students}
        course={activeCourse}
        threshold={attendanceThreshold}
      />
    </div>
  );
}
