"use client";

import { useState } from "react";
import {
  Search,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Applicant, Status } from "@/data/applicants";

// ── Status badge config ───────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  Pending:     "bg-amber-50  text-amber-700  ring-1 ring-amber-200",
  Interviewing:"bg-blue-50   text-blue-700   ring-1 ring-blue-200",
  Accepted:    "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Rejected:    "bg-red-50    text-red-600    ring-1 ring-red-200",
};

const STATUS_DOT: Record<Status, string> = {
  Pending:      "bg-amber-400",
  Interviewing: "bg-blue-500",
  Accepted:     "bg-emerald-500",
  Rejected:     "bg-red-400",
};

// ── MBTI type colouring ───────────────────────────────────────────────────────
const MBTI_STYLE: Record<string, string> = {
  INTJ: "bg-indigo-50 text-indigo-700",
  INTP: "bg-indigo-50 text-indigo-700",
  ENTJ: "bg-blue-50   text-blue-700",
  ENTP: "bg-blue-50   text-blue-700",
  INFJ: "bg-violet-50 text-violet-700",
  INFP: "bg-violet-50 text-violet-700",
  ENFJ: "bg-pink-50   text-pink-700",
  ENFP: "bg-pink-50   text-pink-700",
  ISTJ: "bg-gray-100  text-gray-700",
  ISFJ: "bg-teal-50   text-teal-700",
  ESTJ: "bg-gray-100  text-gray-700",
  ESFJ: "bg-teal-50   text-teal-700",
  ISTP: "bg-orange-50 text-orange-700",
  ISFP: "bg-rose-50   text-rose-700",
  ESTP: "bg-orange-50 text-orange-700",
  ESFP: "bg-rose-50   text-rose-700",
};

type SortKey = "name" | "matchScore" | "appliedAt" | null;
type SortDir = "asc" | "desc";

interface ApplicantTableProps {
  applicants: Applicant[];
  onStatusChange: (id: number, status: Status) => void;
}

export function ApplicantTable({ applicants, onStatusChange }: ApplicantTableProps) {
  const [query,      setQuery]     = useState("");
  const [statusFilter, setFilter]  = useState<Status | "All">("All");
  const [sortKey,    setSortKey]   = useState<SortKey>("appliedAt");
  const [sortDir,    setSortDir]   = useState<SortDir>("desc");
  const [hovered,    setHovered]   = useState<number | null>(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={13} className="text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp   size={13} className="text-primary-500" />
      : <ChevronDown size={13} className="text-primary-500" />;
  };

  // ── Filtering + sorting ─────────────────────────────────────────────────────
  const filtered = applicants
    .filter((a) => {
      const q = query.toLowerCase();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.major.toLowerCase().includes(q) ||
        a.mbti.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "All" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      let va: string | number = a[sortKey];
      let vb: string | number = b[sortKey];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const STATUS_OPTIONS: Array<Status | "All"> = ["All", "Pending", "Interviewing", "Accepted", "Rejected"];

  return (
    <div className="flex flex-col gap-0 rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">

      {/* ── Table toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Applicants</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtered.length} of {applicants.length} applicants
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, major, MBTI…"
              className="w-56 rounded-xl border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-xs text-gray-800 placeholder:text-gray-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="relative flex items-center gap-1.5">
            <Filter size={13} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setFilter(e.target.value as Status | "All")}
              className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-2 pr-6 text-xs text-gray-700 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70">
              {/* Applicant */}
              <th className="px-5 py-3 text-left">
                <button
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Applicant <SortIcon col="name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Major</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">MBTI</th>
              {/* Match Score */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => toggleSort("matchScore")}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Match <SortIcon col="matchScore" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              {/* Applied date */}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => toggleSort("appliedAt")}
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  Applied <SortIcon col="appliedAt" />
                </button>
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                  No applicants match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((a) => {
                const isHighMatch = a.matchScore >= 90;
                const isHovered   = hovered === a.id;

                return (
                  <tr
                    key={a.id}
                    onMouseEnter={() => setHovered(a.id)}
                    onMouseLeave={() => setHovered(null)}
                    className={cn(
                      "transition-colors",
                      isHighMatch
                        ? "bg-amber-50/60 hover:bg-amber-50"
                        : "bg-white hover:bg-gray-50/80"
                    )}
                  >
                    {/* ── Applicant name + avatar ──────────────────────── */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                            a.avatarBg
                          )}
                        >
                          {a.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900 truncate">
                              {a.name}
                            </span>
                            {isHighMatch && (
                              <Star
                                size={12}
                                className="shrink-0 fill-amber-400 text-amber-400"
                                aria-label="High match"
                              />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 truncate">{a.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* ── Major + year ─────────────────────────────────── */}
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-gray-800">{a.major}</span>
                      <br />
                      <span className="text-[11px] text-gray-400">{a.year}</span>
                    </td>

                    {/* ── MBTI ─────────────────────────────────────────── */}
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-0.5 text-xs font-bold",
                          MBTI_STYLE[a.mbti] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {a.mbti}
                      </span>
                    </td>

                    {/* ── Match score ──────────────────────────────────── */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Mini progress bar */}
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              a.matchScore >= 90 ? "bg-emerald-500" :
                              a.matchScore >= 75 ? "bg-primary-500" :
                              "bg-gray-400"
                            )}
                            style={{ width: `${a.matchScore}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            a.matchScore >= 90 ? "text-emerald-600" :
                            a.matchScore >= 75 ? "text-primary-600" :
                            "text-gray-500"
                          )}
                        >
                          {a.matchScore}%
                        </span>
                      </div>
                    </td>

                    {/* ── Status badge ─────────────────────────────────── */}
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          STATUS_STYLE[a.status]
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[a.status])} />
                        {a.status}
                      </span>
                    </td>

                    {/* ── Applied date ──────────────────────────────────── */}
                    <td className="px-4 py-3.5 text-xs text-gray-500 tabular-nums whitespace-nowrap">
                      {new Date(a.appliedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>

                    {/* ── Actions ──────────────────────────────────────── */}
                    <td className="px-5 py-3.5">
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1.5 transition-opacity",
                          isHovered ? "opacity-100" : "opacity-40"
                        )}
                      >
                        {/* View */}
                        <button
                          title="View application"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-all active:scale-90"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Approve */}
                        <button
                          title="Accept applicant"
                          disabled={a.status === "Accepted" || a.status === "Rejected"}
                          onClick={() => onStatusChange(a.id, "Accepted")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <CheckCircle size={13} />
                        </button>

                        {/* Reject */}
                        <button
                          title="Reject applicant"
                          disabled={a.status === "Accepted" || a.status === "Rejected"}
                          onClick={() => onStatusChange(a.id, "Rejected")}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <XCircle size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table footer ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-5 py-3">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> applicant{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          {["Pending", "Interviewing", "Accepted", "Rejected"].map((s) => {
            const count = applicants.filter((a) => a.status === s).length;
            return (
              <span
                key={s}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  STATUS_STYLE[s as Status]
                )}
              >
                {count} {s}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
