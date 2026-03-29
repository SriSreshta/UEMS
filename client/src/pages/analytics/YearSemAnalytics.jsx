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

const GRADE_KEYS = [
  { key: "o",     label: "O",  color: "#6366f1" },
  { key: "aplus", label: "A+", color: "#8b5cf6" },
  { key: "a",     label: "A",  color: "#06b6d4" },
  { key: "bplus", label: "B+", color: "#0ea5e9" },
  { key: "b",     label: "B",  color: "#84cc16" },
  { key: "c",     label: "C",  color: "#f59e0b" },
  { key: "f",     label: "F",  color: "#ef4444" },
];

const generateInsights = (data, year, sem) => {
  if (!data.length) return [];

  const totalPass = data.reduce((s, d) => s + d.pass, 0);
  const totalFail = data.reduce((s, d) => s + d.fail, 0);
  const totalStudents = totalPass + totalFail;
  const overallPassPct = totalStudents > 0 ? Math.round((totalPass / totalStudents) * 100) : 0;

  const subjectPassRates = data.map(d => ({
    name: d.subjectName,
    rate: d.pass + d.fail > 0 ? Math.round((d.pass / (d.pass + d.fail)) * 100) : 0,
  }));

  const best = subjectPassRates.reduce((a, b) => (a.rate > b.rate ? a : b));
  const worst = subjectPassRates.reduce((a, b) => (a.rate < b.rate ? a : b));

  const totalO = data.reduce((s, d) => s + (d.o || 0), 0);
  const totalF = data.reduce((s, d) => s + (d.f || 0), 0);

  return [
    `Overall pass rate for Year ${year}, Semester ${sem} is ${overallPassPct}% (${totalPass} passed out of ${totalStudents} total attempts).`,
    `"${best.name}" has the highest pass rate at ${best.rate}%, making it the strongest subject this semester.`,
    `"${worst.name}" has the lowest pass rate at ${worst.rate}% — this subject may need additional academic support or syllabus review.`,
    `${totalO} students achieved the top grade (O) across all subjects, while ${totalF} students received an F grade.`,
    overallPassPct >= 75
      ? `Overall academic performance is strong this semester with a pass rate above 75%.`
      : `Overall academic performance needs attention — pass rate is below 75% this semester.`,
  ];
};

const YearSemAnalytics = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [analyticsYear, setAnalyticsYear] = useState(4);
  const [analyticsSem, setAnalyticsSem] = useState(2);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    authFetch(`http://localhost:8081/api/admin/analytics?year=${analyticsYear}&semester=${analyticsSem}`)
      .then(r => r.json())
      .then(data => setAnalyticsData(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [analyticsYear, analyticsSem, authFetch]);

  const insights = generateInsights(analyticsData, analyticsYear, analyticsSem);

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
              className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-700">Year & Semester Analytics</h1>
              <p className="text-sm text-slate-400 mt-1">Subject-wise performance filtered by academic year and semester</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-8">
            <select
              value={analyticsYear}
              onChange={e => setAnalyticsYear(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {[1, 2, 3, 4].map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
            <select
              value={analyticsSem}
              onChange={e => setAnalyticsSem(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : analyticsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <span className="text-5xl mb-3">📭</span>
              <p className="font-bold">No data found for this selection.</p>
            </div>
          ) : (
            <>
              {/* Chart 1: Pass % per Subject */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Pass % per Subject</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.map(d => ({
                    name: d.subjectName,
                    passPercent: d.pass + d.fail > 0 ? Math.round((d.pass / (d.pass + d.fail)) * 100) : 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="passPercent" fill="#22c55e" name="Pass %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Overall Pass vs Fail Pie */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Overall Pass vs Fail</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Pass", value: analyticsData.reduce((s, d) => s + d.pass, 0) },
                        { name: "Fail", value: analyticsData.reduce((s, d) => s + d.fail, 0) },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 3: Grade Distribution per Subject */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Grade Distribution per Subject</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.map(d => ({
                    name: d.subjectName,
                    O: d.o, "A+": d.aplus, A: d.a, "B+": d.bplus, B: d.b, C: d.c, F: d.f,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {GRADE_KEYS.map(g => (
                      <Bar key={g.key} dataKey={g.label} fill={g.color} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 4: Overall Grade Distribution */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
                <h3 className="text-base font-black text-slate-600 mb-4">Overall Grade Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={GRADE_KEYS.map(g => ({
                    grade: g.label,
                    count: analyticsData.reduce((s, d) => s + (d[g.key] || 0), 0),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
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

export default YearSemAnalytics;