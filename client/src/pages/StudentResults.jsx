import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

/* ─────────────────────────────────────────────
   Print helper – renders a hidden container with
   all requested memos, then calls window.print().
   A <style> tag injected into <head> ensures only
   #print-root is visible during printing.
────────────────────────────────────────────── */
const printMemos = (memoNodes) => {
  // Remove any previous print root
  const old = document.getElementById("print-root");
  if (old) old.remove();
  const oldStyle = document.getElementById("print-style");
  if (oldStyle) oldStyle.remove();

  // Inject print CSS
  const style = document.createElement("style");
  style.id = "print-style";
  style.textContent = `
    @media print {
      body > *:not(#print-root) { display: none !important; }
      #print-root {
        display: block !important;
        position: static !important;
        background: white;
        z-index: 99999;
        width: 100%;
        margin: 0;
        padding: 0;
      }
      .memo-page {
        page-break-after: always;
        break-after: page;
        width: 210mm;
        margin: 0 auto;
      }
      .memo-page:last-child {
        page-break-after: avoid;
        break-after: avoid;
      }
    }
    #print-root { display: none; }
  `;
  document.head.appendChild(style);

  // Build container
  const root = document.createElement("div");
  root.id = "print-root";

  memoNodes.forEach((node) => {
    const wrapper = document.createElement("div");
    wrapper.className = "memo-page";
    wrapper.appendChild(node);
    root.appendChild(wrapper);
  });

  document.body.appendChild(root);

  requestAnimationFrame(() => {
    window.print();
    // Clean up after print dialog closes
    setTimeout(() => {
      root.remove();
      style.remove();
    }, 1000);
  });
};

/* ─────────────────────────────────────────────
   generateMemoNumbers – derives memoNo & serialNo
   from semester data so each memo is unique.
   Format:
     MEMO NO.   → JNTUH/Y{year}/S{sem}/{rollNumber}
     SERIAL NO. → SL/{year}{sem}/{rollNumber}
────────────────────────────────────────────── */
const generateMemoNumbers = (sem, rollNumber) => {
  const y = sem.year || "X";
  const s = sem.semester || "X";
  const roll = rollNumber || "000";
  return {
    memoNo:   `JNTUH/Y${y}/S${s}/${roll}`,
    serialNo: `SL/${y}${s}/${roll}`,
  };
};

