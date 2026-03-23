import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import axiosInstance from "../api/axiosInstance";
import {
  PlusIcon, TrashIcon, VideoCameraIcon,
  BookOpenIcon, DocumentTextIcon, LinkIcon, ArrowLeftIcon
} from "@heroicons/react/24/outline";

const TYPE_META = {
  VIDEO:   { label: "Video",        icon: VideoCameraIcon, color: "bg-rose-50 text-rose-600 border-rose-100" },
  BOOK:    { label: "Book / PDF",   icon: BookOpenIcon,    color: "bg-amber-50 text-amber-600 border-amber-100" },
  ARTICLE: { label: "Article/Link", icon: DocumentTextIcon, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
};

export default function FacultyMaterialsPage() {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [courses, setCourses]     = useState([]);
  const [courseId, setCourseId]   = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState({ show: false, msg: "", ok: true });
  const [form, setForm] = useState({ chapter: "", title: "", type: "VIDEO", fileUrl: "", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    axiosInstance.get("/faculty/courses")
      .then(r => setCourses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    axiosInstance.get(`/faculty/courses/${courseId}/materials`)
      .then(r => setMaterials(r.data)).catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, [courseId]);

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast({ show: false, msg: "", ok: true }), 4000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!courseId) return showToast("Please select a course first.", false);
    if (!form.title || !form.fileUrl || !form.chapter) return showToast("Chapter, title and URL are required.", false);
    setAdding(true);
    try {
      await axiosInstance.post(`/faculty/courses/${courseId}/materials`, { ...form, courseId: Number(courseId) });
      showToast("Resource added successfully!");
      setForm({ chapter: "", title: "", type: "VIDEO", fileUrl: "", description: "" });
      // Refresh
      const updated = await axiosInstance.get(`/faculty/courses/${courseId}/materials`);
      setMaterials(updated.data);
    } catch {
      showToast("Failed to add resource.", false);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/faculty/materials/${id}`);
      setMaterials(prev => prev.filter(m => m.id !== id));
      showToast("Resource removed.");
    } catch {
      showToast("Failed to remove.", false);
    }
  };

  // Group materials by chapter
  const byChapter = materials.reduce((acc, m) => {
    const ch = m.chapter || "General";
    if (!acc[ch]) acc[ch] = [];
    acc[ch].push(m);
    return acc;
  }, {});

  const inp = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition";
  const lbl = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="faculty" />
      <div className="flex-1 flex flex-col">
        <Header title="Study Materials" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8">
          {toast.show && (
            <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white text-sm font-black ${toast.ok ? "bg-emerald-600" : "bg-red-600"}`}>
              {toast.msg}
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <button onClick={() => navigate("/faculty")} className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-4 hover:translate-x-[-4px] transition-transform">
                <ArrowLeftIcon className="h-4 w-4" /> Dashboard
              </button>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Manage Study Resources</h1>
              <p className="text-slate-500 text-sm mt-1">Add chapter-wise books, videos, and articles for your courses.</p>
            </div>

            {/* Course selector */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <label className={lbl}>Select Course</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)} className={inp}>
                <option value="">— Choose a course —</option>
                {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.name} ({c.code})</option>)}
              </select>
            </div>

            {courseId && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Add form */}
                <div className="lg:col-span-2">
                  <form onSubmit={handleAdd} className="bg-white rounded-3xl p-8 border border-white shadow-xl shadow-slate-200/40 space-y-5 sticky top-24">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Add New Resource</p>

                    <div>
                      <label className={lbl}>Chapter</label>
                      <input placeholder="e.g. 1, 2, Introduction" value={form.chapter} onChange={e => setForm(p => ({...p, chapter: e.target.value}))} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Title</label>
                      <input placeholder="Resource title" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Type</label>
                      <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className={inp}>
                        <option value="VIDEO">📹 Video</option>
                        <option value="BOOK">📘 Book / PDF</option>
                        <option value="ARTICLE">📄 Article / Link</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>URL / Link</label>
                      <input placeholder="https://..." value={form.fileUrl} onChange={e => setForm(p => ({...p, fileUrl: e.target.value}))} className={inp} />
                    </div>
                    <div>
                      <label className={lbl}>Description (optional)</label>
                      <textarea rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} className={inp} />
                    </div>
                    <button type="submit" disabled={adding} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition disabled:opacity-50 active:scale-95">
                      <PlusIcon className="h-5 w-5" />
                      {adding ? "Adding..." : "Add Resource"}
                    </button>
                  </form>
                </div>

                {/* Materials list */}
                <div className="lg:col-span-3 space-y-6">
                  {loading ? (
                    <div className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />
                  ) : Object.keys(byChapter).length === 0 ? (
                    <div className="h-48 bg-white rounded-3xl border border-slate-100 flex items-center justify-center">
                      <p className="text-slate-300 font-bold italic">No resources yet. Add your first one →</p>
                    </div>
                  ) : Object.entries(byChapter).sort(([a],[b]) => a.localeCompare(b, undefined, {numeric: true})).map(([chapter, items]) => (
                    <div key={chapter} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Chapter {chapter}</span>
                        <span className="bg-indigo-50 text-indigo-500 text-[10px] font-black px-2 py-0.5 rounded-full">{items.length} resource{items.length !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {items.map(m => {
                          const meta = TYPE_META[m.type] || TYPE_META.ARTICLE;
                          const Icon = meta.icon;
                          return (
                            <div key={m.id} className="px-8 py-5 flex items-start gap-4 hover:bg-slate-50/50 transition group">
                              <div className={`shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center ${meta.color}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-800 truncate">{m.title}</p>
                                {m.description && <p className="text-xs text-slate-500 mt-0.5 italic">{m.description}</p>}
                                <a href={m.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-indigo-500 text-xs font-bold mt-2 hover:underline">
                                  <LinkIcon className="h-3.5 w-3.5" /> Open Link
                                </a>
                              </div>
                              <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 transition text-slate-300 hover:text-red-500 shrink-0">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
