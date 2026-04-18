import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const AdminPublishResults = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await authFetch("http://localhost:8081/api/admin/exams");
        if (!res.ok) throw new Error("Failed to fetch exams");
        const data = await res.json();
        setExams(data);
        if (data.length > 0) setSelectedExamId(data[0].examId);
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [authFetch]);

  useEffect(() => {
    if (!selectedExamId) return;
    const fetchResultsPreview = async () => {
      try {
        const res = await authFetch(`http://localhost:8081/api/admin/exams/${selectedExamId}/results/preview`);
        if (!res.ok) throw new Error("Failed to fetch preview");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setMessage({ type: "error", text: "Could not fetch preview for selected exam" });
      }
    };
    fetchResultsPreview();
  }, [selectedExamId, authFetch]);

  const handleAbsentToggle = (studentIdx, courseIdx) => {
    const updated = [...students];
    const course = updated[studentIdx].courses[courseIdx];
    course.isAbsent = !course.isAbsent;
    
    // Recalculate directly on frontend wrapper to keep preview fast without hitting API
    if (course.isAbsent) {
      course.grade = "Ab";
      course.gradePoints = 0;
      course.internalMarks = 0;
      course.totalMarks = 0;
    } else {
      // Re-trigger backend fallback logic or just do local logic
      const m1 = course.mid1 || 0;
      const m2 = course.mid2 || 0;
      const assign = course.assignment || 0;
      const endSem = course.endSem || 0;

      const internal = Math.ceil((m1 + m2) / 2.0) + assign;
      course.internalMarks = internal;

      if (internal < 14 || endSem < 21) {
        course.totalMarks = internal + endSem;
        course.grade = "F";
        course.gradePoints = 0;
      } else {
        const total = internal + endSem;
        course.totalMarks = total;
        if (total >= 90) { course.grade = "O"; course.gradePoints = 10; }
        else if (total >= 80) { course.grade = "A+"; course.gradePoints = 9; }
        else if (total >= 70) { course.grade = "A"; course.gradePoints = 8; }
        else if (total >= 60) { course.grade = "B+"; course.gradePoints = 7; }
        else if (total >= 50) { course.grade = "B"; course.gradePoints = 6; }
        else if (total >= 40) { course.grade = "C"; course.gradePoints = 5; }
        else { course.grade = "F"; course.gradePoints = 0; }
      }
    }

    // Recompute SGPA for student
    let totalPoints = 0;
    let totalCredits = 0;
    updated[studentIdx].courses.forEach(c => {
      totalPoints += (c.gradePoints || 0) * (c.credits || 0);
      totalCredits += (c.credits || 0);
    });
    updated[studentIdx].sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

    setStudents(updated);
  };

  const handlePublish = async () => {
    if (!window.confirm("Are you sure you want to publish these results? Once published, they will be visible to students and grades will be finalized.")) return;
    setPublishing(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = { students };
      const res = await authFetch(`http://localhost:8081/api/admin/exams/${selectedExamId}/results/publish`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to publish results");
      setMessage({ type: "success", text: "Results published successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setPublishing(false);
    }
  };



  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Publish Results (R22)" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        
        <main className="p-6 flex-1 overflow-y-auto">
          {message.text && (
            <div className={`p-4 mb-6 rounded border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message.text}
            </div>
          )}


          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8 flex justify-between items-center">
            <div className="w-1/2">
              <h2 className="text-xl font-bold mb-4">Select Exam to Preview Results</h2>
              {loading ? (
                <p>Loading exams...</p>
              ) : (
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedExamId}
                  onChange={(e) => setSelectedExamId(e.target.value)}
                >
                  {exams.map(e => (
                    <option key={e.examId} value={e.examId}>{e.title}</option>
                  ))}
                </select>
              )}
            </div>
            {selectedExamId && students.length > 0 && (
              <div className="flex gap-4">
                <button 
                  onClick={handlePublish} 
                  disabled={publishing} 
                  className={`px-6 py-3 rounded text-white font-bold shadow-sm transition ${publishing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {publishing ? 'Publishing...' : 'Publish Final Results'}
                </button>
              </div>
            )}
          </div>

          {selectedExamId && students.length > 0 && (
            <div className="space-y-6">
              {students.map((student, sIdx) => (
                <div key={student.studentId} className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{student.studentName}</h3>
                      <p className="text-sm font-medium text-slate-600">{student.hallTicketNo}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm text-slate-500 font-semibold mb-1">SGPA</span>
                      <span className="text-2xl font-bold text-indigo-700 px-3 py-1 bg-indigo-100 rounded-md">
                        {student.sgpa}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2">Course</th>
                          <th className="px-4 py-2">Cr</th>
                          <th className="px-4 py-2">Int Setup (M1|M2|A)</th>
                          <th className="px-4 py-2">Int Marks</th>
                          <th className="px-4 py-2">Ext Marks</th>
                          <th className="px-4 py-2">Total</th>
                          <th className="px-4 py-2">Grade / Pts</th>
                          <th className="px-4 py-2 text-center">Absent?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {student.courses.map((c, cIdx) => (
                          <tr key={c.courseId} className={`hover:bg-slate-50 transition ${c.isAbsent ? 'bg-red-50/50' : ''}`}>
                            <td className="px-4 py-3 font-medium text-gray-800" title={c.courseName}>
                              {c.courseCode}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{c.credits}</td>
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                              {c.mid1 || '-'}|{c.mid2 || '-'}|{c.assignment || '-'}
                            </td>
                            <td className="px-4 py-3 font-semibold">{c.internalMarks}</td>
                            <td className="px-4 py-3 font-semibold">{c.endSem || '-'}</td>
                            <td className="px-4 py-3 font-bold">{c.totalMarks}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block w-8 text-center font-bold ${c.grade === 'F' || c.grade === 'Ab' ? 'text-red-600' : 'text-green-600'}`}>
                                {c.grade}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">({c.gradePoints}p)</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={c.isAbsent} onChange={() => handleAbsentToggle(sIdx, cIdx)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                              </label>
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
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminPublishResults;
