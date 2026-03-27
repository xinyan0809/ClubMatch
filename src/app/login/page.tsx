"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, Building2,
  ArrowRight, CheckCircle2, Loader2, Sparkles,
  GraduationCap, Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "student" | "admin";
type Mode = "signin" | "signup";

// Supported universities — only CUC is enabled for the beta
const UNIVERSITIES = [
  { value: "cuc",   label: "中国传媒大学", enabled: true  },
  { value: "other", label: "更多高校拓展中...",  enabled: false },
] as const;
type UniversityValue = typeof UNIVERSITIES[number]["value"] | "";

const VALID_UNI: UniversityValue = "cuc";

// ── Left-panel content ────────────────────────────────────────────────────────
const FEATURES = [
  "基于技能与 MBTI 的 AI 智能匹配",
  "一份档案，申请全校所有社团",
  "实时查看审核进度，与社长直接沟通",
  "告别繁琐纸质流程，入社从未如此高效",
];

const TESTIMONIALS: Record<Role, { quote: string; author: string; desc: string }> = {
  student: {
    quote: "入学第一周就找到了志同道合的伙伴，聚浪真的太厉害了！",
    author: "陈思琦",
    desc: "播音主持，中国传媒大学大一",
  },
  admin: {
    quote: "以前处理200多份申请要花好几周，现在一个下午就全搞定了。",
    author: "刘泽楷",
    desc: "机器人协会社长，中国传媒大学",
  },
};

// ── Reusable text input ───────────────────────────────────────────────────────
function InputField({
  id, label, type = "text", value, onChange,
  placeholder, icon: Icon, rightEl, autoComplete,
}: {
  id: string; label: string; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; icon: React.ElementType;
  rightEl?: React.ReactNode; autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon size={15} className="pointer-events-none absolute left-3.5 text-gray-400" />
        <input
          id={id} type={type} value={value} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 text-sm text-gray-900",
            "placeholder:text-gray-400 transition-all duration-150",
            "focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100",
            rightEl ? "pr-10" : "pr-4",
          )}
        />
        {rightEl && <div className="absolute right-3">{rightEl}</div>}
      </div>
    </div>
  );
}

