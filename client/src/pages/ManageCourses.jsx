import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PencilSquareIcon, TrashIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import api from "../api/axiosInstance";

/* ─── tiny toast ─────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const bg = type === "success" ? "#10b981" : "#ef4444";
  return (
    <div
      className="fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-2xl text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
      style={{ background: bg }}
    >
      <span className="text-sm font-bold">{msg}</span>
      <button onClick={onClose} className="text-xl font-black opacity-70 hover:opacity-100">×</button>
    </div>
  );
}

/* ─── spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
  );
}

const lbl = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5";
const inpCls = "w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300";
const btnCls = (color) => `px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all active:scale-95 flex items-center justify-center ${color}`;

export default function ManageCourses() {
  const [isOpen, setIsOpen] = useState(true);
  const [courses, setCourses]     = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [toast, setToast]         = useState({ msg: "", type: "success" });

  const [form, setForm] = useState({ name: "", code: "", department: "", year: "", semester: "", isOpenElective: false, enrollExistingStudents: false });
  const [creating, setCreating] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  const [assign, setAssign] = useState({ courseId: "", facultyId: "" });
  const [assigning, setAssigning] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSem, setFilterSem] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const loadCourses   = useCallback(() => api.get("/admin/courses").then(r => setCourses(r.data)).catch(() => {}), []);
  const loadFaculties = useCallback(() => api.get("/admin/faculties").then(r => setFaculties(r.data)).catch(() => {}), []);

  useEffect(() => { loadCourses(); loadFaculties(); }, [loadCourses, loadFaculties]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.year || !form.semester) {
      showToast("Please fill all required fields.", "error"); return;
    }
    setCreating(true);
    try {
      const payload = { ...form, year: parseInt(form.year) };
      if (editingCourseId) {
        // Don't send enrollExistingStudents on update
        const { enrollExistingStudents, ...updatePayload } = payload;
        await api.put(`/admin/courses/${editingCourseId}`, updatePayload);
        showToast("Course updated successfully!");
      } else {
        await api.post("/admin/courses", payload);
        const msg = payload.enrollExistingStudents 
          ? "Course created & existing students enrolled!" 
          : "Course created successfully!";
        showToast(msg);
      }
      setForm({ name: "", code: "", department: "", year: "", semester: "", isOpenElective: false, enrollExistingStudents: false });
      setEditingCourseId(null);
      await loadCourses();
    } catch (err) {
      const serverMsg = err?.response?.data;
      showToast(typeof serverMsg === 'string' ? serverMsg : `Failed to ${editingCourseId ? 'update' : 'create'} course.`, "error");
    } finally { setCreating(false); }
  };

  const handleEdit = (course) => {
    setEditingCourseId(course.courseId);
    setForm({
      name: course.name,
      code: course.code,
      department: course.department || "",
      year: course.year,
      semester: course.semester,
      isOpenElective: course.isOpenElective || false,
      enrollExistingStudents: false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      showToast("Course deleted successfully!");
      if (editingCourseId === courseId) {
        setForm({ name: "", code: "", department: "", year: "", semester: "", isOpenElective: false, enrollExistingStudents: false });
        setEditingCourseId(null);
      }
      await loadCourses();
    } catch {
      showToast("Failed to delete course.", "error");
    }
  };

  const handleAssign = async () => {
    if (!assign.courseId || !assign.facultyId) {
      showToast("Select both a course and a faculty member.", "error"); return;
    }
    setAssigning(true);
    try {
      await api.post("/admin/courses/assign", {
        courseId: parseInt(assign.courseId),
        facultyId: parseInt(assign.facultyId),
      });
      showToast("Faculty assigned successfully!");
      setAssign({ courseId: "", facultyId: "" });
      await loadCourses();
    } catch {
      showToast("Failed to assign faculty.", "error");
    } finally { setAssigning(false); }
  };

  const handleUnlockLedger = async (courseId) => {
    if (!window.confirm("Are you sure you want to unlock the ledger for this course? This will allow faculty to re-edit grades.")) {
      return;
    }
    try {
      await api.put(`/admin/courses/${courseId}/unlock-ledger`);
      showToast("Ledger unlocked successfully!", "success");
      await loadCourses(); // Reload to update button state
    } catch (err) {
      showToast("Failed to unlock ledger.", "error");
    }
  };

  const filteredCourses = courses.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchYear = String(c.year || "").includes(q);
    const matchSem = String(c.semester || "").includes(q);
    const matchCode = (c.code || "").toLowerCase().includes(q);
    const matchName = (c.name || "").toLowerCase().includes(q);
    const matchDept = (c.department || "").toLowerCase().includes(q);
    const matchFaculty = (c.facultyName || "").toLowerCase().includes(q);
    
    // First apply explicit dropdown filters if present
    if (filterYear && String(c.year) !== filterYear) return false;
    if (filterSem && String(c.semester) !== filterSem) return false;

    // Then apply text search
    if (q) {
      return matchYear || matchSem || matchCode || matchName || matchDept || matchFaculty;
    }
    
    return true;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Manage Courses" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8">
          <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-2">Manage Courses</h1>
            <p className="text-slate-500 mb-10 text-sm">System administration for courses and faculty assignments.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Create/Edit Course */}
              <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-black text-indigo-600 flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 rounded-lg">{editingCourseId ? '✏️' : '➕'}</span>
                    {editingCourseId ? 'Edit Course' : 'Create New Course'}
                  </h2>
                  {editingCourseId && (
                    <button 
                      onClick={() => { setEditingCourseId(null); setForm({ name: "", code: "", department: "", year: "", semester: "", isOpenElective: false, enrollExistingStudents: false }); }}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Name *</label>
                      <input className={inpCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Data Structures" />
                    </div>
                    <div>
                      <label className={lbl}>Code *</label>
                      <input className={inpCls} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. CS301" />
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Department</label>
                    <input className={inpCls} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. CSE" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={lbl}>Year *</label>
                      <select className={inpCls} value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}>
                        <option value="">Select</option>
                        {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Semester *</label>
                      <select className={inpCls} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                        <option value="">Select</option>
                        {[1, 2].map(s => <option key={s} value={s}>Sem {s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="isOpenElective" 
                      checked={form.isOpenElective} 
                      onChange={e => setForm(p => ({ ...p, isOpenElective: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isOpenElective" className="text-sm font-bold text-slate-700">This is an Open Elective Course</label>
                  </div>
                  {!editingCourseId && !form.isOpenElective && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <input 
                        type="checkbox" 
                        id="enrollExistingStudents" 
                        checked={form.enrollExistingStudents} 
                        onChange={e => setForm(p => ({ ...p, enrollExistingStudents: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="enrollExistingStudents" className="text-xs font-bold text-indigo-800 leading-relaxed">
                        Enroll all existing eligible students
                        <span className="block font-medium text-indigo-600 mt-0.5">Use this when the course was missed or is backdated. All students at or past this year/semester in the same department will be auto-enrolled.</span>
                      </label>
                    </div>
                  )}
                  <button type="submit" disabled={creating} className={btnCls("bg-indigo-600 hover:bg-indigo-700 w-full disabled:opacity-50 mt-2")}>
                    {creating && <Spinner />} {creating ? "Processing..." : (editingCourseId ? "Update Course" : "Register Course")}
                  </button>
                </form>
              </div>

              {/* Assign Faculty */}
              <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50">
                <h2 className="text-lg font-black text-blue-600 mb-6 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 rounded-lg">🎓</span> Faculty Assignment
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className={lbl}>Target Course</label>
                    <select className={inpCls} value={assign.courseId} onChange={e => setAssign(p => ({ ...p, courseId: e.target.value }))}>
                      <option value="">— choose course —</option>
                      {courses.map(c => (
                        <option key={c.courseId} value={c.courseId}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Faculty Member</label>
                    <select className={inpCls} value={assign.facultyId} onChange={e => setAssign(p => ({ ...p, facultyId: e.target.value }))}>
                      <option value="">— select professor —</option>
                      {faculties.map(f => (
                        <option key={f.id} value={f.id}>{f.username} ({f.department})</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleAssign} disabled={assigning} className={btnCls("bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50 mt-4")}>
                    {assigning && <Spinner />} {assigning ? "Processing..." : "Complete Assignment"}
                  </button>
                </div>
              </div>
            </div>

            {/* Course Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-slate-800">Operational Course Registry</h2>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-600 font-bold"
                        >
                            <option value="">All Years</option>
                            <option value="1">Year 1</option>
                            <option value="2">Year 2</option>
                            <option value="3">Year 3</option>
                            <option value="4">Year 4</option>
                        </select>
                        <select
                            value={filterSem}
                            onChange={(e) => setFilterSem(e.target.value)}
                            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-600 font-bold"
                        >
                            <option value="">All Semesters</option>
                            <option value="1">Sem 1</option>
                            <option value="2">Sem 2</option>
                        </select>
                        <input
                            type="text"
                            placeholder="🔍 Search name, code, faculty..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full md:w-56 placeholder:text-slate-400 font-medium"
                        />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0 ml-2">
                            {filteredCourses.length} MATCHES
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Course Info</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Code</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Credits</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Schedule</th>
                                <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Assigned Personnel</th>
                                <th className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 transition-all">
                            {filteredCourses.length > 0 ? (
                              filteredCourses.map((c) => (
                                <tr key={c.courseId} className="hover:bg-slate-50/50 transition">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-slate-800">
                                          {c.name}
                                          {c.isOpenElective && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 tracking-wide uppercase">OE</span>}
                                        </div>
                                        <div className="text-[10px] uppercase font-black text-indigo-400 tracking-tighter">{c.department || "General"}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black ring-1 ring-indigo-100">{c.code}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-black ring-1 ring-blue-100">{c.credits || 0}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-medium text-slate-600">Year {c.year} · Sem {c.semester}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        {c.facultyName
                                            ? <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                <span className="text-slate-700 font-bold">{c.facultyName}</span>
                                                <span className="hidden md:inline text-[10px] text-slate-400">({c.facultyDept})</span>
                                              </div>
                                            : <div className="text-rose-500 font-black text-[10px] uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                                                Pending Assignment
                                              </div>}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {c.hasPublishedResults ? (
                                              <button 
                                                  onClick={() => handleUnlockLedger(c.courseId)}
                                                  className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                                  title="Unlock Marks Ledger"
                                              >
                                                  <LockOpenIcon className="w-4 h-4" />
                                              </button>
                                            ) : (
                                              <div 
                                                className="p-1.5 text-slate-300 cursor-not-allowed"
                                                title="No published results to unlock"
                                              >
                                                  <LockOpenIcon className="w-4 h-4" />
                                              </div>
                                            )}

                                            <button 
                                                onClick={() => handleEdit(c)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Edit Course"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(c.courseId)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                title="Delete Course"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                  <td colSpan="6" className="px-8 py-10 text-center text-slate-400 font-medium italic">
                                      No courses match your search criteria.
                                  </td>
                              </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
