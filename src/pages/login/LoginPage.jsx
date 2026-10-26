import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreen from '../../components/AuthScreen';
import { useAcademic } from '../../context/AcademicContext';

/**
 * LoginPage in dedicated 'login' directory.
 * Preserves full login, 2FA, Supabase auth, and role navigation.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { session, role, setRole, setSession } = useAcademic();
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@college.edu.in').toLowerCase();

  // If user is already authenticated and navigates back to /login, redirect cleanly to their portal
  React.useEffect(() => {
    if (session) {
      const targetPath = role === 'admin' ? '/admin/admin' : role === 'faculty' ? '/faculty/roster' : '/student/overview';
      navigate(targetPath, { replace: true });
    }
  }, [session, role, navigate]);

  const handleLoginSuccess = (userRole, userSession) => {
    const targetRole = userRole || 'faculty';
    setRole(targetRole);

    const activeSess = userSession || {
      user: {
        id: targetRole === 'admin' ? 'admin-system' : `user-${targetRole}`,
        email: targetRole === 'admin' ? ADMIN_EMAIL : `${targetRole}@university.edu`,
        user_metadata: { role: targetRole, name: targetRole === 'admin' ? 'System Administrator' : undefined }
      }
    };

    setSession(activeSess);
    if (typeof window !== 'undefined') {
      localStorage.setItem('college_active_role', targetRole);
      localStorage.setItem('college_active_session', JSON.stringify(activeSess));
    }

    const targetPath = targetRole === 'admin' ? '/admin/admin' : targetRole === 'faculty' ? '/faculty/roster' : '/student/overview';
    navigate(targetPath, { replace: true });
  };

  return <AuthScreen onLogin={handleLoginSuccess} />;
}
