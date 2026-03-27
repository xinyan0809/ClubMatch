"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Pencil, Sparkles, Heart, Users,
  GraduationCap, BookOpen, Brain,
  FileText, ChevronRight, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface InfoRow {
  icon: React.ElementType;
  label: string;
  value: string;
  editable: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT BUTTON
// ─────────────────────────────────────────────────────────────────────────────

function EditBtn({ label }: { label: string }) {
  return (
    <button
      aria-label={`编辑${label}`}
      className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95"
    >
      <Pencil size={10} />
      编辑
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMPTY STATE CARD
// ─────────────────────────────────────────────────────────────────────────────

function EmptySection({
  icon: Icon,
  title,
  desc,
  ctaLabel,
  ctaHref,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
        <Icon size={22} className="text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
      </div>
      <Link
        href={ctaHref}
        className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95"
      >
        {ctaLabel}
        <ChevronRight size={13} />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [userName,    setUserName]    = useState("");
  const [userRole,    setUserRole]    = useState("student");
  const [userUni,     setUserUni]     = useState("中国传媒大学");
  const [isHydrated,  setIsHydrated]  = useState(false);

  useEffect(() => {
    setUserName(localStorage.getItem("cm_userName")?.trim()    || "");
    setUserRole(localStorage.getItem("cm_userRole")            || "student");
    setUserUni (localStorage.getItem("cm_userUniversity")      || "中国传媒大学");
    setIsHydrated(true);
  }, []);

  const displayName = userName || "同学";
  const initial     = displayName[0];
  const isAdmin     = userRole === "admin";
  const roleLabel   = isAdmin ? "社长" : "在校学生";
  const roleBg      = isAdmin ? "bg-violet-100 text-violet-700" : "bg-primary-100 text-primary-700";

  const infoRows: InfoRow[] = [
    { icon: FileText,    label: "姓名",  value: displayName, editable: true  },
    { icon: GraduationCap, label: "高校", value: userUni,    editable: false },
    { icon: BookOpen,    label: "专业",  value: "—",         editable: true  },
    { icon: Brain,       label: "MBTI", value: "—",          editable: true  },
    { icon: Star,        label: "技能标签", value: "—",      editable: true  },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* ── Profile header card ────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

          {/* Cover banner */}
          <div
            className="relative h-28 sm:h-36"
            style={{
              background:
                "linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #0ea5e9 100%)",
            }}
          >
            {/* Dot pattern */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />

            {/* ✨ AI推荐 button — top-right, highly prominent */}
            <div className="absolute right-4 top-4">
              <Link
                href="/discover"
                className={cn(
                  "group flex items-center gap-2 rounded-2xl px-4 py-2.5",
                  "bg-gradient-to-r from-amber-400 to-orange-500",
                  "text-sm font-extrabold text-white",
                  "shadow-lg shadow-orange-300/50",
                  "ring-2 ring-white/30",
                  "transition-all duration-150",
                  "hover:shadow-orange-400/60 hover:brightness-105",
                  "active:scale-95",
                )}
              >
                <Sparkles size={15} className="animate-pulse" />
                AI 社团推荐
              </Link>
              <p className="mt-1 max-w-[180px] text-center text-[10px] leading-tight text-white/70">
                完善信息后点击，智能推荐适合你的社团
              </p>
            </div>
          </div>

          {/* Avatar + name row */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between">
              {/* Avatar — overlaps cover */}
              <div className="-mt-10 flex items-end gap-4">
                <div
                  className={cn(
                    "flex h-20 w-20 items-center justify-center rounded-2xl",
                    "border-4 border-white bg-primary-600 shadow-md",
                    "text-3xl font-black text-white",
                    !isHydrated && "opacity-0",
                  )}
                >
                  {initial}
                </div>
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-gray-900">
                      {isHydrated ? displayName : ""}
                    </h1>
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", roleBg)}>
                      {roleLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">{userUni}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Personal info card ─────────────────────────────── */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">个人信息</h2>
          <div className="space-y-4">
            {infoRows.map(({ icon: Icon, label, value, editable }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                    <Icon size={14} className="text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">{label}</p>
                    <p className={cn("truncate text-sm font-semibold", value === "—" ? "text-gray-300" : "text-gray-800")}>
                      {value}
                    </p>
                  </div>
                </div>
                {editable && <EditBtn label={label} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── 心动社团 ──────────────────────────────────────── */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <h2 className="text-sm font-bold text-gray-800">心动社团</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">
              0
            </span>
          </div>
          <EmptySection
            icon={Heart}
            title="还没有收藏的社团"
            desc="在社团页面点击❤️，喜欢的社团会出现在这里"
            ctaLabel="去发现社团"
            ctaHref="/discover"
          />
        </div>

        {/* ── 已加入社团 ────────────────────────────────────── */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              <h2 className="text-sm font-bold text-gray-800">已加入社团</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">
              0
            </span>
          </div>
          <EmptySection
            icon={Users}
            title="还没有加入任何社团"
            desc="完成申请并通过面试后，你的社团会显示在这里"
            ctaLabel="立即去申请"
            ctaHref="/discover"
          />
        </div>

      </div>
    </div>
  );
}
