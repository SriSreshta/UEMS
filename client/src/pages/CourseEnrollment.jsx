// FILE: client/src/pages/CourseEnrollment.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../api/axiosInstance";

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  if (!msg) return null;
  const bg = type === "success" ? "#22c55e" : type === "warning" ? "#f59e0b" : "#ef4444";
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: bg, color: "#fff", padding: "12px 20px",
      borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,.25)",
      display: "flex", alignItems: "center", gap: 12, minWidth: 280,
      animation: "fadeIn .25s ease",
    }}>
      <span style={{ flex: 1, fontSize: 14 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
    </div>
  );
}

/* ─── Spinner ─────────────────────────────────────────────────────────────── */
function Spinner({ size = 16 }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: "2px solid rgba(255,255,255,.35)", borderTopColor: "#fff",
      borderRadius: "50%", animation: "spin .7s linear infinite",
    }} />
  );
}

/* ─── Style constants ─────────────────────────────────────────────────────── */
const lbl = { display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 5 };
const inp = {
  width: "100%", padding: "9px 12px", borderRadius: 7,
  border: "1px solid #334155", background: "#0f172a",
  color: "#e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box",
};
const sel = { ...inp, cursor: "pointer" };
const btnStyle = (color, disabled) => ({
  padding: "10px 20px", borderRadius: 8, border: "none",
  background: disabled ? "#334155" : color, color: "#fff",
  fontWeight: 700, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer",
  display: "inline-flex", alignItems: "center", gap: 8,
  opacity: disabled ? 0.65 : 1, transition: "opacity .2s",
});

