import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Dedicated Multi-Page Components
import LoginPage from './pages/login/LoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AcademicSetupPage from './pages/admin/AcademicSetupPage';
import FacultyRosterPage from './pages/faculty/FacultyRosterPage';
import QuickGridPage from './pages/faculty/QuickGridPage';
import LeaveApprovalsPage from './pages/faculty/LeaveApprovalsPage';
import AnalyticsPage from './pages/faculty/AnalyticsPage';
import DebarmentPage from './pages/faculty/DebarmentPage';
import ReportsPage from './pages/faculty/ReportsPage';
import StudentPortalPage from './pages/student/StudentPortalPage';
import NotFoundPage from './pages/NotFoundPage';
import HttpErrorPage from './pages/errors/HttpErrorPage';

function RootIndexRedirect() {
  const { session, role } = useAcademic();
  if (!session) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/admin" replace />;
  if (role === 'faculty') return <Navigate to="/faculty/roster" replace />;
  return <Navigate to="/student/overview" replace />;
}

export default function App() {
  return (
    <AcademicProvider>
      <Routes>
        {/* Unified Authentication & 2FA Gateway */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Portal (Protected) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="admin" replace />} />
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="academic-setup" element={<AcademicSetupPage />} />
          <Route path="roster" element={<FacultyRosterPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="warnings" element={<DebarmentPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Faculty Portal (Protected) */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute allowedRole="faculty">
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="roster" replace />} />
          <Route path="roster" element={<FacultyRosterPage />} />
          <Route path="attendance-grid" element={<QuickGridPage />} />
          <Route path="leave" element={<LeaveApprovalsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="warnings" element={<DebarmentPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Student Portal (Protected) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <RootLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<StudentPortalPage />} />
          <Route path="courses" element={<StudentPortalPage />} />
          <Route path="schedule" element={<StudentPortalPage />} />
          <Route path="leave" element={<StudentPortalPage />} />
          <Route path="certificates" element={<StudentPortalPage />} />
        </Route>

        {/* Dedicated HTTP Status Error Pages */}
        <Route path="/400" element={<HttpErrorPage code={400} />} />
        <Route path="/401" element={<HttpErrorPage code={401} />} />
        <Route path="/403" element={<HttpErrorPage code={403} />} />
        <Route path="/404" element={<HttpErrorPage code={404} />} />
        <Route path="/409" element={<HttpErrorPage code={409} />} />
        <Route path="/429" element={<HttpErrorPage code={429} />} />
        <Route path="/500" element={<HttpErrorPage code={500} />} />
        <Route path="/503" element={<HttpErrorPage code={503} />} />

        {/* Root & Catch-all Fallback */}
        <Route path="/" element={<RootIndexRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AcademicProvider>
  );
}
