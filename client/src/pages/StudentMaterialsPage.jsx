import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { VideoCameraIcon, BookOpenIcon, DocumentTextIcon, LinkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const TYPE_META = {
  VIDEO: { label: "Video", icon: VideoCameraIcon, color: "bg-rose-50 text-rose-600 border-rose-100" },
  BOOK: { label: "Book / PDF", icon: BookOpenIcon, color: "bg-amber-50 text-amber-600 border-amber-100" },
  ARTICLE: { label: "Article/Link", icon: DocumentTextIcon, color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
};

export default function StudentMaterialsPage() {
  const { authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    authFetch("https://uems-rz8o.onrender.com/api/students/my-materials")
      .then(r => r.ok ? r.json() : [])
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, [authFetch]);

  const filtered = materials.filter(m => {
    const matchSearch = search === "" ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.courseName?.toLowerCase().includes(search.toLowerCase()) ||
      m.chapter?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || m.type === filterType;
    return matchSearch && matchType;
  });

  // Group by course, then chapter
  const byCourse = filtered.reduce((acc, m) => {
    const key = m.courseName || "Unknown Course";
    if (!acc[key]) acc[key] = {};
    const ch = m.chapter || "General";
    if (!acc[key][ch]) acc[key][ch] = [];
    acc[key][ch].push(m);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isOpen} role="student" />
      <div className="flex-1 flex flex-col">
        <Header title="Study Materials" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">Study Resources</h1>
            <p className="text-slate-500 text-sm mb-8">Chapter-wise books, videos, and articles for your enrolled courses.</p>

            {/* Filter bar */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="relative flex-1 min-w-48">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by title, course, chapter..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none"
                />
              </div>
              {["ALL", "VIDEO", "BOOK", "ARTICLE"].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-5 py-3 rounded-xl text-xs font-black uppercase transition ${filterType === t
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300"
                    }`}
                >
                  {t === "ALL" ? "All Types" : TYPE_META[t]?.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
              </div>
            ) : Object.keys(byCourse).length === 0 ? (
              <div className="h-72 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center gap-3">
                <BookOpenIcon className="h-12 w-12 text-slate-200" />
                <p className="text-slate-300 font-bold italic">No study materials found yet.</p>
                <p className="text-slate-300 text-xs">Faculty will upload resources for your courses soon.</p>
              </div>
            ) : Object.entries(byCourse).map(([courseName, chapters]) => (
              <div key={courseName} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-black text-slate-800">{courseName}</h2>
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs font-black text-slate-300 uppercase">{Object.values(chapters).flat().length} resources</span>
                </div>

                <div className="space-y-4">
                  {Object.entries(chapters).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([chapter, items]) => (
                    <div key={chapter} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chapter {chapter}</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {items.map(m => {
                          const meta = TYPE_META[m.type] || TYPE_META.ARTICLE;
                          const Icon = meta.icon;
                          return (
                            <a
                              key={m.id}
                              href={m.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-start gap-4 px-6 py-5 hover:bg-slate-50 transition group"
                            >
                              <div className={`shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center ${meta.color}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-800 group-hover:text-indigo-600 transition truncate">{m.title}</p>
                                {m.description && <p className="text-xs text-slate-500 mt-0.5 italic">{m.description}</p>}
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${meta.color}`}>{meta.label}</span>
                                </div>
                              </div>
                              <LinkIcon className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 shrink-0 mt-1 transition" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
