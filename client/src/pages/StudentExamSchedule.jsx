import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const StudentExamSchedule = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  
  const [groupedSchedules, setGroupedSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const res = await authFetch("http://localhost:8081/api/student/exams/schedules");
        if (!res.ok) throw new Error("Failed to fetch exam schedules");
        
        const data = await res.json();
        const groups = {};
        data.forEach(s => {
          const title = s.examTitle || "General Exam";
          if (!groups[title]) groups[title] = [];
          groups[title].push(s);
        });
        
        setGroupedSchedules(groups);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [authFetch]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header title="Exam Schedule" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-2">My Exam Schedules</h1>
            <p className="text-slate-500 mb-8 text-sm">Upcoming examinations and timings for your current semester.</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-3 text-slate-500">
                <span className="inline-block w-5 h-5 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                Loading schedules...
              </div>
            ) : Object.keys(groupedSchedules).length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/50 text-center py-16">
                 <div className="text-4xl mb-4">🌴</div>
                 <h2 className="text-xl font-bold text-slate-700">No upcoming exams</h2>
                 <p className="text-slate-500 mt-2">There are no broadcasted exam schedules for your year and semester right now.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedSchedules).map(([examTitle, schedules]) => (
                  <div key={examTitle} className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                    <div className="px-8 py-5 bg-indigo-50/50 border-b border-indigo-100 flex items-center gap-3">
                      <h2 className="text-lg font-bold text-indigo-900">{examTitle}</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100">Course</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 w-48">Date</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 w-32">Start Time</th>
                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 w-32">End Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {schedules.map((s) => (
                            <tr key={s.courseId} className="hover:bg-slate-50/80 transition">
                              <td className="px-8 py-5">
                                <span className="font-bold text-slate-800 block">{s.courseName}</span>
                                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{s.courseCode}</span>
                              </td>
                              <td className="px-8 py-5">
                                <span className="inline-flex items-center gap-2 font-medium text-slate-600 bg-slate-100/50 px-3 py-1 rounded-lg">
                                  {s.examDate || "TBA"}
                                </span>
                              </td>
                              <td className="px-8 py-5 font-semibold text-slate-700">
                                {s.startTime ? s.startTime.substring(0, 5) : "TBA"}
                              </td>
                              <td className="px-8 py-5 font-semibold text-slate-700">
                                {s.endTime ? s.endTime.substring(0, 5) : "TBA"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default StudentExamSchedule;
