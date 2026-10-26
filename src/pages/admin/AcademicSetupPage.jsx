import React from 'react';
import AdminAcademicSetup from '../../components/AdminAcademicSetup';
import { useAcademic } from '../../context/AcademicContext';
import { saveProgramsToCloud } from '../../lib/syncService';

export default function AcademicSetupPage() {
  const { programs, setPrograms, setToast } = useAcademic();

  const handleUpdateSubject = async (progId, semNum, subjectCode, updatedSubjectData) => {
    let finalUpdated = null;
    setPrograms(prev => {
      const updated = prev.map(prog => {
        if (prog.id !== progId) return prog;
        return {
          ...prog,
          semesters: prog.semesters.map(sem => {
            if (sem.semNumber !== semNum) return sem;
            return {
              ...sem,
              subjects: sem.subjects.map(sub => {
                if (sub.code !== subjectCode) return sub;
                return { ...sub, ...updatedSubjectData };
              })
            };
          })
        };
      });

      finalUpdated = updated;
      if (typeof window !== 'undefined') {
        localStorage.setItem('college_programs_master', JSON.stringify(updated));
      }
      return updated;
    });

    if (finalUpdated) {
      await saveProgramsToCloud(finalUpdated);
    }

    setToast({
      type: 'success',
      message: `Curriculum updated for ${subjectCode}. Synced in real-time across all devices.`
    });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  return (
    <AdminAcademicSetup
      programs={programs}
      onUpdateSubject={handleUpdateSubject}
    />
  );
}
