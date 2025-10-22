// FILE: client/src/components/Sidebar.jsx
import { Fragment, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  UserCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BanknotesIcon,
  FolderIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../auth/AuthContext";

const baseItem =
  "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-100 hover:bg-slate-700/50 hover:text-white transition-colors";
const iconCls = "h-5 w-5 shrink-0 text-slate-200";
const sectionTitle = "px-3 pt-4 pb-2 text-[11px] uppercase tracking-wide text-slate-400";

function Collapse({ label, icon: Icon, isMini, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        className={`${baseItem} w-full ${open ? "bg-slate-700/40 text-white" : "text-slate-100"}`}
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <Icon className={`${iconCls}`} />
        {!isMini && <span className="flex-1 text-left">{label}</span>}
        {!isMini && (
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-96" : "max-h-0"}`}
        aria-hidden={!open}
      >
        <div className={`${isMini ? "hidden" : "pl-11 pr-2 py-1 space-y-1"}`}>{children}</div>
      </div>
    </div>
  );
}

function Item({ to = "#", label, icon: Icon, isMini }) {
  const location = useLocation();
  const active = to !== "#" && location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`${baseItem} ${active ? "bg-slate-700/50 text-white" : "text-slate-100"}`}
    >
      <Icon className={iconCls} />
      {!isMini && <span>{label}</span>}
    </Link>
  );
}

export default function Sidebar({ isOpen, role = "student" }) {
  const { user, logout } = useAuth();
  const isMini = !isOpen;

  const menu = useMemo(() => {
    if (role === "faculty") {
      return [
        { type: "profile" },
        { type: "section", title: "main" },
        {
          type: "collapse",
          label: "Attendance",
          icon: ClipboardDocumentListIcon,
          children: [
            { label: "In Process", icon: DocumentTextIcon, to: "/faculty/attendance/in-process" },
            { label: "Completed", icon: DocumentTextIcon, to: "/faculty/attendance/completed" },
          ],
        },
        {
          type: "collapse",
          label: "Internal Marks",
          icon: ChartBarIcon,
          children: [
            { label: "Mid Term 1", icon: AcademicCapIcon, to: "/faculty/internal/mid1" },
            { label: "Mid Term 2", icon: AcademicCapIcon, to: "/faculty/internal/mid2" },
            { label: "Assignment/Seminar", icon: AcademicCapIcon, to: "/faculty/internal/assignment" },
          ],
        },
        {
          type: "collapse",
          label: "External Marks",
          icon: AcademicCapIcon,
          children: [
            { label: "End Sem (Theory)", icon: AcademicCapIcon, to: "/faculty/external/endsem-theory" },
          ],
        },
      ];
    }
    if (role === "admin") {
      return [
        { type: "profile" },
        { type: "section", title: "manage" },
        { type: "item", label: "Manage Students", icon: UserCircleIcon, to: "/admin/students" },
        { type: "item", label: "Manage Faculty", icon: UserCircleIcon, to: "/admin/faculty" },
        {
          type: "collapse",
          label: "Exams & Schedules",
          icon: ClipboardDocumentListIcon,
          children: [
            { label: "Create Exams", icon: DocumentTextIcon, to: "/admin/exams/create" },
            { label: "Schedules", icon: DocumentTextIcon, to: "/admin/exams/schedule" },
            { label: "Publish Results", icon: ChartBarIcon, to: "/admin/exams/publish" },
          ],
        },
      ];
    }
    // student default
    return [
      { type: "profile" },
      { type: "section", title: "student" },
      { type: "item", label: "Student Documents", icon: DocumentTextIcon, to: "/student/documents" },
      { type: "item", label: "Certificates", icon: AcademicCapIcon, to: "/student/certificates" },
      {
        type: "collapse",
        label: "Payments",
        icon: BanknotesIcon,
        children: [
          { label: "Regular Exams", icon: BanknotesIcon, to: "/student/payments/regular" },
          { label: "Supplementary", icon: BanknotesIcon, to: "/student/payments/supply" },
        ],
      },
      { type: "item", label: "Course Materials", icon: FolderIcon, to: "/student/materials" },
      { type: "item", label: "Marks (Internal)", icon: ChartBarIcon, to: "/student/marks/internal" },
    ];
  }, [role]);

  return (
    <aside
      className={`bg-slate-800 text-slate-100 h-screen sticky top-0 flex flex-col transition-[width] duration-200 ${
        isOpen ? "w-64" : "w-16"
      }`}
      aria-label="Sidebar"
    >
      {/* Header / brand */}
      <div className="h-14 flex items-center px-3 border-b border-white/10">
        {!isMini && <span className="text-sm font-semibold">UEMS</span>}
      </div>

      {/* Profile */}
      <div className="px-3 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-white/5">
          <UserCircleIcon className={`${iconCls}`} />
          {!isMini && (
            <div className="leading-tight">
              <div className="text-sm font-medium text-slate-50">{user?.username ?? "User"}</div>
              <div className="text-xs text-slate-300 capitalize">{role}</div>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-1">
        {menu.map((m, idx) => {
          if (m.type === "section") {
            return !isMini ? (
              <div key={idx} className={sectionTitle}>
                {m.title}
              </div>
            ) : (
              <Fragment key={idx} />
            );
          }
          if (m.type === "item") {
            return <Item key={idx} {...m} isMini={isMini} />;
          }
          if (m.type === "collapse") {
            return (
              <Collapse key={idx} label={m.label} icon={m.icon} isMini={isMini}>
                {m.children.map((c, i) => (
                  <Item key={i} {...c} isMini={false} />
                ))}
              </Collapse>
            );
          }
          return null;
        })}
      </nav>

      {/* Logout fixed at bottom */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center justify-start gap-3 px-3 py-2 rounded-md text-sm bg-red-600 hover:bg-red-700"
        >
          <ArrowLeftOnRectangleIcon className={iconCls} />
          {!isMini && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
