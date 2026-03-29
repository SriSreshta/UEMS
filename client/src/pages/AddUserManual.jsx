import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";

const AddUserManual = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "student",
    rollNumber: "",
    year: "1",
    semester: "1",
    department: "",
    designation: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await authFetch("http://localhost:8081/api/admin/create-user", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to create user");
      }

      setMessage({ type: "success", text: "User created successfully!" });
      setFormData({
        username: "",
        email: "",
        role: "student",
        rollNumber: "",
        year: "1",
        semester: "1",
        department: "",
        designation: "",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 bg-pattern">
      <Sidebar isOpen={isOpen} role="admin" />
      <div className="flex-1 flex flex-col">
        <Header title="Manual User Creation" isOpen={isOpen} toggleSidebar={() => setIsOpen(!isOpen)} />
        <main className="p-10 flex-1">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-10 text-slate-900 tracking-tight text-center">Create New User</h2>
            
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
              {message.text && (
                <div className={`p-5 mb-8 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Username</label>
                    <input 
                      required 
                      type="text" 
                      name="username" 
                      placeholder="e.g. jdoe"
                      value={formData.username} 
                      onChange={handleChange} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Email</label>
                    <input 
                      required 
                      type="email" 
                      name="email" 
                      placeholder="e.g. jdoe@example.com"
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">System Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 cursor-pointer">
                    <option value="student">Student Account</option>
                    <option value="faculty">Faculty Member</option>
                  </select>
                </div>

                {formData.role === "student" && (
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Roll Number</label>
                        <input required type="text" name="rollNumber" placeholder="Roll #" value={formData.rollNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Department</label>
                        <input required type="text" name="department" placeholder="e.g. CSE" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Academic Year</label>
                        <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700">
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Semester</label>
                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700">
                          <option value="1">Sem 1</option>
                          <option value="2">Sem 2</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === "faculty" && (
                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Department</label>
                        <input required type="text" name="department" placeholder="e.g. CSE" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Designation</label>
                        <input required type="text" name="designation" placeholder="e.g. Asst. Professor" value={formData.designation} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                      </div>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 mt-8 font-black text-lg shadow-lg shadow-indigo-100 tracking-tight">
                  {loading ? "Creating User..." : "Confirm Creation"}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AddUserManual;
