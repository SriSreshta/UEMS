// FILE: client/src/auth/AuthContext.jsx
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("uems_user");
    return stored ? JSON.parse(stored) : null;
  });

  // ✅ LOGIN FUNCTION
  const login = async (username, password, rollNumber, facultyCode, role) => {
    try {
      const res = await fetch("http://localhost:8081/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, rollNumber, facultyCode, role }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const decoded = jwtDecode(data.token);

      // Robust role extraction
      let rawRole = decoded.role || "";
      if (Array.isArray(rawRole)) rawRole = rawRole[0];
      const normalizedRole = rawRole.replace('ROLE_', '').toLowerCase();

      const payload = {
        username: data.username, // Display name from server response
        email: decoded.sub,      // JWT subject is now email
        role: normalizedRole, 
        token: data.token,
        facultyId: data.facultyId || null,
        studentId: data.studentId || null,
        facultyCode: data.facultyCode || null,
        year: data.year || null,
        semester: data.semester || null,
      };

      sessionStorage.setItem("uems_user", JSON.stringify(payload));
      setUser(payload);

      // Redirect based on role
      let route = "/";
      switch (payload.role) {
        case "admin":
          route = "/admin";
          break;
        case "faculty":
          route = "/faculty";
          break;
        case "student":
          route = "/student";
          break;
        default:
          route = "/login";
      }
      navigate(route);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    sessionStorage.removeItem("uems_user");
    setUser(null);
    navigate("/login");
  };

  // ✅ FETCH WRAPPER THAT ADDS TOKEN
  const authFetch = async (url, options = {}) => {
    if (!user?.token) throw new Error("Not authenticated");

    const headers = {
      Authorization: `Bearer ${user.token}`,
      ...options.headers,
    };

    // Only set Content-Type to JSON if body is NOT FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(url, {
      ...options,
      headers: headers,
    });
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
