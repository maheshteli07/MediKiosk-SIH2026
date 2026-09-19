/**
 * DoctorShell.jsx – Layout shell for all doctor-facing dashboard screens.
 *
 * Design intent:
 *   - Fixed sidebar (brand-slate #1B2430) with icon + label nav items.
 *   - Fixed top bar (white, border-bottom) with breadcrumb, page title, user info.
 *   - Dense layout: small text, compact spacing — this is a professional tool.
 *   - Two-pane: sidebar (fixed) + scrollable main content area.
 *
 * Props:
 *   children    — main content
 *   title       — page title shown in the top bar
 *   breadcrumb  — breadcrumb string above the title (optional)
 */

import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileSearch,
  CheckCircle2,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { ROUTES } from "@/shared/constants/routes.js";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon:  LayoutDashboard,
    to:    ROUTES.DOCTOR_DASHBOARD,
    end:   true,
  },
  {
    label: "Patient Queue",
    icon:  Users,
    to:    ROUTES.PATIENT_QUEUE,
  },
  {
    label: "Cases",
    icon:  FileSearch,
    to:    "/doctor/cases",   // reserved for future sprint
  },
  {
    label: "Approvals",
    icon:  CheckCircle2,
    to:    "/doctor/approvals", // reserved for future sprint
  },
];

function NavItem({ label, icon: Icon, to, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2.5 rounded-lg",
          "text-sm font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          isActive
            ? "bg-primary-500 text-white"
            : "text-white/55 hover:text-white hover:bg-white/8",
        ].join(" ")
      }
    >
      <Icon size={16} strokeWidth={2} aria-hidden="true" />
      <span>{label}</span>
    </NavLink>
  );
}

function DoctorShell({ children, title, breadcrumb }) {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#F6F7F9" }}>
      {/* ── Fixed Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className="w-60 shrink-0 flex flex-col overflow-hidden"
        style={{ backgroundColor: "#1B2430" }}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <Stethoscope size={14} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight tracking-tight">
                MediKiosk
              </p>
              <p className="text-white/35 text-[10px] leading-none mt-0.5">
                Doctor Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Bottom — user info + logout */}
        <div className="shrink-0 px-3 py-4 border-t border-white/10">
          {/* User chip */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="h-7 w-7 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
              <span className="text-primary-300 text-xs font-semibold">D</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Dr. Demo</p>
              <p className="text-white/40 text-[10px] truncate">MBBS · General</p>
            </div>
          </div>

          <button
            className={[
              "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg",
              "text-sm font-medium text-white/45 hover:text-white hover:bg-white/8",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            ].join(" ")}
          >
            <LogOut size={16} aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Right column ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6">
          <div className="min-w-0">
            {breadcrumb && (
              <p className="text-[11px] text-slate-400 mb-0.5 truncate">
                {breadcrumb}
              </p>
            )}
            <h1 className="text-sm font-semibold text-slate-800 truncate">
              {title || "Dashboard"}
            </h1>
          </div>

          {/* Right-side actions (notifications, etc. can be added here) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-700">Dr. Demo</p>
              <p className="text-[10px] text-slate-400">General Medicine</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 text-xs font-bold">D</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default DoctorShell;
