import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { TrashIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ManageUsers = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { authFetch } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [deptFilter, setDeptFilter] = useState("");
    const [rollNoFilter, setRollNoFilter] = useState("");
    const [facultyCodeFilter, setFacultyCodeFilter] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authFetch("http://localhost:8081/api/admin/users");
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
            const res = await authFetch(`http://localhost:8081/api/admin/users/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete user");
            
            setMessage({ type: "success", text: `User ${username} deleted successfully!` });
            fetchUsers();
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        }
    };

    const filteredUsers = users.filter(u => {
        if (u.role === 'ROLE_ADMIN') return false;

        const matchSearch = searchTerm === "" || 
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.facultyCode && u.facultyCode.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchRole = roleFilter === "" || u.role === roleFilter;
        const matchDept = deptFilter === "" || u.department === deptFilter;
        const matchRoll = rollNoFilter === "" || (u.rollNumber && u.rollNumber.toLowerCase().includes(rollNoFilter.toLowerCase()));
        const matchFacultyCode = facultyCodeFilter === "" || (u.facultyCode && u.facultyCode.toLowerCase().includes(facultyCodeFilter.toLowerCase()));
        
        return matchSearch && matchRole && matchDept && matchRoll && matchFacultyCode;
    });

    const hasActiveFilters = roleFilter || deptFilter || rollNoFilter || facultyCodeFilter;

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
                                            placeholder="Search name, email, code..." 
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

                                        <input 
                                            type="text" 
                                            placeholder="Filter Roll No" 
                                            className="block w-full sm:w-auto py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={rollNoFilter}
                                            onChange={(e) => setRollNoFilter(e.target.value)}
                                        />

                                        <input 
                                            type="text" 
                                            placeholder="Filter Faculty Code" 
                                            className="block w-full sm:w-auto py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            value={facultyCodeFilter}
                                            onChange={(e) => setFacultyCodeFilter(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {hasActiveFilters && (
                                <div className="flex flex-wrap items-center gap-2 mt-2 pt-4 border-t border-gray-100">
                                    <span className="text-sm font-medium text-gray-500 mr-2">Active Filters:</span>
                                    
                                    {roleFilter && (
                                        <span className="inline-flex items-center py-1 px-3 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                            Role: {roleFilter.replace('ROLE_', '')}
                                            <button onClick={() => setRoleFilter('')} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none">
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </span>
                                    )}
                                    
                                    {deptFilter && (
                                        <span className="inline-flex items-center py-1 px-3 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                            Dept: {deptFilter}
                                            <button onClick={() => setDeptFilter('')} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none">
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </span>
                                    )}
                                    
                                    {rollNoFilter && (
                                        <span className="inline-flex items-center py-1 px-3 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                                            Roll No: {rollNoFilter}
                                            <button onClick={() => setRollNoFilter('')} className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none">
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </span>
                                    )}

                                    {facultyCodeFilter && (
                                        <span className="inline-flex items-center py-1 px-3 rounded-full text-sm bg-indigo-50 text-indigo-700 border border-indigo-200">
                                            Faculty Code: {facultyCodeFilter}
                                            <button onClick={() => setFacultyCodeFilter('')} className="ml-1.5 p-0.5 rounded-full hover:bg-indigo-100 focus:outline-none">
                                                <XMarkIcon className="h-4 w-4" />
                                            </button>
                                        </span>
                                    )}
                                    
                                    <button 
                                        onClick={() => {
                                            setRoleFilter('');
                                            setDeptFilter('');
                                            setRollNoFilter('');
                                            setFacultyCodeFilter('');
                                        }}
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
                                                            <span className="text-gray-400 text-xs">Roll:</span>{" "}
                                                            <span className="font-semibold text-gray-900">{u.rollNumber}</span>
                                                        </div>
                                                    )}
                                                    {u.facultyCode && (
                                                        <div className="text-sm">
                                                            <span className="text-gray-400 text-xs">Code:</span>{" "}
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
                                                    <button 
                                                        onClick={() => handleDelete(u.id, u.username)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                                                        title="Delete User"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
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
        </div>
    );
};

export default ManageUsers;
