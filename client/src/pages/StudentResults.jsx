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
    <div className="bg-[#e8ecef] text-black w-full max-w-[210mm] mx-auto p-4 sm:p-6 shadow-2xl print:shadow-none min-h-[297mm] flex flex-col font-sans relative overflow-hidden">
      {/* Decorative borders to match the physical memo look */}
      <div className="absolute inset-0 mix-blend-multiply opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-pink-100 to-teal-100 pointer-events-none"></div>
      <div className="absolute inset-1 sm:inset-3 border-[12px] border-double border-[#879d9e] pointer-events-none rounded-sm bg-[#fce8e8] bg-opacity-30"></div>
      
      <div className="relative z-10 flex flex-col h-full pt-6 sm:pt-8 px-4 sm:px-6">
        
        

        {/* Header - 3 column layout: logo | text center | seal */}
<div className="flex items-center justify-between pb-3 border-b border-gray-400">
  {/* Left - Logo */}
  <img src="/src/assets/jntuh-logo.png" alt="JNTUH" 
       className="w-16 h-16 object-contain" />
  
  {/* Center - University text */}
  <div className="text-center flex-1 px-2">
    <p className="font-bold text-sm uppercase">University College of Engineering, Science & Technology Hyderabad</p>
    <p className="text-xs">(Autonomous)</p>
    <p className="font-bold text-sm uppercase">Jawaharlal Nehru Technological University Hyderabad</p>
    <p className="text-xs">Kukatpally, Hyderabad - 500 085, Telangana, India</p>
    <div className="mt-2">
      <span className="bg-gray-900 text-white px-8 py-1 text-xs font-bold uppercase tracking-widest">
        Memorandum of Marks / Grades
      </span>
    </div>
  </div>

  
