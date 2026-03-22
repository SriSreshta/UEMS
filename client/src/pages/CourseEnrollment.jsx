import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import { UserGroupIcon, AcademicCapIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 ${type === "success" ? "bg-emerald-600" : type === "warning" ? "bg-amber-500" : "bg-red-600"}`}>
      <span className="text-sm font-black">{msg}</span>
      <button onClick={onClose} className="text-xl font-bold opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

export default function CourseEnrollment() {
  const [isOpen, setIsOpen] = useState(true);
  const [year, setYear]       = useState("1");
  const [semester, setSemester] = useState("1");
  const [preview, setPreview] = useState(null);  // { students, courses }
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  // Preview: fetch students and courses for selected year/sem
  const handlePreview = useCallback(async () => {
    setLoading(true);
    setPreview(null);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get(`/admin/students?year=${year}&semester=${semester}`),
        api.get(`/admin/courses`),
      ]);
      const matchingCourses = coursesRes.data.filter(
        c => String(c.year) === String(year) && String(c.semester) === String(semester)
      );
      setPreview({ students: studentsRes.data, courses: matchingCourses });
      if (studentsRes.data.length === 0) showToast("No students found for this batch.", "warning");
      if (matchingCourses.length === 0) showToast("No courses found for this batch.", "warning");
    } catch {
      showToast("Failed to load preview data.", "error");
    } finally {
      setLoading(false);
    }
  }, [year, semester]);

  // Reset preview when year/sem changes
  useEffect(() => { setPreview(null); }, [year, semester]);

  // Confirm and run batch enrollment
  const handleEnroll = async () => {
    if (!preview || preview.students.length === 0 || preview.courses.length === 0) {
      showToast("Nothing to enroll. Preview first.", "warning");
      return;
    }
    setEnrolling(true);
    try {
      const res = await api.post("/admin/enroll/batch", { year, semester });
      showToast(res.data, "success");
      setPreview(null);
    } catch (err) {
      showToast(err?.response?.data || "Batch enrollment failed.", "error");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Batch Enrollment" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8">
          <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">Smart Batch Enrollment</h1>
            <p className="text-slate-500 text-sm mb-10">Select a year and semester — the system will enroll <strong>all students</strong> of that batch into <strong>all matching courses</strong>, replacing previous mappings.</p>

            {/* Selector */}
            <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 mb-8">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Batch Configuration</p>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</label>
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-black text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                  >
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Semester</label>
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-black text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                  >
                    {[1,2].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <button
                  onClick={handlePreview}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition disabled:opacity-50 active:scale-95"
                >
                  <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Loading..." : "Preview Batch"}
                </button>
              </div>
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  {/* Students */}
                  <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-9 w-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <UserGroupIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">Students</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Year {year} · Sem {semester}</p>
                      </div>
                      <span className="ml-auto text-2xl font-black text-indigo-500">{preview.students.length}</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {preview.students.map(s => (
                        <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm">
                          <div className="font-bold text-slate-700">{s.username}</div>
                          <div className="text-slate-400 text-[10px] uppercase font-black ml-auto">{s.rollNumber}</div>
                        </div>
                      ))}
                      {preview.students.length === 0 && (
                        <p className="text-slate-300 italic text-sm text-center py-4">No students in this batch</p>
                      )}
                    </div>
                  </div>

                  {/* Courses */}
                  <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/40">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <AcademicCapIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">Courses</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Year {year} · Sem {semester}</p>
                      </div>
                      <span className="ml-auto text-2xl font-black text-emerald-500">{preview.courses.length}</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5">
                      {preview.courses.map(c => (
                        <div key={c.courseId} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm">
                          <div className="font-bold text-slate-700">{c.name}</div>
                          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-lg ml-auto">{c.code}</span>
                        </div>
                      ))}
                      {preview.courses.length === 0 && (
                        <p className="text-slate-300 italic text-sm text-center py-4">No courses for this batch</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary + Confirm */}
                {preview.students.length > 0 && preview.courses.length > 0 && (
                  <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl shadow-indigo-100/30 flex items-center justify-between gap-6">
                    <div>
                      <p className="text-slate-800 font-black text-xl mb-1">
                        {preview.students.length} students × {preview.courses.length} courses = <span className="text-indigo-600">{preview.students.length * preview.courses.length} enrollments</span>
                      </p>
                      <p className="text-sm text-slate-500 italic">⚠️ This will <strong>clear all existing enrollments</strong> for Year {year} Sem {semester} before creating new ones.</p>
                    </div>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 disabled:opacity-50 active:scale-95 shrink-0"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      {enrolling ? "Enrolling..." : "Confirm & Enroll"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
