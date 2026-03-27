"use client";

import {
  Brain,
  Dumbbell,
  Palette,
  Cpu,
  Music2,
  Briefcase,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/data/clubs";
import { CATEGORIES } from "@/data/clubs";

const ICONS: Record<Category, React.ReactNode> = {
  All:      <LayoutGrid size={13} />,
  "AI Match": <Brain   size={13} />,
  Sports:   <Dumbbell  size={13} />,
  Arts:     <Palette   size={13} />,
  Tech:     <Cpu       size={13} />,
  Music:    <Music2    size={13} />,
  Business: <Briefcase size={13} />,
};

interface FilterChipsProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    /* no-scrollbar hides the scrollbar track while keeping scroll behaviour */
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5",
              "text-xs font-semibold transition-all duration-200",
              "ring-1",
              isActive
                ? "bg-primary-600 text-white ring-primary-600 shadow-md shadow-primary-200"
                : "bg-white text-gray-600 ring-gray-200 hover:ring-primary-300 hover:text-primary-600 hover:bg-primary-50"
            )}
          >
            {ICONS[cat]}
            {cat}
          </button>
        );
      })}
    </div>
  );
}
