import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const MemoView = ({ resultsData, sem, showCgpa }) => {
  let passed = sem.courses?.filter(c => c.grade !== 'F' && c.grade !== 'Ab').length || 0;
  let registered = sem.courses?.length || 0;
  let totalCredits = sem.courses?.reduce((acc, c) => acc + (c.credits || 0), 0) || 0;

  return (
    <div className="bg-white text-black w-full p-8 md:p-12 shadow-2xl print:shadow-none mx-auto min-h-[1050px]">
      {/* Letterhead */}
      <div className="text-center mb-8">
        <h1 className="text-xl md:text-2xl font-bold uppercase text-black leading-tight">
          UNIVERSITY COLLEGE OF ENGINEERING, SCIENCE &amp; TECHNOLOGY HYDERABAD
        </h1>
        <p className="text-sm md:text-base font-semibold text-black mt-1">
          (Formerly JNTUH College of Engineering Hyderabad)
        </p>
        <p className="text-sm md:text-base font-semibold text-black mt-1">
          JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY HYDERABAD
        </p>
        <p className="text-sm text-black font-medium mt-1">
          KUKATPALLY, HYDERABAD - 500 085, TELANGANA, INDIA
        </p>
        <div className="bg-green-700 text-white font-bold py-2 mt-5 text-lg tracking-wider w-full">
          MEMORANDUM OF MARKS / GRADES
        </div>
      </div>

      {/* Student Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold mb-8 text-black">
        <div className="space-y-1.5">
          <div className="flex"><span className="w-32 inline-block">MEMO NO</span><span>: N/A</span></div>
          <div className="flex"><span className="w-32 inline-block">SERIAL NO</span><span>: N/A</span></div>
          <div className="flex"><span className="w-32 inline-block">Examination</span><span>: B.Tech {sem.year || resultsData.year || "N/A"}</span></div>
          <div className="flex"><span className="w-32 inline-block">Branch</span><span className="uppercase">: {resultsData.department || "N/A"}</span></div>
          <div className="flex"><span className="w-32 inline-block">Student's Name</span><span className="uppercase">: {resultsData.studentName || "N/A"}</span></div>
        </div>
        <div className="space-y-1.5 sm:text-right">
          <div className="flex sm:justify-end"><span className="w-40 sm:w-auto inline-block sm:mr-2">Hall Ticket No</span><span className="uppercase">: {resultsData.rollNumber || "N/A"}</span></div>
          <div className="flex sm:justify-end"><span className="w-40 sm:w-auto inline-block sm:mr-2">Month &amp; Year of Exam</span><span>: March {new Date().getFullYear()}</span></div>
        </div>
      </div>

      {/* Semester Data */}
      <div className="space-y-8">
        <div className="break-inside-avoid">
          <table className="w-full text-sm border-collapse border border-black text-black">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-2 w-[8%] text-center">S.No</th>
                <th className="border-r border-black p-2 w-[22%] text-left">Subject Code</th>
                <th className="border-r border-black p-2 text-left">Subject Title</th>
                <th className="border-r border-black p-2 w-[12%] text-center">Grade</th>
                <th className="border-r border-black p-2 w-[15%] text-center">Grade Point</th>
                <th className="p-2 w-[12%] text-center">Credits</th>
              </tr>
            </thead>
            <tbody>
              {sem.courses?.map((c, cIdx) => (
                <tr key={cIdx} className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">{cIdx + 1}</td>
                  <td className="border-r border-black p-2 font-medium">{c.courseCode}</td>
                  <td className="border-r border-black p-2">{c.courseName}</td>
                  <td className="border-r border-black p-2 text-center font-bold">{c.grade}</td>
                  <td className="border-r border-black p-2 text-center">{c.gradePoints}</td>
                  <td className="p-2 text-center">{c.credits}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} className="p-2 text-center font-semibold text-sm">
                  Registered Subjects : {registered} &nbsp;&nbsp;|&nbsp;&nbsp; Passed : {passed} &nbsp;&nbsp;|&nbsp;&nbsp; Total Credits : {totalCredits}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mt-1.5 font-bold text-black text-sm">
            SGPA: {sem.sgpa?.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Overall CGPA */}
      {showCgpa && (
        <div className="mt-8 text-right font-black text-xl text-black">
          CGPA: {resultsData.cgpa?.toFixed(2) || "0.00"}
        </div>
      )}
    </div>
  );
};

export default function StudentResults() {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPastSemester, setSelectedPastSemester] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await authFetch("http://localhost:8080/api/students/results");
        if (res.ok) {
          const data = await res.json();
          setResultsData(data);
        }
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [authFetch]);

  // Derived state for formatting
  const currentSemester = resultsData?.semesters?.length > 0 
    ? resultsData.semesters[resultsData.semesters.length - 1] 
    : null;
    
  // Reverse to show newest past result first
  const pastSemesters = resultsData?.semesters?.length > 1
    ? [...resultsData.semesters].slice(0, resultsData.semesters.length - 1).reverse()
    : [];

  return (
    <div className="flex min-h-screen bg-[#f4f1e1]">
      <div className="print:hidden">
        <Sidebar isOpen={isOpen} role="student" />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="print:hidden">
          <Header title="My Results" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        </div>
        
        <main className="flex-1 p-4 md:p-8 flex justify-center items-start print:p-0 print:m-0">
          {loading ? (
            <div className="text-center text-slate-500 mt-10">Loading results...</div>
          ) : !resultsData || !resultsData.semesters || resultsData.semesters.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              No results available yet.
            </div>
          ) : (
            <div className="w-full max-w-[900px] flex flex-col gap-12">
              
              {/* CURRENT SEMESTER MEMO */}
              <div className="w-full">
                <MemoView resultsData={resultsData} sem={currentSemester} showCgpa={true} />
              </div>

              {/* PAST RESULTS */}
              {pastSemesters.length > 0 && (
                <div className="pt-8 border-t-2 border-[#1a1a1a]/20 print:hidden">
                  <h2 className="text-2xl font-black text-black mb-6 uppercase tracking-tight">Past Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastSemesters.map((sem, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPastSemester(sem)}
                        className="text-left px-5 py-4 bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-600 transition-all text-black rounded-lg flex flex-col group justify-between h-full"
                      >
                        <span className="font-bold text-lg mb-1">
                          Year {sem.year} <span className="text-gray-400 font-normal mx-1">&bull;</span> Sem {sem.semester}
                        </span>
                        <div className="flex items-center justify-between text-sm mt-3 border-t border-gray-100 pt-3">
                          <span className="text-gray-600 font-medium tracking-wide">View Results</span>
                          <span className="text-green-700 bg-green-50 rounded-full p-1 leading-none group-hover:translate-x-1 transition-transform">
                            &rarr;
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
        
        <div className="print:hidden">
          <Footer />
        </div>

        {/* Modal for Past Results */}
        {selectedPastSemester && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 print:hidden lg:pl-64">
            <div className="relative w-full max-w-[950px] my-auto">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setSelectedPastSemester(null)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow transition"
                >
                  Close
                </button>
              </div>
              <div className="w-full bg-[#f4f1e1] max-h-[85vh] overflow-y-auto p-4 md:p-8 rounded-lg shadow-2xl">
                <MemoView resultsData={resultsData} sem={selectedPastSemester} showCgpa={false} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
