/**
 * DoctorShell.jsx – Layout shell for all doctor-facing dashboard screens.
 *
 * Design intent:
 *   - Fixed sidebar (brand-slate #1B2430) with icon + label nav items.
 *   - Fixed top bar (white, border-bottom) with breadcrumb, page title, user info.
 *   - Dense layout: small text, compact spacing — this is a professional tool.
 *   - Two-pane: sidebar (fixed) + scrollable main content area.
 *   - Sun/Moon theme toggle in the top-bar (single location, affects all doctor pages).
 *
 * Props:
 *   children    — main content
 *   title       — page title shown in the top bar
 *   breadcrumb  — breadcrumb string above the title (optional)
 */

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileSearch,
  CheckCircle2,
  LogOut,
  Stethoscope,
  Sun,
  Moon,
} from "lucide-react";
import { ROUTES } from "@/shared/constants/routes.js";
import authService from "@/services/authService.js";
import { useTheme } from "@/App.jsx";

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
    to:    ROUTES.DOCTOR_CASES,
  },
  {
    label: "Approvals",
    icon:  CheckCircle2,
    to:    ROUTES.DOCTOR_APPROVALS,
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
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const currentUser = authService.getCurrentUser();
  const doctorName = currentUser?.sub
    ? currentUser.sub.split("@")[0].replace(/^dr\./i, "Dr. ")
    : "Dr. Demo";

  const handleSignOut = () => {
    authService.signOut();
    navigate(ROUTES.SIGN_IN || "/signin");
  };

  return (
    <div
      className="h-screen flex overflow-hidden bg-[#F6F7F9] dark:bg-[#0f1117]"
    >
      {/* ── Fixed Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className="w-60 shrink-0 flex flex-col overflow-hidden bg-[#1B2430] dark:bg-[#0d1117]"
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
              <span className="text-primary-300 text-xs font-semibold">
                {doctorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{doctorName}</p>
              <p className="text-white/40 text-[10px] truncate">MBBS · General</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className={[
              "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-left",
              "text-sm font-medium text-white/45 hover:text-white hover:bg-white/8",
              "transition-colors duration-150 cursor-pointer",
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
        <header className="shrink-0 h-14 bg-white dark:bg-[#141822] border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between px-6">
          <div className="min-w-0">
            {breadcrumb && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-0.5 truncate">
                {breadcrumb}
              </p>
            )}
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {title || "Dashboard"}
            </h1>
          </div>

          {/* Right-side actions: user info + theme toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{doctorName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">General Medicine</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <span className="text-primary-700 dark:text-primary-300 text-xs font-bold">
                {doctorName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* ── Theme Toggle ── */}
            <button
              type="button"
              onClick={toggle}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={[
                "h-8 w-8 rounded-lg flex items-center justify-center",
                "text-slate-500 dark:text-slate-400",
                "hover:bg-slate-100 dark:hover:bg-slate-700",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                "transition-colors duration-150",
              ].join(" ")}
            >
              {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default DoctorShell;