/* ─────────────────────────────────────────────
   MemoView – pure rendering, no print logic here
────────────────────────────────────────────── */
const MemoView = ({ resultsData, sem, showCgpa }) => {
  let passed = sem.courses?.filter(c => c.grade !== 'F' && c.grade !== 'Ab').length || 0;
  let registered = sem.courses?.length || 0;
  let totalCredits = sem.courses?.reduce((acc, c) => acc + (c.credits || 0), 0) || 0;
  const { memoNo, serialNo } = generateMemoNumbers(sem, resultsData.rollNumber);

  return (
    <div className="bg-white text-black w-full max-w-[210mm] mx-auto p-4 sm:p-6 shadow-2xl print:shadow-none min-h-[297mm] flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-1 sm:inset-3 border-[12px] border-double border-[#879d9e] pointer-events-none rounded-sm"></div>

      <div className="relative z-10 flex flex-col h-full pt-6 sm:pt-8 px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-400 min-h-[100px]">
          <img src="/src/assets/jntuh-logo.png" alt="JNTUH"
            className="w-20 h-20 object-contain self-center flex-shrink-0" />
          <div className="text-center flex-1 px-2">
            <p className="font-bold text-[13px] uppercase">University College of Engineering, Science & Technology Hyderabad</p>
            <p className="text-xs text-center w-full">(Autonomous)</p>
            <p className="font-bold text-xs uppercase">Jawaharlal Nehru Technological University Hyderabad</p>
            <p className="text-xs">Kukatpally, Hyderabad - 500 085, Telangana, India</p>
            <div className="mt-2">
              <span className="bg-gray-900 text-white px-8 py-1 text-xs font-bold uppercase tracking-widest">
                Memorandum of Marks / Grades
              </span>
            </div>
          </div>
          <div className="w-20 h-20 flex-shrink-0" />
        </div>

        {/* Memo & Serial No */}
        <div className="text-[10px] sm:text-xs font-bold space-y-1 z-20">
          <div className="flex"><span className="w-16">MEMO NO.</span><span>: {memoNo}</span></div>
          <div className="flex"><span className="w-16">SERIAL NO.</span><span>: {serialNo}</span></div>
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
              <span className="uppercase border border-black px-3 py-1 min-w-[140px] text-center tracking-widest font-black shadow-[inset_0_0_2px_rgba(0,0,0,0.2)]">
                {resultsData.rollNumber || "N/A"}
              </span>
            </div>
            <div className="flex w-full justify-start sm:justify-end items-center">
              <span className="w-32 sm:w-auto inline-block sm:text-right sm:mr-3 text-xs sm:text-[13px]">MONTH &amp; YEAR OF EXAM</span>
              <span className="uppercase sm:min-w-[100px] sm:text-right">: JULY, 2024</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-grow z-10 relative px-1 sm:px-0 mt-2">
          <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center pointer-events-none z-0">
            <img src="/src/assets/jntuh-logo.png" alt=""
              className="w-64 h-64 object-contain opacity-10" />
          </div>
          <div className="border-[1.5px] border-black shadow-[0_0_5px_rgba(0,0,0,0.1)] bg-white/40 mix-blend-multiply">
            <table className="w-full text-xs sm:text-sm border-collapse border-black text-black">
              <thead>
                <tr className="border-b-[1.5px] border-black">
                  <th className="border-r-[1.5px] border-black p-2 w-[6%] text-center font-bold">S.NO</th>
                  <th className="border-r-[1.5px] border-black p-2 w-[14%] text-center font-bold">SUBJECT<br />CODE</th>
                  <th className="border-r-[1.5px] border-black p-2 text-center font-bold">SUBJECT TITLE</th>
                  <th className="border-r-[1.5px] border-black p-1 sm:p-2 w-[8%] text-center font-bold">GRADE</th>
                  <th className="border-r-[1.5px] border-black p-1 sm:p-2 w-[10%] text-center font-bold leading-tight">GRADE<br />POINT</th>
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
            <div className="w-full sm:w-1/3 text-center text-sm font-bold tracking-wide text-black shrink-0">
              SGPA: {sem.sgpa?.toFixed(2)}
            </div>
            <div className="w-full sm:w-1/3 text-center sm:text-right text-[9px] sm:text-[10px] font-bold leading-tight pt-1">
              Note : S - Satisfactory, NS - Not Satisfactory
            </div>
          </div>

          {showCgpa && (
            <div className="text-center font-bold text-sm text-black mb-6 mt-2">
              CGPA: {resultsData.cgpa?.toFixed(2) || "0.00"}
            </div>
          )}
        </div>

        {/* Footer Signatures */}
        <div className="mt-auto pt-8 sm:pt-12 flex justify-between items-end text-[10px] sm:text-[11px] font-bold text-black px-2 sm:px-4 pb-2 w-full z-10 relative">
          <div className="pb-1">
            DATE OF ISSUE : &nbsp;&nbsp;
            <span className="font-bold border-b-[1.5px] border-black border-dashed min-w-[80px] inline-block text-center pb-0.5">
              {new Date().toLocaleDateString('en-GB')}
            </span>
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

/* ─────────────────────────────────────────────
   buildMemoHTML – creates a standalone DOM node
   for a single memo (used by printMemos helper)
────────────────────────────────────────────── */
const buildMemoHTML = (resultsData, sem, showCgpa) => {
  const passed = sem.courses?.filter(c => c.grade !== 'F' && c.grade !== 'Ab').length || 0;
  const registered = sem.courses?.length || 0;
  const totalCredits = sem.courses?.reduce((acc, c) => acc + (c.credits || 0), 0) || 0;
  const { memoNo, serialNo } = generateMemoNumbers(sem, resultsData.rollNumber);

  const rows = (sem.courses || []).map((c, i) => `
    <tr style="border-bottom:1px solid #9ca3af">
      <td style="border-right:1.5px solid black;padding:6px;text-align:center;font-size:11px">${i + 1}</td>
      <td style="border-right:1.5px solid black;padding:6px;text-align:center;font-size:11px;font-weight:500;letter-spacing:0.05em">${c.courseCode}</td>
      <td style="border-right:1.5px solid black;padding:6px;font-size:11px;font-weight:600;padding-left:16px;text-transform:uppercase">${c.courseName}</td>
      <td style="border-right:1.5px solid black;padding:6px;text-align:center;font-weight:700;font-size:12px;letter-spacing:0.05em">${c.grade}</td>
      <td style="border-right:1.5px solid black;padding:6px;text-align:center;font-size:12px">${c.gradePoints}</td>
      <td style="padding:6px;text-align:center;font-size:12px">${c.credits}</td>
    </tr>`).join('');

  const cgpaRow = showCgpa
    ? `<div style="text-align:center;font-weight:700;font-size:14px;color:black;margin-bottom:24px;margin-top:8px">
         CGPA: ${resultsData.cgpa?.toFixed(2) || "0.00"}
       </div>`
    : '';

  const div = document.createElement('div');
  div.style.cssText = `
    background:white;color:black;width:210mm;max-width:210mm;
    padding:24px;min-height:297mm;display:flex;flex-direction:column;
    font-family:sans-serif;position:relative;overflow:hidden;box-sizing:border-box;
  `;
  div.innerHTML = `
    <!-- decorative border -->
    <div style="position:absolute;inset:12px;border:12px double #879d9e;pointer-events:none;border-radius:2px"></div>

    <div style="position:relative;z-index:10;display:flex;flex-direction:column;height:100%;padding-top:32px;padding-left:24px;padding-right:24px">

      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #9ca3af;min-height:100px">
        <img src="/src/assets/jntuh-logo.png" alt="JNTUH" style="width:80px;height:80px;object-fit:contain;flex-shrink:0"/>
        <div style="text-align:center;flex:1;padding:0 8px">
          <p style="font-weight:700;font-size:13px;text-transform:uppercase;margin:0">University College of Engineering, Science &amp; Technology Hyderabad</p>
          <p style="font-size:11px;margin:2px 0">(Autonomous)</p>
          <p style="font-weight:700;font-size:11px;text-transform:uppercase;margin:2px 0">Jawaharlal Nehru Technological University Hyderabad</p>
          <p style="font-size:11px;margin:2px 0">Kukatpally, Hyderabad - 500 085, Telangana, India</p>
          <div style="margin-top:8px">
            <span style="background:#111;color:white;padding:4px 32px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">
              Memorandum of Marks / Grades
            </span>
          </div>
        </div>
        <div style="width:80px;flex-shrink:0"></div>
      </div>

      <!-- Memo / Serial -->
      <div style="font-size:11px;font-weight:700;margin-top:8px">
        <div style="display:flex"><span style="width:64px">MEMO NO.</span><span>: ${memoNo}</span></div>
        <div style="display:flex;margin-top:4px"><span style="width:64px">SERIAL NO.</span><span>: ${serialNo}</span></div>
      </div>

      <!-- Student Details -->
      <div style="margin-top:16px;display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:black;gap:16px;margin-bottom:16px">
        <div style="width:60%">
          <div style="display:flex;align-items:center;margin-bottom:16px">
            <span style="width:128px;display:inline-block">EXAMINATION</span>
            <span style="text-transform:uppercase">: B.Tech ${sem.year || resultsData.year || "N/A"} Year ${sem.semester || "N/A"} Sem</span>
          </div>
          <div style="display:flex;align-items:center;margin-bottom:16px">
            <span style="width:128px;display:inline-block">BRANCH</span>
            <span style="text-transform:uppercase">: ${resultsData.department || "N/A"}</span>
          </div>
          <div style="display:flex;align-items:center">
            <span style="width:128px;display:inline-block;flex-shrink:0">STUDENT'S NAME</span>
            <span style="text-transform:uppercase;border-bottom:1.5px solid black;flex:1;padding-left:4px;padding-bottom:2px;letter-spacing:0.05em">
              : ${resultsData.studentName || "N/A"}
            </span>
          </div>
        </div>
        <div style="width:40%;display:flex;flex-direction:column;align-items:flex-end;gap:16px">
          <div style="display:flex;align-items:center;justify-content:flex-end">
            <span style="margin-right:12px">HALL TICKET NO.</span>
            <span style="text-transform:uppercase;border:1px solid black;padding:4px 12px;min-width:140px;text-align:center;letter-spacing:0.1em;font-weight:900">
              ${resultsData.rollNumber || "N/A"}
            </span>
          </div>
          <div style="display:flex;align-items:center;justify-content:flex-end">
            <span style="margin-right:12px;font-size:11px">MONTH &amp; YEAR OF EXAM</span>
            <span style="text-transform:uppercase">: JULY, 2024</span>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div style="flex:1;position:relative">
        <div style="border:1.5px solid black">
          <table style="width:100%;border-collapse:collapse;color:black;font-size:12px">
            <thead>
              <tr style="border-bottom:1.5px solid black">
                <th style="border-right:1.5px solid black;padding:8px;width:6%;text-align:center;font-weight:700">S.NO</th>
                <th style="border-right:1.5px solid black;padding:8px;width:14%;text-align:center;font-weight:700">SUBJECT<br/>CODE</th>
                <th style="border-right:1.5px solid black;padding:8px;text-align:center;font-weight:700">SUBJECT TITLE</th>
                <th style="border-right:1.5px solid black;padding:8px;width:8%;text-align:center;font-weight:700">GRADE</th>
                <th style="border-right:1.5px solid black;padding:8px;width:10%;text-align:center;font-weight:700">GRADE<br/>POINT</th>
                <th style="padding:8px;width:10%;text-align:center;font-weight:700">CREDITS</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr style="border-top:1.5px solid black">
                <td colspan="3" style="border-right:1.5px solid black;padding:8px;text-align:center;font-weight:600;font-size:11px">
                  <div style="display:flex;justify-content:space-around;padding:0 16px">
                    <span>Registered Subjects : ${registered}</span>
                    <span>Passed : ${passed}</span>
                  </div>
                </td>
                <td colspan="3" style="padding:8px;text-align:center;font-weight:600;font-size:11px">
                  Total Credits : ${totalCredits}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;padding:0 8px;margin-bottom:24px">
          <div style="width:33%"></div>
          <div style="width:33%;text-align:center;font-size:14px;font-weight:700;color:black">SGPA: ${sem.sgpa?.toFixed(2)}</div>
          <div style="width:33%;text-align:right;font-size:9px;font-weight:700;line-height:1.4">Note : S - Satisfactory, NS - Not Satisfactory</div>
        </div>

        ${cgpaRow}
      </div>

      <!-- Signatures -->
      <div style="margin-top:auto;padding-top:48px;display:flex;justify-content:space-between;align-items:flex-end;font-size:10px;font-weight:700;color:black;padding-bottom:8px">
        <div style="padding-bottom:4px">
          DATE OF ISSUE : &nbsp;&nbsp;
          <span style="font-weight:700;border-bottom:1.5px dashed black;min-width:80px;display:inline-block;text-align:center;padding-bottom:2px">
            ${new Date().toLocaleDateString('en-GB')}
          </span>
        </div>
        <div style="text-align:center;display:flex;flex-direction:column;align-items:center">
          <div style="height:24px;margin-bottom:4px;border-bottom:1.5px solid black;width:112px;opacity:0.8"></div>
          VERIFIED BY
          <span style="font-weight:400;margin-top:2px;opacity:0.8;font-size:9px">Clerk</span>
        </div>
        <div style="text-align:center;display:flex;flex-direction:column;align-items:center">
          <div style="height:24px;margin-bottom:4px;border-bottom:1.5px solid black;width:144px;opacity:0.8"></div>
          PRINCIPAL
        </div>
      </div>
    </div>
  `;
  return div;
};

/* ─────────────────────────────────────────────
   PrintButton – reusable styled button
────────────────────────────────────────────── */
const PrintButton = ({ onClick, children, variant = "default" }) => {
  const base = "inline-flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95";
  const variants = {
    default: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    primary: "bg-black text-white hover:bg-gray-800 border border-black",
    outline: "bg-transparent border border-green-700 text-green-700 hover:bg-green-50",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]}`}>
      {/* Printer icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
      </svg>
      {children}
    </button>
  );
};

/* ─────────────────────────────────────────────
   Main Page
────────────────────────────────────────────── */
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

  const currentSemester = resultsData?.semesters?.length > 0
    ? resultsData.semesters[resultsData.semesters.length - 1]
    : null;

  // Past = all except last, shown newest-first in UI
  const pastSemesters = resultsData?.semesters?.length > 1
    ? [...resultsData.semesters].slice(0, resultsData.semesters.length - 1).reverse()
    : [];

  // All semesters in chronological order (oldest → newest) for Print All
  const allSemestersChronological = resultsData?.semesters
    ? [...resultsData.semesters] // already chronological from API
    : [];

  /* ── Print handlers ── */

  const handlePrintSingle = (sem, showCgpa) => {
    const node = buildMemoHTML(resultsData, sem, showCgpa);
    printMemos([node]);
  };

  const handlePrintAll = () => {
    const nodes = allSemestersChronological.map((sem, idx) => {
      const isLast = idx === allSemestersChronological.length - 1;
      return buildMemoHTML(resultsData, sem, isLast); // CGPA only on final memo
    });
    printMemos(nodes);
  };

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
            <div className="text-center text-slate-500 mt-10">No results available yet.</div>
          ) : (
            <div className="w-full max-w-[900px] flex flex-col gap-12">

              {/* ── PRINT ALL button (top) ── */}
              <div className="flex justify-end print:hidden">
                <PrintButton variant="primary" onClick={handlePrintAll}>
                  Print All Memos ({allSemestersChronological.length})
                </PrintButton>
              </div>

              {/* ── CURRENT SEMESTER MEMO ── */}
              <div className="w-full flex flex-col gap-3">
                {/* Print button above current memo */}
                <div className="flex justify-end print:hidden">
                  <PrintButton
                    variant="default"
                    onClick={() => handlePrintSingle(currentSemester, true)}
                  >
                    Print This Memo
                  </PrintButton>
                </div>
                <MemoView resultsData={resultsData} sem={currentSemester} showCgpa={true} />
              </div>

              {/* ── PAST RESULTS ── */}
              {pastSemesters.length > 0 && (
                <div className="pt-8 border-t-2 border-[#1a1a1a]/20 print:hidden">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight">Past Results</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastSemesters.map((sem, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-600 transition-all rounded-lg flex flex-col group justify-between h-full">
                        {/* Card header */}
                        <button
                          onClick={() => setSelectedPastSemester(sem)}
                          className="text-left px-5 pt-4 pb-3 flex-1"
                        >
                          <span className="font-bold text-lg mb-1 block text-black">
                            Year {sem.year} <span className="text-gray-400 font-normal mx-1">&bull;</span> Sem {sem.semester}
                          </span>
                        </button>
                        {/* Card actions */}
                        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 gap-2">
                          <button
                            onClick={() => setSelectedPastSemester(sem)}
                            className="text-sm text-gray-600 font-medium flex items-center gap-1 hover:text-green-700 transition-colors"
                          >
                            View Memo
                            <span className="text-green-700 group-hover:translate-x-1 transition-transform inline-block">&rarr;</span>
                          </button>
                          <PrintButton
                            variant="outline"
                            onClick={() => handlePrintSingle(sem, false)}
                          >
                            Print
                          </PrintButton>
                        </div>
                      </div>
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

        {/* ── Modal for Past Results ── */}
        {selectedPastSemester && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 print:hidden lg:pl-64">
            <div className="relative w-full max-w-[950px] my-auto">
              <div className="flex justify-end items-center gap-3 mb-2">
                {/* Print button inside modal */}
                <PrintButton
                  variant="default"
                  onClick={() => handlePrintSingle(selectedPastSemester, false)}
                >
                  Print This Memo
                </PrintButton>
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
