import React from "react";
import ProfileSettingsModal from "../components/ProfileSettingsModal";
import { useAcademic } from "../context/AcademicContext";

export default function ProfileSettingsPage() {
  const {
    role,
    session,
    userProfile,
    students,
    activeCourse,
    users,
    updateUserProfile,
    setStudents,
    setUsers,
    reloadUserProfile,
    setToast
  } = useAcademic();

  const authenticatedStudent = React.useMemo(() => {
    const studentEmail = session?.user?.email?.toLowerCase();
    if (studentEmail) {
      const matched = (students || []).find(s => s.email?.toLowerCase() === studentEmail);
      if (matched) return matched;
      const metadata = session?.user?.user_metadata || {};
      const profile = userProfile || {};
      return {
        id: session?.user?.id || "stu-active",
        rollNo: profile.roll_no || metadata.rollNo || metadata.roll_no || "CS-2026",
        name: profile.full_name || metadata.name || session?.user?.email?.split("@")[0] || "Student User",
        email: session?.user?.email,
        phone: profile.emergency_contact || metadata.phone || "+91 98000 00000",
        program: profile.program_name || metadata.program || "B.Tech Computer Science & Engineering",
        semester: profile.semester || metadata.semester || "Semester VI",
        section: profile.section || "A",
        attendancePercentage: 0,
        attendedClasses: 0,
        totalClasses: 0,
        todayStatus: "ABSENT",
        status: profile.status || metadata.status || "active"
      };
    }
    return null;
  }, [students, session, userProfile]);

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Account &amp; Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your institutional identity, verified contact channels, and system security credentials.
        </p>
      </div>

      <ProfileSettingsModal
        isOpen={true}
        isPageView={true}
        role={role}
        session={session}
        userProfile={userProfile}
        currentStudent={authenticatedStudent}
        activeCourse={activeCourse}
        users={users}
        onUpdateCurrentUser={async (updated) => {
          if (updateUserProfile) {
            await updateUserProfile({
              full_name: updated.name,
              name: updated.name,
              phone: updated.phone,
              department: updated.department
            });
          }
          if (role === "student" && setStudents && authenticatedStudent) {
            setStudents(prev => prev.map(s => 
              (s.id === authenticatedStudent.id || s.email?.toLowerCase() === authenticatedStudent.email?.toLowerCase())
                ? { ...s, ...updated }
                : s
            ));
          }
          if (setUsers) {
            const targetEmail = session?.user?.email?.toLowerCase() || authenticatedStudent?.email?.toLowerCase();
            setUsers(prev => prev.map(u => u.email?.toLowerCase() === targetEmail ? { ...u, ...updated } : u));
          }
          if (reloadUserProfile) {
            await reloadUserProfile();
          }
        }}
        setToast={setToast}
      />
    </div>
  );
}
