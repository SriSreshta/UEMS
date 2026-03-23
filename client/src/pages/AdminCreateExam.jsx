import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const AdminCreateExam = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    year: "1",
    semester: "1",
    examType: "REGULAR"
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await authFetch("http://localhost:8080/api/admin/exams");
      if (!res.ok) throw new Error("Failed to fetch exams");
      const data = await res.json();
      setExams(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [authFetch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getYearNumeral = (year) => {
    if (year === "1") return "I";
    if (year === "2") return "II";
    if (year === "3") return "III";
    if (year === "4") return "IV";
    return "";
  };

  const getSemNumeral = (sem) => {
    // 1-8 mapping to I or II typically, but let's just use I, II based on odd/even or exact number
    // Let's assume absolute sem numbers or relative? The prompt used "I Sem"
    // Usually a B.Tech year has Sem 1 and Sem 2. Let's assume the user selects absolute 1-8 or relative 1-2.
    // The previous pages used 1 or 2 for target semester. Let's map 1->I, 2->II.
    if (sem === "1") return "I";
    if (sem === "2") return "II";
    // For absolute sem 1-8
    const map = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
    const idx = parseInt(sem) - 1;
    return map[idx] || sem;
  };

  const generateTitle = () => {
    const y = getYearNumeral(formData.year);
    const s = getSemNumeral(formData.semester);
    const type = formData.examType === "REGULAR" ? "Regular" : "Supplementary";
    return `B.Tech ${y} Year ${s} Sem ${type} Exam`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = {
        title: generateTitle(),
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        examType: formData.examType
      };
      
      const res = await authFetch("http://localhost:8080/api/admin/exams", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to create exam");
      
      setMessage({ type: "success", text: `${payload.title} created!` });
      fetchExams();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (examId, title) => {
    if (!window.confirm(`Are you sure you want to delete ${title}? This will also delete all its schedules.`)) return;
    try {
      const res = await authFetch(`http://localhost:8080/api/admin/exams/${examId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      setMessage({ type: "success", text: `${title} deleted!` });
      fetchExams();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Create Exams" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        
        <main className="p-6 flex-1 overflow-y-auto">
          {message.text && (
            <div className={`p-4 mb-6 rounded border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Exam</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Year</label>
                  <select name="year" value={formData.year} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="1">I Year</option>
                    <option value="2">II Year</option>
                    <option value="3">III Year</option>
                    <option value="4">IV Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Semester</label>
                  <select name="semester" value={formData.semester} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="1">I Sem</option>
                    <option value="2">II Sem</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                  <select name="examType" value={formData.examType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="REGULAR">Regular</option>
                    <option value="SUPPLEMENTARY">Supplementary</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-gray-700">
                <strong>Auto-generated Title:</strong> {generateTitle()}
              </div>

              <button type="submit" disabled={submitting} className={`mt-4 px-6 py-2 rounded text-white font-medium shadow-sm transition ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {submitting ? 'Creating...' : 'Create Exam'}
              </button>
            </form>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-300">
              <h2 className="text-lg font-bold text-gray-800">Created Exams</h2>
            </div>
            {loading ? (
              <div className="p-6 text-gray-500 text-center">Loading...</div>
            ) : exams.length === 0 ? (
              <div className="p-6 text-gray-500 text-center">No exams created yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-sm text-gray-600 uppercase">
                    <tr>
                      <th className="px-6 py-3 border-b">ID</th>
                      <th className="px-6 py-3 border-b">Title</th>
                      <th className="px-6 py-3 border-b">Year</th>
                      <th className="px-6 py-3 border-b">Sem</th>
                      <th className="px-6 py-3 border-b">Type</th>
                      <th className="px-6 py-3 border-b">Created At</th>
                      <th className="px-6 py-3 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {exams.map(e => (
                      <tr key={e.examId} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">{e.examId}</td>
                        <td className="px-6 py-4 font-medium">{e.title}</td>
                        <td className="px-6 py-4">{e.year}</td>
                        <td className="px-6 py-4">{e.semester}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${e.examType === 'REGULAR' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {e.examType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(e.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(e.examId, e.title)}
                            className="text-red-500 hover:text-red-700 text-lg transition"
                            title="Delete Exam"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminCreateExam;
