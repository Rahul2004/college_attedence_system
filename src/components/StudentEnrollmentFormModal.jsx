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
  FileText,
  User,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { INDIAN_COLLEGE_PROGRAMS } from '../data/mockData';

export default function StudentEnrollmentFormModal({ 
  isOpen, 
  onClose, 
  initialEmail = '', 
  initialName = '', 
  onSubmitSuccess 
}) {
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  
  // Academic selections
  const [selectedProgramId, setSelectedProgramId] = useState(INDIAN_COLLEGE_PROGRAMS[0]?.id || 'btech-cse');
  const selectedProgram = INDIAN_COLLEGE_PROGRAMS.find(p => p.id === selectedProgramId);
  const [semester, setSemester] = useState('Semester I');
  const [section, setSection] = useState('Section A');
  const [rollNo, setRollNo] = useState('');
  const [admissionBatch, setAdmissionBatch] = useState('2024 – 2028');
  
  // Personal & Guardian info
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !rollNo.trim()) {
      setErrorMsg('Please complete all mandatory academic and personal fields.');
      return;
    }

    setIsSubmitting(true);

    const applicationData = {
      id: `APP-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dob,
      gender,
      programId: selectedProgramId,
      programName: `${selectedProgram?.degree || ''} ${selectedProgram?.branch || ''}`.trim(),
      degree: selectedProgram?.degree || 'B.Tech',
      branch: selectedProgram?.branch || 'Computer Science & Engineering',
      department: selectedProgram?.department || 'Department of Computer Science',
      semester,
      section,
      rollNo: rollNo.trim().toUpperCase(),
      admissionBatch,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      address: address.trim(),
      previousSchool: previousSchool.trim(),
      bloodGroup,
      status: 'WAITING_APPROVAL', // WAITING_APPROVAL | APPROVED | REJECTED
      submittedAt: new Date().toISOString(),
      submittedAtFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess(applicationData);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header - Google Form Style */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Official Institutional Application Form
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Student Admission &amp; Enrollment Application
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              Fill in your complete academic profile. Upon submission, this form will be routed directly to the Course Faculty &amp; Administration Registry for verification.
            </p>
          </div>

          {!isSubmitted && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        {isSubmitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Waiting for Faculty &amp; Admin Approval
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                Application Submitted Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your A-to-Z enrollment details have been submitted into the university cloud directory. Your assigned department faculty and the central administrator have received your application.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Program:</span>
                <span className="font-semibold text-slate-800">{selectedProgram?.branch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-mono font-bold text-slate-900">{rollNo}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-amber-600">Pending Review (Waiting)</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Back to Sign In Gateway
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Personal Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900">
                <User className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  1. Student Identity &amp; Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered College Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="aarav.sharma@collegemail.edu.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Academic Program & Cohort */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  2. Academic Degree &amp; Roll Number Allocation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enrolled Degree &amp; Branch *
                  </label>
                  <select
                    value={selectedProgramId}
                    onChange={e => setSelectedProgramId(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  >
                    {INDIAN_COLLEGE_PROGRAMS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.degree} — {p.branch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Roll Number / Enrollment ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0101CS221001 or CS-602"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Semester
                    </label>
                    <select
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                    >
                      {['Semester I', 'Semester II', 'Semester III', 'Semester IV', 'Semester V', 'Semester VI', 'Semester VII', 'Semester VIII'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Class Section
                    </label>
                    <select
                      value={section}
                      onChange={e => setSection(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-2 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                    >
                      <option value="Section A">Section A</option>
                      <option value="Section B">Section B</option>
                      <option value="Section C">Section C</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admission Batch Year
                  </label>
                  <input
                    type="text"
                    value={admissionBatch}
                    onChange={e => setAdmissionBatch(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Guardian & Residential Information */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-900">
                <MapPin className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider">
                  3. Guardian &amp; Residential Emergency Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent / Guardian Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parent Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 94140 12345"
                    value={guardianPhone}
                    onChange={e => setGuardianPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Permanent Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="House / Flat No., Street, City, State, PIN Code"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Verification Notice Callout */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Statutory Admission Verification Protocol:</span>
              </div>
              <p>
                Submitting this Google form transmits your records to your Department Coordinator (Faculty In-Charge) and the Office of the Registrar (Admin). Your account screen will display <strong>Waiting for Approval</strong> until accepted.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting Form...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-sky-400" />
                    <span>Submit Form to Faculty &amp; Admin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

