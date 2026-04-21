import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const BulkUserUpload = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults([]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await authFetch("http://localhost:8081/api/admin/upload-users", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload users");
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults(["Error: " + err.message]);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Bulk User Upload" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="p-10 flex-1">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-10 text-slate-900 tracking-tight text-center">Bulk Excel Upload</h2>
            
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
              
              {/* Format Requirements */}
              <div className="mb-10 p-8 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-indigo-900">
                <h3 className="font-bold text-xs mb-6 uppercase tracking-widest text-indigo-500">📋 Excel Format Requirements</h3>
                <div className="space-y-3 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-200"></div>
                    <span>File type must be <code className="bg-white px-2 py-0.5 rounded border border-indigo-100 text-indigo-600 font-bold">.xlsx</code></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-200"></div>
                    <span>Row 1 must contain column headers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-200"></div>
                    <span>Role must be <code className="text-indigo-600 font-bold text-xs uppercase">"student"</code> or <code className="text-indigo-600 font-bold text-xs uppercase">"faculty"</code></span>
                  </div>
                </div>

                {/* Column Mapping Tables */}
                <div className="mt-6 space-y-4">
                  {/* Student columns */}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">🎓 Student Column Order</h4>
                    <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-emerald-50">
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col A</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col B</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col C</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col D</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col E</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col F</th>
                            <th className="px-3 py-2 text-left font-bold text-emerald-700">Col G</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Username</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Email</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Role</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Roll No</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Dept</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Year</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Semester</td>
                          </tr>
                          <tr className="text-slate-400">
                            <td className="px-3 py-1.5 border-t text-[11px]">John</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">john@uni.edu</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">student</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">21R11A05A1</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">CSE</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">3</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">1</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Faculty columns */}
                  <div>
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">👨‍🏫 Faculty Column Order</h4>
                    <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="px-3 py-2 text-left font-bold text-blue-700">Col A</th>
                            <th className="px-3 py-2 text-left font-bold text-blue-700">Col B</th>
                            <th className="px-3 py-2 text-left font-bold text-blue-700">Col C</th>
                            <th className="px-3 py-2 text-left font-bold text-blue-700">Col D</th>
                            <th className="px-3 py-2 text-left font-bold text-blue-700">Col E</th>
                            <th className="px-3 py-2 text-left font-bold text-blue-700">Col F</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Username</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Email</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Role</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Faculty Code</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Dept</td>
                            <td className="px-3 py-2 font-semibold text-slate-700 border-t">Designation</td>
                          </tr>
                          <tr className="text-slate-400">
                            <td className="px-3 py-1.5 border-t text-[11px]">Dr. Smith</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">smith@uni.edu</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">faculty</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">FAC001</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">CSE</td>
                            <td className="px-3 py-1.5 border-t text-[11px]">Asst. Prof</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Key notes */}
                <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-bold text-amber-700">⚠️ Key Validation Rules:</p>
                  <ul className="text-xs text-amber-600 mt-1 space-y-0.5 list-disc list-inside">
                    <li>Email must be <b>globally unique</b></li>
                    <li>Faculty Code must be <b>globally unique</b></li>
                    <li>Roll Number must be unique within <b>same dept + year + semester</b></li>
                    <li>Username (display name) <b>can be duplicated</b></li>
                  </ul>
                </div>
              </div>

              <div className="space-y-8">
                <div className="relative border-2 border-dashed border-indigo-100 rounded-2xl p-14 flex flex-col items-center justify-center transition-all hover:bg-indigo-50/30 hover:border-indigo-300 group cursor-pointer bg-slate-50/50">
                  <input 
                    type="file" 
                    accept=".xlsx" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <div className="text-indigo-600 font-bold text-lg mb-1">
                    {file ? file.name : "Choose Excel File"}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop or click to browse"}
                  </div>
                </div>

                <button 
                  onClick={handleUpload} 
                  disabled={loading || !file}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-lg shadow-lg shadow-indigo-200 tracking-tight"
                >
                  {loading ? "Processing Upload..." : "Upload & Sync Users"}
                </button>
              </div>

              {results.length > 0 && (
                <div className="mt-10 pt-10 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center">System Logs</h3>
                  <div className="bg-slate-900 rounded-2xl p-6 max-h-72 overflow-y-auto text-sm font-mono leading-relaxed border border-slate-800 shadow-2xl">
                    {results.map((msg, idx) => (
                      <div 
                        key={idx} 
                        className={`py-1.5 ${idx === 0 && msg.includes("completed") ? "text-cyan-400 font-bold border-b border-slate-800 pb-3 mb-3" : "text-slate-400 font-mono"}`}
                      >
                        <span className="text-slate-600 mr-2">[{idx + 1}]</span>
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default BulkUserUpload;
