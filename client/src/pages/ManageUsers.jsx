import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import { TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const ManageUsers = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { authFetch } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await authFetch("http://localhost:8080/api/admin/users");
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
            const res = await authFetch(`http://localhost:8080/api/admin/users/${id}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete user");
            
            setMessage({ type: "success", text: `User ${username} deleted successfully!` });
            fetchUsers();
        } catch (err) {
            setMessage({ type: "error", text: err.message });
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.rollNumber && u.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar isOpen={isOpen} role="admin" />
            <div className="flex-1 flex flex-col">
                <Header title="Manage Users" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
                
                <main className="p-6 flex-1 overflow-y-auto">
                    {message.text && (
                        <div className={`p-4 mb-6 rounded border ${message.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h2 className="text-xl font-bold">All Registered Users</h2>
                            <div className="relative w-full md:w-80">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Search by username, email or roll no..." 
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
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
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'ROLE_FACULTY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {u.role.replace('ROLE_', '')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">{u.department || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {u.rollNumber && `Roll: ${u.rollNumber}`}
                                                        {u.designation && `Desig: ${u.designation}`}
                                                        {u.year && ` | Year: ${u.year} Sem: ${u.semester}`}
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
