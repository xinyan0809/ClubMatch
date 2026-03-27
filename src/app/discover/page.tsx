"use client";

import { useState, useMemo } from "react";
import { PartyPopper, RefreshCw } from "lucide-react";
import { ClubCard } from "@/components/discover/ClubCard";
import { FilterChips } from "@/components/discover/FilterChips";
import { SearchBar } from "@/components/discover/SearchBar";
import { ALL_CLUBS, type Category } from "@/data/clubs";
import { cn } from "@/lib/utils";

export default function DiscoverPage() {
  const [query, setQuery]       = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [passed, setPassed]     = useState<Set<number>>(new Set());
  const [applied, setApplied]   = useState<Set<number>>(new Set());

  const handlePass  = (id: number) => setPassed((s)  => new Set(s).add(id));
  const handleApply = (id: number) => setApplied((s) => new Set(s).add(id));

  const handleReset = () => {
    setPassed(new Set());
    setApplied(new Set());
    setQuery("");
    setCategory("All");
  };

  const visibleClubs = useMemo(() => {
    return ALL_CLUBS.filter((club) => {
      if (passed.has(club.id) || applied.has(club.id)) return false;
      if (category !== "All" && category !== "AI Match" && club.category !== category) return false;
      if (category === "AI Match") return true; // show all, sorted by score
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          club.name.toLowerCase().includes(q) ||
          club.slogan.toLowerCase().includes(q) ||
          club.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) =>
      category === "AI Match" ? b.matchScore - a.matchScore : 0
    );
  }, [query, category, passed, applied]);

  const dismissedCount = passed.size + applied.size;

  return (
    /*
     * Outer wrapper: full-screen height, subtle background
     * Inner container: capped at max-w-md to simulate a phone app shell
     */
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 to-white">
      <div className="mx-auto max-w-md px-4 py-6">

        {/* ── Header ──────────────────────────────────────────── */}
        <header className="mb-5">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Discover Clubs
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {visibleClubs.length} club{visibleClubs.length !== 1 ? "s" : ""} waiting for you
              </p>
            </div>

            {dismissedCount > 0 && (
              <button
                onClick={handleReset}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5",
                  "text-xs font-semibold text-primary-600",
                  "bg-primary-50 ring-1 ring-primary-200",
                  "hover:bg-primary-100 transition-colors",
                  "active:scale-95"
                )}
              >
                <RefreshCw size={12} />
                Reset ({dismissedCount})
              </button>
            )}
          </div>

          {/* Applied success pills row */}
          {applied.size > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 ring-1 ring-emerald-200">
              <PartyPopper size={14} className="shrink-0 text-emerald-600" />
              <p className="text-xs font-medium text-emerald-700">
                You applied to{" "}
                <strong>{applied.size}</strong>{" "}
                club{applied.size !== 1 ? "s" : ""}! Check your profile for status.
              </p>
            </div>
          )}
        </header>

        {/* ── Search bar ──────────────────────────────────────── */}
        <div className="mb-3">
          <SearchBar value={query} onChange={setQuery} />
        </div>

        {/* ── Filter chips ────────────────────────────────────── */}
        <div className="mb-5">
          <FilterChips active={category} onChange={setCategory} />
        </div>

        {/* ── Club card feed ──────────────────────────────────── */}
        {visibleClubs.length > 0 ? (
          <div className="flex flex-col gap-5">
            {visibleClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                onPass={handlePass}
                onApply={handleApply}
              />
            ))}
          </div>
        ) : (
          /* ── Empty state ──────────────────────────────────── */
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-gray-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <PartyPopper size={28} className="text-primary-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                You&apos;ve seen them all!
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {query || category !== "All"
                  ? "Try adjusting your search or filters."
                  : "Come back later or reset to explore again."}
              </p>
            </div>
            <button
              onClick={handleReset}
              className={cn(
                "mt-1 flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2.5",
                "text-sm font-semibold text-white shadow-md shadow-primary-200",
                "hover:bg-primary-500 transition-colors active:scale-95"
              )}
            >
              <RefreshCw size={14} />
              Explore Again
            </button>
          </div>
        )}

        {/* Bottom spacer so last card clears the mobile nav bar */}
        <div className="h-4" />
      </div>
    </div>
  );
}
