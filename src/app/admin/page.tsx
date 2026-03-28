"use client";

import { useState, useEffect } from "react";
import { Users, Clock, CheckCircle2, XCircle, CalendarClock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Status = "待处理" | "已安排面试" | "已通过" | "已拒绝";

interface Applicant {
  id: number;
  name: string;      // always starts with "Mock - "
  major: string;
  mbti: string;
  matchScore: number;
  status: Status;
}

// ─────────────────────────────────────────────────────────────────────────────
//  MOCK DATA  — names MUST start with "Mock - " so viewers know it's demo data
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_APPLICANTS: Applicant[] = [
  { id: 1, name: "Mock - 张伟",   major: "新闻传播学",   mbti: "INFJ", matchScore: 94, status: "待处理"    },
  { id: 2, name: "Mock - 李娜",   major: "广播电视学",   mbti: "ENFP", matchScore: 88, status: "待处理"    },
  { id: 3, name: "Mock - 王芳",   major: "数字媒体技术", mbti: "INTJ", matchScore: 96, status: "已安排面试" },
  { id: 4, name: "Mock - 赵磊",   major: "播音主持",     mbti: "ENFJ", matchScore: 82, status: "已安排面试" },
  { id: 5, name: "Mock - 陈晓明", major: "传播学",       mbti: "ISFP", matchScore: 75, status: "已通过"    },
  { id: 6, name: "Mock - 刘婷婷", major: "网络与新媒体", mbti: "ENTP", matchScore: 91, status: "待处理"    },
  { id: 7, name: "Mock - 孙浩",   major: "广告学",       mbti: "INFP", matchScore: 68, status: "待处理"    },
];

// ─────────────────────────────────────────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Status, string> = {
  "待处理":    "bg-amber-50  text-amber-700  ring-amber-200",
  "已安排面试": "bg-blue-50   text-blue-700   ring-blue-200",
  "已通过":    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "已拒绝":    "bg-red-50    text-red-700    ring-red-200",
};

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [clubName,    setClubName]    = useState("社团");
  const [applicants,  setApplicants]  = useState<Applicant[]>(MOCK_APPLICANTS);

  useEffect(() => {
    const name = localStorage.getItem("cm_adminClubName");
    if (name) setClubName(name);
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────────────
  const total       = applicants.length;
  const pending     = applicants.filter((a) => a.status === "待处理").length;
  const interviewing = applicants.filter((a) => a.status === "已安排面试").length;
  const highMatch   = applicants.filter((a) => a.matchScore >= 90).length;

  const handleAction = (id: number, action: "accept" | "reject") => {
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: action === "accept" ? "已安排面试" : "已拒绝" }
          : a,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              你好，<span className="text-primary-600">{clubName}</span> 负责人 👋
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric", month: "long", day: "numeric", weekday: "long",
              })}
              &nbsp;· 招新数据实时同步
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-primary-50 px-4 py-2.5 ring-1 ring-primary-100">
            <Sparkles size={14} className="text-primary-500" />
            <span className="text-xs font-semibold text-primary-700">AI 智能匹配已开启</span>
          </div>
        </header>

        {/* ── Metric cards ───────────────────────────────────────────────── */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="总报名人数"
            value={total}
            icon={Users}
            iconBg="bg-primary-50"
            iconColor="text-primary-600"
            sub={`其中 ${highMatch} 人 AI 匹配度 ≥ 90%`}
          />
          <MetricCard
            label="待处理"
            value={pending}
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
            sub="等待审核或安排面试"
          />
          <MetricCard
            label="已安排面试"
            value={interviewing}
            icon={CalendarClock}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            sub="面试进行中"
          />
        </div>

        {/* ── High-match callout ─────────────────────────────────────────── */}
        {highMatch > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                发现 {highMatch} 位高匹配度申请人
              </p>
              <p className="mt-0.5 text-xs text-amber-600">
                下方表格中 AI 匹配度 ≥ 90% 的行已高亮显示，建议优先安排面试。
              </p>
            </div>
          </div>
        )}

        {/* ── Applicant table ────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-sm font-bold text-gray-900">申请人列表</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              以下数据均为演示用途，姓名前缀「Mock -」标识为虚构数据。
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">姓名</th>
                  <th className="px-6 py-3">专业</th>
                  <th className="px-6 py-3">MBTI</th>
                  <th className="px-6 py-3">AI 匹配度</th>
                  <th className="px-6 py-3">状态</th>
                  <th className="px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applicants.map((a) => (
                  <tr
                    key={a.id}
                    className={cn(
                      "transition-colors hover:bg-gray-50",
                      a.matchScore >= 90 && "bg-amber-50/40",
                    )}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{a.name}</td>
                    <td className="px-6 py-4 text-gray-600">{a.major}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
                        {a.mbti}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              a.matchScore >= 90 ? "bg-amber-400" : a.matchScore >= 80 ? "bg-emerald-400" : "bg-gray-300",
                            )}
                            style={{ width: `${a.matchScore}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-bold",
                            a.matchScore >= 90 ? "text-amber-600" : a.matchScore >= 80 ? "text-emerald-600" : "text-gray-500",
                          )}
                        >
                          {a.matchScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "待处理" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(a.id, "accept")}
                            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-primary-500 active:scale-95"
                          >
                            <CheckCircle2 size={12} />
                            通过
                          </button>
                          <button
                            onClick={() => handleAction(a.id, "reject")}
                            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                          >
                            <XCircle size={12} />
                            拒绝
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="divide-y divide-gray-50 md:hidden">
            {applicants.map((a) => (
              <div
                key={a.id}
                className={cn("px-5 py-4", a.matchScore >= 90 && "bg-amber-50/40")}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{a.major}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-2.5 flex items-center gap-3">
                  <span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
                    {a.mbti}
                  </span>
                  <span className={cn("text-xs font-bold", a.matchScore >= 90 ? "text-amber-600" : "text-gray-500")}>
                    AI {a.matchScore}%
                  </span>
                </div>
                {a.status === "待处理" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAction(a.id, "accept")}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary-600 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-500 active:scale-95"
                    >
                      <CheckCircle2 size={12} />
                      通过
                    </button>
                    <button
                      onClick={() => handleAction(a.id, "reject")}
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-gray-100 py-2 text-xs font-semibold text-gray-600 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                    >
                      <XCircle size={12} />
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  METRIC CARD (inline — no separate file needed)
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  label, value, icon: Icon, iconBg, iconColor, sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", iconBg)}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  );
}