// ── University select ─────────────────────────────────────────────────────────
function UniversitySelect({
  value, onChange, error,
}: {
  value: UniversityValue;
  onChange: (v: UniversityValue) => void;
  error?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="university" className="text-xs font-semibold text-gray-700">
        选择高校
      </label>
      <div className="relative flex items-center">
        <GraduationCap
          size={15}
          className={cn(
            "pointer-events-none absolute left-3.5 transition-colors",
            error ? "text-red-400" : "text-gray-400",
          )}
        />
        <select
          id="university"
          value={value}
          onChange={(e) => onChange(e.target.value as UniversityValue)}
          className={cn(
            "w-full appearance-none rounded-xl border bg-gray-50 py-2.5 pl-9 pr-4 text-sm",
            "transition-all duration-150 cursor-pointer",
            "focus:bg-white focus:outline-none focus:ring-2",
            error
              ? "border-red-300 text-red-600 focus:border-red-400 focus:ring-red-100"
              : value === VALID_UNI
              ? "border-emerald-300 text-gray-900 focus:border-emerald-400 focus:ring-emerald-100"
              : "border-gray-200 text-gray-500 focus:border-primary-400 focus:ring-primary-100",
          )}
        >
          <option value="" disabled>请选择您的高校</option>
          {UNIVERSITIES.map(({ value: v, label, enabled }) => (
            <option key={v} value={v} disabled={!enabled}>
              {label}
            </option>
          ))}
        </select>
        {/* Check mark when valid university is selected */}
        {value === VALID_UNI && (
          <CheckCircle2
            size={15}
            className="pointer-events-none absolute right-3.5 text-emerald-500"
          />
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [role,         setRole]       = useState<Role>("student");
  const [mode,         setMode]       = useState<Mode>("signin");
  const [university,   setUniversity] = useState<UniversityValue>("");
  const [credential,   setCred]       = useState(""); // email or phone
  const [password,     setPassword]   = useState("");
  const [name,         setName]       = useState("");
  const [showPassword, setShowPass]   = useState(false);
  const [isLoading,    setIsLoading]  = useState(false);
  const [error,        setError]      = useState("");

  const testimonial  = TESTIMONIALS[role];
  const isValidUni   = university === VALID_UNI;
  const canSubmit    = isValidUni && credential.trim().length > 0 && password.length >= 6;

  const clearError = () => setError("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!university) {
      setError("请先选择您的高校");
      return;
    }
    if (!isValidUni) {
      setError("目前仅对中国传媒大学开放内测");
      return;
    }
    if (!credential.trim()) {
      setError("请输入邮箱或手机号");
      return;
    }
    if (password.length < 6) {
      setError("密码至少需要 6 位字符");
      return;
    }

    setIsLoading(true);
    // Simulate Supabase round-trip — replace with real auth later
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);

    router.push(role === "student" ? "/discover" : "/admin");
  };

  return (
    <div className="flex min-h-screen bg-white">

      {/* ════════════════════════════════════════════════════════
          LEFT PANEL — brand identity  (desktop lg+ only)
          ════════════════════════════════════════════════════════ */}
      <div
        className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden p-12"
        style={{
          background:
            "radial-gradient(ellipse at 20% 20%, #1d4ed8, #1e1b4b 45%, #0f172a 75%)",
        }}
      >
        {/* ── Decorative layer ──────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0">
          {/* Glowing orbs */}
          <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-8 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute right-8 top-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-2xl" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Giant watermark character for cultural depth */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="select-none font-black text-white"
              style={{ fontSize: "22rem", opacity: 0.025, lineHeight: 1 }}
            >
              浪
            </span>
          </div>
        </div>

        {/* ── Logo ──────────────────────────────────────────── */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <span className="text-base font-black text-white">聚</span>
          </div>
          <div className="leading-tight">
            <p className="text-xl font-bold text-white">
              Club<span className="text-blue-300">Match</span>
              <span className="ml-2 font-semibold text-white/80">聚浪</span>
            </p>
            <p className="text-[11px] font-medium tracking-widest text-blue-200/50 uppercase">
              Campus Club Platform
            </p>
          </div>
        </div>

        {/* ── Hero copy ─────────────────────────────────────── */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold leading-snug tracking-tight text-white xl:text-5xl">
              找到你的圈子，
              <br />
              <span className="text-blue-300">开启精彩校园生活</span>
            </h2>
            <p className="max-w-sm text-base leading-relaxed text-blue-100/65">
              聚浪通过 AI 技术，将学生的技能、性格与最匹配的社团精准连接，
              让每一位新生都能快速找到归属感。
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                <span className="text-sm text-blue-100/75">{f}</span>
              </li>
            ))}
          </ul>

          {/* CUC exclusive badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-2 ring-1 ring-amber-400/30">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-300">
              中国传媒大学 · 内测合作高校
            </span>
          </div>
        </div>

        {/* ── Testimonial card ──────────────────────────────── */}
        <div
          key={testimonial.author}
          className="relative rounded-2xl p-5 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <Sparkles size={14} className="mb-3 text-blue-300/60" />
          <p className="text-sm leading-relaxed text-white/80">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
              {testimonial.author[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{testimonial.author}</p>
              <p className="text-[11px] text-blue-200/55">{testimonial.desc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          RIGHT PANEL — authentication form
          ════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">

        {/* Mobile-only logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200">
            <span className="text-lg font-black text-white">聚</span>
          </div>
          <p className="text-base font-bold text-gray-900">
            Club<span className="text-primary-600">Match</span>
            <span className="ml-1 text-gray-500 font-medium">聚浪</span>
          </p>
        </div>

        <div className="w-full max-w-sm space-y-6">

          {/* ── Page heading ──────────────────────────────── */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "signin" ? "欢迎回来" : "创建你的账号"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {mode === "signin"
                ? "登录以继续使用 ClubMatch 聚浪"
                : "加入我们，开启你的精彩社团生活 🎉"}
            </p>
          </div>

          {/* ── Role toggle ───────────────────────────────── */}
          <div
            className="relative flex rounded-xl bg-gray-100 p-1"
            role="tablist"
            aria-label="选择身份"
          >
            {/* Sliding pill */}
            <div
              className={cn(
                "absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-white shadow-sm",
                "transition-transform duration-200 ease-in-out",
                role === "student" ? "translate-x-0" : "translate-x-[calc(100%+8px)]",
              )}
            />
            {(
              [
                { value: "student", label: "我是学生", icon: User     },
                { value: "admin",   label: "我是社长", icon: Building2 },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                role="tab"
                aria-selected={role === value}
                onClick={() => { setRole(value); clearError(); }}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-colors duration-150",
                  role === value ? "text-gray-900" : "text-gray-500 hover:text-gray-700",
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Form ──────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name — signup only */}
            {mode === "signup" && (
              <InputField
                id="name"
                label={role === "admin" ? "社团名称" : "真实姓名"}
                value={name}
                onChange={setName}
                placeholder={role === "admin" ? "例：机器人协会" : "例：陈思琦"}
                icon={role === "admin" ? Building2 : User}
                autoComplete="name"
              />
            )}

            {/* University selector — always shown */}
            <UniversitySelect
              value={university}
              onChange={(v) => { setUniversity(v); clearError(); }}
              error={!!error && !isValidUni}
            />

            {/* Credential */}
            <InputField
              id="credential"
              label="邮箱或手机号"
              type="text"
              value={credential}
              onChange={(v) => { setCred(v); clearError(); }}
              placeholder="请输入邮箱或手机号"
              icon={credential.includes("@") ? Mail : Phone}
              autoComplete="username"
            />

            {/* Password */}
            <InputField
              id="password"
              label="密码"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(v) => { setPassword(v); clearError(); }}
              placeholder="至少 6 位字符"
              icon={Lock}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Forgot password */}
            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium text-primary-600 hover:underline"
                >
                  忘记密码？
                </button>
              </div>
            )}

            {/* ── Error / validation message ─────────────── */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            {/* ── CUC-only notice (shown when no uni selected) ── */}
            {!university && !error && (
              <p className="text-center text-[11px] text-gray-400">
                目前仅对
                <span className="font-semibold text-primary-600"> 中国传媒大学 </span>
                开放内测
              </p>
            )}

            {/* ── Submit ────────────────────────────────────── */}
            <button
              type="submit"
              disabled={isLoading || !canSubmit}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white",
                "transition-all duration-150",
                canSubmit
                  ? "bg-primary-600 shadow-md shadow-primary-200 hover:bg-primary-500 active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed",
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {mode === "signin" ? "登录中..." : "注册中..."}
                </>
              ) : (
                <>
                  {mode === "signin"
                    ? role === "student" ? "学生登录" : "社长登录"
                    : role === "student" ? "注册学生账号" : "注册社长账号"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* ── Mode toggle ───────────────────────────────── */}
          <p className="text-center text-sm text-gray-500">
            {mode === "signin" ? (
              <>
                还没有账号？{" "}
                <button
                  onClick={() => { setMode("signup"); clearError(); }}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  免费注册
                </button>
              </>
            ) : (
              <>
                已有账号？{" "}
                <button
                  onClick={() => { setMode("signin"); clearError(); }}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  立即登录
                </button>
              </>
            )}
          </p>

          {/* Terms */}
          <p className="text-center text-[11px] text-gray-400 leading-relaxed">
            登录即代表您同意我们的
            <button className="text-gray-500 hover:underline mx-0.5">服务协议</button>
            与
            <button className="text-gray-500 hover:underline mx-0.5">隐私政策</button>
          </p>
        </div>
      </div>
    </div>
  );
}
