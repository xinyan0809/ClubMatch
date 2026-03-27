"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors",
              isActive ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Icon
              size={22}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={cn(
                "transition-transform",
                isActive && "scale-110"
              )}
            />
            <span>{label}</span>
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
