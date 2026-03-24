import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

export default function StudentResults() {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex min-h-screen bg-[#f4f1e1]">
      <div className="print:hidden">
        <Sidebar isOpen={isOpen} role="student" />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
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
            <div className="bg-white text-black w-full max-w-[900px] p-8 md:p-12 shadow-2xl print:shadow-none print:w-full print:max-w-none mx-auto min-h-[1050px]">
              
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
                  <div className="flex"><span className="w-32 inline-block">Examination</span><span>: B.Tech {resultsData.year || "N/A"}</span></div>
                  <div className="flex"><span className="w-32 inline-block">Branch</span><span className="uppercase">: {resultsData.department || "N/A"}</span></div>
                  <div className="flex"><span className="w-32 inline-block">Student's Name</span><span className="uppercase">: {resultsData.studentName || "N/A"}</span></div>
                </div>
                <div className="space-y-1.5 sm:text-right">
                  <div className="flex sm:justify-end"><span className="w-40 sm:w-auto inline-block sm:mr-2">Hall Ticket No</span><span className="uppercase">: {resultsData.rollNumber || "N/A"}</span></div>
                  <div className="flex sm:justify-end"><span className="w-40 sm:w-auto inline-block sm:mr-2">Month &amp; Year of Exam</span><span>: March {new Date().getFullYear()}</span></div>
                </div>
              </div>

              {/* Semesters Data */}
              <div className="space-y-8">
                {resultsData.semesters.map((sem, idx) => {
                  let passed = sem.courses?.filter(c => c.grade !== 'F' && c.grade !== 'Ab').length || 0;
                  let registered = sem.courses?.length || 0;
                  let totalCredits = sem.courses?.reduce((acc, c) => acc + (c.credits || 0), 0) || 0;

                  return (
                    <div key={idx} className="break-inside-avoid">
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
                  );
                })}
              </div>

              {/* Overall CGPA */}
              <div className="mt-8 text-right font-black text-xl text-black">
                CGPA: {resultsData.cgpa?.toFixed(2) || "0.00"}
              </div>

            </div>
          )}
        </main>
        
        <div className="print:hidden">
          <Footer />
        </div>
      </div>
    </div>
  );
}
