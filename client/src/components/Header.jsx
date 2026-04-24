// FILE: client/src/components/Header.jsx
import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Menu, Home } from "lucide-react"; 
import { Link } from "react-router-dom";

export default function Header({ title, toggleSidebar, isOpen }) {
  const { user, logout } = useAuth();
  const homeRoute = user?.role === 'admin' ? '/admin' : user?.role === 'faculty' ? '/faculty' : '/student';

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-1 inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link 
          to={homeRoute}
          className="mr-3 inline-flex items-center justify-center rounded-md p-2 text-blue-600 hover:bg-blue-50 transition"
          title="Go to Dashboard"
        >
          <Home className="h-5 w-5" />
        </Link>
        <h1 className="text-sm sm:text-base font-semibold truncate max-w-[200px] sm:max-w-md">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          {user?.username} • {user?.role}
        </div>
        <button
          onClick={logout}
          className="border px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
