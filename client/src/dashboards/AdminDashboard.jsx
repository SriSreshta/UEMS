import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import adminHero from "../assets/dashboard/admin_hero.png";

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [stats, setStats] = useState({ users: null, courses: null, fees: null });
  const [loading, setLoading] = useState(true);

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
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;
