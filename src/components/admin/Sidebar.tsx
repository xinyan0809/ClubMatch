"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin",            label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/applicants", label: "Applicants",  icon: Users           },
  { href: "/admin/interviews", label: "Interviews",  icon: CalendarClock   },
  { href: "/admin/settings",   label: "Settings",    icon: Settings        },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* ── Logo ──────────────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
          <span className="text-sm font-bold text-white">CM</span>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-gray-900">
            Club<span className="text-primary-600">Match</span>
          </p>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Admin Portal
          </p>
        </div>
      </div>

      {/* ── Nav links ─────────────────────────────────────────── */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  "shrink-0 transition-colors",
                  isActive ? "text-primary-600" : "text-gray-400 group-hover:text-gray-600"
                )}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="text-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: club info + logout ────────────────────────── */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-1">
        {/* Club president card */}
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
            TC
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-800">
              Tech Club
            </p>
            <p className="truncate text-[11px] text-gray-400">President</p>
          </div>
        </div>

        <button className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut size={16} className="shrink-0 text-gray-400 group-hover:text-red-500 transition-colors" />
          Log out
        </button>
      </div>
    </aside>
  );
}
