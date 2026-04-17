import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axiosInstance";
import * as XLSX from "xlsx";
import { CloudArrowUpIcon, DocumentArrowDownIcon, ArrowLeftIcon, CheckBadgeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const UploadMarksPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [courseDetails, setCourseDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'current', 'past'

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/faculty/courses/${courseId}/marks`);
      setStudents(res.data);
      
      // Fetch course details to know its year/sem for current vs past logic
      const cRes = await api.get(`/faculty/courses`);
      let allCourses = cRes.data;
      if (!Array.isArray(allCourses) && allCourses.content) allCourses = allCourses.content;
      else if (!Array.isArray(allCourses) && allCourses.data) allCourses = allCourses.data;
      else if (!Array.isArray(allCourses)) allCourses = [];
      
      const cDetails = allCourses.find(c => String(c.courseId || c.course_id || c.id) === String(courseId));
      if (cDetails) setCourseDetails(cDetails);

    } catch (err) {
      setError(err.response?.data || err.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    if (value === "") {
      setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, [field]: null } : s));
      return;
    }
    const num = Number(value);
    let maxVal = 30;
    if (field === "assignmentMarks") maxVal = 10;
    if (field === "endSemMarks") maxVal = 60;
    
    if (num < 0 || num > maxVal) return;
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, [field]: num } : s));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
            throw new Error("Excel file is empty.");
        }

        const rawHeaders = Object.keys(data[0] || {});
        const headers = rawHeaders.reduce((acc, h) => {
            acc[h.trim().toLowerCase()] = h;
            return acc;
        }, {});

        const missingInternal = ['student id', 'student name', 'mid1', 'mid2', 'assignment'].filter(h => !headers[h]);
        const missingExternal = ['student id', 'student name', 'end sem'].filter(h => !headers[h]);

        const isInternal = ['mid1', 'mid2', 'assignment'].some(h => headers[h]);
        const isExternal = ['end sem'].some(h => headers[h]);

        if (isInternal && !isExternal && missingInternal.length > 0) {
            throw new Error(`Missing required columns for Internal Marks upload: ${missingInternal.join(', ')}`);
        } else if (isExternal && !isInternal && missingExternal.length > 0) {
            throw new Error(`Missing required columns for External Marks upload: ${missingExternal.join(', ')}`);
        } else if (!isInternal && !isExternal) {
            throw new Error("Excel must contain either Internal marks columns (Mid1, Mid2, Assignment) or External marks columns (End Sem).");
        }

        setStudents(prev => prev.map(student => {
          const row = data.find(r => {
             const val = r[headers['student id']];
             return val && (String(val) === String(student.rollNumber) || String(val) === String(student.studentId));
          });
          
          if (row) {
            const getVal = (col) => row[headers[col]] !== undefined ? Number(row[headers[col]]) : undefined;
            return {
              ...student,
              mid1Marks: getVal('mid1') !== undefined ? getVal('mid1') : student.mid1Marks,
              mid2Marks: getVal('mid2') !== undefined ? getVal('mid2') : student.mid2Marks,
              assignmentMarks: getVal('assignment') !== undefined ? getVal('assignment') : student.assignmentMarks,
              endSemMarks: getVal('end sem') !== undefined ? getVal('end sem') : student.endSemMarks
            };
          }
          return student;
        }));
        
        const typeStr = (isInternal && isExternal) ? "Internal & External" : (isInternal ? "Internal" : "External");
        setMessage(`Excel import successful! (${typeStr} marks mapped) Review the table below.`);
        setError("");
      } catch (err) {
        setError(err.message || "Error parsing Excel format.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const handleSave = async () => {
    try {
      const payload = students.map(s => ({
        studentId: s.studentId,
        mid1Marks: s.mid1Marks,
        mid2Marks: s.mid2Marks,
        assignmentMarks: s.assignmentMarks,
        endSemMarks: s.endSemMarks
      }));
      await api.post(`/faculty/courses/${courseId}/marks/bulk`, payload);
      setMessage("All marks committed successfully to the ledger!");
      setError("");
      setTimeout(() => navigate("/faculty"), 2500);
    } catch (err) {
      setError(err.response?.data || err.message || "Failed to save marks");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="faculty" />
      <div className="flex-1 flex flex-col">
        <Header title="Internal Assessment" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
                <div>
                  <button onClick={() => navigate("/faculty")} className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-4 hover:translate-x-[-4px] transition-transform">
                    <ArrowLeftIcon className="h-4 w-4" /> Faculty Dashboard
                  </button>
                  <h1 className="text-4xl font-black text-slate-800 tracking-tight">Post Academic Marks</h1>
                  <p className="text-slate-500 font-bold text-sm mt-2 flex items-center gap-2">
                    <CheckBadgeIcon className="h-5 w-5 text-emerald-500" /> Secure ledger entry for Course ID {courseId}
                  </p>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={loading || students.length === 0} 
                  className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50"
                >
                  Sync & Commit All
                </button>
            </div>

            {error && <div className="p-6 mb-8 text-rose-700 bg-rose-50 rounded-2xl border border-rose-100 font-bold animate-in slide-in-from-top-4">{error}</div>}
            {message && <div className="p-6 mb-8 text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-100 font-bold animate-in slide-in-from-top-4">{message}</div>}

            {!loading && students.length > 0 && (
              <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-white mb-10 flex flex-col lg:flex-row justify-between items-center gap-10">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-3">
                    <CloudArrowUpIcon className="h-7 w-7 text-indigo-500" />
                    Mass Ledger Upload
                  </h3>
                  <p className="text-slate-500 text-sm italic mb-6">Import student performance data from a standard office workbook (.xlsx).</p>
                  <div className="flex flex-col gap-2 mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase">External Upload Format (Exact headers):</p>
                    <div className="flex flex-wrap gap-2">
                      {["Student ID", "Student Name", "End Sem"].map(tag => (
                        <span key={tag} className="bg-indigo-50 px-2 py-1 rounded text-[10px] font-black text-indigo-500 uppercase tracking-wide border border-indigo-100">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mt-2">Internal Upload Format (Exact headers):</p>
                    <div className="flex flex-wrap gap-2">
                      {["Student ID", "Student Name", "Mid1", "Mid2", "Assignment"].map(tag => (
                        <span key={tag} className="bg-emerald-50 px-2 py-1 rounded text-[10px] font-black text-emerald-600 uppercase tracking-wide border border-emerald-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="block w-full text-xs text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                </div>
                <div className="hidden lg:block w-px h-20 bg-slate-100"></div>
                <div className="text-center lg:text-right">
                    <div className="text-5xl font-black text-slate-100 mb-2">.XLSX</div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Workbook Support</div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="h-96 flex items-center justify-center bg-white rounded-3xl border border-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center justify-between bg-slate-50/50 gap-4">
                  {/* Left stats */}
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Ledger</div>
                    <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">{students.length} STUDENT RECORDS</div>
                  </div>

                  {/* Filters Section */}
                  <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        placeholder="Search student..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto flex-shrink-0">
                      {['all', 'current', 'past'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`flex-1 md:w-20 py-1.5 px-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                            filterType === type 
                              ? "bg-white text-indigo-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100/50">
                        <th rowSpan={2} className="px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 align-middle">Student details</th>
                        <th colSpan={3} className="px-8 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-r border-slate-200 bg-emerald-50/30">Internal Marks</th>
                        <th colSpan={1} className="px-8 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-b border-slate-200 bg-indigo-50/30">External Marks</th>
                      </tr>
                      <tr className="bg-slate-50/50">
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mid1 (30)</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mid2 (30)</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100">Assignment (10)</th>
                        <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">End Sem (60)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.filter(student => {
                        const matchesSearch = student.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
                        if (!matchesSearch) return false;

                        const isCurrent = courseDetails ? (String(student.year) === String(courseDetails.year) && String(student.semester) === String(courseDetails.semester)) : true;
                        
                        if (filterType === 'current') return isCurrent;
                        if (filterType === 'past') return !isCurrent;
                        return true;
                      }).map((student) => {
                        const isCurrent = courseDetails ? (String(student.year) === String(courseDetails.year) && String(student.semester) === String(courseDetails.semester)) : false;
                        return (
                        <tr key={student.studentId} className="hover:bg-indigo-50/30 transition duration-300 group">
                          <td className="px-8 py-6 border-r border-slate-50">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="font-bold text-slate-800">{student.studentName}</div>
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mt-1">{student.rollNumber}</div>
                              </div>
                              {courseDetails && (
                                isCurrent ? (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-indigo-600 bg-indigo-100 border border-indigo-200 shrink-0 mt-1 tracking-widest">
                                    Current
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-slate-500 bg-slate-100 border border-slate-200 shrink-0 mt-1 tracking-widest">
                                    Past
                                  </span>
                                )
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-6">
                            <input type="number" min="0" max="30" placeholder="-" value={student.mid1Marks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "mid1Marks", e.target.value)} className="w-16 mx-auto block bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-center font-black text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                          </td>
                          <td className="px-4 py-6">
                            <input type="number" min="0" max="30" placeholder="-" value={student.mid2Marks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "mid2Marks", e.target.value)} className="w-16 mx-auto block bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-center font-black text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                          </td>
                          <td className="px-4 py-6 border-r border-slate-50">
                            <input type="number" min="0" max="10" placeholder="-" value={student.assignmentMarks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "assignmentMarks", e.target.value)} className="w-16 mx-auto block bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-center font-black text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                          </td>
                          <td className="px-4 py-6">
                            <input type="number" min="0" max="60" placeholder="-" value={student.endSemMarks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "endSemMarks", e.target.value)} className="w-20 mx-auto block bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-center font-black text-indigo-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                          </td>
                        </tr>
                      )})}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan="4" className="px-8 py-20 text-center text-slate-300 font-bold italic">No active enrollments for this session context.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default UploadMarksPage;
