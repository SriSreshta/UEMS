import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../auth/AuthContext";

const StudentDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, authFetch } = useAuth();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const res = await authFetch("http://localhost:8080/api/test/student");
      const text = await res.text();
      setMessage(text);
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Student Dashboard"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="p-6 flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {user?.username || "Student"}!
          </h1>
          <p className="text-gray-600 mb-4">{message}</p>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
