import React from 'react';
import AdminDashboard from '../../components/AdminDashboard';
import { useAcademic } from '../../context/AcademicContext';
import { saveSystemSettingToCloud, saveUsersToCloud } from '../../lib/syncService';

export default function AdminDashboardPage() {
  const {
    session,
    attendanceThreshold,
    setAttendanceThreshold,
    users,
    setUsers,
    announcements,
    setAnnouncements,
    auditLogs,
    setToast
  } = useAcademic();

  const handleUpdateThreshold = async (val) => {
    const num = Number(val);
    setAttendanceThreshold(num);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_min_attendance_threshold', val.toString());
    }
    await saveSystemSettingToCloud('attendance_threshold', num);
    setToast({ type: 'success', message: `Statutory Threshold updated to ${val}% and synced in real-time across all devices.` });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  const handleUpdateRole = async (userId, newRole) => {
    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updated);
    if (typeof window !== 'undefined') localStorage.setItem('college_app_users', JSON.stringify(updated));
    await saveUsersToCloud(updated);
  };

  const handleApproveStatus = async (userId, targetStatus = 'active') => {
    const updated = users.map(u => u.id === userId ? { ...u, status: targetStatus } : u);
    setUsers(updated);
    if (typeof window !== 'undefined') localStorage.setItem('college_app_users', JSON.stringify(updated));
    await saveUsersToCloud(updated);
  };

  const handleDeleteUser = async (userId) => {
    const userToDelete = users.find(u => u.id === userId);
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_app_users', JSON.stringify(updated));
      const currentActiveSession = localStorage.getItem('college_active_session');
      if (currentActiveSession && userToDelete) {
        try {
          const parsed = JSON.parse(currentActiveSession);
          if (parsed?.user?.email?.toLowerCase() === userToDelete.email?.toLowerCase()) {
            localStorage.removeItem('college_active_session');
            localStorage.removeItem('college_active_role');
            window.location.href = '/login';
          }
        } catch {}
      }
    }
    await saveUsersToCloud(updated);
  };

  const handleAddUser = async (newUser) => {
    const updated = [newUser, ...users];
    setUsers(updated);
    if (typeof window !== 'undefined') localStorage.setItem('college_app_users', JSON.stringify(updated));
    await saveUsersToCloud(updated);
  };

  const handleAddAnnouncement = async (newAnn) => {
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    if (typeof window !== 'undefined') localStorage.setItem('college_campus_announcements', JSON.stringify(updated));
    await saveSystemSettingToCloud('college_campus_announcements', updated);
    setToast({ type: 'success', message: 'Announcement broadcasted in real-time to all student and faculty dashboards.' });
    setTimeout(() => setToast({ type: null, message: '' }), 4000);
  };

  const handleDeleteAnnouncement = async (annId) => {
    const updated = announcements.filter(a => a.id !== annId);
    setAnnouncements(updated);
    if (typeof window !== 'undefined') localStorage.setItem('college_campus_announcements', JSON.stringify(updated));
    await saveSystemSettingToCloud('college_campus_announcements', updated);
  };

  return (
    <AdminDashboard
      currentSession={session}
      attendanceThreshold={attendanceThreshold}
      onUpdateThreshold={handleUpdateThreshold}
      users={users}
      onUpdateRole={handleUpdateRole}
      onApproveStatus={handleApproveStatus}
      onDeleteUser={handleDeleteUser}
      onAddUser={handleAddUser}
      announcements={announcements}
      onAddAnnouncement={handleAddAnnouncement}
      onDeleteAnnouncement={handleDeleteAnnouncement}
      auditLogs={auditLogs}
    />
  );
}
