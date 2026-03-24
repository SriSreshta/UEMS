import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import studentHero from "../assets/dashboard/student_hero.png";
import { useNavigate } from "react-router-dom";

const QUOTES = [
  "Learning today, leading tomorrow.",
  "Dream big, study hard, shine brighter.",
  "Every expert was once a beginner.",
  "Knowledge is the best investment you can make.",
  "Push yourself — no one else is going to do it for you.",
];

const StudentDashboard = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { user, authFetch } = useAuth();
    const [attendanceAlert, setAttendanceAlert] = useState(false);
    const [attendancePercent, setAttendancePercent] = useState(null);
    const [showAlert, setShowAlert] = useState(true);
    const [resultNotification, setResultNotification] = useState(null);
    const navigate = useNavigate();
    const quote = QUOTES[new Date().getDay() % QUOTES.length];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await authFetch("http://localhost:8080/api/student/notifications/results");
                console.log("Notifications API status:", res.status);
                if (res.ok) {
                    const data = await res.json();
                    console.log("Notifications API body:", data);
                    if (data && data.length > 0) {
                        setResultNotification(data[0]);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch result notifications:", err);
            }
        };
        fetchNotifications();

        const checkAttendance = async () => {
            if (!user?.studentId) return;
            try {
                const res = await authFetch(`http://localhost:8080/api/attendance/student/${user.studentId}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.length > 0) {
                    const presentCount = data.filter(a => a.present).length;
                    const percent = (presentCount / data.length) * 100;
                    setAttendancePercent(percent.toFixed(1));
                    if (percent < 75) {
                        setAttendanceAlert(true);
                        setTimeout(() => setAttendanceAlert(false), 10000);
                    }
                }
            } catch (err) {
                console.error("Attendance check failed:", err);
            }
        };
        checkAttendance();
    }, [authFetch, user?.studentId]);

    console.log("Modal trigger state:", resultNotification);

    return (
        <div className="flex min-h-screen bg-slate-900">
            <Sidebar isOpen={isOpen} role="student" />
            <div className="flex-1 flex flex-col">
                <Header title="Student Portal" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

                {/* Result Notification Modal (Non-dismissible) */}
                {resultNotification && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="bg-slate-800 border-2 border-emerald-500/50 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 transition-all">
                            <div className="text-6xl mb-6">📋</div>
                            <h2 className="text-2xl font-black text-white mb-2">Results Published!</h2>
                            <p className="text-slate-300 mb-8 leading-relaxed font-medium">
                                Your results have been published for {resultNotification.year} Year {resultNotification.semester} Sem!
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        await authFetch(`http://localhost:8080/api/student/notifications/${resultNotification.id}/seen`, { method: "PUT" });
                                        setResultNotification(null);
                                        navigate("/student/results");
                                    } catch (err) {
                                        console.error("Failed to mark notification as seen:", err);
                                    }
                                }}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30"
                            >
                                View My Results
                            </button>
                        </div>
                    </div>
                )}

                {/* Attendance Alert */}
                {attendanceAlert && showAlert && (
                    <div className="fixed top-20 right-6 z-50">
                        <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-sm border border-red-500">
                            <div className="text-2xl mt-0.5">⚠️</div>
                            <div className="flex-1">
                                <p className="font-black text-base">Low Attendance</p>
                                <p className="text-sm opacity-90 mt-1">Your overall attendance is <strong>{attendancePercent}%</strong>, below the required 75%.</p>
                            </div>
                            <button onClick={() => setShowAlert(false)} className="opacity-70 hover:opacity-100 text-xl font-bold">×</button>
                        </div>
                    </div>
                )}

                <main className="flex-1 relative">
                    {/* Full-bleed hero */}
                    <div className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center overflow-hidden">
                        {/* Background */}
                        <img
                            src={studentHero}
                            alt="Student"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Dark overlay with gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

                        {/* Content */}
                        <div className="relative z-10 text-center px-8 max-w-3xl">
                            <p className="text-white/50 text-xs font-black uppercase tracking-[0.4em] mb-6">Student Portal</p>

                            <h1 className="text-white text-5xl md:text-6xl font-black mb-6 leading-tight tracking-tight drop-shadow-xl">
                                Welcome back,<br />
                                <span className="text-blue-300">{user?.username || "Student"}</span>
                            </h1>

                            <div className="w-16 h-1 bg-blue-400 rounded-full mx-auto mb-8 opacity-80" />

                            <p className="text-white/80 text-xl md:text-2xl italic font-light leading-relaxed drop-shadow">
                                "{quote}"
                            </p>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <ScheduleSection authFetch={authFetch} />
                </main>
                <Footer />
            </div>
        </div>
    );
};

const ScheduleSection = ({ authFetch }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await authFetch("http://localhost:8080/api/student/exams/schedules");
        if (res.ok) {
          const data = await res.json();
          setSchedules(data);
        }
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [authFetch]);

  if (loading) return null;
  if (schedules.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 -mt-20 relative z-20">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="text-blue-400">📅</span> Upcoming Exam Schedules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((s, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition">
              <div className="text-xs uppercase tracking-wide text-blue-300 font-semibold mb-1">
                {s.courseCode}
              </div>
              <h3 className="text-lg font-bold mb-3 truncate" title={s.courseName}>{s.courseName}</h3>
              <div className="text-sm space-y-2 opacity-90">
                <div className="flex justify-between items-center border-b border-white/10 pb-1">
                  <span className="text-white/60 text-xs uppercase">Date</span>
                  <span className="font-medium">{s.examDate || "TBA"}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-white/60 text-xs uppercase">Time</span>
                  <span className="font-medium">{s.startTime || "TBA"} - {s.endTime || "TBA"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
