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

  // Login function: sends credentials to backend
  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const decoded = jwtDecode(data.token);

      const payload = {
        username: decoded.sub,
        role: decoded.role, // ROLE_ADMIN, ROLE_STUDENT, ROLE_FACULTY
        token: data.token,
      };

      sessionStorage.setItem("uems_user", JSON.stringify(payload));
      setUser(payload);

      // Map backend role to route
      let route = "";
      switch (payload.role) {
        case "ROLE_ADMIN":
          route = "/admin";
          break;
        case "ROLE_FACULTY":
          route = "/faculty";
          break;
        case "ROLE_STUDENT":
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

  // Logout function
  const logout = () => {
    sessionStorage.removeItem("uems_user");
    setUser(null);
    navigate("/login");
  };

  // Helper to add token automatically
  const authFetch = async (url, options = {}) => {
    if (!user?.token) throw new Error("Not authenticated");
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${user.token}`,
      },
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
