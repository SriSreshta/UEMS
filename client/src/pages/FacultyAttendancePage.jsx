import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import { ClipboardDocumentCheckIcon, BookOpenIcon } from "@heroicons/react/24/outline";

const FacultyAttendancePage = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { user, authFetch } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                if (!user?.username) return;
                const res = await authFetch(`http://localhost:8080/api/courses/faculty/by-username/${user.username}`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setCourses(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [user, authFetch]);

    return (
        <div className="flex min-h-screen bg-slate-50 bg-pattern">
            <Sidebar isOpen={isOpen} role="faculty" />
            <div className="flex-1 flex flex-col">
                <Header title="Attendance Management" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
                <main className="p-10 flex-1">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                <ClipboardDocumentCheckIcon className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Post Attendance</h1>
                        </div>
                        <p className="text-slate-500 mb-10 ml-14">Select a course to record student attendance logs.</p>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                                {[1, 2].map(i => <div key={i} className="h-44 bg-slate-200 rounded-3xl"></div>)}
                            </div>
                        ) : courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-slate-800">
                                {courses.map(course => (
                                    <Link 
                                        key={course.id} 
                                        to={`/faculty/attendance/mark/${course.id}`}
                                        className="group bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                                            <BookOpenIcon className="h-32 w-32" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-black ring-1 ring-indigo-100 uppercase">
                                                    {course.code}
                                                </span>
                                                <div className="text-[10px] font-black text-slate-300 tracking-widest uppercase">
                                                    {course.year} • {course.semester}
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-4 group-hover:text-indigo-600 transition">
                                                {course.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest pt-4 border-t border-slate-50">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                Active Course Session
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 bg-white rounded-3xl text-center border-2 border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold italic">No academic courses assigned for attendance posting.</p>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
};

export default FacultyAttendancePage;
