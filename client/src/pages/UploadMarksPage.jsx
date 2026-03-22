import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import * as XLSX from "xlsx";
import { CloudArrowUpIcon, DocumentArrowDownIcon, ArrowLeftIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

const UploadMarksPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      const res = await authFetch(`http://localhost:8080/faculty/courses/${courseId}/marks`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      setError(err.message);
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
    const maxVal = field === "assignmentMarks" ? 10 : 30;
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

        setStudents(prev => prev.map(student => {
          const row = data.find(r => String(r["Roll Number"]) === String(student.rollNumber));
          if (row) {
            return {
              ...student,
              mid1Marks: row["Mid 1"] !== undefined ? Number(row["Mid 1"]) : student.mid1Marks,
              mid2Marks: row["Mid 2"] !== undefined ? Number(row["Mid 2"]) : student.mid2Marks,
              assignmentMarks: row["Assignment"] !== undefined ? Number(row["Assignment"]) : student.assignmentMarks
            };
          }
          return student;
        }));
        setMessage("Excel import successful! Review the table below.");
        setError("");
      } catch (err) {
        setError("Error parsing Excel. Columns must be: Roll Number, Mid 1, Mid 2, Assignment");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSave = async () => {
    try {
      const payload = students.map(s => ({
        studentId: s.studentId,
        mid1Marks: s.mid1Marks,
        mid2Marks: s.mid2Marks,
        assignmentMarks: s.assignmentMarks
      }));
      const res = await authFetch(`http://localhost:8080/faculty/courses/${courseId}/marks/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save marks");
      setMessage("All marks committed successfully to the ledger!");
      setError("");
      setTimeout(() => navigate("/faculty"), 2500);
    } catch (err) {
      setError(err.message);
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {["Roll Number", "Mid 1", "Mid 2", "Assignment"].map(tag => (
                      <span key={tag} className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{tag}</span>
                    ))}
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
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Performance Ledger</div>
                    <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">{students.length} STUDENT RECORDS</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mid Session 1 (30)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mid Session 2 (30)</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Portfolio (10)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map((student) => (
                        <tr key={student.studentId} className="hover:bg-indigo-50/30 transition duration-300 group">
                          <td className="px-8 py-6">
                            <div className="font-bold text-slate-800">{student.studentName}</div>
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mt-1">{student.rollNumber}</div>
                          </td>
                          <td className="px-8 py-6">
                            <input type="number" min="0" max="30" placeholder="-" value={student.mid1Marks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "mid1Marks", e.target.value)} className="w-24 mx-auto block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                          </td>
                          <td className="px-8 py-6">
                            <input type="number" min="0" max="30" placeholder="-" value={student.mid2Marks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "mid2Marks", e.target.value)} className="w-24 mx-auto block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                          </td>
                          <td className="px-8 py-6">
                            <input type="number" min="0" max="10" placeholder="-" value={student.assignmentMarks ?? ""} onChange={(e) => handleMarkChange(student.studentId, "assignmentMarks", e.target.value)} className="w-24 mx-auto block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center font-black text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all" />
                          </td>
                        </tr>
                      ))}
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
