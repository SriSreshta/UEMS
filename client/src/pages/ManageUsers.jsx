import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import {
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    PencilSquareIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// ─────────────────────────────────────────────────────────────────────────────
// Edit Student Modal
// ─────────────────────────────────────────────────────────────────────────────
const BRANCHES = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "N/A"];
const YEARS = ["1", "2", "3", "4"];
const SEMESTERS = ["1", "2"];

const EditStudentModal = ({ user, onClose, onSaved, authFetch }) => {
    const [form, setForm] = useState({
        username: user.username || "",
        email: user.email || "",
        year: user.year || "",
        semester: user.semester || "",
        department: user.department || "",
        section: user.section || "",
        resetCurrentSemesterEnrollments: false,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username.trim()) { setError("Name is required."); return; }
        if (!form.email.trim()) { setError("Email is required."); return; }
        if (!form.year) { setError("Year is required."); return; }
        if (!form.semester) { setError("Semester is required."); return; }

        setSaving(true);
        try {
            const res = await authFetch(`https://uems-rz8o.onrender.com/api/admin/users/${user.id}/student`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const text = await res.text();
            if (!res.ok) throw new Error(text || "Update failed");
            onSaved("Student updated successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">Edit Student</h2>
                        <p className="text-blue-200 text-xs mt-0.5">Roll: {user.rollNumber}</p>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/10">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Personal Details */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Personal Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={handleChange("username")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                    placeholder="Student name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                    placeholder="student@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Academic Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Year <span className="text-red-500">*</span></label>
                                <select
                                    value={form.year}
                                    onChange={handleChange("year")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                                >
                                    <option value="">Select</option>
                                    {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Semester <span className="text-red-500">*</span></label>
                                <select
                                    value={form.semester}
                                    onChange={handleChange("semester")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                                >
                                    <option value="">Select</option>
                                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Branch (Department)</label>
                                <select
                                    value={form.department}
                                    onChange={handleChange("department")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                                >
                                    <option value="">Select</option>
                                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                                <input
                                    type="text"
                                    value={form.section}
                                    onChange={handleChange("section")}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                                    placeholder="e.g. A, B"
                                    maxLength={5}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Reset Enrollment */}
                    <div className={`rounded-xl border p-4 transition-all ${form.resetCurrentSemesterEnrollments ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.resetCurrentSemesterEnrollments}
                                onChange={handleChange("resetCurrentSemesterEnrollments")}
                                className="mt-0.5 h-4 w-4 rounded accent-amber-500 cursor-pointer"
                            />
                            <div>
                                <span className="text-sm font-semibold text-slate-700">Reset current semester enrollments</span>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Use <strong>only</strong> if incorrect subjects were assigned. This removes the student's
                                    current semester enrollments and re-assigns correct ones. Past semester data is never affected.
                                </p>
                            </div>
                        </label>
                        {form.resetCurrentSemesterEnrollments && (
                            <div className="mt-3 flex items-center gap-2 text-amber-700 text-xs font-semibold bg-amber-100 rounded-lg px-3 py-2">
                                <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                                Current semester enrollments will be wiped and re-assigned from courses.
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="text-red-600 text-xs font-semibold bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:opacity-90 transition disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
const ManageUsers = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { authFetch } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authFetch("https://uems-rz8o.onrender.com/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [authFetch]);

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Are you sure you want to delete user ${username}? This will also delete associated student/faculty records from the database.`)) {
            return;
        }
        try {
            const res = await authFetch(`https://uems-rz8o.onrender.com/api/admin/users/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete user");
            setMessage({ type: "success", text: `User ${username} deleted successfully!` });
            fetchUsers();
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        }
    };

    const filteredUsers = users.filter(u => {
        if (u.role === 'ROLE_ADMIN') return false;
        const term = searchTerm.toLowerCase();
        const matchSearch = searchTerm === "" ||
            u.username.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.rollNumber && u.rollNumber.toLowerCase().includes(term)) ||
            (u.facultyCode && u.facultyCode.toLowerCase().includes(term));
        const matchRole = roleFilter === "" || u.role === roleFilter;
        const matchDept = deptFilter === "" || u.department === deptFilter;
        return matchSearch && matchRole && matchDept;
    });

    const hasActiveFilters = roleFilter || deptFilter;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={isOpen} role="admin" />
            <div className="flex-1 flex flex-col">
                <Header title="Manage Users" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />

                <main className="p-6 flex-1 overflow-y-auto">
                    {message.text && (
                        <div className={`p-4 mb-6 rounded-xl border flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            <div className={`w-2 h-2 rounded-full ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            {message.text}
                            <button onClick={() => setMessage({ type: "", text: "" })} className="ml-auto p-0.5 rounded-full hover:bg-black/5">
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">All Registered Users</h2>
                                    <p className="text-sm text-slate-400 mt-1">{filteredUsers.length} users found</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative w-full xl:w-64">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <MagnifyingGlassIcon className="h-5 w-5" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search name, email, roll no, faculty code..."
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <FunnelIcon className="h-5 w-5 text-gray-400 hidden xl:block" />
                                        <select
                                            className="block w-full sm:w-auto py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                        >
                                            <option value="">All Roles</option>
                                            <option value="ROLE_FACULTY">Faculty</option>
                                            <option value="ROLE_STUDENT">Student</option>
                                        </select>

                                        <select
                                            className="block w-full sm:w-auto py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={deptFilter}
                                            onChange={(e) => setDeptFilter(e.target.value)}
                                        >
                                            <option value="">All Depts</option>
                                            {[...new Set(users.map(u => u.department).filter(Boolean))].map(dept => (
                                                <option key={dept} value={dept}>{dept}</option>
                                            ))}
                                        </select>

                                    </div>
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <div className="flex flex-wrap items-center gap-2 mt-2 pt-4 border-t border-gray-100">
                                    <span className="text-sm font-medium text-gray-500 mr-2">Active Filters:</span>
                                    {roleFilter && (
                                        <span className="inline-flex items-center py-1 px-3 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                            Role: {roleFilter.replace('ROLE_', '')}
                                            <button onClick={() => setRoleFilter('')} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none"><XMarkIcon className="h-4 w-4" /></button>
                                        </span>
                                    )}
                                    {deptFilter && (
                                        <span className="inline-flex items-center py-1 px-3 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                            Dept: {deptFilter}
                                            <button onClick={() => setDeptFilter('')} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none"><XMarkIcon className="h-4 w-4" /></button>
                                        </span>
                                    )}
                                    <button
                                        onClick={() => { setRoleFilter(''); setDeptFilter(''); }}
                                        className="text-sm text-gray-500 hover:text-gray-700 ml-2"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No users found.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-left">
                                    <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">User Details</th>
                                            <th className="px-6 py-3">Role</th>
                                            <th className="px-6 py-3">Identity</th>
                                            <th className="px-6 py-3">Dept / Info</th>
                                            <th className="px-6 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">{u.username}</div>
                                                    <div className="text-sm text-gray-500">{u.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'ROLE_FACULTY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {u.role.replace('ROLE_', '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.rollNumber && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-400 text-xs">Roll: </span>
                                                            <span className="font-semibold text-gray-900">{u.rollNumber}</span>
                                                        </div>
                                                    )}
                                                    {u.facultyCode && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-400 text-xs">Code: </span>
                                                            <span className="font-semibold text-indigo-600">{u.facultyCode}</span>
                                                        </div>
                                                    )}
                                                    {!u.rollNumber && !u.facultyCode && (
                                                        <span className="text-gray-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{u.department || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {u.designation && `${u.designation}`}
                                                        {u.year && `Year: ${u.year} | Sem: ${u.semester}`}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {/* Edit button — only for students */}
                                                        {u.role === 'ROLE_STUDENT' && (
                                                            <button
                                                                onClick={() => setEditingUser(u)}
                                                                className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50 transition"
                                                                title="Edit Student"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(u.id, u.username)}
                                                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                            title="Delete User"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>

            {/* Edit Student Modal */}
            {editingUser && (
                <EditStudentModal
                    user={editingUser}
                    authFetch={authFetch}
                    onClose={() => setEditingUser(null)}
                    onSaved={(msg) => {
                        setEditingUser(null);
                        setMessage({ type: "success", text: msg });
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
};

export default ManageUsers;
