import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClubMatch — Find Your University Club",
    template: "%s | ClubMatch",
  },
  description:
    "Discover and join university clubs that match your interests. Connect with fellow students and grow together.",
  keywords: ["university", "clubs", "student", "recruitment", "activities"],
  authors: [{ name: "ClubMatch" }],
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Desktop: sticky top nav (hidden on mobile) */}
        <TopNav />

        {/* Main content area
            - On mobile: add bottom padding so content isn't hidden behind BottomNav
            - On desktop: full height minus the 64px TopNav */}
        <main className="min-h-[calc(100dvh-4rem)] pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile: fixed bottom tab bar (hidden on desktop) */}
        <BottomNav />
      </body>
    </html>
  );
}