</div>
{/* Memo & Serial No (Top Left) */}
        <div className="text-[10px] sm:text-xs font-bold space-y-1 z-20">
          <div className="flex"><span className="w-16">MEMO NO.</span><span>: {resultsData.memoNo || ""}</span></div>
          <div className="flex"><span className="w-16">SERIAL NO.</span><span>: {resultsData.serialNo || ""}</span></div>
        </div>

        {/* Student Details */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between text-xs sm:text-[13px] font-bold text-black gap-2 sm:gap-4 mb-4 relative z-10 w-full pl-2 sm:pl-0">
          <div className="space-y-4 w-full sm:w-[60%]">
            <div className="flex items-center">
              <span className="w-24 sm:w-32 inline-block">EXAMINATION</span>
              <span className="uppercase">: B.Tech {sem.year || resultsData.year || "N/A"} Year {sem.semester || "N/A"} Sem</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 sm:w-32 inline-block">BRANCH</span>
              <span className="uppercase">: {resultsData.department || "N/A"}</span>
            </div>
            <div className="flex items-center mt-2">
              <span className="w-24 sm:w-32 inline-block shrink-0">STUDENT'S NAME</span>
              <span className="uppercase border-b-[1.5px] border-black flex-1 ml-1 pl-1 pb-0.5 tracking-wide flex items-center">
                <span className="mr-2">:</span>{resultsData.studentName || "N/A"}
              </span>
            </div>
          </div>
          <div className="space-y-4 w-full sm:w-[40%] flex flex-col sm:items-end mt-4 sm:mt-0">
            <div className="flex w-full justify-start sm:justify-end items-center">
              <span className="w-32 sm:w-auto inline-block sm:text-right sm:mr-3 textxs sm:text-[13px]">HALL TICKET NO.</span>
              <span className="uppercase border border-black px-3 py-1 min-w-[140px] text-center bg-[#fceeee] tracking-widest font-black shadow-[inset_0_0_2px_rgba(0,0,0,0.2)]">
                {resultsData.rollNumber || "N/A"}
              </span>
            </div>
            <div className="flex w-full justify-start sm:justify-end items-center">
              <span className="w-32 sm:w-auto inline-block sm:text-right sm:mr-3 text-xs sm:text-[13px]">MONTH &amp; YEAR OF EXAM</span>
              <span className="uppercase sm:min-w-[100px] sm:text-right">: JULY, 2024</span>
            </div>
          </div>
        </div>

        {/* Semester Data Table */}
        <div className="flex-grow z-10 relative px-1 sm:px-0 mt-2">
          <div className="border-[1.5px] border-black shadow-[0_0_5px_rgba(0,0,0,0.1)] bg-white/40 mix-blend-multiply">
            <table className="w-full text-xs sm:text-sm border-collapse border-black text-black">
              <thead>
                <tr className="border-b-[1.5px] border-black">
                  <th className="border-r-[1.5px] border-black p-2 w-[6%] text-center font-bold">S.NO</th>
                  <th className="border-r-[1.5px] border-black p-2 w-[14%] text-center font-bold">SUBJECT<br/>CODE</th>
                  <th className="border-r-[1.5px] border-black p-2 text-center font-bold">SUBJECT TITLE</th>
                  <th className="border-r-[1.5px] border-black p-1 sm:p-2 w-[8%] text-center font-bold">GRADE</th>
                  <th className="border-r-[1.5px] border-black p-1 sm:p-2 w-[10%] text-center font-bold leading-tight">GRADE<br/>POINT</th>
                  <th className="p-1 sm:p-2 w-[10%] text-center font-bold">CREDITS</th>
                </tr>
              </thead>
              <tbody>
                {sem.courses?.map((c, cIdx) => (
                  <tr key={cIdx} className="border-b-[1px] border-gray-400">
                    <td className="border-r-[1.5px] border-black p-2 text-center text-[11px] sm:text-xs">{cIdx + 1}</td>
                    <td className="border-r-[1.5px] border-black p-2 text-center font-medium text-[11px] sm:text-xs tracking-wider">{c.courseCode}</td>
                    <td className="border-r-[1.5px] border-black p-2 text-[11px] sm:text-xs font-semibold pl-4 uppercase">{c.courseName}</td>
                    <td className="border-r-[1.5px] border-black p-2 text-center font-bold text-xs sm:text-sm tracking-wide">{c.grade}</td>
                    <td className="border-r-[1.5px] border-black p-2 text-center text-xs sm:text-sm">{c.gradePoints}</td>
                    <td className="p-2 text-center text-xs sm:text-sm">{c.credits}</td>
                  </tr>
                ))}
                
                
                
                <tr className="border-t-[1.5px] border-black bg-white/50">
                  <td colSpan={3} className="border-r-[1.5px] border-black p-2 text-center font-semibold text-[11px] sm:text-xs tracking-wide">
                    <div className="flex justify-around px-2 sm:px-4">
                      <span>Registered Subjects : {registered}</span>
                      <span>Passed : {passed}</span>
                    </div>
                  </td>
                  <td colSpan={3} className="p-2 text-center font-semibold text-[11px] sm:text-xs tracking-wide">
                    Total Credits : {totalCredits}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-3 flex flex-col sm:flex-row justify-between items-center sm:items-start text-black px-2 mb-6 gap-2 sm:gap-0">
              <div className="w-full sm:w-1/3"></div>
              <div className="w-full sm:w-1/3 text-center text-base sm:text-lg font-black tracking-widest text-[#a81d1d] shrink-0">
                SGPA: {sem.sgpa?.toFixed(2)}
              </div>
              <div className="w-full sm:w-1/3 text-center sm:text-right text-[9px] sm:text-[10px] font-bold leading-tight pt-1">
                Note : S - Satisfactory, NS - Not Satisfactory
              </div>
          </div>

          {showCgpa && (
            <div className="text-center font-black text-base sm:text-lg text-black mb-6 border-t-2 border-b-2 border-black py-1 sm:py-2 mt-2 max-w-[200px] mx-auto bg-white/50 shadow-sm">
              CGPA: {resultsData.cgpa?.toFixed(2) || "0.00"}
            </div>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="mt-auto pt-8 sm:pt-12 flex justify-between items-end text-[10px] sm:text-[11px] font-bold text-black px-2 sm:px-4 pb-2 w-full z-10 relative">
          <div className="pb-1">
            DATE OF ISSUE : &nbsp;&nbsp;<span className="font-bold border-b-[1.5px] border-black border-dashed min-w-[80px] inline-block text-center pb-0.5">{new Date().toLocaleDateString('en-GB')}</span>
          </div>
          <div className="text-center flex flex-col items-center">
              <div className="h-4 sm:h-6 mb-1 border-b-[1.5px] border-black w-20 sm:w-28 opacity-80"></div>
              VERIFIED BY
              <span className="font-normal mt-0.5 opacity-80 text-[9px]">Clerk</span>
          </div>
          <div className="text-center flex flex-col items-center">
              <div className="h-4 sm:h-6 mb-1 border-b-[1.5px] border-black w-24 sm:w-36 opacity-80"></div>
              PRINCIPAL
          </div>
        </div>
      </div>
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
