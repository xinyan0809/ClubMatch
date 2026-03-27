"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search clubs…"
          className={cn(
            "w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-9 pr-4",
            "text-sm text-gray-900 placeholder:text-gray-400",
            "shadow-sm transition-all duration-150",
            "focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          )}
        />
      </div>

      {/* Filter icon button */}
      <button
        aria-label="Advanced filters"
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          "border border-gray-200 bg-white shadow-sm",
          "transition-all duration-150",
          "hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600",
          "active:scale-95"
        )}
      >
        <SlidersHorizontal size={16} className="text-gray-500" />
      </button>
    </div>
  );
}
