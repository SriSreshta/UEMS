import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import {
  DocumentIcon,
  AcademicCapIcon,
  CloudArrowUpIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

export default function StudentDocumentStore({ type = "document" }) {
  const { user, authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [items, setItems] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isCert = type === "certificate";
  const pageTitle = isCert ? "My Certificates" : "My Documents";
  const emptyMessage = isCert
    ? "No certificates uploaded yet."
    : "No documents uploaded yet.";
  const emptySubMessage = isCert ? "Upload your achievement certificates here." : "Store your important documents here.";
  const IconProps = isCert ? AcademicCapIcon : DocumentIcon;

  // Fetch documents from backend
  const fetchDocuments = async () => {
    if (!user?.studentId) return;
    try {
      const res = await authFetch(`https://uems-rz8o.onrender.com/api/student/documents/${user.studentId}?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.studentId, type, authFetch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await authFetch(`https://uems-rz8o.onrender.com/api/student/documents/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert("Failed to delete document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDownload = (id) => {
    // Open in a new tab so it triggers the browser download
    const url = `https://uems-rz8o.onrender.com/api/student/documents/download/${id}`;
    // Fetch explicitly using authFetch to ensure the token is attached 
    // Usually browser downloads don't send auth headers, so we fetch Blob and trigger download
    authFetch(url)
      .then(r => r.blob())
      .then(blob => {
        const _url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = _url;
        // Ideally parse content-disposition header to get original filename
        a.download = "downloaded_file";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(_url);
        a.remove();
      })
      .catch(err => {
        console.error("Error downloading file", err);
      });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!user?.studentId) return;

    const formData = new FormData(e.target);
    const title = formData.get("title");
    const file = formData.get("file");

    if (title && file) {
      setIsUploading(true);
      try {
        const fd = new FormData();
        fd.append("title", title);
        fd.append("type", type);
        fd.append("file", file);

        const res = await authFetch(`https://uems-rz8o.onrender.com/api/student/documents/${user.studentId}`, {
          method: "POST",
          body: fd,
          // Do NOT set Content-Type header manually, let browser set multipart boundary
          headers: {}
        });

        if (res.ok) {
          const newItem = await res.json();
          setItems((prev) => [newItem, ...prev]);
          setUploadModalOpen(false);
        } else {
          alert("Failed to upload document.");
        }
      } catch (error) {
        console.error("Error uploading document:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Format size helper
  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header title={pageTitle} isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{pageTitle}</h1>
                <p className="text-slate-500 text-sm">Securely store and manage your {type}s.</p>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                Upload {type === "document" ? "Document" : "Certificate"}
              </button>
            </div>

            {items.length === 0 ? (
              <div className="h-72 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <IconProps className="h-12 w-12 text-slate-200" />
                <p className="text-slate-300 font-bold italic">{emptyMessage}</p>
                <p className="text-slate-400 text-xs">{emptySubMessage}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${isCert ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        <IconProps className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate" title={item.title}>
                          {item.title}
                        </h3>
                        <p className="font-medium text-slate-400 text-xs truncate mt-0.5" title={item.fileName}>
                          {item.fileName}
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-[11px] font-semibold text-slate-400">
                          <span>{formatDate(item.uploadedAt)}</span>
                          <span>&bull;</span>
                          <span>{formatSize(item.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDownload(item.id)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {uploadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-black text-slate-800">Upload {type === "document" ? "Document" : "Certificate"}</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder={isCert ? "e.g., Python Course Certificate" : "e.g., ID Proof"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 rounded-xl"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center"
                >
                  {isUploading ? "Uploading..." : "Confirm Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
