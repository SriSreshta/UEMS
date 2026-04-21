import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { AcademicCapIcon, TrophyIcon, StarIcon } from "@heroicons/react/24/solid";

const GoldMedalList = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [medalists, setMedalists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedalists = async () => {
      try {
        const res = await authFetch("https://uems-rz8o.onrender.com/api/admin/gold-medalists");
        if (!res.ok) throw new Error("Failed to fetch gold medalists");
        const data = await res.json();
        setMedalists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMedalists();
  }, [authFetch]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Gold Medal List"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-amber-500 to-yellow-600 rounded-3xl p-8 mb-10 text-white shadow-xl shadow-amber-200/50 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <TrophyIcon className="h-12 w-12 text-yellow-200" />
                  <h1 className="text-4xl font-black tracking-tight">Academic Excellence</h1>
                </div>
                <p className="text-amber-50 font-medium max-w-2xl leading-relaxed">
                  Celebrating our top achievers who have demonstrated exceptional consistency.
                  Criteria: Cumulative GPA &gt; 8.0 and no backlogs in any semester.
                </p>
              </div>
              <AcademicCapIcon className="h-64 w-64 absolute -bottom-10 -right-10 text-white/10 rotate-12" />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Calculating excellence...</p>
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl text-rose-700 font-bold">
                Error: {error}
              </div>
            ) : medalists.length === 0 ? (
              <div className="bg-white border border-slate-100 p-16 rounded-3xl text-center shadow-sm">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🏅</div>
                <h3 className="text-xl font-black text-slate-700 mb-2">No Gold Medalists Found</h3>
                <p className="text-slate-500 font-medium">No students currently meet the elite criteria for the Gold Medal List.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                          <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                          <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Department</th>
                          <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center">CGPA</th>
                          <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {medalists.map((m, idx) => (
                          <tr key={m.studentId} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-indigo-50 text-indigo-600">
                                {idx + 1}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col">
                                <span className="font-black text-slate-700 group-hover:text-amber-600 transition-colors">{m.username}</span>
                                <span className="text-xs text-slate-400 font-bold font-mono uppercase tracking-tighter">{m.rollNumber}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase">
                                {m.department}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                                <StarIcon className="h-4 w-4" />
                                <span className="font-black text-lg">{m.cgpa.toFixed(2)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded uppercase">
                                Gold Medalist
                              </span>
                            </td>
                          </tr>
                        ))}
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

export default GoldMedalList;
