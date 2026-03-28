import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNav />
      <main className="min-h-[calc(100dvh-4rem)] pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
