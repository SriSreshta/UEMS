import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";

// Modern SVGs for UI
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserGroupIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5V18a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M9 14a4 4 0 100-8 4 4 0 000 8zm8-4a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MarkAttendancePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Contains username, role, token, facultyId

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (!user?.facultyId) {
      showToast("Error: Missing Faculty ID. Please try logging in again.", "error");
      setLoading(false);
      return;
    }
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/students/course/${courseId}`);
      setStudents(res.data);

      // Initialize all students to PRESENT by default
      const initial = {};
      res.data.forEach((s) => (initial[s.id] = true));
      setAttendance(initial);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to load enrolled students.", "error");
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
      showToast("Faculty ID is missing from your session.", "error");
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
      showToast("Attendance saved successfully for " + attendanceList.length + " students!", "success");
      
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save attendance.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = totalStudents - presentCount;

  return (
    <div className="p-8 min-h-[calc(100vh-64px)] bg-slate-50">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-right-8 border ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
            : "bg-rose-50 border-rose-100 text-rose-800"
        }`}>
          {toast.type === "success" ? <CheckCircleIcon /> : <XCircleIcon />}
          <p className="font-bold text-sm tracking-tight">{toast.message}</p>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mark Attendance</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
              <UserGroupIcon />
              Course ID: <span className="text-indigo-600 font-bold">{courseId}</span>
            </p>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date</span>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="font-bold text-slate-700 outline-none bg-transparent cursor-pointer"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting || loading || students.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold tracking-tight shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Attendance"
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center">
             <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-500 font-medium">Fetching enrolled students...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Sidebar Stats */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Today's Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Total Enrolled</span>
                    <span className="text-lg font-black text-slate-800">{totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                    <span className="text-sm font-medium text-emerald-700">Present</span>
                    <span className="text-lg font-black text-emerald-700">{presentCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-50 px-4 py-3 rounded-xl border border-rose-100">
                    <span className="text-sm font-medium text-rose-700">Absent</span>
                    <span className="text-lg font-black text-rose-700">{absentCount}</span>
                  </div>
                </div>
              </div>

              {!user?.facultyId && (
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-800 text-sm font-medium">
                  ⚠️ Your faculty profile is not linked correctly. Saving will fail.
                </div>
              )}
            </div>

            {/* Main Table Area */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {students.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserGroupIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">No Students Found</h3>
                  <p className="text-slate-500">There are no students currently enrolled in this course.</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 w-16 text-center">#</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Roll Number</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200">Student Name</th>
                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 text-center w-40">Status Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((s, index) => {
                        const isPresent = attendance[s.id] || false;
                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => toggleAttendance(s.id)}
                            className={`transition-colors cursor-pointer ${
                              isPresent ? "hover:bg-emerald-50/30" : "bg-rose-50/50 hover:bg-rose-50"
                            }`}
                          >
                            <td className="px-6 py-4 text-center text-sm font-medium text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                {s.rollNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-sm text-slate-800">{s.username}</div>
                              {s.department && (
                                <div className="text-xs text-slate-500 font-medium">{s.department} • Year {s.year}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAttendance(s.id);
                                }}
                                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                  isPresent ? 'bg-emerald-500' : 'bg-rose-400'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                    isPresent ? 'translate-x-8' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <div className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                                isPresent ? "text-emerald-600" : "text-rose-500"
                              }`}>
                                {isPresent ? "Present" : "Absent"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendancePage;
