import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  Filter,
  CheckCircle2,
  Search,
  Users,
  GraduationCap,
  Building2,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { useAcademic } from '../context/AcademicContext';
import { saveSystemSettingToCloud } from '../lib/syncService';

export default function NoticeBoardPage() {
  const location = useLocation();
  const {
    role: contextRole,
    announcements = [],
    setAnnouncements,
    session,
    userProfile,
    setToast
  } = useAcademic();

  // Resolve role from path or context: 'admin' | 'faculty' | 'student'
  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeRole = ['admin', 'faculty', 'student'].includes(pathParts[0])
    ? pathParts[0]
    : (contextRole || 'student');

  const canPublish = activeRole === 'admin' || activeRole === 'faculty';
  const canDelete = activeRole === 'admin';

  // Composer Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL'); // NORMAL | URGENT
  // Admin can target ALL, FACULTY_ONLY, STUDENT_ONLY
  // Faculty defaults to ALL or STUDENT_ONLY
  const [audience, setAudience] = useState('ALL');
  const [category, setCategory] = useState('ACADEMIC'); // ACADEMIC | ADMINISTRATIVE | EXAMINATION | EVENT

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Filter notices based on active role and search
  const visibleAnnouncements = useMemo(() => {
    return announcements.filter(item => {
      // 1. Role-based Permission Isolation:
      // Student: NEVER sees 'FACULTY_ONLY'
      if (activeRole === 'student') {
        if (item.audience === 'FACULTY_ONLY') return false;
      }
      // Faculty: Can see 'ALL' and 'FACULTY_ONLY', plus 'STUDENT_ONLY' if relevant for tracking
      // Admin: Sees ALL notices unconditionally.

      // 2. Audience Tab Filter
      if (audienceFilter !== 'ALL' && item.audience !== audienceFilter) {
        return false;
      }

      // 3. Priority Filter
      if (priorityFilter !== 'ALL' && item.priority !== priorityFilter) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchContent = item.content?.toLowerCase().includes(q);
        const matchAuthor = item.author?.toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchAuthor) return false;
      }

      return true;
    });
  }, [announcements, activeRole, audienceFilter, priorityFilter, searchQuery]);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const authorName =
      userProfile?.full_name ||
      session?.user?.user_metadata?.name ||
      (activeRole === 'admin' ? 'Office of the Registrar' : 'Department Faculty Committee');

    const newNotice = {
      id: `ann-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      priority,
      audience,
      category,
      author: authorName,
      authorRole: activeRole,
      publishedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      createdAt: new Date().toISOString()
    };

    const updated = [newNotice, ...announcements];
    setAnnouncements(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('college_campus_announcements', JSON.stringify(updated));
    }
    await saveSystemSettingToCloud('college_campus_announcements', updated);

    // Reset Form
    setTitle('');
    setContent('');
    setPriority('NORMAL');
    setAudience('ALL');
    setCategory('ACADEMIC');
    setIsComposeOpen(false);

    if (setToast) {
      setToast({
        type: 'success',
        message: `Official circular published successfully for ${audience === 'ALL' ? 'Campus (All)' : audience === 'FACULTY_ONLY' ? 'Faculty Only' : 'Students Only'}.`
      });
      setTimeout(() => setToast({ type: null, message: '' }), 4000);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (!window.confirm('Are you sure you want to retract and delete this official notice?')) return;
    const updated = announcements.filter(a => a.id !== noticeId);
    setAnnouncements(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem('college_campus_announcements', JSON.stringify(updated));
    }
    await saveSystemSettingToCloud('college_campus_announcements', updated);

    if (setToast) {
      setToast({
        type: 'success',
        message: 'Notice retracted and removed from college registry.'
      });
      setTimeout(() => setToast({ type: null, message: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Notice Board &amp; Circulars Hub
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                  {activeRole} Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Official institutional bulletins, exam advisories, holidays, and administrative circulars.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canPublish && (
            <button
              type="button"
              onClick={() => setIsComposeOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Publish Circular</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= SEARCH & AUDIENCE FILTERS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars by subject, keyword, or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Quick Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Circulars Only</option>
            <option value="NORMAL">Standard Notices</option>
          </select>

          {/* Audience Filter (Only for Admin & Faculty) */}
          {activeRole !== 'student' && (
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="ALL">All Audiences</option>
              <option value="FACULTY_ONLY">Faculty Only Circulars</option>
              <option value="STUDENT_ONLY">Student Only Circulars</option>
            </select>
          )}
        </div>
      </div>

      {/* ================= NOTICES FEED ================= */}
      {visibleAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No circulars matching your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeRole === 'student'
              ? 'There are no active notices published for students right now. Please check back later.'
              : 'Try refining your search keyword or audience filter, or post a new circular above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleAnnouncements.map((ann) => {
            const isUrgent = ann.priority === 'URGENT';
            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all duration-200 flex flex-col justify-between ${
                  isUrgent
                    ? 'border-red-200 bg-red-50/20 hover:border-red-300'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Metadata Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isUrgent
                            ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {ann.priority || 'NORMAL'}
                      </span>

                      {/* Audience Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          ann.audience === 'FACULTY_ONLY'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : ann.audience === 'STUDENT_ONLY'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {ann.audience === 'FACULTY_ONLY'
                          ? 'Faculty Only'
                          : ann.audience === 'STUDENT_ONLY'
                          ? 'Students Only'
                          : 'Campus Wide'}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNotice(ann.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-slate-100 transition"
                        title="Delete Circular"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 leading-snug">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600 truncate max-w-[180px]">
                      {ann.author || 'Dean of Academic Affairs'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{ann.publishedAt || 'Today'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= COMPOSER MODAL (ADMIN & FACULTY) ================= */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Publish Official Notice / Circular
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Posted by {activeRole === 'admin' ? 'Administration' : 'Faculty Member'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateNotice} className="p-5 space-y-4">
              {/* Notice Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Circular Subject / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End-Semester Examination Schedule Notification"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-medium"
                />
              </div>

              {/* Priority & Target Audience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="NORMAL">Standard Notice</option>
                    <option value="URGENT">Urgent / High Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="ALL">Entire Campus (Faculty &amp; Students)</option>
                    <option value="FACULTY_ONLY">Faculty &amp; Staff Only (Hidden from Students)</option>
                    <option value="STUDENT_ONLY">Students Only</option>
                  </select>
                </div>
              </div>

              {/* Content / Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notice Details / Body *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type the complete circular instructions, guidelines, room numbers, or statutory announcements here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 font-medium leading-relaxed resize-none"
                />
              </div>

              {/* Audience Restriction Notice Callout */}
              {audience === 'FACULTY_ONLY' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Confidential to Faculty:</strong> Students will strictly <strong>NOT</strong> see this circular on their portal or mobile devices.
                  </span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  Publish to Live Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

