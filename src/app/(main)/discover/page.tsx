"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, LayoutGrid, Star, BookOpen, Rocket,
  Dumbbell, Heart, Target, Users, Sparkles, CheckCircle2,
} from "lucide-react";
import { ClubCard } from "@/components/discover/ClubCard";
import { ClubDetailModal } from "@/components/discover/ClubDetailModal";
import { AIRecommendationModal } from "@/components/AIRecommendationModal";
import { ALL_CLUBS, CATEGORIES, type Category, type Club } from "@/data/clubs";
import { cn } from "@/lib/utils";

// ── Category icons ────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  "全部":    <LayoutGrid size={15} />,
  "思想政治类": <Star      size={15} />,
  "学术科技类": <BookOpen  size={15} />,
  "创新创业类": <Rocket    size={15} />,
  "文化体育类": <Dumbbell  size={15} />,
  "志愿公益类": <Heart     size={15} />,
  "自律互助类": <Target    size={15} />,
};

// ─────────────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [query,        setQuery]        = useState("");
  const [category,     setCategory]     = useState<Category>("全部");
  const [liked,        setLiked]        = useState<Set<number>>(new Set());
  const [applied,      setApplied]      = useState<Set<number>>(new Set());
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [aiOpen,       setAiOpen]       = useState(false);
  const [toast,        setToast]        = useState(false);

  const likedKeyRef   = useRef("");
  const appliedKeyRef = useRef("");

  // Load liked + applied clubs from localStorage on mount
  useEffect(() => {
    const userName      = localStorage.getItem("cm_userName")?.trim() || "";
    likedKeyRef.current   = `liked_clubs_${userName}`;
    appliedKeyRef.current = `applied_clubs_${userName}`;
    try {
      const rawLiked = localStorage.getItem(likedKeyRef.current);
      if (rawLiked) setLiked(new Set(JSON.parse(rawLiked) as number[]));
    } catch { /* ignore */ }
    try {
      const rawApplied = localStorage.getItem(appliedKeyRef.current);
      if (rawApplied) setApplied(new Set(JSON.parse(rawApplied) as number[]));
    } catch { /* ignore */ }
  }, []);

  const toggleLike = (id: number) =>
    setLiked((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      localStorage.setItem(likedKeyRef.current, JSON.stringify([...s]));
      return s;
    });

  const handleApply = (id: number) => {
    setApplied((prev) => {
      const s = new Set(prev);
      s.add(id);
      localStorage.setItem(appliedKeyRef.current, JSON.stringify([...s]));
      return s;
    });
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CLUBS.filter((c) => {
      if (category !== "全部" && c.category !== category) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <header className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">社团广场</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            发现感兴趣的社团，开启你的大学故事 ✨
          </p>
        </header>

        {/* ── Two-column body ───────────────────────────────────────────── */}
        <div className="flex gap-6">

          {/* ════ LEFT: Category sidebar (hidden on mobile) ════ */}
          <aside className="hidden w-48 shrink-0 lg:block">
            <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                社团分类
              </p>
              {/* ✨ AI Smart Match — pinned above categories */}
              <button
                onClick={() => setAiOpen(true)}
                className="mb-2 flex w-full items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2.5 text-left text-sm font-bold text-white shadow-sm shadow-orange-200 transition-all hover:brightness-110 active:scale-95"
              >
                <Sparkles size={15} className="shrink-0" />
                AI 智能推荐
              </button>

              <nav className="flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      category === cat
                        ? "bg-primary-50 font-semibold text-primary-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    )}
                  >
                    <span className={cn(category === cat ? "text-primary-600" : "text-gray-400")}>
                      {CATEGORY_ICONS[cat]}
                    </span>
                    {cat}
                  </button>
                ))}
              </nav>

              {/* Liked clubs count */}
              {liked.size > 0 && (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 ring-1 ring-red-100">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <Heart size={12} fill="currentColor" />
                    心动社团 {liked.size} 个
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* ════ RIGHT: Search + card grid ════ */}
          <div className="min-w-0 flex-1">

            {/* ── Search bar ─────────────────────────────────────────────── */}
            <div className="relative mb-5">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索社团名称、标签或描述…"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
            </div>

            {/* Mobile category chips */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {/* AI chip — always first */}
              <button
                onClick={() => setAiOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-orange-200 transition-all hover:brightness-110 active:scale-95"
              >
                <Sparkles size={12} />
                AI 智能推荐
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    category === cat
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50",
                  )}
                >
                  {CATEGORY_ICONS[cat]}
                  {cat}
                </button>
              ))}
            </div>

            {/* ── Results meta ───────────────────────────────────────────── */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                找到
                <span className="mx-1 font-semibold text-gray-900">{filtered.length}</span>
                个社团
                {category !== "全部" && (
                  <span className="ml-1 text-gray-400">· {category}</span>
                )}
              </p>
              {applied.size > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
                  <Users size={11} />
                  已报名 {applied.size} 个
                </span>
              )}
            </div>

            {/* ── Club grid ──────────────────────────────────────────────── */}
            {filtered.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    isLiked={liked.has(club.id)}
                    isApplied={applied.has(club.id)}
                    onOpen={() => setSelectedClub(club)}
                    onLike={() => toggleLike(club.id)}
                    onApply={() => handleApply(club.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
                <Search size={32} className="text-gray-200" />
                <div>
                  <p className="font-semibold text-gray-700">没有找到相关社团</p>
                  <p className="mt-1 text-sm text-gray-400">
                    试试调整分类或修改搜索关键词
                  </p>
                </div>
                <button
                  onClick={() => { setQuery(""); setCategory("全部"); }}
                  className="mt-1 rounded-xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-500 active:scale-95"
                >
                  重置筛选
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Apply toast ──────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-2xl bg-gray-900/90 px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          报名成功！请留意主页的面试日程安排。
        </div>
      )}

      {/* ── AI Recommendation Modal ──────────────────────────────────────── */}
      {aiOpen && <AIRecommendationModal onClose={() => setAiOpen(false)} />}

      {/* ── Club detail modal ─────────────────────────────────────────────── */}
      {selectedClub && (
        <ClubDetailModal
          club={selectedClub}
          isLiked={liked.has(selectedClub.id)}
          isApplied={applied.has(selectedClub.id)}
          onClose={() => setSelectedClub(null)}
          onLike={() => toggleLike(selectedClub.id)}
          onApply={() => handleApply(selectedClub.id)}
        />
      )}
    </div>
  );
}
