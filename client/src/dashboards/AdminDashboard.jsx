import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import adminHero from "../assets/dashboard/admin_hero.png";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({ students: null, courses: null, fees: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch("http://localhost:8081/api/admin/dashboard-stats");
        if (res.ok) {
          const data = await res.json();
          setStats({
            students: data.studentCount,
            courses: data.courseCount,
            fees: data.feeNotificationCount,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authFetch]);

  const statCards = [
    { label: "Total Students",    value: stats.students, color: "text-indigo-600",  bg: "bg-indigo-50" },
    { label: "Active Courses",    value: stats.courses, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Fee Notifications", value: stats.fees,    color: "text-amber-600",   bg: "bg-amber-50" },
  ];

  const analyticsCards = [
    {
      title: "Year & Semester Analytics",
      description: "Explore pass/fail rates, grade distributions, and subject-wise performance filtered by academic year and semester.",
      icon: "📅",
      color: "from-indigo-500 to-indigo-700",
      border: "border-indigo-100",
      badge: "bg-indigo-100 text-indigo-700",
      badgeLabel: "Year · Semester · Grades",
      route: "/admin/analytics/year-sem",
    },
    {
      title: "Department Analytics",
      description: "Compare enrollment counts, performance trends, and grade breakdowns across all departments.",
      icon: "🏛️",
      color: "from-emerald-500 to-emerald-700",
      border: "border-emerald-100",
      badge: "bg-emerald-100 text-emerald-700",
      badgeLabel: "Departments · Enrollment · Trends",
      route: "/admin/analytics/dept",
    },
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

          <div className="p-8 max-w-4xl mx-auto">
            {/* Real-time stats */}
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

            {/* Analytics Navigation */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-slate-700">Analytics</h2>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                  2 Reports
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {analyticsCards.map(card => (
                  <button
                    key={card.route}
                    onClick={() => navigate(card.route)}
                    className={`text-left bg-white rounded-2xl border ${card.border} shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400`}
                  >
                    {/* Gradient top bar */}
                    <div className={`h-2 w-full bg-gradient-to-r ${card.color}`} />

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl">{card.icon}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${card.badge}`}>
                          {card.badgeLabel}
                        </span>
                      </div>

                      <h3 className="text-lg font-black text-slate-700 mb-2 group-hover:text-indigo-600 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        {card.description}
                      </p>

                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">
                        <span>View Report</span>
                        <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;