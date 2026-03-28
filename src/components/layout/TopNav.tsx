"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Compass, MessageCircle, User, Bell, ClipboardList, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const SESSION_KEYS = [
  "cm_userName", "cm_userProfile", "cm_userRole", "cm_userUniversity",
  "cm_adminClubId", "cm_adminClubName", "cm_adminProfile",
];

const STUDENT_LINKS = [
  { href: "/home",     label: "首页",   icon: Home          },
  { href: "/discover", label: "社团",   icon: Compass       },
  { href: "/messages", label: "消息",   icon: MessageCircle },
  { href: "/profile",  label: "我的",   icon: User          },
];

const ADMIN_LINKS = [
  { href: "/home",     label: "首页",    icon: Home          },
  { href: "/admin",    label: "招新管理", icon: ClipboardList },
  { href: "/messages", label: "消息",    icon: MessageCircle },
  { href: "/profile",  label: "社团主页", icon: User          },
];

export function TopNav() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [initial,    setInitial]    = useState("同");
  const [isAdmin,    setIsAdmin]    = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
    router.push("/");
  };

  useEffect(() => {
    const role      = localStorage.getItem("cm_userRole");
    const clubName  = localStorage.getItem("cm_adminClubName") || "";
    const userName  = localStorage.getItem("cm_userName") || "";
    setIsLoggedIn(!!role);
    setIsAdmin(role === "admin");
    if (role === "admin" && clubName) {
      setInitial(clubName[0]);
    } else if (userName.trim()) {
      setInitial(userName.trim()[0]);
    }
  }, []);

  const navLinks = isAdmin ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <header className="sticky top-0 z-50 hidden md:flex w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">

        {/* ── Logo ──────────────────────────────────────────── */}
        <Link href={isLoggedIn ? "/home" : "/"} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">聚</span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            Club<span className="text-primary-600">Match</span>
            <span className="ml-1 text-gray-500 font-medium">聚浪</span>
          </span>
        </Link>

        {isLoggedIn ? (
          <>
            {/* ── Center nav links (authenticated) ────────────── */}
            <nav className="flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* ── Right side: bell + avatar + logout ───────────── */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" aria-label="通知">
                <Bell size={18} className="text-gray-600" />
              </Button>
              <Link href="/profile" aria-label="前往个人主页">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary-300 transition-all">
                  <AvatarImage src="" alt="用户头像" />
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                aria-label="退出登录"
                title="退出登录"
              >
                <LogOut size={16} className="text-gray-500 hover:text-red-500 transition-colors" />
              </Button>
            </div>
          </>
        ) : (
          /* ── Unauthenticated: only show login CTA ──────────── */
          <>
            <div /> {/* spacer */}
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-sm font-bold text-white shadow-sm shadow-primary-200 transition-all hover:bg-primary-500 active:scale-95"
            >
              立即体验 / 登录
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
