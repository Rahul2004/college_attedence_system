import React from 'react';
import FacultyLeaveApprovals from '../../components/FacultyLeaveApprovals';
import { useAcademic } from '../../context/AcademicContext';

import { saveLeavesToCloud, saveUsersToCloud } from '../../lib/syncService';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function LeaveApprovalsPage() {
  const { 
    activeCourse, 
    leaves, 
    setLeaves, 
    disputes, 
    handleResolveDispute, 
    users, 
    setUsers, 
    setToast 
  } = useAcademic();

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

  const handleApproveUser = async (userId) => {
    const updated = users.map(u => u.id === userId ? { ...u, status: 'active' } : u);
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_app_users', JSON.stringify(updated));
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch {}
    }

    await saveUsersToCloud(updated);
    setToast({
      type: 'success',
      message: `Student registration approved! Student can now log in to the portal.`
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
        users={users}
        onApproveUser={handleApproveUser}
      />
    </div>
  );
}
