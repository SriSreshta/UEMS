// FILE: src/dashboards/FacultyDashboard.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../auth/AuthContext";

const FacultyDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth();

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
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome, {user?.username || "Faculty"}!
            </h1>
            <p className="text-gray-700 mt-1">
              Here’s a summary of your dashboard.
            </p>
          </div>

          {/* ...existing cards/sections... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold">Create Question Paper</h3>
              <p className="text-sm text-gray-600 mt-2">
                Draft and submit question papers for admin review.
              </p>
              <div className="mt-4">
                <button className="btn bg-indigo-600 text-white">Start</button>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold">Marking & Results</h3>
              <p className="text-sm text-gray-600 mt-2">
                Upload marks and publish student results securely.
              </p>
              <div className="mt-4">
                <button className="btn bg-indigo-600 text-white">Upload</button>
              </div>
            </div>
          </div>

          <section className="mt-8 card">
            <h2 className="text-lg font-semibold mb-2">My Exams</h2>
            <div className="text-sm text-gray-600">
              No exams scheduled in demo mode.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
