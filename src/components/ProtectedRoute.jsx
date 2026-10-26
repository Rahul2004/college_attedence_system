import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAcademic } from '../context/AcademicContext';
import HttpErrorPage from '../pages/errors/HttpErrorPage';

export default function ProtectedRoute({ allowedRole, children }) {
  const { session, role, loading } = useAcademic();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide">Authenticating Academic Suite...</span>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to /login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Strict Role Isolation: Display HTTP 403 Forbidden if user lacks role privileges
  if (allowedRole && role !== allowedRole) {
    const roleLabels = {
      admin: 'College Administrator',
      faculty: 'Academic Faculty / Professor',
      student: 'Registered Student'
    };
    const targetLabel = roleLabels[allowedRole] || allowedRole;
    const currentLabel = roleLabels[role] || role;

    return (
      <HttpErrorPage
        code={403}
        title="403 — Institutional Access Forbidden"
        message={`Access Denied: This portal is restricted to ${targetLabel}s. Your active account is authorized as ${currentLabel}. Direct URL tampering is prohibited by university policy.`}
        actionText="Go to My Portal"
        actionLink={
          role === 'admin' 
            ? '/admin/admin' 
            : role === 'faculty' 
            ? '/faculty/roster' 
            : '/student/overview'
        }
      />
    );
  }

  return children;
}
