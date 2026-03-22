import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import { CheckCircleIcon, XCircleIcon, UserGroupIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const MarkAttendancePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (!user?.facultyId) {
      showToast("Error: Missing Faculty ID.", "error");
      setLoading(false);
      return;
    }
    loadStudents();
  }, [courseId, user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/students/course/${courseId}`);
      setStudents(res.data);
      const initial = {};
      res.data.forEach((s) => (initial[s.id] = true));
      setAttendance(initial);
    } catch (err) {
      console.error(err);
      showToast("Failed to load enrolled students.", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleSubmit = async () => {
    if (!user?.facultyId) {
      showToast("Faculty ID is missing.", "error");
      return;
    }
    try {
      setSubmitting(true);
      const attendanceList = Object.keys(attendance).map(studentId => ({
        studentId: parseInt(studentId),
        present: attendance[studentId]
      }));
      const payload = {
        courseId: parseInt(courseId),
        facultyId: parseInt(user.facultyId),
        date: date,
        attendanceList: attendanceList
      };
      await axiosInstance.post("/attendance/mark/bulk", payload);
      showToast("Attendance saved successfully!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to save attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = totalStudents - presentCount;

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="faculty" />
      <div className="flex-1 flex flex-col">
        <Header title="Daily Attendance" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="p-8 flex-1">
          {toast.show && (
            <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-8 ${
              toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
            }`}>
              <CheckCircleIcon className="h-6 w-6" />
              <p className="font-bold text-sm">{toast.message}</p>
            </div>
          )}

          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-4 hover:translate-x-[-4px] transition-transform">
                  <ArrowLeftIcon className="h-4 w-4" /> Back to List
                </button>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Post Daily Logs</h1>
                <p className="text-slate-500 font-bold text-sm flex items-center gap-2 mt-2">
                  <UserGroupIcon className="h-5 w-5" /> Course Context: <span className="text-indigo-600">ID {courseId}</span>
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</span>
                  <input type="date" value={date} max={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} className="font-black text-slate-700 bg-transparent outline-none cursor-pointer" />
                </div>
                
                <button onClick={handleSubmit} disabled={submitting || loading || students.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95">
                  {submitting ? "Saving..." : "Commit Attendance"}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-96 bg-white rounded-3xl border border-slate-100 flex items-center justify-center animate-pulse shadow-sm">
                 <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/40">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Attendance Flux</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-5 py-4 bg-slate-50 rounded-2xl border border-slate-50 italic">
                        <span className="text-slate-500 font-bold">Total Enrolled</span>
                        <span className="text-xl font-black">{totalStudents}</span>
                      </div>
                      <div className="flex justify-between items-center px-5 py-4 bg-emerald-50 rounded-2xl border border-emerald-50 text-emerald-700">
                        <span className="font-bold uppercase text-[10px] tracking-widest">Present</span>
                        <span className="text-xl font-black">{presentCount}</span>
                      </div>
                      <div className="flex justify-between items-center px-5 py-4 bg-rose-50 rounded-2xl border border-rose-50 text-rose-700">
                        <span className="font-bold uppercase text-[10px] tracking-widest">Absent</span>
                        <span className="text-xl font-black">{absentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                  <div className="overflow-x-auto max-h-[700px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest w-20 text-center italic">#</th>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Identity Identifier</th>
                          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest italic text-center w-48">Binary Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {students.map((s, idx) => {
                          const isPresent = attendance[s.id] || false;
                          return (
                            <tr key={s.id} onClick={() => toggleAttendance(s.id)} className={`cursor-pointer transition duration-300 ${isPresent ? "hover:bg-slate-50" : "bg-rose-50/20 hover:bg-rose-50/40"}`}>
                              <td className="px-8 py-6 text-center text-sm font-black text-slate-300 italic">{idx + 1}</td>
                              <td className="px-8 py-6">
                                <div className="text-lg font-bold text-slate-800 leading-tight">{s.username}</div>
                                <div className="text-xs font-black text-indigo-400 uppercase tracking-tighter mt-1">{s.rollNumber}</div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${isPresent ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${isPresent ? 'left-7' : 'left-1'}`}></div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isPresent ? "text-emerald-500" : "text-rose-500"}`}>
                                        {isPresent ? "Present" : "Absent"}
                                    </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

export default MarkAttendancePage;
