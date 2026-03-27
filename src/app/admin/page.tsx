"use client";

import { useState } from "react";
import { Users, UserPlus, CalendarClock, Sparkles } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { ApplicantTable } from "@/components/admin/ApplicantTable";
import { APPLICANTS, STATS, type Status } from "@/data/applicants";

export default function AdminDashboardPage() {
  const [applicants, setApplicants] = useState(APPLICANTS);

  const handleStatusChange = (id: number, status: Status) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  // Derived — recalculate from live state so metric cards stay in sync
  const accepted     = applicants.filter((a) => a.status === "Accepted").length;
  const interviewing = applicants.filter((a) => a.status === "Interviewing").length;

  return (
    /* Scrollable main area */
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl space-y-7 px-8 py-8">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back,{" "}
                <span className="text-primary-600">Tech Club President</span>
              </h1>
              <span className="text-xl">👋</span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {new Date("2026-03-27").toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {" · "}
              Here&apos;s your recruitment snapshot for today.
            </p>
          </div>

          {/* AI Match banner */}
          <div className="flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-2.5 ring-1 ring-primary-100">
            <Sparkles size={15} className="text-primary-500" />
            <span className="text-xs font-semibold text-primary-700">
              Smart Match Active
            </span>
          </div>
        </div>

        {/* ── Metric cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <MetricCard
            label="Total Applicants"
            value={applicants.length}
            sub={`${accepted} accepted so far this season`}
            icon={Users}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
            trend="up"
            trendLabel="+4 this week"
          />
          <MetricCard
            label="New Today"
            value={STATS.newToday}
            sub="Applications received today"
            icon={UserPlus}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend="up"
            trendLabel="vs yesterday"
          />
          <MetricCard
            label="Interviews Scheduled"
            value={interviewing}
            sub="Awaiting interview completion"
            icon={CalendarClock}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            trend="flat"
            trendLabel="No change"
          />
        </div>

        {/* ── Smart Match callout ──────────────────────────────────────── */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <Star className="mt-0.5 shrink-0 fill-amber-400 text-amber-400" size={16} />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {applicants.filter((a) => a.matchScore >= 90).length} high-match applicants detected
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              Rows highlighted in yellow have a Smart Match score ≥ 90%. These are your strongest candidates — consider fast-tracking them to interview.
            </p>
          </div>
        </div>

        {/* ── Applicant table ──────────────────────────────────────────── */}
        <ApplicantTable
          applicants={applicants}
          onStatusChange={handleStatusChange}
        />
      </div>
    </main>
  );
}

// Inline import to avoid a separate file for a single usage
function Star(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 16, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0"
      {...rest}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
