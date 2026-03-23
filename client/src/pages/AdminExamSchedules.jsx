import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const AdminExamSchedules = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await authFetch("http://localhost:8080/api/admin/exams");
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
    const fetchSchedules = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/api/admin/exams/${selectedExamId}/schedules`);
        if (!res.ok) throw new Error("Failed to fetch schedules");
        const data = await res.json();
        setSchedules(data);
      } catch (err) {
        setMessage({ type: "error", text: "Could not fetch schedules for selected exam" });
      }
    };
    fetchSchedules();
  }, [selectedExamId, authFetch]);

  const handleScheduleChange = (index, field, value) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const payload = { schedules };
      const res = await authFetch(`http://localhost:8080/api/admin/exams/${selectedExamId}/schedules`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to save schedules");
      setMessage({ type: "success", text: "Schedules saved successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcast = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await authFetch(`http://localhost:8080/api/admin/exams/${selectedExamId}/broadcast`, {
        method: "PUT"
      });
      if (!res.ok) throw new Error("Failed to broadcast schedules");
      setMessage({ type: "success", text: "Schedule broadcasted successfully!" });
      
      // refresh schedules to see isBroadcasted changes
      const refresh = await authFetch(`http://localhost:8080/api/admin/exams/${selectedExamId}/schedules`);
      const data = await refresh.json();
      setSchedules(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (idx, scheduleId, courseName) => {
    if (!window.confirm(`Are you sure you want to remove ${courseName} from the schedule?`)) return;
    
    if (scheduleId) {
      try {
        const res = await authFetch(`http://localhost:8080/api/admin/exams/${selectedExamId}/schedules/${scheduleId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete schedule item from database");
      } catch (err) {
        setMessage({ type: "error", text: err.message });
        return; 
      }
    }
    
    const updated = schedules.filter((_, i) => i !== idx);
    setSchedules(updated);
    setMessage({ type: "success", text: `${courseName} removed from schedule.` });
  };

  const handleDeleteEntireSchedule = async () => {
    if (!window.confirm("Are you sure you want to delete this ENTIRE schedule? This cannot be undone.")) return;
    
    try {
      const res = await authFetch(`http://localhost:8080/api/admin/exams/${selectedExamId}/schedules`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete the entire schedule");
      
      setMessage({ type: "success", text: "Entire schedule deleted successfully!" });
      setSchedules([]);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Exam Schedules" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        
        <main className="p-6 flex-1 overflow-y-auto">
          {message.text && (
            <div className={`p-4 mb-6 rounded border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Select Exam</h2>
            {loading ? (
              <p>Loading exams...</p>
            ) : (
              <select
                className="w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                {exams.map(e => (
                  <option key={e.examId} value={e.examId}>{e.title}</option>
                ))}
              </select>
            )}
          </div>

          {selectedExamId && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-300 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Schedule Builder</h2>
                {schedules.length > 0 && schedules[0]?.isBroadcasted && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 font-semibold text-sm rounded-full">
                    Broadcasted Active
                  </span>
                )}
              </div>
              
              {schedules.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No courses found for this exam's Year and Semester. Please add courses in Manage Courses first.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-50 text-sm text-gray-600 uppercase">
                        <tr>
                          <th className="px-6 py-3 border-b">Course Name</th>
                          <th className="px-6 py-3 border-b">Exam Date</th>
                          <th className="px-6 py-3 border-b">Start Time</th>
                          <th className="px-6 py-3 border-b">End Time</th>
                          <th className="px-6 py-3 border-b text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {schedules.map((s, idx) => (
                          <tr key={s.courseId} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">{s.courseName}</td>
                            <td className="px-6 py-4">
                              <input type="date" value={s.examDate || ""} onChange={(e) => handleScheduleChange(idx, "examDate", e.target.value)} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                            </td>
                            <td className="px-6 py-4">
                              <input type="time" value={s.startTime || ""} onChange={(e) => handleScheduleChange(idx, "startTime", e.target.value)} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                            </td>
                            <td className="px-6 py-4">
                              <input type="time" value={s.endTime || ""} onChange={(e) => handleScheduleChange(idx, "endTime", e.target.value)} className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none w-full" />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleDeleteRow(idx, s.scheduleId, s.courseName)}
                                className="text-red-500 hover:text-red-700 text-lg transition"
                                title="Remove Course"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-6 bg-gray-50 flex gap-4 border-t border-gray-200 items-center justify-between">
                    <div className="flex gap-4">
                      <button onClick={handleSave} disabled={saving} className={`px-6 py-2 rounded text-blue-700 bg-blue-100 font-medium shadow-sm transition hover:bg-blue-200`}>
                        Save Schedule
                      </button>
                      <button onClick={handleBroadcast} disabled={saving} className={`px-6 py-2 rounded text-white bg-blue-600 font-medium shadow-sm transition hover:bg-blue-700`}>
                        Broadcast
                      </button>
                    </div>
                    
                    <button onClick={handleDeleteEntireSchedule} disabled={saving} className="px-4 py-2 rounded text-red-600 bg-red-100 font-medium shadow-sm transition hover:bg-red-200 border border-red-200">
                      Delete Entire Schedule
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminExamSchedules;
