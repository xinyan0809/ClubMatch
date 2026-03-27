import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

interface MetricCardProps {
  label: string;
  value: number | string;
  sub: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: Trend;
  trendLabel?: string;
}

const TREND_ICON: Record<Trend, LucideIcon> = {
  up:   TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const TREND_COLOR: Record<Trend, string> = {
  up:   "text-emerald-600",
  down: "text-red-500",
  flat: "text-gray-400",
};

export function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
}: MetricCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend] : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        {TrendIcon && trend && (
          <span className={cn("flex items-center gap-1 text-xs font-semibold", TREND_COLOR[trend])}>
            <TrendIcon size={13} />
            {trendLabel}
          </span>
        )}
      </div>

      <div>
        <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-500">{label}</p>
      </div>

      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}
