// FILE: client/src/dashboards/AdminDashboard.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../auth/AuthContext";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Admin Dashboard"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, {user?.username || "Admin"}!
            </h1>
            <p className="text-gray-700 mt-1">
              Here’s a summary of your dashboard.
            </p>
          </div>
          {/* ...existing cards/sections... */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="font-semibold">Manage Students</h3>
              <p className="text-sm text-gray-600 mt-2">
                Create, edit, and remove student accounts.
              </p>
              <div className="mt-4">
                <button className="btn bg-indigo-600 text-white">Go</button>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold">Manage Faculty</h3>
              <p className="text-sm text-gray-600 mt-2">
                Assign departments and roles.
              </p>
            </div>

            <div className="card">
              <h3 className="font-semibold">Exams & Schedules</h3>
              <p className="text-sm text-gray-600 mt-2">
                Create exams, set dates, publish results.
              </p>
            </div>
          </div>

          <section className="mt-8 card">
            <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
            <div className="text-sm text-gray-600">
              No activity yet — this is a seeded demo dashboard.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
