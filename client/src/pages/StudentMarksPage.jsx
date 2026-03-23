import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const StudentMarksPage = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, authFetch } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await authFetch("http://localhost:8080/api/students/my-marks");
        if (!res.ok) throw new Error("Failed to fetch marks");
        const data = await res.json();
        setMarks(data);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Internal Marks"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="p-6 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6">
            My Assessment Marks
          </h1>
          
          {error && <p className="text-red-500 mb-4">{error}</p>}
          
          {loading ? (
            <p className="text-gray-500 flex items-center">
               <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></span> Loading your marks...
            </p>
          ) : marks.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <table className="min-w-full text-left border-collapse">
                <thead className="bg-gray-100 border-b border-gray-300 uppercase text-xs font-semibold text-gray-700 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Course Code</th>
                    <th className="px-6 py-4">Course Name</th>
                    <th className="px-6 py-4">Mid 1 (30)</th>
                    <th className="px-6 py-4">Mid 2 (30)</th>
                    <th className="px-6 py-4">Assignment (10)</th>
                    <th className="px-6 py-4 bg-gray-200">Total Internal (40)</th>
                    <th className="px-6 py-4 bg-gray-300">End Sem (60)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {marks.map((m) => {
                    const mid1 = m.mid1Marks !== null ? m.mid1Marks : 0;
                    const mid2 = m.mid2Marks !== null ? m.mid2Marks : 0;
                    const assign = m.assignmentMarks !== null ? m.assignmentMarks : 0;
                    // Formula: Math.ceil((Mid1 + Mid2) / 2) + Assignment
                    const hasAnyInternal = m.mid1Marks !== null || m.mid2Marks !== null || m.assignmentMarks !== null;
                    const totalInternal = hasAnyInternal ? Math.ceil((mid1 + mid2) / 2) + assign : "-";

                    return (
                      <tr key={m.courseId} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-700">{m.courseCode}</td>
                        <td className="px-6 py-4 text-gray-800">{m.courseName}</td>
                        <td className="px-6 py-4 font-semibold text-center sm:text-left">{m.mid1Marks !== null ? m.mid1Marks : "-"}</td>
                        <td className="px-6 py-4 font-semibold text-center sm:text-left">{m.mid2Marks !== null ? m.mid2Marks : "-"}</td>
                        <td className="px-6 py-4 font-semibold text-center sm:text-left">{m.assignmentMarks !== null ? m.assignmentMarks : "-"}</td>
                        <td className="px-6 py-4 font-bold text-center sm:text-left bg-gray-50">{totalInternal}</td>
                        <td className="px-6 py-4 font-bold text-center sm:text-left bg-gray-100">{m.endSemMarks !== null && m.endSemMarks !== undefined ? m.endSemMarks : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 rounded shadow border border-gray-200 text-gray-500">
              <p>You have no graded assessments or enrollments yet.</p>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default StudentMarksPage;
