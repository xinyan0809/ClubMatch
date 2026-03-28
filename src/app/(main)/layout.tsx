import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { AuthGuard } from "@/components/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <TopNav />
      <main className="min-h-[calc(100dvh-4rem)] pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
