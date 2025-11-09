import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

const FacultyAttendancePage = () => {
  const { user, authFetch } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await authFetch(
          `http://localhost:8080/api/courses/faculty/by-username/${user.username}`
        );
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
        setError("Could not load courses.");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [authFetch, user]);

  if (loading) return <p className="p-6">Loading courses...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Courses</h1>
      {courses.length === 0 ? (
        <p>No courses assigned.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.courseId}
              className="bg-white shadow p-4 rounded-xl border border-gray-200"
            >
              <h3 className="font-semibold text-lg text-gray-700 mb-2">
                {course.name} ({course.code})
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Semester {course.semester} | {course.department}
              </p>
              <Link
                to={`/faculty/attendance/mark/${course.courseId}`}
                className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Mark Attendance
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyAttendancePage;
