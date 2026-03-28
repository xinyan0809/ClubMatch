"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Pencil, Sparkles, Heart, Users,
  GraduationCap, BookOpen, Brain,
  FileText, ChevronRight, Star, X, Check,
  MessageCircle, AlignLeft, Building2, Tag, Megaphone, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CLUBS, CATEGORIES, type Club, type Category } from "@/data/clubs";
import { avatarColour, TAG_COLOURS } from "@/components/discover/ClubCard";
import { AIRecommendationModal } from "@/components/AIRecommendationModal";

// ─────────────────────────────────────────────────────────────────────────────
//  SESSION CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_KEYS = [
  "cm_userName", "cm_userProfile", "cm_userRole", "cm_userUniversity",
  "cm_adminClubId", "cm_adminClubName", "cm_adminProfile",
];

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT TYPES
// ─────────────────────────────────────────────────────────────────────────────

type StudentField = "姓名" | "专业" | "MBTI" | "技能标签" | "个人介绍";

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

type AdminField = "社团全称" | "社团分类" | "招新宣言";

interface AdminProfile {
  clubFullName: string;
  clubCategory: string;
  slogan: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED HELPERS
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
      <Link href={ctaHref} className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95">
        {ctaLabel} <ChevronRight size={13} />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function StudentEditModal({
  field, initialValue, onSave, onClose,
}: {
  field: StudentField;
  initialValue: string;
  onSave: (field: StudentField, value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  useEffect(() => { setTimeout(() => (inputRef.current as HTMLElement)?.focus(), 50); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => { onSave(field, value.trim()); onClose(); };

  const placeholder: Record<StudentField, string> = {
    姓名:    "请输入你的真实姓名",
    专业:    "例：新闻传播学、计算机科学",
    MBTI:    "",
    技能标签: "例：Python, 视频剪辑, 公共演讲（逗号分隔）",
    个人介绍: "介绍一下你自己，兴趣爱好、特长、你想加入社团的原因…",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">编辑 {field}</h3>
            <p className="mt-0.5 text-xs text-gray-400">修改后点击「保存」立即生效</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{field}</label>
          {field === "MBTI" ? (
            <select ref={inputRef as React.RefObject<HTMLSelectElement>} value={value} onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all">
              <option value="">请选择 MBTI 类型</option>
              {MBTI_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : field === "个人介绍" ? (
            <textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} value={value} onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder[field]} rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all" />
          ) : (
            <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={value} onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder={placeholder[field]}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all" />
          )}
          {field === "技能标签" && <p className="mt-2 text-xs text-gray-400">多个技能请用英文逗号「,」隔开</p>}
          {field === "技能标签" && value.trim() && (
            <div className="mt-3"><p className="mb-1.5 text-[11px] font-semibold text-gray-500">预览</p><SkillPills raw={value} /></div>
          )}
        </div>
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95">取消</button>
          <button onClick={handleSave} disabled={field !== "MBTI" && !value.trim()}
            className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95",
              value.trim() || field === "MBTI" ? "bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-200" : "cursor-not-allowed bg-gray-200 text-gray-400")}>
            <Check size={14} />保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AdminEditModal({
  field, initialValue, onSave, onClose,
}: {
  field: AdminField;
  initialValue: string;
  onSave: (field: AdminField, value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => { setTimeout(() => (inputRef.current as HTMLElement)?.focus(), 50); }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleSave = () => { onSave(field, value.trim()); onClose(); };

  const placeholder: Record<AdminField, string> = {
    社团全称: "例：中国传媒大学机器人协会",
    社团分类: "",
    招新宣言: "例：以技术驱动创新，让每一位成员找到归属",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">编辑 {field}</h3>
            <p className="mt-0.5 text-xs text-gray-400">修改后点击「保存」立即生效</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{field}</label>
          {field === "社团分类" ? (
            <select ref={inputRef as React.RefObject<HTMLSelectElement>} value={value} onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all">
              <option value="">请选择社团分类</option>
              {CATEGORIES.filter((c) => c !== "全部").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input ref={inputRef as React.RefObject<HTMLInputElement>} type="text" value={value} onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder={placeholder[field]}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all" />
          )}
        </div>
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95">取消</button>
          <button onClick={handleSave} disabled={field !== "社团分类" && !value.trim()}
            className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95",
              value.trim() || field === "社团分类" ? "bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-200" : "cursor-not-allowed bg-gray-200 text-gray-400")}>
            <Check size={14} />保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT PROFILE
// ─────────────────────────────────────────────────────────────────────────────

function StudentProfile() {
  const [userName,   setUserName]   = useState("");
  const [userUni,    setUserUni]    = useState("中国传媒大学");
  const [major,      setMajor]      = useState("");
  const [mbti,       setMbti]       = useState("");
  const [skills,     setSkills]     = useState("");
  const [bio,        setBio]        = useState("");
  const [likedClubs, setLikedClubs] = useState<Club[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [editField,  setEditField]  = useState<StudentField | null>(null);
  const [aiOpen,     setAiOpen]     = useState(false);

  useEffect(() => {
    setUserName(localStorage.getItem("cm_userName")?.trim() || "");
    setUserUni(localStorage.getItem("cm_userUniversity")    || "中国传媒大学");

    const profile = JSON.parse(localStorage.getItem("cm_userProfile") || "{}");
    setMajor (profile.major  || "");
    setMbti  (profile.mbti   || "");
    setSkills(profile.skills || "");
    setBio   (profile.bio    || "");

    try {
      const raw = localStorage.getItem("clubmatch_liked_clubs");
      if (raw) {
        const ids = JSON.parse(raw) as number[];
        setLikedClubs(ALL_CLUBS.filter((c) => ids.includes(c.id)));
      }
    } catch { /* ignore */ }

    setIsHydrated(true);
  }, []);

  const handleSave = (field: StudentField, value: string) => {
    if (field === "姓名") {
      setUserName(value);
      localStorage.setItem("cm_userName", value);
      return;
    }
    const profile = JSON.parse(localStorage.getItem("cm_userProfile") || "{}");
    if (field === "专业")    { setMajor(value);  profile.major  = value; }
    if (field === "MBTI")    { setMbti(value);   profile.mbti   = value; }
    if (field === "技能标签") { setSkills(value); profile.skills = value; }
    if (field === "个人介绍") { setBio(value);    profile.bio    = value; }
    localStorage.setItem("cm_userProfile", JSON.stringify(profile));
  };

  const displayName = userName || "同学";
  const initial     = displayName[0];

  const rows: { icon: React.ElementType; label: StudentField | "高校"; value: string; editable: boolean }[] = [
    { icon: FileText,      label: "姓名",    value: displayName,   editable: true  },
    { icon: GraduationCap, label: "高校",    value: userUni,       editable: false },
    { icon: BookOpen,      label: "专业",    value: major || "—",  editable: true  },
    { icon: Brain,         label: "MBTI",   value: mbti  || "—",  editable: true  },
    { icon: Star,          label: "技能标签", value: skills || "—", editable: true  },
  ];

  return (
    <>
      {/* ── Profile Header ── */}
      <div className="relative rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-36 rounded-t-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 55%,#0ea5e9 100%)" }}>
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
        </div>
        <div className={cn("absolute left-6 top-[88px] z-10 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-primary-600 shadow-lg text-3xl font-black text-white select-none transition-opacity duration-300", !isHydrated && "opacity-0")}>
          {initial}
        </div>
        <div className="px-6 pb-6 pt-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={cn("text-2xl font-extrabold text-gray-900 transition-opacity", !isHydrated && "opacity-0")}>{displayName}</h1>
                <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[11px] font-bold text-primary-700">在校学生</span>
              </div>
              <p className="mt-0.5 text-sm text-gray-400">{userUni}</p>
            </div>
            <button onClick={() => setAiOpen(true)}
              className="flex items-center gap-2 rounded-2xl px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-sm font-extrabold text-white shadow-lg shadow-orange-200/70 ring-1 ring-white/20 transition-all hover:brightness-110 hover:shadow-orange-300/80 active:scale-95">
              <Sparkles size={15} className="animate-pulse" />
              AI 社团推荐
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">✨ 完善下方信息后，点击「AI 社团推荐」获取智能匹配结果</p>
        </div>
      </div>

      {/* ── Personal Info ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-800">个人信息</h2>
        <div className="space-y-3">
          {rows.map(({ icon: Icon, label, value, editable }) => (
            <div key={label} className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                  <Icon size={14} className="text-primary-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gray-400">{label}</p>
                  {label === "技能标签" ? (
                    <div className="mt-1"><SkillPills raw={skills} /></div>
                  ) : (
                    <p className={cn("mt-0.5 truncate text-sm font-semibold", value === "—" ? "text-gray-300" : "text-gray-800")}>{value}</p>
                  )}
                </div>
              </div>
              {editable && (
                <button onClick={() => setEditField(label as StudentField)} aria-label={`编辑${label}`}
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95">
                  <Pencil size={10} />编辑
                </button>
              )}
            </div>
          ))}
          {/* Personal bio */}
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                  <AlignLeft size={14} className="text-primary-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gray-400">个人介绍</p>
                  {bio ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{bio}</p>
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold text-gray-300">—</p>
                  )}
                </div>
              </div>
              <button onClick={() => setEditField("个人介绍")} aria-label="编辑个人介绍"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95">
                <Pencil size={10} />编辑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Liked Clubs ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500" />
            <h2 className="text-sm font-bold text-gray-800">心动社团</h2>
          </div>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", likedClubs.length > 0 ? "bg-red-50 text-red-500 ring-1 ring-red-100" : "bg-gray-100 text-gray-400")}>
            {likedClubs.length}
          </span>
        </div>
        {likedClubs.length === 0 ? (
          <EmptySection icon={Heart} title="还没有收藏的社团" desc="在社团页面点击 ❤️，喜欢的社团会出现在这里" ctaLabel="去发现社团" ctaHref="/discover" />
        ) : (
          <div className="space-y-3">
            {likedClubs.map((club) => (
              <div key={club.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white", avatarColour(club.id))}>
                  {club.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{club.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {club.tags.slice(0, 2).map((tag, i) => (
                      <span key={tag} className={cn("rounded-full px-2 py-0 text-[10px] font-semibold ring-1", TAG_COLOURS[i % TAG_COLOURS.length])}>{tag}</span>
                    ))}
                  </div>
                </div>
                <Link href={`/messages?clubId=${club.id}`}
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-500">
                  <MessageCircle size={12} />去沟通
                </Link>
              </div>
            ))}
            <Link href="/discover"
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95">
              继续发现更多社团 <ChevronRight size={12} />
            </Link>
          </div>
        )}
      </div>

      {/* ── Joined Clubs ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary-500" />
            <h2 className="text-sm font-bold text-gray-800">已加入社团</h2>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">0</span>
        </div>
        <EmptySection icon={Users} title="还没有加入任何社团" desc="完成申请并通过面试后，你的社团会显示在这里" ctaLabel="立即去申请" ctaHref="/discover" />
      </div>

      {editField && (
        <StudentEditModal
          field={editField}
          initialValue={
            editField === "姓名"    ? (userName || "") :
            editField === "专业"    ? major  :
            editField === "MBTI"   ? mbti   :
            editField === "个人介绍" ? bio    :
            skills
          }
          onSave={handleSave}
          onClose={() => setEditField(null)}
        />
      )}
      {aiOpen && <AIRecommendationModal onClose={() => setAiOpen(false)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN PROFILE
// ─────────────────────────────────────────────────────────────────────────────

function AdminProfile() {
  const router = useRouter();

  const [adminClubName, setAdminClubName] = useState("");
  const [isHydrated,    setIsHydrated]    = useState(false);
  const [editField,     setEditField]     = useState<AdminField | null>(null);

  // Admin-specific profile fields (separate from student data)
  const [clubFullName,  setClubFullName]  = useState("");
  const [clubCategory,  setClubCategory]  = useState("");
  const [slogan,        setSlogan]        = useState("");

  useEffect(() => {
    const name = localStorage.getItem("cm_adminClubName") || "未知社团";
    setAdminClubName(name);

    // Load admin-specific profile — NEVER touches cm_userProfile
    const adminProfile: AdminProfile = JSON.parse(
      localStorage.getItem("cm_adminProfile") || "{}",
    );
    setClubFullName(adminProfile.clubFullName || name);
    setClubCategory(adminProfile.clubCategory || "");
    setSlogan      (adminProfile.slogan       || "");

    setIsHydrated(true);
  }, []);

  const handleSave = (field: AdminField, value: string) => {
    const adminProfile: AdminProfile = JSON.parse(
      localStorage.getItem("cm_adminProfile") || "{}",
    );
    if (field === "社团全称")  { setClubFullName(value);  adminProfile.clubFullName  = value; }
    if (field === "社团分类")  { setClubCategory(value);  adminProfile.clubCategory  = value; }
    if (field === "招新宣言")  { setSlogan(value);         adminProfile.slogan        = value; }
    localStorage.setItem("cm_adminProfile", JSON.stringify(adminProfile));
  };

  const handleLogout = () => {
    SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
    router.push("/login");
  };

  const initial = adminClubName[0] || "社";

  const adminRows: { icon: React.ElementType; label: AdminField; value: string }[] = [
    { icon: Building2, label: "社团全称", value: clubFullName || "—" },
    { icon: Tag,       label: "社团分类", value: clubCategory || "—" },
    { icon: Megaphone, label: "招新宣言", value: slogan       || "—" },
  ];

  return (
    <>
      {/* ── Admin Header ── */}
      <div className="relative rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-36 rounded-t-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f59e0b 0%,#d97706 40%,#b45309 100%)" }}>
          <div className="absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }} />
        </div>
        <div className={cn("absolute left-6 top-[88px] z-10 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-amber-500 shadow-lg text-3xl font-black text-white select-none transition-opacity duration-300", !isHydrated && "opacity-0")}>
          {initial}
        </div>
        <div className="px-6 pb-6 pt-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className={cn("text-2xl font-extrabold text-gray-900 transition-opacity", !isHydrated && "opacity-0")}>
                  {adminClubName}
                </h1>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">社团账号</span>
              </div>
              <p className="mt-0.5 text-sm text-gray-400">中国传媒大学 · 登录身份：{adminClubName} 负责人</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">管理社团主页信息，吸引更多优质学生申请 ✨</p>
        </div>
      </div>

      {/* ── Club Profile Management ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-800">社团主页管理</h2>
        <div className="space-y-3">
          {adminRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                  <Icon size={14} className="text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-gray-400">{label}</p>
                  <p className={cn("mt-0.5 truncate text-sm font-semibold", value === "—" ? "text-gray-300" : "text-gray-800")}>{value}</p>
                </div>
              </div>
              <button onClick={() => setEditField(label)} aria-label={`编辑${label}`}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-amber-300 hover:text-amber-600 active:scale-95">
                <Pencil size={10} />编辑
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-800">快捷入口</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/admin"
            className="flex items-center gap-3 rounded-2xl border border-primary-100 bg-primary-50 px-4 py-3.5 transition-all hover:bg-primary-100 active:scale-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
              <Users size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-700">招新管理</p>
              <p className="text-xs text-primary-500">查看申请人，处理面试</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-primary-400" />
          </Link>
          <Link href="/messages"
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 transition-all hover:bg-gray-100 active:scale-95">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-700">
              <MessageCircle size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700">消息中心</p>
              <p className="text-xs text-gray-400">与申请人沟通</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-gray-300" />
          </Link>
        </div>
      </div>

      {/* ── Account / Logout ── */}
      <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-gray-800">账号设置</h2>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3.5 text-left transition-all hover:bg-red-100 active:scale-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500">
            <LogOut size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-600">退出登录</p>
            <p className="text-xs text-red-400">清除当前会话，返回登录页</p>
          </div>
        </button>
      </div>

      {editField && (
        <AdminEditModal
          field={editField}
          initialValue={
            editField === "社团全称" ? clubFullName :
            editField === "社团分类" ? clubCategory :
            slogan
          }
          onSave={handleSave}
          onClose={() => setEditField(null)}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE — reads role and delegates to the correct view
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [roleKnown, setRoleKnown] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem("cm_userRole") === "admin");
    setRoleKnown(true);
  }, []);

  // Don't render children until we know the role — prevents flash of wrong view
  if (!roleKnown) return null;

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {isAdmin ? <AdminProfile /> : <StudentProfile />}
      </div>
    </div>
  );
}
