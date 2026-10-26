import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Building2,
  Users,
  Plus,
  Edit2,
  Check,
  Search,
  Layers,
  Award
} from 'lucide-react';
import { INDIAN_COLLEGE_PROGRAMS } from '../data/mockData';

export default function AdminAcademicSetup({ programs: propPrograms, onUpdateSubject }) {
  const [selectedProgramId, setSelectedProgramId] = useState('btech-cse');
  const [selectedSemNumber, setSelectedSemNumber] = useState('VI');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSubject, setEditingSubject] = useState(null);
  const [editFaculty, setEditFaculty] = useState('');
  const [editRoom, setEditRoom] = useState('');

  const programs = propPrograms || INDIAN_COLLEGE_PROGRAMS;
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];
  const currentSem = currentProgram?.semesters?.find(s => s.semNumber === selectedSemNumber) || currentProgram?.semesters?.[0];
  const subjects = currentSem?.subjects || [];

  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.faculty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (sub) => {
    setEditingSubject(sub);
    setEditFaculty(sub.faculty);
    setEditRoom(sub.room);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSubject) return;

    if (onUpdateSubject) {
      onUpdateSubject(selectedProgramId, selectedSemNumber, editingSubject.code, {
        faculty: editFaculty,
        room: editRoom
      });
    }

    setEditingSubject(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Master Academic Curriculum &amp; Programs
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Institutional Admin Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure Indian University degrees (B.Tech, BCA, MCA, BBA, MBA, B.Sc), semesters, subjects, credits, and faculty allocations.
          </p>
        </div>
      </div>

      {/* Program Selector Pills */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Select Degree Program &amp; Department
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {programs.map(prog => {
            const isSelected = prog.id === selectedProgramId;
            return (
              <button
                key={prog.id}
                type="button"
                onClick={() => {
                  setSelectedProgramId(prog.id);
                  if (prog.semesters?.length > 0) {
                    setSelectedSemNumber(prog.semesters[0].semNumber);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25 ring-2 ring-purple-600/20'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {prog.degree} &bull; {prog.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Department Banner & Semester Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              {currentProgram.academicBlock}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {currentProgram.degree} &mdash; {currentProgram.branch}
            </h3>
            <p className="text-xs text-slate-500">
              {currentProgram.department} &bull; Total {currentProgram.semesters?.length || 0} Academic Semesters
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              AKTU / UGC Affiliated
            </span>
          </div>
        </div>

        {/* Semester selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {currentProgram.semesters?.map(sem => {
            const isSelected = sem.semNumber === selectedSemNumber;
            return (
              <button
                key={sem.semNumber}
                type="button"
                onClick={() => setSelectedSemNumber(sem.semNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sem {sem.semNumber} ({sem.subjects?.length} Papers)
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects Table for Selected Semester */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Curriculum Subjects &mdash; {currentSem?.semLabel || `Semester ${selectedSemNumber}`}
            </h4>
            <span className="text-xs text-slate-500">
              {filteredSubjects.length} Registered Course Papers
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or faculty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Code</th>
                <th className="py-3 px-3.5">Subject Title</th>
                <th className="py-3 px-3.5">Assigned Faculty</th>
                <th className="py-3 px-3.5">Credits</th>
                <th className="py-3 px-3.5">Hall / Room</th>
                <th className="py-3 px-3.5">Timetable Slot</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map(sub => (
                <tr key={sub.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-purple-700">{sub.code}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">
                    {sub.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{sub.type}</span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 font-medium">{sub.faculty}</td>
                  <td className="py-3 px-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                      {sub.credits} Credits
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600">{sub.room}</td>
                  <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px]">{sub.defaultSlot}</td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(sub)}
                      className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Edit assigned faculty and classroom"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Subject Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden flex flex-col text-xs">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">Edit Curriculum Allocation</h3>
                <span className="text-[11px] text-purple-300 font-mono">{editingSubject.code}: {editingSubject.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Faculty Member</label>
                <input
                  type="text"
                  required
                  value={editFaculty}
                  onChange={e => setEditFaculty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lecture Hall / Classroom Room</label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={e => setEditRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 transition-all"
                >
                  Update &amp; Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