export default function CourseEnrollment() {
  /* ── State ── */
  const [courses, setCourses]       = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Filters
  const [filterYear, setFilterYear]   = useState("");
  const [filterSem,  setFilterSem]    = useState("");
  const [filterDept, setFilterDept]   = useState("");

  // Student data
  const [students,  setStudents]    = useState([]);
  const [enrolled,  setEnrolled]    = useState(new Set()); // studentIds already enrolled
  const [selected,  setSelected]    = useState(new Set()); // checked student ids

  // Loading flags
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [enrolling, setEnrolling]             = useState(false);
  const [loadingCourses, setLoadingCourses]   = useState(true);

  const [toast, setToast] = useState({ msg: "", type: "success" });

  /* ── Helpers ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4500);
  };

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try { const r = await api.get("/admin/courses"); setCourses(r.data); }
    catch { showToast("Failed to load courses.", "error"); }
    finally { setLoadingCourses(false); }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  /* Load already-enrolled students whenever course changes */
  useEffect(() => {
    if (!selectedCourseId) { setEnrolled(new Set()); return; }
    api.get(`/admin/enrollments/course/${selectedCourseId}`)
      .then(r => setEnrolled(new Set(r.data.map(e => e.studentId))))
      .catch(() => setEnrolled(new Set()));
    setSelected(new Set());
  }, [selectedCourseId]);

  /* ── Fetch filtered students ── */
  const handleFetchStudents = async () => {
    if (!filterYear || !filterSem) {
      showToast("Year and Semester are required to filter students.", "warning"); return;
    }
    setLoadingStudents(true);
    setStudents([]);
    setSelected(new Set());
    try {
      const params = { year: filterYear, semester: filterSem };
      if (filterDept) params.department = filterDept;
      const r = await api.get("/admin/students", { params });
      setStudents(r.data);
      if (r.data.length === 0) showToast("No students found for the selected filters.", "warning");
    } catch {
      showToast("Failed to fetch students.", "error");
    } finally { setLoadingStudents(false); }
  };

  /* ── Checkbox logic ── */
  const toggleStudent = (id) => {
    if (enrolled.has(id)) return; // already enrolled — cannot select
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const eligibleStudents = students.filter(s => !enrolled.has(s.id));
  const allSelected = eligibleStudents.length > 0 && eligibleStudents.every(s => selected.has(s.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligibleStudents.map(s => s.id)));
    }
  };

  /* ── Enroll ── */
  const handleEnroll = async () => {
    if (!selectedCourseId) { showToast("Please select a course first.", "error"); return; }
    if (selected.size === 0) { showToast("Select at least one student to enroll.", "warning"); return; }
    setEnrolling(true);
    try {
      const r = await api.post("/admin/enroll/bulk", {
        studentIds: [...selected],
        courseId: parseInt(selectedCourseId),
      });
      // Mark newly enrolled
      const newEnrolled = new Set(enrolled);
      selected.forEach(id => newEnrolled.add(id));
      setEnrolled(newEnrolled);
      setSelected(new Set());
      const msgs = r.data;
      const skipped = msgs.filter(m => m.includes("already enrolled")).length;
      const enrolled_count = msgs.length - skipped;
      showToast(`✅ Enrolled ${enrolled_count} student(s).${skipped ? ` ${skipped} skipped (already enrolled).` : ""}`, "success");
    } catch {
      showToast("Enrollment failed. Please try again.", "error");
    } finally { setEnrolling(false); }
  };

  /* ── Derived ── */
  const selectedCourse = courses.find(c => String(c.courseId) === String(selectedCourseId));

  /* ─── Render ─── */
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Inter',sans-serif", padding: "32px 24px" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .enroll-table { border-collapse: collapse; width: 100%; }
        .enroll-table th, .enroll-table td { padding: 11px 14px; text-align: left; font-size: 13px; border-bottom: 1px solid #1e293b; }
        .enroll-table th { color: #94a3b8; font-weight: 700; background: #1e293b; position: sticky; top: 0; }
        .enroll-table tr:hover td { background: rgba(255,255,255,.025); }
        .enroll-table input[type='checkbox'] { width: 15px; height: 15px; cursor: pointer; accent-color: #6366f1; }
        input:focus, select:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.2); }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />

      {/* ── Header ── */}
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, background: "linear-gradient(135deg,#a78bfa,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Course Enrollment
      </h1>
      <p style={{ color: "#64748b", marginBottom: 32, fontSize: 14 }}>Select a course, filter students, and enroll them in bulk.</p>

      {/* ── Step 1: Select Course ── */}
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, border: "1px solid #334155", marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#a78bfa" }}>Step 1 — Select Course</h2>
        {loadingCourses ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b" }}><Spinner /> Loading courses…</div>
        ) : (
          <div style={{ maxWidth: 480 }}>
            <label style={lbl}>Course</label>
            <select style={sel} value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setStudents([]); setSelected(new Set()); }}>
              <option value="">— select a course —</option>
              {courses.map(c => (
                <option key={c.courseId} value={c.courseId}>
                  {c.name} ({c.code}) — Year {c.year}, Sem {c.semester}
                </option>
              ))}
            </select>
          </div>
        )}
        {selectedCourse && (
          <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              ["Department", selectedCourse.department || "—"],
              ["Year", `Year ${selectedCourse.year}`],
              ["Semester", `Sem ${selectedCourse.semester}`],
              ["Faculty", selectedCourse.facultyName || "Unassigned"],
            ].map(([k, v]) => (
              <span key={k} style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "5px 14px", fontSize: 13 }}>
                <span style={{ color: "#64748b" }}>{k}: </span>
                <span style={{ fontWeight: 600, color: selectedCourse.facultyName || k !== "Faculty" ? "#e2e8f0" : "#ef4444" }}>{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Step 2: Filter Students ── */}
      <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, border: "1px solid #334155", marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#38bdf8" }}>Step 2 — Filter Students</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, alignItems: "end" }}>
          <div>
            <label style={lbl}>Year *</label>
            <select style={sel} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="">Select year</option>
              {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Semester *</label>
            <select style={sel} value={filterSem} onChange={e => setFilterSem(e.target.value)}>
              <option value="">Select semester</option>
              {[1, 2].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Department (optional)</label>
            <input style={inp} value={filterDept} onChange={e => setFilterDept(e.target.value)} placeholder="e.g. CSE" />
          </div>
          <button onClick={handleFetchStudents} disabled={loadingStudents} style={btnStyle("#6366f1", loadingStudents)}>
            {loadingStudents ? <Spinner /> : "🔍"} {loadingStudents ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* ── Step 3: Select & Enroll ── */}
      {students.length > 0 && (
        <div style={{ background: "#1e293b", borderRadius: 14, padding: 24, border: "1px solid #334155" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#4ade80" }}>
              Step 3 — Select &amp; Enroll &nbsp;
              <span style={{ fontSize: 13, color: "#64748b", fontWeight: 400 }}>
                ({students.length} student{students.length !== 1 ? "s" : ""} found · {enrolled.size} already enrolled)
              </span>
            </h2>
            <button
              onClick={handleEnroll}
              disabled={enrolling || selected.size === 0 || !selectedCourseId}
              style={btnStyle("#22c55e", enrolling || selected.size === 0 || !selectedCourseId)}
            >
              {enrolling ? <Spinner /> : "✅"}
              {enrolling ? "Enrolling…" : `Enroll ${selected.size > 0 ? `(${selected.size})` : ""} Selected`}
            </button>
          </div>

          <div style={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
            <table className="enroll-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      title="Select all eligible students"
                      disabled={eligibleStudents.length === 0} />
                  </th>
                  <th>#</th>
                  <th>Username</th>
                  <th>Roll Number</th>
                  <th>Email</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const isEnrolled = enrolled.has(s.id);
                  const isChecked  = selected.has(s.id);
                  return (
                    <tr key={s.id} style={{ opacity: isEnrolled ? 0.5 : 1 }}>
                      <td>
                        <input type="checkbox" checked={isChecked} disabled={isEnrolled}
                          onChange={() => toggleStudent(s.id)} />
                      </td>
                      <td style={{ color: "#64748b" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{s.username}</td>
                      <td>
                        <span style={{ background: "#1e3a5f", color: "#7dd3fc", borderRadius: 5, padding: "2px 8px", fontSize: 12 }}>
                          {s.rollNumber}
                        </span>
                      </td>
                      <td style={{ color: "#94a3b8", fontSize: 12 }}>{s.email}</td>
                      <td>Year {s.year}</td>
                      <td>Sem {s.semester}</td>
                      <td style={{ color: "#94a3b8" }}>{s.department || "—"}</td>
                      <td>
                        {isEnrolled
                          ? <span style={{ color: "#4ade80", fontSize: 12, fontWeight: 600 }}>✓ Enrolled</span>
                          : <span style={{ color: "#64748b", fontSize: 12 }}>Not enrolled</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
