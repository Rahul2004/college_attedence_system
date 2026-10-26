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

  const handleApproveUser = async (userId, targetStatus = 'details_required') => {
    const updated = users.map(u => u.id === userId ? { ...u, status: targetStatus } : u);
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_app_users', JSON.stringify(updated));
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ status: targetStatus, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (err) {
        console.warn('Update profile status error:', err);
      }
    }

    await saveUsersToCloud(updated);
    const msg = targetStatus === 'active'
      ? 'Student account fully verified and activated! Student dashboard is now unlocked.'
      : 'Student registration approved! Student has been granted access to submit college academic details.';

    setToast({
      type: 'success',
      message: msg
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
