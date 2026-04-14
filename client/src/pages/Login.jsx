// client/src/pages/Login.jsx

import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";
import logo from "../assets/jntuh-logo.png";

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

  const colors = { bg: "from-blue-600 to-indigo-800", ring: "ring-blue-200", border: "border-blue-200", text: "text-blue-700" };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* Left Panel: Branding & Logo */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-slate-900 border-r border-slate-800">
        {/* Animated fluid blur background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-6 p-12 text-center w-full max-w-4xl">
          <div className="w-40 h-40 bg-slate-800/50 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl border border-slate-700/50 flex items-center justify-center transform transition-transform hover:scale-105 duration-500 group">
            <img src={logo} alt="JNTUH Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-500" />
          </div>
          <div className="space-y-2.5">
            <h3 className="text-base md:text-lg font-bold text-orange-500 tracking-wide">
              University College of Engineering, Science & Technology Hyderabad
            </h3>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-snug drop-shadow-lg uppercase">
              Jawaharlal Nehru Technological University Hyderabad
            </h2>
            <p className="text-lg md:text-xl text-slate-200 font-semibold tracking-wide">
              University Management System
            </p>
            <p className="text-xs md:text-sm text-slate-400 font-medium">
              Kukatpally, Hyderabad - 500 085, Telangana, India
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center p-4 sm:p-8 xl:p-12 relative bg-slate-50 lg:bg-white overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-6 mt-4">
          <div className="inline-block w-20 h-20 bg-slate-900 rounded-[1.5rem] p-3 shadow-xl mb-4">
            <img src={logo} alt="JNTUH Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">JNTUH-UCESTH</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">University Management System</p>
        </div>
          
        <div className="w-full max-w-sm mx-auto my-auto">
          <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-slate-200/50 p-6 sm:p-8 border border-slate-100 relative">
            <div className="mb-6 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-2xl shadow-lg transform -rotate-6 transition-all duration-300`}>
                {getRoleIcon()}
              </div>
              <div>
                <h2 className={`text-xl font-black ${colors.text}`}>Welcome Back</h2>
                <p className="text-slate-500 text-xs font-medium">Please sign in to continue.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector (Dropdown) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Login As</label>
                <div className="relative group">
                  <select
                    value={role}
                    onChange={(e) => { setRole(e.target.value); setError(""); }}
                    className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:${colors.ring} focus:border-transparent outline-none appearance-none transition-all font-bold text-slate-700 cursor-pointer hover:bg-slate-100 text-sm`}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:${colors.ring} focus:border-transparent outline-none transition-all font-medium text-slate-700 hover:bg-slate-100 text-sm`}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              {/* Student: Roll Number */}
              {role === "student" && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Roll Number</label>
                  <input
                    type="text"
                    placeholder="Enter your Roll Number"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:${colors.ring} focus:border-transparent outline-none transition-all font-medium text-slate-700 hover:bg-slate-100 text-sm"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Faculty: Faculty Code */}
              {role === "faculty" && (
                <div className="animate-fadeIn">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Faculty Code</label>
                  <input
                    type="text"
                    placeholder="Enter your Faculty Code"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:${colors.ring} focus:border-transparent outline-none transition-all font-medium text-slate-700 hover:bg-slate-100 text-sm"
                    value={facultyCode}
                    onChange={e => setFacultyCode(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Password with toggle */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:${colors.ring} focus:border-transparent outline-none transition-all font-medium text-slate-700 hover:bg-slate-100 text-sm`}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${colors.bg} text-white py-3 rounded-lg font-bold text-sm shadow-xl hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
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
            <div className="mt-5 text-center pt-4 border-t border-slate-100">
              <Link
                to="/forgot-password"
                state={{ role }}
                className={`${colors.text} text-[11px] font-bold hover:underline transition uppercase tracking-wide`}
              >
                Get Login Credentials or Forgot Password?
              </Link>
            </div>
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
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        select::-ms-expand {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Login;
