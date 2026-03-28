import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../auth/AuthContext";
import InsightsPanel from "../../components/Analytics/InsightsPanel";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6", "#0ea5e9"];

const generateInsights = (data) => {
  if (!data.length) return [];

  const top = data.reduce((a, b) => (a.studentCount > b.studentCount ? a : b));
  const least = data.reduce((a, b) => (a.studentCount < b.studentCount ? a : b));
  const totalStudents = data.reduce((s, d) => s + d.studentCount, 0);
  const topPassDept = data.reduce((a, b) => (a.passPercent > b.passPercent ? a : b));
  const lowPassDept = data.reduce((a, b) => (a.passPercent < b.passPercent ? a : b));
  const avgPass = Math.round(data.reduce((s, d) => s + d.passPercent, 0) / data.length);

  return [
    `${top.department} has the highest enrollment with ${top.studentCount} students (${Math.round((top.studentCount / totalStudents) * 100)}% of total).`,
    `${least.department} has the lowest enrollment with ${least.studentCount} students — consider promotional outreach.`,
    `${topPassDept.department} leads in academic performance with a ${topPassDept.passPercent}% pass rate.`,
    `${lowPassDept.department} has the lowest pass rate at ${lowPassDept.passPercent}% — targeted academic intervention is recommended.`,
    `The average pass rate across all departments is ${avgPass}%.`,
  ];
};

const DeptAnalytics = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    authFetch("http://localhost:8080/api/admin/analytics/department")
      .then(r => r.json())
      .then(data => setDeptData(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authFetch]);

  const insights = generateInsights(deptData);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Admin Panel" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/admin")}
              className="text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-700">Department Analytics</h1>
              <p className="text-sm text-slate-400 mt-1">Enrollment and performance breakdown across all departments</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
            </div>
          ) : deptData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <span className="text-5xl mb-3">📭</span>
              <p className="font-bold">No department data available.</p>
            </div>
          ) : (
            <>
              {/* Chart 1: Student Enrollment per Department */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Student Enrollment per Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="studentCount" fill="#22c55e" name="Students" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Department-wise Enrollment Share (Pie) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Enrollment Share by Department</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={deptData.map(d => ({ name: d.department, value: d.studentCount }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deptData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3: Pass % per Department */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Pass % per Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="passPercent" fill="#6366f1" name="Pass %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 4: Pass vs Fail per Department (Grouped) */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Pass vs Fail per Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pass" fill="#22c55e" name="Pass" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fail" fill="#ef4444" name="Fail" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Insights */}
              <InsightsPanel insights={insights} />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DeptAnalytics;