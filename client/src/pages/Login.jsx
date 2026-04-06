// client/src/pages/Login.jsx

import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Sanitization (Trim spaces)
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedRollNo = rollNo.trim();

    // 2. Validation (Check if empty after trimming)
    if (!trimmedUsername || !trimmedPassword || (role === "student" && !trimmedRollNo)) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    // 3. Login with sanitized data
    const ok = await login(trimmedUsername, trimmedPassword, trimmedRollNo);
    if (!ok) alert("Invalid credentials");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">JNTUH-UCESTH<br />UEMS Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Select Role:</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-2 p-2 border rounded-md"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          {role === "student" && (
            <input
              type="text"
              placeholder="Roll Number"
              className="w-full mb-2 p-2 border rounded-md"
              value={rollNo}
              onChange={e => setRollNo(e.target.value)}
            />
          )}
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 p-2 border rounded-md"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white py-2 rounded-md transition`}>
              {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            state={{ role }}
            className="text-blue-500 text-sm hover:underline"
          >
            Get Login Credentials or Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
