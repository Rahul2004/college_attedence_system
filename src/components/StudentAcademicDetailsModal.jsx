import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Send,
  Building2,
  Calendar,
  AlertCircle,
  Phone,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { INDIAN_COLLEGE_PROGRAMS } from '../data/mockData';
import { useAcademic } from '../context/AcademicContext';

export default function StudentAcademicDetailsModal({ profile, onSubmitSuccess }) {
  const { session, handleLogout } = useAcademic();

  const [selectedProgramId, setSelectedProgramId] = useState(
    profile?.program_id || INDIAN_COLLEGE_PROGRAMS[0]?.id || 'btech-cse'
  );
  const selectedProgram = INDIAN_COLLEGE_PROGRAMS.find(p => p.id === selectedProgramId);

  const [semester, setSemester] = useState(profile?.semester || 'I');
  const [section, setSection] = useState(profile?.section || 'A');
  const [rollNo, setRollNo] = useState(profile?.roll_no || '');
  const [admissionYear, setAdmissionYear] = useState(profile?.admission_year || '2024');
  const [dob, setDob] = useState(profile?.dob || '');
  const [emergencyContact, setEmergencyContact] = useState(profile?.emergency_contact || '');
  const [fullName, setFullName] = useState(
    profile?.full_name || session?.user?.user_metadata?.name || ''
  );

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!rollNo.trim()) {
      setErrorMsg('Please enter your official College Roll Number / Enrollment Number.');
      return;
    }

    if (!emergencyContact.trim() || emergencyContact.length < 10) {
      setErrorMsg('Please enter a valid 10-digit emergency contact phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: fullName.trim(),
        roll_no: rollNo.trim().toUpperCase(),
        program_id: selectedProgramId,
        program_name: `${selectedProgram?.degree || ''} ${selectedProgram?.branch || ''}`.trim(),
        department: selectedProgram?.department || 'Computer Science & Engineering',
        semester: `Semester ${semester}`,
        section: section,
        admission_year: admissionYear,
        dob: dob || null,
        emergency_contact: emergencyContact.trim(),
        status: 'details_pending_review',
        updated_at: new Date().toISOString()
      };

      if (supabase && session?.user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', session.user.id);

        if (error) throw error;
      }

      setIsDone(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(payload);
      }
    } catch (err) {
      console.error('Failed to submit academic details:', err);
      setErrorMsg(err.message || 'Failed to submit college enrollment details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Details Submitted Successfully!</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Your college enrollment details have been submitted to the academic office for final verification.
            Your dashboard will unlock automatically once confirmed by your department.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-2xl w-full">
        {/* University Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
              College Enrollment &amp; Academic Onboarding
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Step 2: Enter your institutional academic details to unlock your attendance portal
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 backdrop-blur-xl">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-indigo-500/10 text-indigo-700 border-indigo-200 mb-2">
              Action Required
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Submit Official Academic Information
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your registration request has been accepted. Please select your degree program, branch, semester, and official roll number.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name (as per College ID)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            {/* Program Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Degree Program &amp; Branch
              </label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setSemester('I');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                {INDIAN_COLLEGE_PROGRAMS.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.degree} — {prog.branch}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Department: {selectedProgram?.department}
              </span>
            </div>

            {/* Semester & Section Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  {(selectedProgram?.semesters || []).map((sem) => (
                    <option key={sem.semNumber} value={sem.semNumber}>
                      {sem.semLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Section / Batch
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>

            {/* Roll Number & Admission Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Roll Number / UID *
                </label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                  placeholder="e.g. 0101CS221045"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admission Year
                </label>
                <select
                  value={admissionYear}
                  onChange={(e) => setAdmissionYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>
            </div>

            {/* Date of Birth & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Emergency Contact (Parent / Guardian) *
                </label>
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="+91 98000 00000"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={async () => {
                  await handleLogout();
                  window.location.href = '/login';
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Details...' : 'Submit Academic Details'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
