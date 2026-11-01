import React, { useState } from 'react';
import {
  BookOpen,
  Building2,
  Search,
  Edit2,
  X
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
              Curriculum &amp; Program Allocation
            </h2>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              Master control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Configure academic degree programs, semesters, course credits, classroom lecture halls, and faculty assignments.
          </p>
        </div>
      </div>

      {/* Program Selector Pills */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
        <label className="block text-xs font-medium text-slate-500 mb-2">
          Select degree program &amp; department
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                }`}
              >
                {prog.degree} | {prog.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Department Banner & Semester Tabs */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              {currentProgram.academicBlock}
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1.5">
              {currentProgram.degree} — {currentProgram.branch}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentProgram.department} | {currentProgram.semesters?.length || 0} Academic semesters configured
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
              Institutional syllabus
            </span>
          </div>
        </div>

        {/* Semester selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {currentProgram.semesters?.map(sem => {
            const isSelected = sem.semNumber === selectedSemNumber;
            return (
              <button
                key={sem.semNumber}
                type="button"
                onClick={() => setSelectedSemNumber(sem.semNumber)}
                className={`px-3 py-1 rounded-md text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                Sem {sem.semNumber} ({sem.subjects?.length} papers)
              </button>
            );
          })}
        </div>
      </div>

      {/* Subjects Table for Selected Semester */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Curriculum subjects — {currentSem?.semLabel || `Semester ${selectedSemNumber}`}
            </h4>
            <span className="text-xs text-slate-500 font-normal">
              {filteredSubjects.length} registered course modules
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or faculty..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-sky-600"
            />
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3.5">Code</th>
                <th className="py-2.5 px-3.5">Subject title</th>
                <th className="py-2.5 px-3.5">Assigned faculty</th>
                <th className="py-2.5 px-3.5">Credits</th>
                <th className="py-2.5 px-3.5">Room</th>
                <th className="py-2.5 px-3.5">Slot</th>
                <th className="py-2.5 px-3.5 text-center">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map(sub => (
                <tr key={sub.code} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">{sub.code}</td>
                  <td className="py-2.5 px-3.5 font-medium text-slate-900">
                    {sub.name}
                    <span className="block text-[10px] text-slate-500 font-normal">{sub.type}</span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-700">{sub.faculty}</td>
                  <td className="py-2.5 px-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                      {sub.credits} credits
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 text-slate-600">{sub.room}</td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-500 text-[11px]">{sub.defaultSlot}</td>
                  <td className="py-2.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(sub)}
                      className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col text-xs">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-sm text-white">Edit Curriculum Allocation</h3>
                <span className="text-[11px] text-sky-400 font-mono">{editingSubject.code}: {editingSubject.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Assigned faculty member</label>
                <input
                  type="text"
                  required
                  value={editFaculty}
                  onChange={e => setEditFaculty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-sky-600 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Lecture hall / Room number</label>
                <input
                  type="text"
                  required
                  value={editRoom}
                  onChange={e => setEditRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-sky-600 text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSubject(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-colors cursor-pointer"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
