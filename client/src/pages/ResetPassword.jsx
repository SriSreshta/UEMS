import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword
      });
      setMessage("Password reset successful! Redirecting to login...");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-500 text-center mb-8">Enter your new password below.</p>

        {!token && error ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <Link 
              to="/forgot-password" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Request New Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-10"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading || !token}
              className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition duration-200 ${
                loading || !token ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <div className="mt-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 text-sm rounded-r-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && token && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 text-sm rounded-r-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-8 text-center border-t pt-6">
          <Link to="/login" className="text-gray-500 font-medium hover:text-blue-600 transition">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
