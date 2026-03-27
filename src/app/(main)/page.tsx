import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  LayoutDashboard,
  Star,
  ChevronDown,
  Users,
  Trophy,
  Clock,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ClubMatch 聚浪 — 中国传媒大学专属社团招新平台",
  description:
    "首个基于 AI 智能匹配的高校社团招新平台。找到你的圈子，开启非凡大学生活。",
};

// ─────────────────────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+",  label: "在册社团" },
  { value: "5,000+",label: "活跃学生" },
  { value: "98%",   label: "匹配满意度" },
  { value: "3 分钟", label: "平均完成申请" },
];

const FEATURES = [
  {
    emoji: "✨",
    icon: Sparkles,
    title: "AI 智能匹配",
    desc: "告别盲目海投。算法分析你的技能、MBTI 与兴趣，精准推荐最契合的社团，匹配度最高可达 99%。",
    color: "from-violet-500 to-indigo-600",
    lightBg: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    emoji: "📱",
    icon: Smartphone,
    title: "沉浸式浏览",
    desc: "像刷短视频一样浏览社团日常。左滑跳过，右滑申请，每一张社团卡片都是一扇新世界的门。",
    color: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    emoji: "⚡️",
    icon: LayoutDashboard,
    title: "一站式管理",
    desc: "社长专属后台，简历筛选、面试排期、录取通知全自动化。让招新专注于发现人才，而非填写表格。",
    color: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    textColor: "text-amber-600",
  },
];

