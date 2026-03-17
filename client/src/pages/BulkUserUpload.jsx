import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const BulkUserUpload = () => {
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
      const res = await authFetch("http://localhost:8080/api/admin/upload-users", {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type header manually here.
        // Let the browser set it automatically with the correct boundary for multipart/form-data.
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
    <div className="p-10 min-h-[calc(100vh-64px)] bg-slate-50/30">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-10 text-slate-900 tracking-tight text-center">Bulk Excel Upload</h2>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
          <div className="mb-10 p-8 bg-indigo-50/40 border border-indigo-100 rounded-2xl text-indigo-900">
            <h3 className="font-bold text-xs mb-6 uppercase tracking-widest text-indigo-500">Format Requirements</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-200"></div>
                <span>File type must be <code className="bg-white px-2 py-0.5 rounded border border-indigo-100 text-indigo-600 font-bold">.xlsx</code></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-200"></div>
                <span>Row 1 must contain headers</span>
              </div>
              
              <div className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-indigo-50 mt-4">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 shadow-sm shadow-indigo-200"></div>
                <div className="flex-1">
                  <span className="block text-xs uppercase text-indigo-400 font-bold mb-2 tracking-tighter">Column Order Mapping</span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
                    <span className="text-slate-500">Col 1: <b className="text-indigo-600">username</b></span>
                    <span className="text-slate-500">Col 4: <b className="text-indigo-600">rollNumber / dept</b></span>
                    <span className="text-slate-500">Col 2: <b className="text-indigo-600">email</b></span>
                    <span className="text-slate-500">Col 5: <b className="text-indigo-600">year / designation</b></span>
                    <span className="text-slate-500">Col 3: <b className="text-indigo-600">role</b></span>
                    <span className="text-slate-500">Col 6: <b className="text-indigo-600">semester</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-sm shadow-indigo-200"></div>
                <span>Role must be strictly <code className="text-indigo-600 font-bold text-xs uppercase">"student"</code> or <code className="text-indigo-600 font-bold text-xs uppercase">"faculty"</code></span>
              </div>
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
                    className={`py-1.5 ${idx === 0 && msg.includes("completed") ? "text-cyan-400 font-bold border-b border-slate-800 pb-3 mb-3" : "text-slate-400"}`}
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
    </div>
  );
};

export default BulkUserUpload;
