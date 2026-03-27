import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, Sparkles, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "ClubMatch — Find Your University Club",
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    desc: "We analyse your skills and MBTI to surface clubs you'll actually love.",
  },
  {
    icon: Users,
    title: "500+ Active Clubs",
    desc: "Sports, Tech, Arts, Music — every interest across every campus.",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    desc: "Chat with club presidents before you even apply.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Minimal top bar ──────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">CM</span>
          </div>
          <span className="text-base font-bold text-gray-900">
            Club<span className="text-primary-600">Match</span>
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
        >
          Log in
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-5 max-w-2xl">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-200">
            <Sparkles size={11} />
            Powered by Smart Matching
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Find your tribe.{" "}
            <span className="text-primary-600">Build your campus life.</span>
          </h1>

          <p className="max-w-lg text-lg text-gray-500">
            ClubMatch connects freshmen with university clubs that fit their
            skills, personality, and schedule — in minutes, not months.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-200 hover:bg-primary-500 transition-colors active:scale-95"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/discover"
              className="rounded-2xl border border-gray-200 px-7 py-3.5 text-sm font-semibold text-gray-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              Browse Clubs
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            Free for students · No credit card required
          </p>
        </div>

        {/* ── Feature cards ─────────────────────────────────── */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-left"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100">
                <Icon size={16} className="text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} ClubMatch. All rights reserved.
      </footer>
    </div>
  );
}
