"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Routes that don't require a session
const PUBLIC_PATHS = ["/", "/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("cm_userRole");
    if (role) {
      setAuthed(true);
    } else if (!isPublic) {
      // No session on a protected route → kick to landing page
      router.replace("/");
    }
    // Public paths: nothing to do — rendered unconditionally below
  }, [isPublic, router]);

  // Public pages render immediately (no gate)
  // Protected pages render only after localStorage confirms a session
  if (!isPublic && !authed) return null;
  return <>{children}</>;
}
