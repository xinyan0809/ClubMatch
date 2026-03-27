"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Heart, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Club } from "@/data/clubs";

type DismissDirection = "left" | "right" | null;

interface ClubCardProps {
  club: Club;
  onPass: (id: number) => void;
  onApply: (id: number) => void;
}

const TAG_COLORS: Record<string, string> = {
  "Beginner OK":        "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Beginners Welcome":  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "All Levels":         "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Extrovert Friendly": "bg-sky-50    text-sky-700    ring-sky-200",
  "Introvert OK":       "bg-violet-50 text-violet-700  ring-violet-200",
  "Weekend Activities": "bg-amber-50  text-amber-700  ring-amber-200",
  "Weekly Meetups":     "bg-amber-50  text-amber-700  ring-amber-200",
  "Live Performances":  "bg-pink-50   text-pink-700   ring-pink-200",
  "Project-Based":      "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Team Projects":      "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "Hands-On":           "bg-orange-50 text-orange-700 ring-orange-200",
  "Networking":         "bg-teal-50   text-teal-700   ring-teal-200",
  "Mentorship":         "bg-teal-50   text-teal-700   ring-teal-200",
  "Portfolio Help":     "bg-rose-50   text-rose-700   ring-rose-200",
  "Pitch Nights":       "bg-yellow-50 text-yellow-700 ring-yellow-200",
  "Fun Vibes":          "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
  "Competitions":       "bg-red-50    text-red-700    ring-red-200",
  "Creative Space":     "bg-purple-50 text-purple-700 ring-purple-200",
};

const matchColor = (score: number) => {
  if (score >= 90) return "bg-emerald-500 text-white";
  if (score >= 75) return "bg-amber-400  text-white";
  return                 "bg-gray-400    text-white";
};

export function ClubCard({ club, onPass, onApply }: ClubCardProps) {
  const [direction, setDirection] = useState<DismissDirection>(null);

  const dismiss = (dir: "left" | "right") => {
    setDirection(dir);
    setTimeout(() => {
      if (dir === "left") onPass(club.id);
      else onApply(club.id);
    }, 320);
  };

  const imageUrl = `https://picsum.photos/seed/${club.imageSeed}/600/800`;

  return (
    <article
      className={cn(
        "relative w-full overflow-hidden rounded-3xl shadow-lg",
        "transition-all duration-300 ease-in-out",
        direction === "left"  && "-translate-x-full -rotate-6 opacity-0",
        direction === "right" && "translate-x-full  rotate-6  opacity-0"
      )}
      style={{ aspectRatio: "3 / 4" }}
    >
      {/* ── Background image ───────────────────────────────────── */}
      <Image
        src={imageUrl}
        alt={club.name}
        fill
        sizes="(max-width: 448px) 100vw, 448px"
        className="object-cover"
        priority
      />

      {/* ── Color tint overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `linear-gradient(135deg, ${club.gradientFrom}, ${club.gradientTo})`,
        }}
      />

      {/* ── Bottom gradient for text legibility ─────────────────── */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* ── Match score badge (top-right) ───────────────────────── */}
      <div className="absolute right-4 top-4">
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-md",
            matchColor(club.matchScore)
          )}
        >
          <Sparkles size={11} />
          {club.matchScore}% Match
        </div>
      </div>

      {/* ── Member count (top-left) ─────────────────────────────── */}
      <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        <Users size={11} />
        {club.members.toLocaleString()} members
      </div>

      {/* ── Bottom content ──────────────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 pb-5">
        {/* Name & slogan */}
        <div>
          <h2 className="text-xl font-bold leading-tight text-white">
            {club.name}
          </h2>
          <p className="mt-0.5 text-sm text-white/75">{club.slogan}</p>
        </div>

        {/* Tag pills */}
        <div className="flex flex-wrap gap-1.5">
          {club.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                TAG_COLORS[tag] ?? "bg-white/20 text-white ring-white/30"
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          {/* Pass button */}
          <button
            onClick={() => dismiss("left")}
            aria-label="Pass"
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/20",
              "bg-white/10 py-3 text-sm font-semibold text-white backdrop-blur-sm",
              "transition-all duration-150",
              "hover:bg-white/20 hover:border-white/40",
              "active:scale-95"
            )}
          >
            <X size={16} strokeWidth={2.5} />
            Pass
          </button>

          {/* Apply button */}
          <button
            onClick={() => dismiss("right")}
            aria-label="Apply"
            className={cn(
              "flex flex-[2] items-center justify-center gap-2 rounded-2xl",
              "bg-primary-600 py-3 text-sm font-bold text-white shadow-lg shadow-primary-900/40",
              "transition-all duration-150",
              "hover:bg-primary-500 hover:shadow-primary-700/50",
              "active:scale-95"
            )}
          >
            <Heart size={16} strokeWidth={2.5} />
            Apply Now
          </button>
        </div>
      </div>
    </article>
  );
}
