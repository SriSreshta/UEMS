import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import studentHero from "../assets/dashboard/student_hero.png";

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
    const quote = QUOTES[new Date().getDay() % QUOTES.length];

    useEffect(() => {
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
    }, [user, authFetch]);

    return (
        <div className="flex min-h-screen bg-slate-900">
            <Sidebar isOpen={isOpen} role="student" />
            <div className="flex-1 flex flex-col">
                <Header title="Student Portal" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

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
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default StudentDashboard;
