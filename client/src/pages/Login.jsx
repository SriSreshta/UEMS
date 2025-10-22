// FILE: src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Login = () => {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // roll number / faculty ID / admin ID
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login({ email, username, password, role });
    if (!result.ok) {
      alert(result.message);
      return;
    }
    navigate(`/${result.role}`);
  };

  const renderCredentialFields = () => {
    switch (role) {
      case "student":
        return (
          <>
            <input
              type="email"
              placeholder="Registered Mail ID"
              className="w-full mb-3 p-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Roll Number"
              className="w-full mb-3 p-2 border rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        );
      case "faculty":
        return (
          <>
            <input
              type="email"
              placeholder="Registered Mail ID"
              className="w-full mb-3 p-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Faculty ID Number"
              className="w-full mb-3 p-2 border rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        );
      case "admin":
        return (
          <>
            <input
              type="email"
              placeholder="Registered Mail ID"
              className="w-full mb-3 p-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Admin ID"
              className="w-full mb-3 p-2 border rounded-md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-8 w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">
          JNTUH-UCESTH
          <br />
          UEMS Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Select Role:</label>
            <div className="flex flex-col space-y-2">
              {["student", "faculty", "admin"].map((r) => (
                <label key={r} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={r}
                    checked={role === r}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-blue-500"
                  />
                  <span className="capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {renderCredentialFields()}

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 border rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
