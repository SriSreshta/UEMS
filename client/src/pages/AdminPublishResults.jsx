import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const PAGE_SIZE = 20;

const AdminPublishResults = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);

  // Supplementary states
  const [isSupplementary, setIsSupplementary] = useState(false);
  const [suppAttempts, setSuppAttempts] = useState([]);
  const [showSuppModal, setShowSuppModal] = useState(false);
  const [suppForm, setSuppForm] = useState({ id: null, studentSearch: "", selectedCourseId: "", marksObtained: "", enrollmentId: "" });
  const [suppLoading, setSuppLoading] = useState(false);
  const [backlogCourses, setBacklogCourses] = useState([]);
  const [backlogsLoading, setBacklogsLoading] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await authFetch("http://localhost:8081/api/admin/exams");
        if (!res.ok) throw new Error("Failed to fetch exams");
        const data = await res.json();
        setExams(data);
      } catch (err) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [authFetch]);

  useEffect(() => {
    if (!selectedExamId) {
      setStudents([]);
      return;
    }
    const fetchResultsPreview = async () => {
      setPreviewLoading(true);
      setStudents([]);
      setCurrentPage(1);
      try {
        const res = await authFetch(
          `http://localhost:8081/api/admin/exams/${selectedExamId}/results/preview`
        );
        if (!res.ok) throw new Error("Failed to fetch preview");
        const data = await res.json();
        const selectedExam = exams.find(e => String(e.examId) === String(selectedExamId));
        const isSupp = selectedExam?.examType?.toUpperCase() === "SUPPLEMENTARY";
        setIsSupplementary(isSupp);
        
        setStudents(data);

        if (isSupp) {
          const suppRes = await authFetch(`http://localhost:8081/api/admin/supplementary?year=${selectedExam.year}&semester=${selectedExam.semester}`);
          if (suppRes.ok) {
            setSuppAttempts(await suppRes.json());
          }
        }
      } catch (err) {
        setMessage({
          type: "error",
          text: "Could not fetch preview for selected exam",
        });
      } finally {
        setPreviewLoading(false);
      }
    };
    fetchResultsPreview();
  }, [selectedExamId, authFetch, exams]);

  useEffect(() => {
    if (isSupplementary && selectedExamId && suppForm.studentSearch) {
      setBacklogsLoading(true);
      setBacklogCourses([]);
      
      const url = `http://localhost:8081/api/admin/supplementary/backlogs?studentId=${suppForm.studentSearch}`;
      console.log("Fetching backlogs URL:", url);
      
      authFetch(url)
        .then(res => res.json())
        .then(data => {
          console.log("Backlog data received:", data);
          setBacklogCourses(data);
        })
        .catch(err => {
          console.error("Error fetching backlogs", err);
        })
        .finally(() => {
          setBacklogsLoading(false);
        });
    } else {
      setBacklogCourses([]);
    }
  }, [isSupplementary, selectedExamId, suppForm.studentSearch, authFetch]);

  const loadSuppAttempts = async () => {
    const selectedExam = exams.find(e => String(e.examId) === String(selectedExamId));
    if (!selectedExam) return;
    try {
      const res = await authFetch(`http://localhost:8081/api/admin/supplementary?year=${selectedExam.year}&semester=${selectedExam.semester}`);
      if (res.ok) setSuppAttempts(await res.json());
    } catch {}
  };

  const handleSuppSubmit = async (e) => {
    e.preventDefault();
    if (!suppForm.enrollmentId || !suppForm.marksObtained) {
      showToast("Please fill all required fields", "error"); return;
    }
    setSuppLoading(true);
    try {
      const payload = {
        enrollmentId: suppForm.enrollmentId,
        marksObtained: parseInt(suppForm.marksObtained)
      };
      const res = await authFetch("http://localhost:8081/api/admin/supplementary", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save attempt");
      setShowSuppModal(false);
      loadSuppAttempts();
      setMessage({ type: "success", text: "Supplementary result saved!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSuppLoading(false);
    }
  };

  const handleDeleteSupp = async (id) => {
    if (!window.confirm("Delete this supplementary result?")) return;
    try {
      const res = await authFetch(`http://localhost:8081/api/admin/supplementary/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      loadSuppAttempts();
    } catch (err) {
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

  const showToast = (txt, type="error") => setMessage({ type, text: txt });

  const handlePublish = async () => {
    if (
      !window.confirm(
        "Are you sure you want to publish these results? Once published, they will be visible to students and grades will be finalized."
      )
    )
      return;
    setPublishing(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = { students };
      const res = await authFetch(
        `http://localhost:8081/api/admin/exams/${selectedExamId}/results/publish`,
        { method: "POST", body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error("Failed to publish results");
      setMessage({ type: "success", text: "Results published successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (
      !window.confirm(
        "Are you sure you want to unpublish these results? This will hide them from students so corrections can be made."
      )
    )
      return;
    setPublishing(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await authFetch(
        `http://localhost:8081/api/admin/exams/${selectedExamId}/results/unpublish`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to unpublish results");
      setMessage({
        type: "success",
        text: "Results unpublished successfully! You can now fix marks and republish.",
      });
      // Re-fetch the preview so the admin sees current state for republishing
      const currentExamId = selectedExamId;
      setSelectedExamId("");
      setTimeout(() => setSelectedExamId(currentExamId), 100);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setPublishing(false);
    }
  };

  const totalPages = Math.ceil(students.length / PAGE_SIZE);
  const paginatedStudents = students.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Publish Results (R22)"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />

        <main className="p-6 flex-1 overflow-y-auto w-full">
          <div className="max-w-6xl w-full mx-auto">
            {message.text && (
            <div
              className={`p-4 mb-6 rounded border ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8 flex justify-between items-center">
            <div className="w-1/2">
              <h2 className="text-xl font-bold mb-4">
                Select Exam to Preview Results
              </h2>
              {loading ? (
                <p>Loading exams...</p>
              ) : (
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedExamId}
                  onChange={(e) => {
                    setSelectedExamId(e.target.value);
                    setMessage({ type: "", text: "" });
                  }}
                >
                  <option value="">— Select an Exam —</option>
                  {exams.map((e) => (
                    <option key={e.examId} value={e.examId}>
                      {e.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedExamId && students.length > 0 && (
              <div className="flex gap-4 items-center">
                <button
                  onClick={handleUnpublish}
                  disabled={publishing}
                  className={`px-4 py-3 rounded text-red-600 font-bold border border-red-200 hover:bg-red-50 transition ${
                    publishing ? "opacity-50" : ""
                  }`}
                >
                  Unpublish
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className={`px-6 py-3 rounded text-white font-bold shadow-sm transition ${
                    publishing
                      ? "bg-indigo-400"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {publishing ? "Publishing..." : "Publish Final Results"}
                </button>
              </div>
            )}
          </div>

          {/* Empty state — no exam selected */}
          {!selectedExamId && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6M9 16h4"
                />
              </svg>
              <p className="text-lg font-medium text-gray-500">
                No exam selected
              </p>
              <p className="text-sm mt-1">
                Select an exam above to preview and publish results.
              </p>
            </div>
          )}

          {/* Preview loading spinner */}
          {previewLoading && (
            <div className="flex items-center justify-center py-24 text-gray-400">
              <svg
                className="animate-spin w-8 h-8 mr-3 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span className="text-base font-medium">Loading preview...</span>
            </div>
          )}

          {/* Student results — paginated */}
          {!previewLoading && selectedExamId && students.length > 0 && (
            <>
              <div className="space-y-6">
                {paginatedStudents.map((student, sIdxOnPage) => {
                  return (
                    <div
                      key={student.studentId}
                      className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden animate-in fade-in duration-500"
                    >
                      <div className="bg-slate-100 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {student.studentName}
                          </h3>
                          <p className="text-sm font-medium text-slate-600">
                            {student.hallTicketNo}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="block text-sm text-slate-500 font-semibold mb-1">
                            SGPA (Session)
                          </span>
                          <span className="text-2xl font-bold text-indigo-700 px-3 py-1 bg-indigo-100 rounded-md">
                            {student.sgpa || "0.00"}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead className="bg-gray-50 text-gray-600 uppercase border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2">Course</th>
                              <th className="px-4 py-2">Cr</th>
                              <th className="px-4 py-2">Internal (M1|M2|A)</th>
                              <th className="px-4 py-2">Internal</th>
                              <th className="px-4 py-2">End Sem</th>
                              <th className="px-4 py-2">Total</th>
                              <th className="px-4 py-2">Grade / Pts</th>
                              <th className="px-4 py-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {student.courses.map((c, cIdx) => (
                              <tr
                                key={c.courseId}
                                className={`hover:bg-slate-50 transition ${
                                  c.isAbsent ? "bg-red-50/50" : ""
                                }`}
                              >
                                <td className="px-4 py-3 font-medium text-gray-800">
                                  {c.courseCode} - {c.courseName}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                  {c.credits}
                                </td>
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                  {c.mid1 ?? "-"}|{c.mid2 ?? "-"}|{c.assignment ?? "-"}
                                </td>
                                <td className="px-4 py-3 font-semibold">
                                  {c.internalMarks}
                                </td>
                                <td className="px-4 py-3 font-semibold">
                                  {c.endSem ?? "-"}
                                </td>
                                <td className="px-4 py-3 font-bold">
                                  {c.totalMarks}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`inline-block w-8 text-center font-bold ${c.grade === "F" || c.grade === "Ab" ? "text-red-600" : "text-green-600"}`}>
                                    {c.grade}
                                  </span>
                                  <span className="text-xs text-gray-400 ml-1">
                                    ({c.gradePoints}p)
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {c.isAbsent ? (
                                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">ABSENT</span>
                                  ) : (
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${c.grade === "F" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                                      {c.grade === "F" ? "FAIL" : "PASSED"}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(() => {
                let pages = [];
                if (totalPages <= 7) {
                  pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else {
                  if (currentPage <= 4) {
                    pages = [1, 2, 3, 4, 5, '...', totalPages];
                  } else if (currentPage >= totalPages - 3) {
                    pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                  }
                }

                return (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      ← Prev
                    </button>
                    
                    {pages.map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-3 py-1.5 text-sm text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`px-3 py-1.5 text-sm rounded border transition ${
                            page === currentPage
                              ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                              : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next →
                    </button>
                  </div>
                );
              })()}
            </>
          )}
          </div>
        </main>
        {showSuppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-6">Add/Edit Supplementary Result</h2>
              <form onSubmit={handleSuppSubmit} className="space-y-4">
                
                {/* Search for Student by roll number / name inside `students` */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Student</label>
                  <select 
                    className="w-full p-2 border rounded focus:ring-2 outline-none"
                    value={suppForm.studentSearch}
                    onChange={e => setSuppForm({...suppForm, studentSearch: e.target.value, selectedCourseId: "", enrollmentId: ""})}
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.studentId} value={s.studentId}>{s.studentName} ({s.hallTicketNo})</option>
                    ))}
                  </select>
                </div>

                {suppForm.studentSearch && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Course Backlog</label>
                    <select 
                      className="w-full p-2 border rounded focus:ring-2 outline-none"
                      value={suppForm.enrollmentId}
                      onChange={e => setSuppForm({...suppForm, enrollmentId: e.target.value})}
                      required
                    >
                      <option value="">-- Choose Course --</option>
                      {backlogsLoading ? (
                        <option value="" disabled>Loading courses...</option>
                      ) : backlogCourses.length === 0 ? (
                        <option value="" disabled>No backlog courses found</option>
                      ) : (
                        backlogCourses.map(c => (
                          <option key={c.enrollmentId} value={c.enrollmentId}>{c.courseCode} - {c.courseName}</option>
                        ))
                      )}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Marks Obtained (External/End Sem)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded outline-none" 
                      value={suppForm.marksObtained}
                      onChange={e => setSuppForm({...suppForm, marksObtained: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                  <button type="button" onClick={() => setShowSuppModal(false)} className="px-4 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                  <button type="submit" disabled={suppLoading} className="px-4 py-2 font-bold text-white bg-indigo-600 rounded hover:bg-indigo-700">
                    {suppLoading ? "Saving..." : "Save Result"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPublishResults;