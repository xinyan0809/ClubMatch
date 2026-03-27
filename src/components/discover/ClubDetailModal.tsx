"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, MessageCircle, ClipboardList, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Club } from "@/data/clubs";
import { avatarColour, TAG_COLOURS } from "./ClubCard";

// ─────────────────────────────────────────────────────────────────────────────

interface ClubDetailModalProps {
  club: Club;
  isLiked: boolean;
  isApplied: boolean;
  onClose: () => void;
  onLike: () => void;
  onApply: () => void;
}

export function ClubDetailModal({
  club,
  isLiked,
  isApplied,
  onClose,
  onLike,
  onApply,
}: ClubDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    // ── Backdrop ───────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ── Modal box ───────────────────────────────────────────────────── */}
      <div
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-5">
          {/* Club avatar */}
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white",
              avatarColour(club.id),
            )}
          >
            {club.name[0]}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{club.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700 ring-1 ring-primary-200">
                {club.category}
              </span>
              {club.recruiting && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-200">
                  招新中
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Users size={10} />
                {club.members.toLocaleString()} 名成员
              </span>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Tag pills */}
          <div className="mb-5 flex flex-wrap gap-1.5">
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

          {/* Full description — each \n\n becomes a new paragraph */}
          <div className="space-y-3">
            {club.fullDescription.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-700">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* ── Footer actions ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2.5 border-t border-gray-100 px-6 py-4">
          {/* Heart — 心动 toggle */}
          <button
            onClick={onLike}
            aria-label={isLiked ? "取消心动" : "加入心动社团"}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
              isLiked
                ? "bg-red-50 text-red-500 ring-1 ring-red-200"
                : "bg-gray-100 text-gray-400 hover:text-gray-600",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isLiked ? 0 : 1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* 去沟通 */}
          <Link
            href={`/messages?clubId=${club.id}`}
            onClick={onClose}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500 active:scale-95"
          >
            <MessageCircle size={14} />
            去沟通
          </Link>

          {/* 去报名 */}
          <button
            onClick={() => { onApply(); onClose(); }}
            disabled={isApplied}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-sm font-semibold transition-all active:scale-95",
              isApplied
                ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-primary-200 bg-white text-primary-600 hover:bg-primary-50",
            )}
          >
            <ClipboardList size={14} />
            {isApplied ? "已报名" : "去报名"}
          </button>
        </div>
      </div>
    </div>
  );
}
