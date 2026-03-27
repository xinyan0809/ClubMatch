"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Pencil, Sparkles, Heart, Users,
  GraduationCap, BookOpen, Brain,
  FileText, ChevronRight, Star, X, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

type EditableField = "姓名" | "专业" | "MBTI" | "技能标签";

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

// ─────────────────────────────────────────────────────────────────────────────
//  SKILL PILLS
// ─────────────────────────────────────────────────────────────────────────────

function SkillPills({ raw }: { raw: string }) {
  const tags = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!tags.length) return <span className="text-sm font-semibold text-gray-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
          {t}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function EditModal({
  field,
  initialValue,
  onSave,
  onClose,
}: {
  field: EditableField;
  initialValue: string;
  onSave: (field: EditableField, value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Focus the input when modal opens
  useEffect(() => {
    setTimeout(() => (inputRef.current as HTMLElement)?.focus(), 50);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => {
    onSave(field, value.trim());
    onClose();
  };

  const placeholder: Record<EditableField, string> = {
    姓名:   "请输入你的真实姓名",
    专业:   "例：新闻传播学、计算机科学",
    MBTI:   "",
    技能标签: "例：Python, 视频剪辑, 公共演讲（逗号分隔）",
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dialog */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">编辑 {field}</h3>
            <p className="mt-0.5 text-xs text-gray-400">修改后点击「保存」立即生效</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
            {field}
          </label>

          {field === "MBTI" ? (
            /* MBTI dropdown */
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            >
              <option value="">请选择 MBTI 类型</option>
              {MBTI_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            /* Text input */
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder={placeholder[field]}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            />
          )}

          {field === "技能标签" && (
            <p className="mt-2 text-xs text-gray-400">
              多个技能请用英文逗号「,」隔开，将自动显示为标签
            </p>
          )}

          {/* Live preview for skills */}
          {field === "技能标签" && value.trim() && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold text-gray-500">预览</p>
              <SkillPills raw={value} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={field !== "MBTI" && !value.trim()}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95",
              value.trim() || field === "MBTI"
                ? "bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-200"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
          >
            <Check size={14} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMPTY SECTION
// ─────────────────────────────────────────────────────────────────────────────

function EmptySection({
  icon: Icon, title, desc, ctaLabel, ctaHref,
}: {
  icon: React.ElementType; title: string; desc: string;
  ctaLabel: string; ctaHref: string;
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
        {ctaLabel} <ChevronRight size={13} />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  // ── Auth fields (from localStorage) ──────────────────────────────────────
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("student");
  const [userUni,  setUserUni]  = useState("中国传媒大学");

  // ── Editable profile fields ───────────────────────────────────────────────
  const [major,  setMajor]  = useState("");
  const [mbti,   setMbti]   = useState("");
  const [skills, setSkills] = useState(""); // comma-separated

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isHydrated, setIsHydrated] = useState(false);
  const [editField,  setEditField]  = useState<EditableField | null>(null);

  // ── Read from localStorage on mount ──────────────────────────────────────
  useEffect(() => {
    setUserName(localStorage.getItem("cm_userName")?.trim()       || "");
    setUserRole(localStorage.getItem("cm_userRole")               || "student");
    setUserUni (localStorage.getItem("cm_userUniversity")         || "中国传媒大学");

    const profile = JSON.parse(localStorage.getItem("cm_userProfile") || "{}");
    setMajor (profile.major  || "");
    setMbti  (profile.mbti   || "");
    setSkills(profile.skills || "");

    setIsHydrated(true);
  }, []);

  // ── Save a single edited field ────────────────────────────────────────────
  const handleSave = (field: EditableField, value: string) => {
    if (field === "姓名") {
      setUserName(value);
      localStorage.setItem("cm_userName", value);
      return;
    }

    // For profile fields, update state + persist JSON blob
    const profile = JSON.parse(localStorage.getItem("cm_userProfile") || "{}");
    if (field === "专业")   { setMajor(value);  profile.major  = value; }
    if (field === "MBTI")   { setMbti(value);   profile.mbti   = value; }
    if (field === "技能标签") { setSkills(value); profile.skills = value; }
    localStorage.setItem("cm_userProfile", JSON.stringify(profile));
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const displayName = userName || "同学";
  const initial     = displayName[0];
  const isAdmin     = userRole === "admin";
  const roleLabel   = isAdmin ? "社长" : "在校学生";
  const roleBg      = isAdmin
    ? "bg-violet-100 text-violet-700"
    : "bg-primary-100 text-primary-700";

  // ── Info rows definition ──────────────────────────────────────────────────
  const rows: { icon: React.ElementType; label: EditableField | "高校"; value: string; editable: boolean }[] = [
    { icon: FileText,      label: "姓名",   value: displayName,         editable: true  },
    { icon: GraduationCap, label: "高校",   value: userUni,             editable: false },
    { icon: BookOpen,      label: "专业",   value: major  || "—",       editable: true  },
    { icon: Brain,         label: "MBTI",  value: mbti   || "—",       editable: true  },
    { icon: Star,          label: "技能标签", value: skills || "—",     editable: true  },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* ══════════════════════════════════════════════
            PROFILE HEADER CARD
            Layout fix: wrapper has NO overflow-hidden.
            Avatar is absolute-positioned to safely
            overlap the banner without being clipped.
        ══════════════════════════════════════════════ */}
        <div className="relative rounded-3xl border border-gray-100 bg-white shadow-sm">

          {/* Banner — has its own overflow-hidden for dot grid + rounded top */}
          <div
            className="relative h-36 rounded-t-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 55%,#0ea5e9 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
          </div>

          {/* ── Avatar — absolutely positioned so it overlaps banner ── */}
          {/*   top-[88px] = banner(144px) - half-avatar(48px) - margin(8px) */}
          <div
            className={cn(
              "absolute left-6 top-[88px] z-10",
              "flex h-24 w-24 items-center justify-center",
              "rounded-2xl border-4 border-white bg-primary-600 shadow-lg",
              "text-3xl font-black text-white select-none",
              "transition-opacity duration-300",
              !isHydrated && "opacity-0",
            )}
          >
            {initial}
          </div>

          {/* ── Content below banner ───────────────────────────────── */}
          {/*   pt-16 (64px) clears the avatar that extends ~40px below banner */}
          <div className="px-6 pb-6 pt-16">
            <div className="flex flex-wrap items-start justify-between gap-4">

              {/* Name + role + university */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className={cn(
                      "text-2xl font-extrabold text-gray-900 transition-opacity",
                      !isHydrated && "opacity-0",
                    )}
                  >
                    {displayName}
                  </h1>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", roleBg)}>
                    {roleLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-400">{userUni}</p>
              </div>

              {/* ✨ AI 社团推荐 — prominent CTA */}
              <Link
                href="/discover"
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-5 py-3",
                  "bg-gradient-to-r from-amber-400 to-orange-500",
                  "text-sm font-extrabold text-white",
                  "shadow-lg shadow-orange-200/70",
                  "ring-1 ring-white/20",
                  "transition-all duration-150 hover:brightness-110 hover:shadow-orange-300/80",
                  "active:scale-95",
                )}
              >
                <Sparkles size={15} className="animate-pulse" />
                AI 社团推荐
              </Link>
            </div>

            {/* Sub-hint for the AI button */}
            <p className="mt-2 text-xs text-gray-400">
              ✨ 完善下方信息后，点击「AI 社团推荐」获取智能匹配结果
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            PERSONAL INFO CARD
        ══════════════════════════════════════════════ */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">个人信息</h2>
          <div className="space-y-3">
            {rows.map(({ icon: Icon, label, value, editable }) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                    <Icon size={14} className="text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-400">{label}</p>
                    {/* Skills get special pill rendering */}
                    {label === "技能标签" ? (
                      <div className="mt-1">
                        <SkillPills raw={skills} />
                      </div>
                    ) : (
                      <p
                        className={cn(
                          "mt-0.5 truncate text-sm font-semibold",
                          value === "—" ? "text-gray-300" : "text-gray-800",
                        )}
                      >
                        {value}
                      </p>
                    )}
                  </div>
                </div>

                {editable && (
                  <button
                    onClick={() => setEditField(label as EditableField)}
                    aria-label={`编辑${label}`}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95"
                  >
                    <Pencil size={10} />
                    编辑
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            LIKED CLUBS
        ══════════════════════════════════════════════ */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <h2 className="text-sm font-bold text-gray-800">心动社团</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">0</span>
          </div>
          <EmptySection
            icon={Heart}
            title="还没有收藏的社团"
            desc="在社团页面点击 ❤️，喜欢的社团会出现在这里"
            ctaLabel="去发现社团"
            ctaHref="/discover"
          />
        </div>

        {/* ══════════════════════════════════════════════
            JOINED CLUBS
        ══════════════════════════════════════════════ */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              <h2 className="text-sm font-bold text-gray-800">已加入社团</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">0</span>
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

      {/* ══════════════════════════════════════════════
          EDIT MODAL (portal-style — rendered at page root)
      ══════════════════════════════════════════════ */}
      {editField && (
        <EditModal
          field={editField}
          initialValue={
            editField === "姓名"   ? (userName || "") :
            editField === "专业"   ? major :
            editField === "MBTI"  ? mbti  :
            skills
          }
          onSave={handleSave}
          onClose={() => setEditField(null)}
        />
      )}
    </div>
  );
}
