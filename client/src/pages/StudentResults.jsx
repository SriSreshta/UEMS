import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

export default function StudentResults() {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await authFetch("http://localhost:8080/api/students/results");
        if (res.ok) {
          const data = await res.json();
          setResultsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [authFetch]);

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header title="My Results" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8 text-white">
          <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
            <span className="text-blue-400">🎓</span> My Results
          </h1>
          
          {loading ? (
            <div className="text-center text-slate-400 mt-10">Loading results...</div>
          ) : !resultsData || !resultsData.semesters || resultsData.semesters.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              No results available yet.
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto space-y-8">
              {/* CGPA Display */}
              <div className="bg-slate-800/80 rounded-2xl p-6 border border-white/10 shadow-xl flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-300">Cumulative Grade Point Average</h2>
                  <p className="text-sm text-slate-500">Dynamically calculated from all published semesters</p>
                </div>
                <div className="text-4xl font-black text-blue-400 drop-shadow-md">
                  {resultsData.cgpa?.toFixed(2) || "0.00"}
                </div>
              </div>

              {/* Semester Groups */}
              {resultsData.semesters.map((sem, idx) => (
                <div key={idx} className="bg-slate-800 rounded-xl overflow-hidden border border-white/5 shadow-lg">
                  <div className="bg-slate-700/50 px-6 py-4 flex items-center justify-between border-b border-white/5">
                     <h3 className="text-lg font-bold text-white">
                       {sem.year} Year {sem.semester} Sem
                     </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-200">
                      <thead className="bg-slate-800 text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3">Course Code</th>
                          <th className="px-6 py-3">Course Name</th>
                          <th className="px-6 py-3 text-center">Credits</th>
                          <th className="px-6 py-3 text-center">Grade</th>
                          <th className="px-6 py-3 text-center">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sem.courses?.map((c, cIdx) => (
                          <tr key={cIdx} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-blue-300">{c.courseCode}</td>
                            <td className="px-6 py-4">{c.courseName}</td>
                            <td className="px-6 py-4 text-center">{c.credits}</td>
                            <td className="px-6 py-4 text-center font-bold text-emerald-400">{c.grade}</td>
                            <td className="px-6 py-4 text-center font-bold text-white">{c.gradePoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-slate-700/30 px-6 py-4 flex justify-end items-center border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-medium uppercase text-sm tracking-wider">SGPA</span>
                      <span className="text-xl font-black text-emerald-300">{sem.sgpa?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}
