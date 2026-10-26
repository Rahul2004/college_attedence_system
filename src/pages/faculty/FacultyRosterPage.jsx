import React from 'react';
import { useNavigate } from 'react-router-dom';
import OrdersTableRoster from '../../components/OrdersTableRoster';
import StudentDetailCard from '../../components/StudentDetailCard';
import RightMetricsPanel from '../../components/RightMetricsPanel';
import { useAcademic } from '../../context/AcademicContext';
import { LECTURE_PERIODS } from '../../data/mockData';

export default function FacultyRosterPage() {
  const navigate = useNavigate();
  const {
    students,
    handleToggleStatus,
    handleMarkAll,
    selectedDate,
    setSelectedDate,
    handleCommit,
    isCommitting,
    pendingChanges,
    activeDetailStudent,
    setActiveDetailStudent,
    programs,
    selectedProgramId,
    setSelectedProgramId,
    selectedSemNumber,
    setSelectedSemNumber,
    selectedSubjectCode,
    setSelectedSubjectCode,
    selectedSlotId,
    setSelectedSlotId,
    activeCourse,
    role,
    attendanceThreshold
  } = useAcademic();

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
      <div className="flex-1 min-w-0 relative w-full">
        <OrdersTableRoster
          students={students}
          onToggleStatus={handleToggleStatus}
          onMarkAll={handleMarkAll}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onCommit={handleCommit}
          isCommitting={isCommitting}
          hasPendingChanges={pendingChanges.size > 0}
          onSelectStudentDetail={setActiveDetailStudent}
          activeDetailStudent={activeDetailStudent}
          programs={programs}
          lecturePeriods={LECTURE_PERIODS}
          selectedProgramId={selectedProgramId}
          onProgramChange={setSelectedProgramId}
          selectedSemNumber={selectedSemNumber}
          onSemChange={setSelectedSemNumber}
          selectedSubjectCode={selectedSubjectCode}
          onSubjectChange={setSelectedSubjectCode}
          selectedSlotId={selectedSlotId}
          onSlotChange={setSelectedSlotId}
          activeCourse={activeCourse}
          role={role}
          threshold={attendanceThreshold}
        />

        {activeDetailStudent && (
          <div className="fixed top-24 right-8 z-40 w-80 hidden 2xl:block">
            <StudentDetailCard
              student={activeDetailStudent}
              onClose={() => setActiveDetailStudent(null)}
              onToggleStatus={handleToggleStatus}
              threshold={attendanceThreshold}
            />
          </div>
        )}
      </div>

      <RightMetricsPanel
        students={students}
        course={activeCourse}
        threshold={attendanceThreshold}
        onSelectDefaulterFilter={() => navigate('/faculty/warnings')}
      />
    </div>
  );
}
