// client/src/pages/ForgotPassword.jsx

import React, { useState } from "react";
import { useLocation } from "react-router-dom";

const ForgotPassword = () => {
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role || "student");
  const [username, setUsername] = useState("");
  const [id, setId] = useState(""); // Roll No/Faculty ID/Admin ID
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("If the entered details are correct and registered, you will receive further instructions.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Forgot Password</h2>
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
          <input
            type="text"
            placeholder={
              role === "student" ? "Roll Number" :
              role === "faculty" ? "Faculty ID" : "Admin ID"
            }
            className="w-full mb-2 p-2 border rounded-md"
            value={id}
            onChange={e => setId(e.target.value)}
            required
          />
          <button type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition">
            Submit
          </button>
        </form>
        {message && (
          <div className="mt-4 text-green-600 text-sm text-center">{message}</div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
