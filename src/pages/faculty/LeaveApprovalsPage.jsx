import React from 'react';
import FacultyLeaveApprovals from '../../components/FacultyLeaveApprovals';
import { useAcademic } from '../../context/AcademicContext';

import { saveLeavesToCloud } from '../../lib/syncService';

export default function LeaveApprovalsPage() {
  const { activeCourse, leaves, setLeaves, disputes, handleResolveDispute, setToast } = useAcademic();

  const handleUpdateLeaveStatus = async (leaveId, newStatus) => {
    const updated = leaves.map(l => l.id === leaveId ? { ...l, status: newStatus } : l);
    setLeaves(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_app_leaves', JSON.stringify(updated));
    }
    await saveLeavesToCloud(updated);
    setToast({
      type: 'success',
      message: `Student leave application has been ${newStatus.toLowerCase()} and synced across all portals.`
    });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  return (
    <div className="w-full">
      <FacultyLeaveApprovals
        activeCourse={activeCourse}
        leaves={leaves}
        onUpdateLeaveStatus={handleUpdateLeaveStatus}
        disputes={disputes}
        onResolveDispute={handleResolveDispute}
      />
    </div>
  );
}
