// FILE: client/src/dashboards/StudentDashboard.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../auth/AuthContext";

export default function StudentDashboard() {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} role="student" />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <Header
          toggleSidebar={() => setIsOpen(!isOpen)}
          isOpen={isOpen}
          title="Student Dashboard"
        />

        {/* Main section */}
        <main className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, {user?.username || "Student"}!
            </h1>
            <p className="text-gray-700 mt-1">
              Here’s a summary of your dashboard.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-lg">Upcoming Exams</h3>
              <p className="text-sm text-gray-600 mt-2">
                View your exam timetable and instructions.
              </p>
            </div>

            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-lg">Results</h3>
              <p className="text-sm text-gray-600 mt-2">
                Check published results and download transcripts.
              </p>
            </div>

            <div className="bg-white p-4 shadow rounded">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <p className="text-sm text-gray-600 mt-2">
                Administrative notices and updates.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="mt-8 bg-white p-4 shadow rounded">
            <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
            <div className="flex gap-3">
              <button className="border px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition">
                Download Admit Card
              </button>
              <button className="border px-4 py-2 rounded hover:bg-blue-500 hover:text-white transition">
                Contact Faculty
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
