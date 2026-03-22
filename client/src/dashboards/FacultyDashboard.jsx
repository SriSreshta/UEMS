import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { AcademicCapIcon, BookOpenIcon, UsersIcon } from "@heroicons/react/24/outline";
import facultyHero from "../assets/dashboard/faculty_hero.png";

const FacultyDashboard = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { user, authFetch } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (!user?.username) return;
        const res = await authFetch(
          `http://localhost:8080/api/courses/faculty/by-username/${user.username}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Could not load assigned courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [authFetch, user]);

  return (
    <div className="flex min-h-screen bg-white bg-pattern">
      <Sidebar isOpen={isOpen} role="faculty" />
      <div className="flex-1 flex flex-col">
        <Header
          title="Faculty Dashboard"
          isOpen={isOpen}
          toggleSidebar={() => setIsOpen(!isOpen)}
        />
        <main className="flex-1">
          {/* Photographic Hero Section */}
          <div className="relative h-80 overflow-hidden">
            <img 
                src={facultyHero} 
                alt="Faculty Office" 
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-teal-900/40 backdrop-blur-[1px]"></div>
            
            <div className="absolute bottom-8 left-10 text-white max-w-2xl px-6 py-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                Welcome, <span className="text-teal-200">{user?.username || "Professor"}</span>
              </h1>
              <div className="h-1 w-20 bg-teal-300 rounded-full mb-4"></div>
              
              <div className="max-w-xl">
                <p className="text-xl italic font-medium opacity-100 leading-relaxed border-l-4 border-teal-300/50 pl-4 mb-1">
                  "To teach is to learn twice."
                </p>
                <p className="text-xs tracking-widest uppercase opacity-70 ml-5">— Joseph Joubert</p>
              </div>
            </div>
          </div>

          <div className="p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-12 mb-10">
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition duration-300">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpenIcon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Courses</p>
                    <p className="text-2xl font-black text-slate-800">{courses.length}</p>
                </div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hover:-translate-y-1 transition duration-300">
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                    <UsersIcon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Students</p>
                    <p className="text-2xl font-black text-slate-800">--</p>
                </div>
                </div>

                <div className="md:col-span-2 bg-slate-50/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-600 italic text-sm text-center shadow-sm">
                "A teacher affects eternity; he can never tell where his influence stops." — Henry Adams
                </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AcademicCapIcon className="h-7 w-7 text-emerald-600" />
                Academic Workload
            </h2>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1,2].map(i => <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>)}
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100">{error}</div>
            ) : (
                <>
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => (
                        <div key={course.courseId || course.id} className="group p-8 bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition duration-500 rounded-3xl flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-700 transition">{course.name}</h4>
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">{course.code}</span>
                            </div>
                            <p className="text-slate-500 text-sm mb-6 pb-4 border-b border-slate-50">Dept: {course.department} | {course.year} • {course.semester}</p>
                        </div>
                        <div className="flex space-x-3 mt-auto">
                            <Link to={`/faculty/marks/upload/${course.courseId || course.id}`} className="flex-1 text-center py-3 px-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">
                            Marks
                            </Link>
                            <Link to={`/faculty/attendance/mark/${course.courseId || course.id}`} className="flex-1 text-center py-3 px-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                            Attendance
                            </Link>
                        </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <div className="p-16 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
                    <BookOpenIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium text-lg">Your academic workload is currently clear.</p>
                    </div>
                )}
                </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default FacultyDashboard;
