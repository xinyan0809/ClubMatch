"use client";

import Link from "next/link";
import { Heart, MessageCircle, ClipboardList, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Club } from "@/data/clubs";

// ── Avatar colour derived from club id ────────────────────────────────────────
const AVATAR_COLOURS = [
  "bg-primary-600",
  "bg-violet-600",
  "bg-rose-500",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-fuchsia-600",
  "bg-orange-500",
  "bg-teal-600",
  "bg-indigo-600",
];
function avatarColour(id: number) {
  return AVATAR_COLOURS[(id - 1) % AVATAR_COLOURS.length];
}

// ── Tag colour cycling ─────────────────────────────────────────────────────────
const TAG_COLOURS = [
  "bg-primary-50 text-primary-700 ring-primary-200",
  "bg-violet-50  text-violet-700  ring-violet-200",
  "bg-amber-50   text-amber-700   ring-amber-200",
];

// ─────────────────────────────────────────────────────────────────────────────

interface ClubCardProps {
  club: Club;
  isLiked: boolean;
  isApplied: boolean;
  onLike: () => void;
  onApply: () => void;
}

export function ClubCard({ club, isLiked, isApplied, onLike, onApply }: ClubCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">

      {/* ── Top row: avatar + info + heart ────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Club avatar */}
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white",
              avatarColour(club.id),
            )}
          >
            {club.name[0]}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-bold text-gray-900">{club.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
              <Users size={11} />
              {club.members.toLocaleString()} 名成员
              {club.recruiting && (
                <span className="ml-1.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                  招新中
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Heart / 心动 toggle */}
        <button
          onClick={onLike}
          aria-label={isLiked ? "取消心动" : "加入心动社团"}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all active:scale-90",
            isLiked
              ? "bg-red-50 text-red-500 ring-1 ring-red-200"
              : "text-gray-300 hover:bg-gray-100 hover:text-gray-500",
          )}
        >
          <Heart
            size={19}
            className="transition-transform"
            fill={isLiked ? "currentColor" : "none"}
            strokeWidth={isLiked ? 0 : 1.8}
          />
        </button>
      </div>

      {/* ── Tags ──────────────────────────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {club.tags.map((tag, i) => (
          <span
            key={tag}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
              TAG_COLOURS[i % TAG_COLOURS.length],
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── Description ───────────────────────────────────────────────────── */}
      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600">
        {club.description}
      </p>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="mt-4 flex gap-2.5">
        {/* Primary: 去沟通 — passes club name so messages page can open the right chat */}
        <Link
          href={`/messages?club=${encodeURIComponent(club.name)}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-500 active:scale-95"
        >
          <MessageCircle size={14} />
          去沟通
        </Link>

        {/* Secondary: 去报名 */}
        <button
          onClick={onApply}
          disabled={isApplied}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-semibold transition-all active:scale-95",
            isApplied
              ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-600"
              : "border-primary-200 bg-white text-primary-600 hover:bg-primary-50",
          )}
        >
          <ClipboardList size={14} />
          {isApplied ? "已报名" : "去报名"}
        </button>
      </div>
    </article>
  );
}
