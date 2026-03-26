import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import adminHero from "../assets/dashboard/admin_hero.png";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({ users: null, courses: null, fees: null });
  const [loading, setLoading] = useState(true);

  const [analyticsYear, setAnalyticsYear] = useState(4);
  const [analyticsSem, setAnalyticsSem] = useState(2);
  const [analyticsData, setAnalyticsData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, feesRes] = await Promise.all([
          authFetch("http://localhost:8080/api/admin/users"),
          authFetch("http://localhost:8080/api/admin/courses"),
          authFetch("http://localhost:8080/api/admin/fees"),
        ]);

        const users   = usersRes.ok   ? await usersRes.json()   : [];
        const courses = coursesRes.ok ? await coursesRes.json() : [];
        const fees    = feesRes.ok    ? await feesRes.json()    : [];

        setStats({
          users: users.length,
          courses: courses.length,
          fees: fees.length,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  useEffect(() => {
    authFetch(`http://localhost:8080/api/admin/analytics?year=${analyticsYear}&semester=${analyticsSem}`)
      .then(r => r.json())
      .then(data => setAnalyticsData(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [analyticsYear, analyticsSem, authFetch]);

  const statCards = [
    { label: "Total Users",       value: stats.users,   color: "text-indigo-600",  bg: "bg-indigo-50" },
    { label: "Active Courses",    value: stats.courses, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Fee Notifications", value: stats.fees,    color: "text-amber-600",   bg: "bg-amber-50" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Admin Panel" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

        <main className="flex-1">
          {/* Hero */}
          <div className="relative h-56 overflow-hidden bg-slate-900">
            <img src={adminHero} alt="Admin" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
            <div className="absolute inset-0 flex items-center px-10">
              <div>
                <p className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">System Administrator</p>
                <h1 className="text-white text-4xl font-black tracking-tight">Admin Dashboard</h1>
                <p className="text-white/50 mt-2 italic">"Management is doing things right; leadership doing the right things."</p>
              </div>
            </div>
          </div>

          {/* Real-time stats */}
          <div className="p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {statCards.map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{card.label}</p>
                  {loading ? (
                    <div className="h-10 w-16 bg-slate-100 rounded-lg animate-pulse" />
                  ) : (
                    <p className={`text-5xl font-black ${card.color}`}>{card.value ?? "—"}</p>
                  )}
                </div>
              ))}
            </div>

            {/* ===== ANALYTICS SECTION ===== */}
            <div style={{ marginTop: '2rem' }}>
              <h2 className="text-2xl font-black text-slate-700 mb-4">Analytics</h2>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <select
                  value={analyticsYear}
                  onChange={e => setAnalyticsYear(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
                <select
                  value={analyticsSem}
                  onChange={e => setAnalyticsSem(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>

              {/* Chart 1: Pass % per Subject */}
              <h3 className="text-lg font-bold text-slate-600 mt-6 mb-2">Pass % per Subject</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analyticsData.map(d => ({
                    name: d.subjectName,
                    passPercent: d.pass + d.fail > 0
                      ? Math.round((d.pass / (d.pass + d.fail)) * 100)
                      : 0
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="passPercent" fill="#22c55e" name="Pass %" />
                </BarChart>
              </ResponsiveContainer>

              {/* Chart 2: Overall Pass vs Fail Pie */}
              <h3 className="text-lg font-bold text-slate-600 mt-6 mb-2">Overall Pass vs Fail</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pass', value: analyticsData.reduce((s, d) => s + d.pass, 0) },
                      { name: 'Fail', value: analyticsData.reduce((s, d) => s + d.fail, 0) }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Chart 3: Grade Distribution per Subject */}
              <h3 className="text-lg font-bold text-slate-600 mt-6 mb-2">Grade Distribution per Subject</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={analyticsData.map(d => ({
                    name: d.subjectName,
                    O: d.o,
                    'A+': d.aplus,
                    A: d.a,
                    'B+': d.bplus,
                    B: d.b,
                    C: d.c,
                    F: d.f
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="O"  fill="#6366f1" />
                  <Bar dataKey="A+" fill="#8b5cf6" />
                  <Bar dataKey="A"  fill="#06b6d4" />
                  <Bar dataKey="B+" fill="#0ea5e9" />
                  <Bar dataKey="B"  fill="#84cc16" />
                  <Bar dataKey="C"  fill="#f59e0b" />
                  <Bar dataKey="F"  fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>

              {/* Chart 4: Overall Grade Distribution */}
              <h3 className="text-lg font-bold text-slate-600 mt-6 mb-2">Overall Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={['o', 'aplus', 'a', 'bplus', 'b', 'c', 'f'].map(g => ({
                    grade: g === 'aplus' ? 'A+' : g === 'bplus' ? 'B+' : g.toUpperCase(),
                    count: analyticsData.reduce((s, d) => s + (d[g] || 0), 0)
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>

            </div>
            {/* ===== END ANALYTICS SECTION ===== */}

          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;