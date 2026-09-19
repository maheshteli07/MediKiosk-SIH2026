/**
 * Tabs.jsx – Controlled tab navigation.
 *
 * Variants:
 *   underline — bottom-border indicator (PatientShell, content areas)
 *   pill      — rounded toggle group (DoctorShell, toolbars)
 *
 * Props:
 *   tabs       — [{ id: string, label: string, disabled?: boolean }]
 *   activeTab  — currently selected tab id
 *   onChange   — (id: string) => void
 *   variant    — "underline" | "pill"
 *
 * Usage:
 *   const [tab, setTab] = useState("overview");
 *   <Tabs tabs={tabs} activeTab={tab} onChange={setTab} variant="pill" />
 */

import React from "react";

function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",
}) {
  return (
    <div
      role="tablist"
      aria-label="Tabs"
      className={[
        "flex",
        variant === "pill"
          ? "gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit"
          : "gap-0 border-b border-slate-200 dark:border-slate-700/60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={[
              "font-medium transition-all duration-150 focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1",
              "disabled:opacity-40 disabled:cursor-not-allowed",

              variant === "underline"
                ? [
                    "px-1 pb-3 pt-0.5 text-sm mr-6",
                    "border-b-2 -mb-px",
                    isActive
                      ? "border-primary-500 text-primary-600 dark:text-primary-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600",
                  ].join(" ")
                : [
                    "px-3 py-1.5 text-sm rounded-md",
                    isActive
                      ? "bg-white dark:bg-[#1e2535] text-primary-700 dark:text-primary-300 shadow-sm font-semibold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
                  ].join(" "),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