const STEPS = [
  {
    num: "01",
    title: "创建你的档案",
    desc: "填写专业、技能标签，完成 MBTI 测试。全程不超过 3 分钟。",
    color: "bg-primary-600",
  },
  {
    num: "02",
    title: "获取 AI 推荐",
    desc: "算法实时运算，为你生成专属的社团匹配列表，匹配度清晰可见。",
    color: "bg-violet-600",
  },
  {
    num: "03",
    title: "一键申请入社",
    desc: "提交申请，与社长直接沟通，实时追踪审核状态，告别焦虑等待。",
    color: "bg-emerald-600",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "入学第一周就找到了志同道合的伙伴，聚浪推荐的 AI 社团和我的专业方向完全契合，现在已经做了三个小项目了。",
    name: "陈思琦",
    role: "播音主持，中国传媒大学 2024 级",
    initials: "陈",
    score: "97% 匹配",
    scoreBg: "bg-emerald-50",
    scoreText: "text-emerald-700",
  },
  {
    quote:
      "以前招新靠纸质简历，堆满了整张桌子，漏看了多少优秀的同学都不知道。用了聚浪之后，一个下午就筛完了，还能按匹配度排序。",
    name: "刘泽楷",
    role: "机器人协会社长，中国传媒大学 2022 级",
    initials: "刘",
    score: "社长认证",
    scoreBg: "bg-primary-50",
    scoreText: "text-primary-700",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Mock phone with a mini Discover card inside — pure CSS/Tailwind */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-56 sm:w-64 select-none">

      {/* ── Floating badge: match score ──────────────────── */}
      <div className="animate-float-d1 absolute -right-10 top-10 z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-600 shadow-lg ring-1 ring-emerald-100">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        AI 匹配 95%
      </div>

      {/* ── Floating badge: new message ──────────────────── */}
      <div className="animate-float-d2 absolute -left-12 top-24 z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-primary-600 shadow-lg ring-1 ring-primary-100">
        💬 社长发来消息
      </div>

      {/* ── Floating badge: accepted ─────────────────────── */}
      <div className="animate-float-d3 absolute -left-8 bottom-20 z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-violet-600 shadow-lg ring-1 ring-violet-100">
        🎉 申请已通过
      </div>

      {/* ── Phone body ───────────────────────────────────── */}
      <div className="animate-float relative overflow-hidden rounded-[2.5rem] border-[5px] border-gray-800 bg-gray-900 shadow-2xl shadow-gray-900/40">

        {/* Notch */}
        <div className="flex justify-center bg-gray-900 pt-2 pb-1">
          <div className="h-5 w-20 rounded-full bg-gray-800" />
        </div>

        {/* Screen */}
        <div className="bg-gray-50">

          {/* App top bar */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
            <span className="text-xs font-bold text-gray-900">发现社团</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
              <span className="text-[10px] font-bold text-primary-600">同</span>
            </div>
          </div>

          {/* Club card */}
          <div className="p-2.5">
            <div
              className="overflow-hidden rounded-2xl text-white"
              style={{
                background:
                  "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 100%)",
              }}
            >
              {/* Card image area */}
              <div className="relative h-28">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
                <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold">
                  ✨ 95%
                </div>
                <div className="absolute left-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[9px]">
                  312 成员
                </div>
                {/* Abstract dots decoration */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 w-1 rounded-full bg-white"
                        style={{ opacity: Math.random() * 0.8 + 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Card text */}
              <div className="px-3 pb-3 pt-2">
                <p className="text-[11px] font-bold leading-tight">
                  AI 与机器学习协会
                </p>
                <p className="mt-0.5 text-[9px] text-white/60">
                  让 AI 改变世界，从这里开始
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {["新手友好", "周末活动"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] text-white/80"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button className="flex-1 rounded-lg bg-white/15 py-1 text-[9px]">
                    跳过
                  </button>
                  <button className="flex-[2] rounded-lg bg-primary-500 py-1 text-[9px] font-bold">
                    申请加入
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom tab bar */}
          <div className="flex border-t border-gray-100 bg-white px-1 py-1.5">
            {["首页", "发现", "消息", "我的"].map((tab, i) => (
              <div
                key={tab}
                className={`flex flex-1 flex-col items-center gap-0.5 text-[8px] ${
                  i === 1 ? "text-primary-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`h-3 w-3 rounded-sm ${
                    i === 1 ? "bg-primary-100" : "bg-gray-100"
                  }`}
                />
                {tab}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glow under phone */}
      <div className="absolute -bottom-6 left-1/2 h-12 w-48 -translate-x-1/2 rounded-full bg-primary-400/20 blur-2xl" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[calc(100dvh-4rem)] items-center overflow-hidden bg-white">

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          {/* Large gradient blob behind phone */}
          <div className="absolute right-0 top-0 h-[80%] w-[55%] rounded-bl-[6rem] bg-gradient-to-br from-primary-50 via-indigo-50 to-violet-50 opacity-70" />
          {/* Dot grid overlay */}
          <div
            className="absolute right-0 top-0 h-[80%] w-[55%] opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, #2563eb22 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Small decorative orbs */}
          <div className="absolute right-[5%] top-[10%] h-48 w-48 rounded-full bg-primary-300/10 blur-3xl" />
          <div className="absolute right-[20%] bottom-[10%] h-64 w-64 rounded-full bg-violet-300/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* ── Left: copy ──────────────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Exclusive beta badge */}
              <div className="flex">
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                  中国传媒大学 · 专属内测中
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                找到你的圈子，
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
                  开启非凡大学生活
                </span>
              </h1>

              {/* Subheadline */}
              <p className="max-w-lg text-lg leading-relaxed text-gray-500">
                中国传媒大学专属内测中。
                <br />
                首个基于 AI 匹配的高校社团招新平台——
                用算法找到你真正热爱的社团。
              </p>

              {/* CTA row */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-2 rounded-2xl bg-primary-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-200/60 transition-all hover:bg-primary-500 active:scale-95"
                >
                  立即体验 · 登录
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="#features"
                  className="flex items-center gap-2 rounded-2xl border border-gray-200 px-6 py-3.5 text-sm font-semibold text-gray-600 transition-all hover:border-primary-300 hover:text-primary-600"
                >
                  了解更多
                  <ChevronDown size={15} />
                </a>
              </div>

              {/* Social proof strip */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex -space-x-2">
                  {["陈", "刘", "王", "张"].map((c) => (
                    <div
                      key={c}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-100 text-xs font-bold text-primary-700"
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">5,000+</span>{" "}
                  位同学已加入候补
                </p>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={12} className="fill-current" />
                  ))}
                  <span className="ml-1 text-sm text-gray-500">
                    4.9 / 5
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: phone mockup ──────────────────────────── */}
            <div className="flex justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <a
          href="#stats"
          className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-gray-400 hover:text-primary-500 transition-colors md:flex"
          aria-label="向下滚动"
        >
          <span className="text-xs">向下滚动</span>
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </section>

      {/* ══════════════════════════════════════════════════════════
          STATS STRIP
          ══════════════════════════════════════════════════════════ */}
      <section
        id="stats"
        className="bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-600 py-10"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 sm:grid-cols-4 sm:px-10">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-3xl font-extrabold text-white sm:text-4xl">
                {value}
              </span>
              <span className="text-sm font-medium text-primary-100">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURES SECTION
          ══════════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="bg-gray-50 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          {/* Section header */}
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span className="rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-600 ring-1 ring-primary-200">
              核心功能
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              为何选择 <span className="text-primary-600">ClubMatch 聚浪</span>？
            </h2>
            <p className="max-w-lg text-base text-gray-500">
              我们重新定义了高校社团招新体验——无论你是寻找归属的学生，还是渴望精准招募的社长。
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ emoji, icon: Icon, title, desc, color, lightBg, textColor }) => (
              <div
                key={title}
                className="group flex flex-col gap-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Icon */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${lightBg}`}>
                  <Icon size={22} className={textColor} />
                </div>
                {/* Gradient bar */}
                <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${color}`} />
                {/* Text */}
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {emoji} {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span className="rounded-full bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-600 ring-1 ring-violet-200">
              使用流程
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              三步，开始你的社团旅程
            </h2>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent sm:block" />

            {STEPS.map(({ num, title, desc, color }) => (
              <div key={num} className="relative flex flex-col items-center gap-4 text-center">
                <div
                  className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-xl font-black text-white shadow-lg`}
                >
                  {num}
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-bold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TESTIMONIALS
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <div className="mb-14 flex flex-col items-center gap-3 text-center">
            <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
              用户评价
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              他们都说好用
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {TESTIMONIALS.map(
              ({ quote, name, role, initials, score, scoreBg, scoreText }) => (
                <div
                  key={name}
                  className="flex flex-col gap-5 rounded-3xl bg-white p-7 shadow-sm ring-1 ring-gray-100"
                >
                  {/* Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-current" />
                    ))}
                    <span
                      className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${scoreBg} ${scoreText}`}
                    >
                      {score}
                    </span>
                  </div>
                  {/* Quote */}
                  <p className="flex-1 text-sm leading-relaxed text-gray-700">
                    &ldquo;{quote}&rdquo;
                  </p>
                  {/* Author */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-400">{role}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BOTTOM CTA
          ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden py-24"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, #1d4ed8, #1e1b4b 50%, #0f172a)",
        }}
      >
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center sm:px-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 ring-1 ring-white/20">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            内测名额有限，先到先得
          </span>

          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            你的圈子，就在
            <br />
            <span className="text-blue-300">中国传媒大学</span> 等你
          </h2>

          <p className="max-w-md text-base text-blue-100/70">
            加入聚浪，让 AI 帮你找到最匹配的社团，开启一段属于你的精彩大学故事。
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-bold text-primary-700 shadow-xl transition-all hover:bg-blue-50 active:scale-95"
            >
              立即加入内测
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/discover"
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15"
            >
              直接浏览社团
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-2 flex flex-wrap justify-center gap-5 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-400" />
              免费注册，无隐藏费用
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-400" />
              中传校园网络安全认证
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-emerald-400" />
              数据仅在校内使用
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-10">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600">
              <span className="text-xs font-black text-white">聚</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              Club<span className="text-primary-600">Match</span>
              <span className="ml-1 text-gray-400 font-medium">聚浪</span>
            </span>
          </div>

          <p className="text-xs text-gray-400 text-center">
            © 2026 ClubMatch 聚浪 · 中国传媒大学合作项目 ·{" "}
            <button className="hover:text-gray-600 hover:underline">隐私政策</button>
            {" "}·{" "}
            <button className="hover:text-gray-600 hover:underline">服务条款</button>
          </p>

          {/* Nav quick links */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/discover" className="hover:text-primary-600 transition-colors">发现社团</Link>
            <Link href="/login"    className="hover:text-primary-600 transition-colors">登录 / 注册</Link>
            <Link href="/admin"    className="hover:text-primary-600 transition-colors">社长入口</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
