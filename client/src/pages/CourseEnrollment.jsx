import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import api from "../api/axiosInstance";
import { UserGroupIcon, AcademicCapIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  return (
    <div className={`fixed top-6 right-6 z-[9999] px-6 py-4 rounded-2xl shadow-2xl text-white flex items-center gap-3 ${type === "success" ? "bg-emerald-600" : type === "warning" ? "bg-amber-500" : "bg-red-600"} animate-in fade-in slide-in-from-top-4 duration-300`}>
      <span className="text-sm font-black">{msg}</span>
      <button onClick={onClose} className="text-xl font-bold opacity-60 hover:opacity-100">×</button>
    </div>
  );
}

export default function CourseEnrollment() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("batch"); // 'batch' or 'elective'
  
  // Shared Selector state
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  
  // Batch state
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  
  // Elective state
  const [electivePreview, setElectivePreview] = useState({ students: [], courses: [] });
  const [electiveCourseId, setElectiveCourseId] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [electiveEnrolling, setElectiveEnrolling] = useState(false);
  const [electiveDeptFilter, setElectiveDeptFilter] = useState("all");

  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 5000);
  };

  // Preview for Batch
  const handlePreview = useCallback(async () => {
    setLoading(true);
    setPreview(null);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get(`/admin/students?year=${year}&semester=${semester}`),
        api.get(`/admin/courses`),
      ]);
      const matchingCourses = coursesRes.data.filter(
        c => String(c.year) === String(year) && String(c.semester) === String(semester) && !c.isOpenElective
      );
      setPreview({ students: studentsRes.data, courses: matchingCourses });
      if (studentsRes.data.length === 0) showToast("No students found for this batch.", "warning");
      if (matchingCourses.length === 0) showToast("No core courses found for this batch.", "warning");
    } catch {
      showToast("Failed to load preview data.", "error");
    } finally {
      setLoading(false);
    }
  }, [year, semester]);

  // Preview for Electives
  const handleElectivePreview = useCallback(async () => {
    setLoading(true);
    setElectiveCourseId("");
    setSelectedStudents([]);
    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.get(`/admin/students?year=${year}&semester=${semester}`),
        api.get(`/admin/courses`),
      ]);
      const oeCourses = coursesRes.data.filter(
        c => String(c.year) === String(year) && String(c.semester) === String(semester) && c.isOpenElective
      );
      setElectivePreview({ students: studentsRes.data, courses: oeCourses });
    } catch {
      showToast("Failed to load elective data.", "error");
    } finally {
      setLoading(false);
    }
  }, [year, semester]);

  useEffect(() => { 
    setPreview(null); 
    if(activeTab === 'elective') handleElectivePreview();
  }, [year, semester, activeTab, handleElectivePreview]);

  // Action: Batch Enroll
  const handleBatchEnroll = async () => {
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

  // Action: Elective Enroll (Bulk)
  const handleElectiveEnroll = async () => {
    if (!electiveCourseId) {
      showToast("Please select an Open Elective course first.", "warning");
      return;
    }
    if (selectedStudents.length === 0) {
      showToast("Please select at least one student.", "warning");
      return;
    }
    setElectiveEnrolling(true);
    try {
      const res = await api.post("/admin/enroll/bulk", { 
        studentIds: selectedStudents, 
        courseId: parseInt(electiveCourseId) 
      });
      showToast(`Successfully enrolled ${selectedStudents.length} students into the elective!`, "success");
      setSelectedStudents([]);
      setElectiveCourseId("");
    } catch (err) {
      showToast(err?.response?.data || "Elective enrollment failed.", "error");
    } finally {
      setElectiveEnrolling(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAllStudents = (filteredStudentsList) => {
    const allFilteredIds = filteredStudentsList.map(s => s.id);
    const allSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedStudents.includes(id));
    
    if (allSelected) {
      // Deselect these filtered students
      setSelectedStudents(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered students
      setSelectedStudents(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Course Enrollment" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8">
          <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">Course Enrollment Hub</h1>
            <p className="text-slate-500 text-sm mb-8">Manage bulk enrollments for core subjects and manual assignments for Open Electives.</p>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
              <button 
                onClick={() => setActiveTab("batch")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "batch" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}
              >
                Core Batch
              </button>
              <button 
                onClick={() => setActiveTab("elective")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "elective" ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}
              >
                Open Electives
              </button>
            </div>

            {/* Common Selector */}
            <div className={`bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 mb-8 transition-colors duration-300 ${activeTab === 'elective' ? 'ring-2 ring-amber-100 border-amber-50' : 'ring-2 ring-indigo-50 border-white'}`}>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Target Batch Configuration</p>
              <div className="flex flex-wrap gap-6 items-end">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</label>
                  <select
                    value={year} onChange={e => setYear(e.target.value)}
                    className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-black text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                  >
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Semester</label>
                  <select
                    value={semester} onChange={e => setSemester(e.target.value)}
                    className="px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-black text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                  >
                    {[1,2].map(s => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                {activeTab === 'batch' && (
                  <button
                    onClick={handlePreview} disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition disabled:opacity-50 active:scale-95 border-none"
                  >
                    <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    {loading ? "Loading..." : "Preview Core Batch"}
                  </button>
                )}
              </div>
            </div>

            {/* Batch Enrollment View */}
            {activeTab === "batch" && preview && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  {/* Students */}
                  <div className="bg-white rounded-3xl p-8 border shadow-xl shadow-slate-200/40 border-slate-100">
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
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                      {preview.students.map(s => (
                        <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl text-sm">
                          <div className="font-bold text-slate-700">{s.username}</div>
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-[9px] uppercase font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{s.department}</span>
                            <div className="text-slate-400 text-[10px] uppercase font-black">{s.rollNumber}</div>
                          </div>
                        </div>
                      ))}
                      {preview.students.length === 0 && (
                        <p className="text-slate-300 italic text-sm text-center py-4">No students in this batch</p>
                      )}
                    </div>
                  </div>

                  {/* Core Courses */}
                  <div className="bg-white rounded-3xl p-8 border shadow-xl shadow-slate-200/40 border-slate-100">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <AcademicCapIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">Core Courses</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">matching respective departments</p>
                      </div>
                      <span className="ml-auto text-2xl font-black text-emerald-500">{preview.courses.length}</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                      {preview.courses.map(c => (
                        <div key={c.courseId} className="flex flex-col gap-1 px-3 py-2 bg-slate-50 rounded-xl text-sm leading-tight">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700">{c.name}</span>
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded ml-auto">{c.code}</span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{c.department}ONLY</span>
                        </div>
                      ))}
                      {preview.courses.length === 0 && (
                        <p className="text-slate-300 italic text-sm text-center py-4">No core courses for this batch</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-indigo-100 shadow-xl shadow-indigo-100/30 flex items-center justify-between gap-6">
                  <div>
                    <p className="text-slate-800 font-black text-lg mb-1">
                      Smart mapping ready!
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">Students will only be enrolled in core courses that match their department.<br/>Existing Open Elective enrollments will be strictly preserved.</p>
                  </div>
                  <button
                    onClick={handleBatchEnroll}
                    disabled={enrolling}
                    className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-base hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 disabled:opacity-50 active:scale-95 shrink-0"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    {enrolling ? "Enrolling..." : "Confirm & Enroll"}
                  </button>
                </div>
              </div>
            )}

            {/* Elective Enrollment View */}
            {activeTab === "elective" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-white rounded-3xl p-8 border shadow-xl shadow-amber-100/30 border-amber-50">
                   <div className="mb-6">
                     <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Open Elective Course</label>
                     <select
                       value={electiveCourseId}
                       onChange={e => {
                         setElectiveCourseId(e.target.value);
                         setElectiveDeptFilter("other"); // Default to excluding the offering branch
                         setSelectedStudents([]);
                       }}
                       className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-black text-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none"
                     >
                       <option value="">-- Choose an Elective --</option>
                       {electivePreview.courses.map(c => (
                         <option key={c.courseId} value={c.courseId}>{c.name} ({c.code}) - Offered by {c.department}</option>
                       ))}
                     </select>
                     {electivePreview.courses.length === 0 && !loading && <span className="text-xs text-amber-600 mt-2 font-bold inline-block">No active Open Electives found for this year/sem.</span>}
                   </div>

                   {electiveCourseId && (() => {
                     const selectedCourse = electivePreview.courses.find(c => String(c.courseId) === String(electiveCourseId));
                     const offeringDept = selectedCourse?.department || "N/A";
                     const uniqueDepts = Array.from(new Set(electivePreview.students.map(s => s.department).filter(Boolean)));
                     const filteredStudents = electivePreview.students.filter(s => {
                         if (electiveDeptFilter === "all") return true;
                         if (electiveDeptFilter === "other") return s.department !== offeringDept;
                         return s.department === electiveDeptFilter;
                     });

                     return (
                     <div>
                       <div className="flex flex-col gap-3 mb-4 mt-8 bg-amber-50/50 p-5 rounded-2xl border border-amber-100/50">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Filter Students by Branch</label>
                         <select
                           value={electiveDeptFilter}
                           onChange={e => setElectiveDeptFilter(e.target.value)}
                           className="w-full sm:w-auto px-4 py-3 rounded-xl border border-amber-200 bg-white text-slate-700 font-bold text-sm focus:ring-4 focus:ring-amber-500/10 outline-none"
                         >
                           <option value="all">All Departments</option>
                           <option value="other">Other than Offering Branch ({offeringDept})</option>
                           {uniqueDepts.map(d => (
                             <option key={d} value={d}>{d}</option>
                           ))}
                         </select>
                       </div>

                       <div className="flex items-center justify-between mb-4">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select Students to Enroll {(selectedStudents.length > 0) && `(${selectedStudents.length} selected)`}</label>
                         <button onClick={() => selectAllStudents(filteredStudents)} className="text-[10px] font-black uppercase tracking-wider text-amber-600 hover:text-amber-700 underline focus:outline-none">
                           {filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.id)) ? "Deselect All Filtered" : "Select All Filtered"}
                         </button>
                       </div>
                       
                       <div className="bg-slate-50 border border-slate-100 rounded-2xl max-h-72 overflow-y-auto p-4 space-y-2">
                         {filteredStudents.map(s => (
                           <label key={s.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:border-amber-200 transition">
                             <input 
                               type="checkbox" 
                               checked={selectedStudents.includes(s.id)}
                               onChange={() => toggleStudent(s.id)}
                               className="w-5 h-5 text-amber-500 bg-slate-50 border-slate-300 rounded focus:ring-amber-500"
                             />
                             <span className="font-bold text-slate-700 text-sm">{s.username}</span>
                             <span className="ml-auto text-[10px] font-black uppercase text-slate-400 tracking-wider">
                               {s.department} · {s.rollNumber}
                             </span>
                           </label>
                         ))}
                         {filteredStudents.length === 0 && (
                           <div className="text-center py-6 text-sm text-slate-400 italic">No students matched this filter.</div>
                         )}
                       </div>
                       
                       <div className="mt-8 flex justify-end">
                         <button
                           onClick={handleElectiveEnroll}
                           disabled={electiveEnrolling || selectedStudents.length === 0}
                           className="flex items-center gap-2 px-10 py-4 bg-amber-500 text-white rounded-2xl font-black text-base hover:bg-amber-600 transition shadow-lg shadow-amber-100 disabled:opacity-50 active:scale-95 shrink-0"
                         >
                           <AcademicCapIcon className="h-5 w-5" />
                           {electiveEnrolling ? "Assigning..." : "Assign Elective to Selected"}
                         </button>
                       </div>
                     </div>
                     );
                   })()}
                </div>
              </div>
            )}

          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
