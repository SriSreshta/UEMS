// client/src/pages/Login.jsx

import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [facultyCode, setFacultyCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedRollNo = rollNo.trim();
    const trimmedFacultyCode = facultyCode.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (role === "student" && !trimmedRollNo) {
      setError("Roll Number is required for student login.");
      return;
    }

    if (role === "faculty" && !trimmedFacultyCode) {
      setError("Faculty Code is required for faculty login.");
      return;
    }

    setLoading(true);
    const ok = await login(trimmedUsername, trimmedPassword, trimmedRollNo, trimmedFacultyCode, role);
    if (!ok) setError("Invalid credentials. Please check your details.");
    setLoading(false);
  };

  const getRoleIcon = () => {
    switch (role) {
      case "student": return "🎓";
      case "faculty": return "👨‍🏫";
      case "admin": return "🔐";
      default: return "👤";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "student": return { bg: "from-emerald-500 to-teal-600", ring: "ring-emerald-200", border: "border-emerald-200", text: "text-emerald-600" };
      case "faculty": return { bg: "from-blue-500 to-indigo-600", ring: "ring-blue-200", border: "border-blue-200", text: "text-blue-600" };
      case "admin": return { bg: "from-purple-500 to-violet-600", ring: "ring-purple-200", border: "border-purple-200", text: "text-purple-600" };
      default: return { bg: "from-gray-500 to-gray-600", ring: "ring-gray-200", border: "border-gray-200", text: "text-gray-600" };
    }
  };

  const colors = getRoleColor();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Header Card */}
        <div className={`bg-gradient-to-r ${colors.bg} rounded-t-3xl p-8 text-center shadow-2xl`}>
          <div className="text-5xl mb-3">{getRoleIcon()}</div>
          <h1 className="text-2xl font-black text-white tracking-tight">JNTUH-UCESTH</h1>
          <p className="text-white/80 text-sm font-medium mt-1">University Examination Management System</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-3xl shadow-2xl shadow-slate-200/60 p-8 border border-slate-100 border-t-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Login As</label>
              <div className="grid grid-cols-3 gap-2">
                {["student", "faculty", "admin"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setError(""); }}
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

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter your name"
                className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:${colors.ring} focus:border-transparent outline-none transition-all font-medium text-slate-700`}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            {/* Student: Roll Number */}
            {role === "student" && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Roll Number</label>
                <input
                  type="text"
                  placeholder="Enter your Roll Number"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-transparent outline-none transition-all font-medium text-slate-700"
                  value={rollNo}
                  onChange={e => setRollNo(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Faculty: Faculty Code */}
            {role === "faculty" && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Faculty Code</label>
                <input
                  type="text"
                  placeholder="Enter your Faculty Code"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-transparent outline-none transition-all font-medium text-slate-700"
                  value={facultyCode}
                  onChange={e => setFacultyCode(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Password with toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:${colors.ring} focus:border-transparent outline-none transition-all font-medium text-slate-700`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r ${colors.bg} text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Authenticating...
                </span>
              ) : "Login"}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-6 text-center pt-5 border-t border-slate-100">
            <Link
              to="/forgot-password"
              state={{ role }}
              className={`${colors.text} text-sm font-semibold hover:underline transition`}
            >
              Get Login Credentials or Forgot Password?
            </Link>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
