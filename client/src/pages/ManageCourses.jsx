// FILE: client/src/pages/ManageCourses.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";

/* ─── tiny toast ─────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const bg = type === "success" ? "#22c55e" : "#ef4444";
  return (
    <div
      style={{
        position: "fixed", top: 24, right: 24, zIndex: 9999,
        background: bg, color: "#fff", padding: "12px 20px",
        borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.25)",
        display: "flex", alignItems: "center", gap: 12, minWidth: 260,
        animation: "fadeIn .25s ease",
      }}
    >
      <span style={{ flex: 1, fontSize: 14 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}

/* ─── spinner ─────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 16, height: 16,
      border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
      borderRadius: "50%", animation: "spin .7s linear infinite", marginRight: 8,
    }} />
  );
}

/* ─── label / input helpers ─────────────────────────────────────────────── */
const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 5 };
const inp = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: "1px solid #334155", background: "#0f172a",
  color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
};
const sel = { ...inp, cursor: "pointer" };
const btn = (color) => ({
  padding: "9px 18px", borderRadius: 7, border: "none", cursor: "pointer",
  fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center",
  background: color, color: "#fff", transition: "opacity .2s",
});

export default function ManageCourses() {
  /* ── state ── */
  const [courses, setCourses]     = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [toast, setToast]         = useState({ msg: "", type: "success" });

  // Create course form
  const [form, setForm] = useState({ name: "", code: "", department: "", year: "", semester: "" });
  const [creating, setCreating] = useState(false);

  // Assign faculty
  const [assign, setAssign] = useState({ courseId: "", facultyId: "" });
  const [assigning, setAssigning] = useState(false);

  /* ── helpers ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const loadCourses   = useCallback(() => api.get("/admin/courses").then(r => setCourses(r.data)).catch(() => {}), []);
  const loadFaculties = useCallback(() => api.get("/admin/faculties").then(r => setFaculties(r.data)).catch(() => {}), []);

  useEffect(() => { loadCourses(); loadFaculties(); }, [loadCourses, loadFaculties]);

  /* ── handlers ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.year || !form.semester) {
      showToast("Please fill all required fields.", "error"); return;
    }
    setCreating(true);
    try {
      await api.post("/admin/courses", { ...form, year: parseInt(form.year) });
      showToast("Course created successfully!");
      setForm({ name: "", code: "", department: "", year: "", semester: "" });
      await loadCourses();
    } catch {
      showToast("Failed to create course.", "error");
    } finally { setCreating(false); }
  };

  const handleAssign = async () => {
    if (!assign.courseId || !assign.facultyId) {
      showToast("Select both a course and a faculty member.", "error"); return;
    }
    setAssigning(true);
    try {
      await api.post("/admin/courses/assign", {
        courseId: parseInt(assign.courseId),
        facultyId: parseInt(assign.facultyId),
      });
      showToast("Faculty assigned successfully!");
      setAssign({ courseId: "", facultyId: "" });
      await loadCourses();
    } catch {
      showToast("Failed to assign faculty.", "error");
    } finally { setAssigning(false); }
  };

  /* ── render ── */
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Inter',sans-serif", padding: "32px 24px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 11px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid #1e293b; }
        th { color: #94a3b8; font-weight: 700; background: #1e293b; }
        tr:hover td { background: rgba(255,255,255,.03); }
        input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.2); }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, background: "linear-gradient(135deg,#818cf8,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Manage Courses
      </h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>Create courses and assign faculty members.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>

        {/* ── Create Course ── */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, border: "1px solid #334155" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#818cf8" }}>➕ Create New Course</h2>
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Course Name *</label>
              <input style={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Data Structures" />
            </div>
            <div>
              <label style={lbl}>Course Code *</label>
              <input style={inp} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} placeholder="e.g. CS301" />
            </div>
            <div>
              <label style={lbl}>Department</label>
              <input style={inp} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} placeholder="e.g. CSE" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Year *</label>
                <select style={sel} value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))}>
                  <option value="">Select</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Semester *</label>
                <select style={sel} value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                  <option value="">Select</option>
                  {[1, 2].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={creating} style={{ ...btn("#6366f1"), marginTop: 4, opacity: creating ? .6 : 1 }}>
              {creating && <Spinner />} {creating ? "Creating…" : "Create Course"}
            </button>
          </form>
        </div>

        {/* ── Assign Faculty ── */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, border: "1px solid #334155" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "#38bdf8" }}>🎓 Assign Faculty to Course</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={lbl}>Select Course</label>
              <select style={sel} value={assign.courseId} onChange={e => setAssign(p => ({ ...p, courseId: e.target.value }))}>
                <option value="">— choose course —</option>
                {courses.map(c => (
                  <option key={c.courseId} value={c.courseId}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>Select Faculty</label>
              <select style={sel} value={assign.facultyId} onChange={e => setAssign(p => ({ ...p, facultyId: e.target.value }))}>
                <option value="">— choose faculty —</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.username} — {f.department}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAssign} disabled={assigning} style={{ ...btn("#0ea5e9"), opacity: assigning ? .6 : 1, marginTop: 8 }}>
              {assigning && <Spinner />} {assigning ? "Assigning…" : "Assign Faculty"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Course List Table ── */}
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, border: "1px solid #334155", overflowX: "auto" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#e2e8f0" }}>📋 All Courses</h2>
        {courses.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "24px 0" }}>No courses found. Create one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th><th>Name</th><th>Code</th><th>Department</th>
                <th>Year</th><th>Semester</th><th>Assigned Faculty</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={c.courseId}>
                  <td style={{ color: "#64748b" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span style={{ background: "#1d4ed8", color: "#bfdbfe", borderRadius: 5, padding: "2px 8px", fontSize: 12 }}>{c.code}</span></td>
                  <td style={{ color: "#94a3b8" }}>{c.department || "—"}</td>
                  <td>{c.year ? `Year ${c.year}` : "—"}</td>
                  <td>{c.semester ? `Sem ${c.semester}` : "—"}</td>
                  <td>
                    {c.facultyName
                      ? <span style={{ color: "#4ade80" }}>✓ {c.facultyName} <span style={{ color: "#64748b", fontSize: 12 }}>({c.facultyDept})</span></span>
                      : <span style={{ color: "#ef4444", fontSize: 12 }}>Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
