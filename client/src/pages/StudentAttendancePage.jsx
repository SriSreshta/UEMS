import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import { 
    ClipboardDocumentListIcon, 
    ExclamationTriangleIcon, 
    CheckBadgeIcon, 
    ChartPieIcon,
    AcademicCapIcon
} from "@heroicons/react/24/outline";

const StudentAttendancePage = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { user } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                if (!user?.studentId) return;
                const res = await axiosInstance.get(`/attendance/student/${user.studentId}/stats`);
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch attendance stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const totalConducted = stats.reduce((acc, curr) => acc + curr.totalClasses, 0);
    const totalAttended = stats.reduce((acc, curr) => acc + curr.attendedClasses, 0);
    const overallPercentage = totalConducted > 0 
        ? ((totalAttended / totalConducted) * 100).toFixed(2) 
        : 0;

    const isGlobalWarning = totalConducted > 0 && overallPercentage < 75;

    return (
        <div className="flex min-h-screen bg-slate-50 bg-pattern">
            <Sidebar isOpen={isOpen} role="student" />
            <div className="flex-1 flex flex-col">
                <Header title="My Attendance" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
                <main className="p-10 flex-1">
                    <div className="max-w-7xl mx-auto space-y-10">
                        {/* Title & Header Section */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                                        <ClipboardDocumentListIcon className="h-7 w-7" />
                                    </div>
                                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Attendance Analytics</h1>
                                </div>
                                <p className="text-slate-500 font-medium ml-16">Monitor your subject-wise presence and academic engagement.</p>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className={`col-span-1 lg:col-span-2 p-8 rounded-[2rem] border-2 transition-all duration-500 shadow-2xl ${
                                isGlobalWarning 
                                ? 'bg-rose-50 border-rose-100 shadow-rose-200/50' 
                                : 'bg-emerald-50 border-emerald-100 shadow-emerald-200/50'
                            }`}>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            {isGlobalWarning ? (
                                                <ExclamationTriangleIcon className="h-8 w-8 text-rose-600 animate-pulse" />
                                            ) : (
                                                <CheckBadgeIcon className="h-8 w-8 text-emerald-600" />
                                            )}
                                            <span className={`text-sm font-black uppercase tracking-[0.2em] ${isGlobalWarning ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {isGlobalWarning ? 'Critical Alert: Low Attendance' : 'Excellent Maintenance'}
                                            </span>
                                        </div>
                                        <h2 className="text-5xl font-black text-slate-800">
                                            {totalConducted > 0 ? `${overallPercentage}%` : 'N/A'} <span className="text-xl font-bold text-slate-400">Overall Presence</span>
                                        </h2>
                                        <p className="text-slate-600 font-medium max-w-md">
                                            {totalConducted === 0
                                                ? "No classes have been conducted yet. Your attendance will be tracked here once sessions begin."
                                                : isGlobalWarning 
                                                    ? "Your overall attendance is below the mandatory 75% threshold. Please prioritize your classes to avoid academic repercussions."
                                                    : "Great job! You are maintaining a healthy attendance record across all your enrolled subjects."}
                                        </p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className={`h-24 w-24 rounded-full border-8 flex items-center justify-center font-black ${
                                            totalConducted === 0 ? 'border-slate-200 text-slate-400 text-lg'
                                            : isGlobalWarning ? 'border-rose-200 text-rose-600 text-2xl' 
                                            : 'border-emerald-200 text-emerald-600 text-2xl'
                                        }`}>
                                        {totalConducted === 0 ? 'N/A' : `${Math.round(overallPercentage)}%`}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col justify-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                        <ChartPieIcon className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Aggregate</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-500 font-bold">Total Sessions</span>
                                        <span className="text-2xl font-black text-slate-800">{totalConducted}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <span className="text-slate-500 font-bold">Attended Logs</span>
                                        <span className="text-2xl font-black text-indigo-600">{totalAttended}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${isGlobalWarning ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                            style={{ width: `${overallPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Stats Table */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                                    Subject-wise Breakdown
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="px-5 py-2 bg-white rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                                        Academic Session: {stats.length > 0 ? stats[0].year : '2023-24'}
                                    </span>
                                    <span className="px-5 py-2 bg-indigo-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-indigo-600 shadow-lg shadow-indigo-100 italic">
                                        Semester {stats.length > 0 ? stats[0].semester : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white">
                                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Subject Context</th>
                                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Conducted</th>
                                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Attended</th>
                                            <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Percentage</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            [1, 2, 3].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan="4" className="px-10 py-8"><div className="h-8 bg-slate-100 rounded-xl w-full"></div></td>
                                                </tr>
                                            ))
                                        ) : stats.length > 0 ? (
                                            stats.map((s) => {
                                                const isWarning = s.totalClasses > 0 && s.percentage < 75;
                                                return (
                                                    <tr key={s.courseId} className="group hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-10 py-8">
                                                            <div className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{s.courseName}</div>
                                                            <div className="text-xs font-black text-indigo-400 uppercase tracking-tighter mt-1">{s.courseCode}</div>
                                                        </td>
                                                        <td className="px-10 py-8 text-center">
                                                            <span className="text-lg font-bold text-slate-600">{s.totalClasses}</span>
                                                        </td>
                                                        <td className="px-10 py-8 text-center">
                                                            <span className="text-lg font-bold text-slate-600">{s.attendedClasses}</span>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <div className="flex flex-col items-end gap-2">
                                                                <span className={`text-2xl font-black ${isWarning ? 'text-rose-600' : s.totalClasses === 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                                                                    {s.totalClasses === 0 ? 'N/A' : `${s.percentage.toFixed(1)}%`}
                                                                </span>
                                                                {isWarning && (
                                                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest animate-bounce">
                                                                        <ExclamationTriangleIcon className="h-3 w-3" />
                                                                        Shortage
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-10 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                                            <ClipboardDocumentListIcon className="h-8 w-8" />
                                                        </div>
                                                        <p className="text-slate-400 font-bold italic tracking-wide">No attendance logs found for current courses.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default StudentAttendancePage;
