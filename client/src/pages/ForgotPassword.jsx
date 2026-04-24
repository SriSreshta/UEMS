import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const ForgotPassword = () => {
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role || "student");
  const [email, setEmail] = useState("");
  const [idValue, setIdValue] = useState(""); // Roll No / Faculty Code
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        email,
        ...(role === "student" ? { rollNumber: idValue } : { facultyCode: idValue })
      };

      await axiosInstance.post("/auth/forgot-password", payload);
      setMessage("If the details are correct, a password reset link has been sent to your email.");
      setEmail("");
      setIdValue("");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = () => {
    return role === "student" 
      ? { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", ring: "focus:ring-emerald-200" }
      : { bg: "from-blue-500 to-indigo-600", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", ring: "focus:ring-blue-200" };
  };

  const colors = getRoleColor();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className={`bg-gradient-to-r ${colors.bg} rounded-t-3xl p-8 text-center shadow-2xl`}>
          <div className="text-5xl mb-3">🔑</div>
          <h2 className="text-2xl font-black text-white">Forgot Password</h2>
          <p className="text-white/80 text-sm font-medium mt-1">Enter your details to receive a reset link.</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-3xl shadow-2xl shadow-slate-200/60 p-8 border border-slate-100 border-t-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {["student", "faculty"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setIdValue(""); setMessage(""); setError(""); }}
                    className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                      role === r 
                        ? `bg-gradient-to-r ${getRoleColor().bg} text-white shadow-lg scale-[1.02]` 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Email</label>
              <input
                type="email"
                placeholder="e.g. name@university.edu"
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl ${colors.ring} focus:ring-4 focus:border-transparent outline-none transition-all font-medium text-slate-700`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Roll Number / Faculty Code */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                {role === "student" ? "Roll Number" : "Faculty Code"}
              </label>
              <input
                type="text"
                placeholder={role === "student" ? "Enter your Roll Number" : "Enter your Faculty Code"}
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl ${colors.ring} focus:ring-4 focus:border-transparent outline-none transition-all font-medium text-slate-700`}
                value={idValue}
                onChange={e => setIdValue(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-200 bg-gradient-to-r ${colors.bg} ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </span>
              ) : "Send Reset Link"}
            </button>
          </form>

          {message && (
            <div className="mt-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-semibold rounded-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-xl flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-8 text-center pt-5 border-t border-slate-100">
            <Link to="/login" className="text-slate-500 font-semibold hover:text-blue-600 transition">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
