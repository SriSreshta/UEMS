import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axiosInstance";
import { DocumentMagnifyingGlassIcon, BookOpenIcon, CheckBadgeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// markType will be one of: 'mid1', 'mid2', 'assignment', 'endSem'
const FacultyMarksViewPage = ({ markType, title }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [groupedMarks, setGroupedMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'current', 'past'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch faculty's courses
        const courseRes = await api.get(`/faculty/courses`);
        let courses = courseRes.data;
        console.log("courses fetched:", courses);
        
        // Ensure courses is an array even if the backend wrapped it in an object
        if (!Array.isArray(courses) && courses.content) {
          courses = courses.content;
        } else if (!Array.isArray(courses) && courses.data) {
          courses = courses.data;
        } else if (!Array.isArray(courses)) {
          console.warn("Expected an array of courses, but received:", typeof courses, courses);
          courses = [];
        }

        // 2. Fetch marks for each course in parallel
        const marksPromises = courses.map(async (c) => {
          try {
            const id = c.courseId || c.course_id || c.id;
            console.log("Extracted course id:", id, "from course:", c);
            
            if (!id) {
               console.error("Missing course identifier in course object:", c);
               return { course: c, marks: [] };
            }
            const mRes = await api.get(`/faculty/courses/${id}/marks`);
            return { course: c, marks: mRes.data || [] };
          } catch (e) {
            console.error("Failed to fetch marks for course", c, e.response?.data || e.message);
            return { course: c, marks: [] };
          }
        });

        const allMarks = await Promise.all(marksPromises);

        // Grouping: Course -> Classes (we don't have exact Class metadata easily accessible in FacultyMarksResponse, 
        // but we can group by course. If we had year/semester we'd group further).
        // Based on user prompt "Course -> Classes under each course", we will group by Course Name for now,
        // and if student info contains year/dept, we can sub-group. But Student table info isn't in FacultyMarksResponse yet.
        // I will group by Course as the primary hierarchy.
        
        const groupedList = [];
        allMarks.forEach(({ course, marks }) => {
           if (marks && marks.length > 0) {
              const name = course.name || course.course_name || "Unknown Course";
              const code = course.code || course.course_code || "N/A";
              const courseKey = `${name} (${code})`;
              groupedList.push({ courseKey, course, students: marks });
           }
        });

        setGroupedMarks(groupedList);
      } catch (err) {
        setError(err.response?.data || err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user, markType]);

  const getMarkDisplay = (student) => {
    let mark;
    switch(markType) {
      case 'mid1': mark = student.mid1Marks; break;
      case 'mid2': mark = student.mid2Marks; break;
      case 'assignment': mark = student.assignmentMarks; break;
      case 'endSem': mark = student.endSemMarks; break;
      default: mark = null;
    }
    return (mark === null || mark === undefined) ? "—" : mark;
  };

  const getMaxMarks = () => {
    switch(markType) {
      case 'mid1': return 30;
      case 'mid2': return 30;
      case 'assignment': return 10;
      case 'endSem': return 60;
      default: return "-";
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="faculty" />
      <div className="flex-1 flex flex-col">
        <Header title={title} isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="p-8 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">{title} Ledger</h1>
              <p className="text-slate-500 font-bold text-sm mt-2 flex items-center gap-2">
                <CheckBadgeIcon className="h-5 w-5 text-indigo-500" /> Viewing all mapped courses
              </p>
            </div>

            {/* Filters Section */}
            {!loading && !error && groupedMarks.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                    placeholder="Search by student name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto">
                  {['all', 'current', 'past'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`flex-1 md:w-32 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                        filterType === type 
                          ? "bg-white text-indigo-600 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/70"
                      }`}
                    >
                      {type === 'all' ? 'All' : type === 'current' ? 'Current' : 'Past'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="p-6 mb-8 text-rose-700 bg-rose-50 rounded-2xl border border-rose-100 font-bold">{error}</div>}

            {loading ? (
              <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-slate-50">
                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : groupedMarks.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
                <DocumentMagnifyingGlassIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Records Found</h3>
                <p className="text-slate-500 font-medium">There are currently no active enrollments mapped to your courses.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {groupedMarks.map(({ courseKey, course, students }) => {
                  // Filter out students based on criteria
                  const filteredStudents = students.filter(student => {
                    const matchesSearch = student.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
                    
                    if (!matchesSearch) return false;

                    const isCurrent = String(student.year) === String(course.year) && String(student.semester) === String(course.semester);
                    
                    if (filterType === 'current') return isCurrent;
                    if (filterType === 'past') return !isCurrent;
                    return true;
                  });

                  if (filteredStudents.length === 0) return null;

                  return (
                    <div key={courseKey} className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                      <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                          <BookOpenIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">{courseKey}</h3>
                          <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">
                            {filteredStudents.length} {filterType !== 'all' ? filterType : ''} Enrolled Students
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-slate-50/50">
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100 w-1/2">Student Details</th>
                              <th className="px-8 py-5 text-[10px] font-black text-emerald-600 uppercase tracking-widest border-b border-slate-100 w-1/2 text-center">Score (Max: {getMaxMarks()})</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((student) => {
                              const isCurrent = String(student.year) === String(course.year) && String(student.semester) === String(course.semester);
                              return (
                                <tr key={student.studentId} className="hover:bg-slate-50/50 transition">
                                  <td className="px-8 py-4 border-r border-slate-50 flex items-center gap-3">
                                    <div>
                                      <div className="font-bold text-slate-700">{student.studentName}</div>
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.rollNumber}</div>
                                    </div>
                                    {isCurrent ? (
                                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-indigo-600 bg-indigo-100 border border-indigo-200 shrink-0 ml-auto mr-4 tracking-widest">
                                        Current
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-slate-500 bg-slate-100 border border-slate-200 shrink-0 ml-auto mr-4 tracking-widest">
                                        Past/Carry
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-8 py-4 text-center">
                                    <span className={`inline-block px-4 py-2 rounded-lg font-black text-lg ${getMarkDisplay(student) === "—" ? "text-slate-400 bg-slate-50" : "text-emerald-700 bg-emerald-50 border border-emerald-100"}`}>
                                      {getMarkDisplay(student)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default FacultyMarksViewPage;
