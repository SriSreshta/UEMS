import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { ChevronDownIcon, ChevronUpIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

const StudentMarksPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, authFetch } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSemesters, setExpandedSemesters] = useState({});

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await authFetch("https://uems-rz8o.onrender.com/api/students/my-marks");
        if (!res.ok) throw new Error("Failed to fetch marks");
        const data = await res.json();
        setMarks(data);

        // Auto-expand the current semester (based on the student's year/semester)
        if (data.length > 0 && user) {
          const currentKey = `${user.year || "1"}-${user.semester || "1"}`;
          setExpandedSemesters({ [currentKey]: true });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchMarks();
    }
  }, [authFetch, user]);

  // Group marks by year-semester
  const groupedMarks = marks.reduce((groups, m) => {
    const key = `${m.year || "?"}-${m.semester || "?"}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
    return groups;
  }, {});

  // Sort semester keys chronologically
  const sortedKeys = Object.keys(groupedMarks).sort().reverse();

  const toggleSemester = (key) => {
    setExpandedSemesters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentKey = `${user?.year || "1"}-${user?.semester || "1"}`;

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Internal Marks"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="p-8 flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <AcademicCapIcon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">My Assessment Marks</h1>
                <p className="text-slate-500 font-medium">View your internal marks across all semesters.</p>
              </div>
            </div>

            {error && <div className="p-6 mb-8 text-rose-700 bg-rose-50 rounded-2xl border border-rose-100 font-bold">{error}</div>}

            {loading ? (
              <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : sortedKeys.length > 0 ? (
              <div className="space-y-6">
                {sortedKeys.map((key) => {
                  const [yr, sem] = key.split("-");
                  const isCurrent = key === currentKey;
                  const isExpanded = expandedSemesters[key] ?? isCurrent;
                  const semesterMarks = groupedMarks[key];

                  return (
                    <div key={key} className={`bg-white rounded-3xl border overflow-hidden shadow-xl transition-all duration-300 ${isCurrent ? "border-indigo-200 shadow-indigo-100/50" : "border-slate-100 shadow-slate-200/40"}`}>
                      {/* Semester Header — clickable */}
                      <button
                        onClick={() => toggleSemester(key)}
                        className="w-full flex items-center justify-between px-8 py-6 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white font-black ${isCurrent ? "bg-indigo-600" : "bg-slate-400"}`}>
                            {yr}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-slate-800">
                              Year {yr} — Semester {sem}
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {isCurrent ? "Current Semester" : "Past Semester"} · {semesterMarks.length} course(s)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isCurrent && (
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                              Current
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {/* Marks Table — collapsible */}
                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-white border-t border-slate-100">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Code</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Name</th>
                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mid 1 (30)</th>
                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mid 2 (30)</th>
                                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Assign (10)</th>
                                <th className="px-4 py-4 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center bg-emerald-50/50">Total Internal (40)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {semesterMarks.map((m) => {
                                const mid1 = m.mid1Marks !== null ? m.mid1Marks : 0;
                                const mid2 = m.mid2Marks !== null ? m.mid2Marks : 0;
                                const assign = m.assignmentMarks !== null ? m.assignmentMarks : 0;
                                const hasAnyInternal = m.mid1Marks !== null || m.mid2Marks !== null || m.assignmentMarks !== null;
                                const totalInternal = hasAnyInternal ? Math.ceil((mid1 + mid2) / 2) + assign : "—";

                                return (
                                  <tr key={m.courseId} className="hover:bg-indigo-50/30 transition">
                                    <td className="px-8 py-5">
                                      <span className="text-xs font-black text-indigo-500 uppercase tracking-tight">{m.courseCode}</span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-700">{m.courseName}</td>
                                    <td className="px-4 py-5 text-center font-bold text-slate-600">{m.mid1Marks !== null ? m.mid1Marks : "—"}</td>
                                    <td className="px-4 py-5 text-center font-bold text-slate-600">{m.mid2Marks !== null ? m.mid2Marks : "—"}</td>
                                    <td className="px-4 py-5 text-center font-bold text-slate-600">{m.assignmentMarks !== null ? m.assignmentMarks : "—"}</td>
                                    <td className="px-4 py-5 text-center bg-emerald-50/30">
                                      <span className={`inline-block px-3 py-1 rounded-lg font-black text-lg ${totalInternal === "—" ? "text-slate-400" : "text-emerald-700"}`}>
                                        {totalInternal}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-3xl border border-slate-100 text-center shadow-sm">
                <AcademicCapIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-medium text-lg">You have no graded assessments or enrollments yet.</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default StudentMarksPage;
