import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


const MarkAttendancePage = () => {
  const { courseId } = useParams();
  const { user, authFetch } = useAuth();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");

  // ✅ Load students for this course
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const res = await authFetch(`http://localhost:8080/api/students/by-course/${courseId}`);
        if (!res.ok) throw new Error("Failed to load students");
        const data = await res.json();
        setStudents(data);

        // initialize attendance state
        const initial = {};
        data.forEach((s) => (initial[s.id] = true)); // default all present
        setAttendance(initial);
      } catch (err) {
        console.error(err);
        setMessage("Could not load students for this course.");
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [authFetch, courseId]);

  // ✅ Toggle Present/Absent
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // ✅ Submit attendance
  const handleSubmit = async () => {
    try {
      setMessage("Saving attendance...");
      for (const studentId of Object.keys(attendance)) {
        await authFetch("http://localhost:8080/api/attendance/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student: { id: studentId },
            faculty: { id: user.facultyId }, // assuming your JWT or context provides this
            course: { courseId: courseId },
            date: date,
            present: attendance[studentId],
          }),
        });
      }
      setMessage("✅ Attendance saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to save attendance.");
    }
  };

  if (loading) return <p className="p-6">Loading students...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Mark Attendance</h1>
      <p className="mb-4 text-gray-600">Course ID: {courseId}</p>

      <div className="mb-4">
        <label className="mr-2 text-gray-700 font-medium">Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      {students.length === 0 ? (
        <p>No students enrolled in this course.</p>
      ) : (
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border-b">Roll No</th>
              <th className="p-2 border-b">Name</th>
              <th className="p-2 border-b text-center">Present</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{s.rollNumber}</td>
                <td className="p-2">{s.user?.username || "N/A"}</td>
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={attendance[s.id] || false}
                    onChange={() => toggleAttendance(s.id)}
                    className="h-4 w-4"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={handleSubmit}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Save Attendance
      </button>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
};

export default MarkAttendancePage;
