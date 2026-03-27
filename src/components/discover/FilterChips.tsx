"use client";

import {
  LayoutGrid, Star, BookOpen, Rocket, Dumbbell, Heart, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/data/clubs";
import { CATEGORIES } from "@/data/clubs";

const ICONS: Record<Category, React.ReactNode> = {
  "全部":    <LayoutGrid size={13} />,
  "思想政治类": <Star      size={13} />,
  "学术科技类": <BookOpen  size={13} />,
  "创新创业类": <Rocket    size={13} />,
  "文化体育类": <Dumbbell  size={13} />,
  "志愿公益类": <Heart     size={13} />,
  "自律互助类": <Target    size={13} />,
};

interface FilterChipsProps {
  active: Category;
  onChange: (cat: Category) => void;
}

export function FilterChips({ active, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5",
              "text-xs font-semibold transition-all duration-200 ring-1",
              isActive
                ? "bg-primary-600 text-white ring-primary-600 shadow-md shadow-primary-200"
                : "bg-white text-gray-600 ring-gray-200 hover:ring-primary-300 hover:text-primary-600 hover:bg-primary-50",
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
