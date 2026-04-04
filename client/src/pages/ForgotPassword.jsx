import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const ForgotPassword = () => {
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role || "student");
  const [email, setEmail] = useState("");
  const [idValue, setIdValue] = useState(""); // Roll No / Username
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
        ...(role === "student" ? { rollNumber: idValue } : { username: idValue })
      };

      await axiosInstance.post("/auth/forgot-password", payload);
      setMessage("If the details are correct, a password reset link has been sent to your email.");
      setEmail("");
      setIdValue("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Forgot Password</h2>
        <p className="text-gray-500 text-center mb-8">Enter your details to receive a reset link.</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Role</label>
            <select 
              value={role} 
              onChange={e => { setRole(e.target.value); setIdValue(""); setMessage(""); setError(""); }} 
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Email</label>
            <input
              type="email"
              placeholder="e.g. name@university.edu"
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {role === "student" ? "Roll Number" : "Username"}
            </label>
            <input
              type="text"
              placeholder={role === "student" ? "Enter your Roll Number" : "Enter your Username"}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              value={idValue}
              onChange={e => setIdValue(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition duration-200 ${
              loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded-r-lg">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg">
            {error}
          </div>
        )}

        <div className="mt-8 text-center border-t pt-6">
          <Link to="/login" className="text-blue-600 font-medium hover:underline transition">
            &larr; Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
