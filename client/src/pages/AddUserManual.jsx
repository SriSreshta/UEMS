import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const AddUserManual = () => {
  const { authFetch } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "student",
    rollNumber: "",
    year: "",
    semester: "",
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
      const res = await authFetch("http://localhost:8080/api/admin/create-user", {
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
        year: "",
        semester: "",
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
    <div className="p-10 min-h-[calc(100vh-64px)] bg-slate-50/30">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-10 text-slate-900 tracking-tight text-center">Manual User Creation</h2>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-10">
          {message.text && (
            <div className={`p-5 mb-8 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
              <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-rose-500 shadow-sm shadow-rose-200'}`}></div>
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
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Email Address</label>
                <input 
                  required 
                  type="email" 
                  name="email" 
                  placeholder="e.g. jdoe@example.com"
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-slate-700" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">System Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSIjOTQ5OUI3Iiwgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xOSA5bC03IDctNy03Ii8+PC9zdmc+')] bg-[length:20px] bg-[right_1.25rem_center] bg-no-repeat">
                <option value="student">Student Account</option>
                <option value="faculty">Faculty Member</option>
              </select>
            </div>

            {formData.role === "student" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-slate-200"></div>
                  Student Profile
                </h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Roll Number</label>
                    <input required type="text" name="rollNumber" placeholder="Roll #" value={formData.rollNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Academic Year</label>
                    <select name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700">
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Semester</label>
                    <select name="semester" value={formData.semester} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700">
                      <option value="1">Sem 1</option>
                      <option value="2">Sem 2</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.role === "faculty" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-slate-200"></div>
                  Faculty Profile
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Department</label>
                    <input required type="text" name="department" placeholder="e.g. CSE" value={formData.department} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-tighter">Designation</label>
                    <input required type="text" name="designation" placeholder="e.g. Asst. Professor" value={formData.designation} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-sm font-bold text-slate-700" />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50 mt-8 font-black text-lg shadow-lg shadow-indigo-100 tracking-tight">
              {loading ? "Initializing User..." : "Execute User Creation"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserManual;
