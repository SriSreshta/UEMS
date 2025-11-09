import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../auth/AuthContext";

const FacultyDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, authFetch } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!user?.username) return;
        const res = await authFetch(
          `http://localhost:8080/api/courses/faculty/by-username/${user.username}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Could not load assigned courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [authFetch, user]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="faculty" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Faculty Dashboard"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="p-6 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user?.username || "Faculty"}!
          </h1>

          {loading ? (
            <p>Loading courses...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <>
              <h3 className="text-gray-700 mb-4">
                You have <b>{courses.length}</b> assigned course
                {courses.length !== 1 ? "s" : ""}.
              </h3>

              {courses.length > 0 ? (
                <ul className="list-disc list-inside">
                  {courses.map((course) => (
                    <li key={course.id} className="text-gray-800">
                      {course.name} ({course.code})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No courses assigned yet.</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
