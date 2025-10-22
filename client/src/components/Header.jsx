// FILE: client/src/components/Header.jsx
import React from "react";
import { useAuth } from "../auth/AuthContext";
import { Menu } from "lucide-react"; // replacing iconify with lucide-react for consistency

export default function Header({ title, toggleSidebar, isOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-3 inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm sm:text-base font-semibold">{title}</h1>
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
