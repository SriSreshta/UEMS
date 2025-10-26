import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Compose login payload based on role
    let ok = false;
    if (role === "student") {
      ok = await login(email, password, rollNo, role);
    } else if (role === "faculty") {
      ok = await login(email, password, facultyId, role);
    } else {
      ok = await login(adminId, password, undefined, role);
    }
    if (!ok) alert("Invalid credentials");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">
          JNTUH-UCESTH <br /> UEMS Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Select Role:</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-2 border rounded-md">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {role === "student" && (
            <>
              <input
                type="email"
                placeholder="Registered Mail ID"
                className="w-full mb-2 p-2 border rounded-md"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Roll Number"
                className="w-full mb-2 p-2 border rounded-md"
                value={rollNo}
                onChange={e => setRollNo(e.target.value)}
                required
              />
            </>
          )}
          {role === "faculty" && (
            <>
              <input
                type="email"
                placeholder="Registered Mail ID"
                className="w-full mb-2 p-2 border rounded-md"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Faculty ID"
                className="w-full mb-2 p-2 border rounded-md"
                value={facultyId}
                onChange={e => setFacultyId(e.target.value)}
                required
              />
            </>
          )}
          {role === "admin" && (
            <input
              type="text"
              placeholder="Admin ID"
              className="w-full mb-2 p-2 border rounded-md"
              value={adminId}
              onChange={e => setAdminId(e.target.value)}
              required
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
          <button type="submit" disabled={loading}
            className={`w-full ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white py-2 rounded-md transition`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-500 text-sm hover:underline">
            Get Login Credentials or Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
