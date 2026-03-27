"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "student" | "admin";
type Mode = "signin" | "signup";

// ── Left-panel feature list ───────────────────────────────────────────────────
const FEATURES = [
  "AI-powered club matching based on your skills & MBTI",
  "Apply to multiple clubs with a single profile",
  "Real-time application status from club admins",
  "Direct messaging before and after you apply",
];

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "I found my people in week one. ClubMatch is genuinely magic.",
    author: "Sarah L.",
    role: "Computer Science, Year 1",
  },
  {
    quote: "Managing 200+ applications used to take weeks. Now it takes an hour.",
    author: "Marcus T.",
    role: "Robotics Club President",
  },
];

// ── Input component ───────────────────────────────────────────────────────────
function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightElement,
  autoComplete,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ElementType;
  rightElement?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon
          size={15}
          className="pointer-events-none absolute left-3.5 text-gray-400"
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900",
            "placeholder:text-gray-400",
            "transition-all duration-150",
            "focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100",
            rightElement && "pr-10"
          )}
        />
        {rightElement && (
          <div className="absolute right-3">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  const [role, setRole]               = useState<Role>("student");
  const [mode, setMode]               = useState<Mode>("signin");
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPass]   = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState("");

  // Cycle through testimonials
  const testimonial = TESTIMONIALS[role === "student" ? 0 : 1];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    // Simulate network round-trip (replace with real Supabase call later)
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);

    if (role === "student") router.push("/discover");
    else router.push("/admin");
  };

  const roleLabel   = role === "student" ? "Student" : "Club Admin";
  const buttonLabel = mode === "signin" ? `Sign in as ${roleLabel}` : `Create ${roleLabel} account`;

  return (
    <div className="flex min-h-screen">

      {/* ════════════════════════════════════════════════════
          LEFT PANEL — branding / illustration (desktop only)
          ════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "relative hidden lg:flex lg:w-[52%]",
          "flex-col justify-between overflow-hidden p-12",
          // Deep space gradient
          "bg-[radial-gradient(ellipse_at_top_left,_#1d4ed8,_#1e1b4b_40%,_#0f172a_70%)]"
        )}
      >
        {/* Decorative floating orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute right-10 top-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-2xl" />
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <span className="text-base font-black text-white">CM</span>
          </div>
          <span className="text-xl font-bold text-white">
            Club<span className="text-blue-300">Match</span>
          </span>
        </div>

        {/* Centre copy */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Find your tribe.
              <br />
              <span className="text-blue-300">Build your campus life.</span>
            </h2>
            <p className="max-w-sm text-base text-blue-100/70">
              Join thousands of students discovering clubs that match their
              skills, personality, and ambitions.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                <span className="text-sm text-blue-100/80">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial card */}
        <div
          key={testimonial.author}
          className="relative rounded-2xl bg-white/8 p-5 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500"
        >
          <Sparkles size={14} className="mb-3 text-blue-300/70" />
          <p className="text-sm italic text-white/85">&ldquo;{testimonial.quote}&rdquo;</p>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
              {testimonial.author[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{testimonial.author}</p>
              <p className="text-[11px] text-blue-200/60">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          RIGHT PANEL — auth form
          ════════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 sm:px-10">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <span className="text-sm font-bold text-white">CM</span>
          </div>
          <span className="text-base font-bold text-gray-900">
            Club<span className="text-primary-600">Match</span>
          </span>
        </div>

        <div className="w-full max-w-sm space-y-7">

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {mode === "signin"
                ? "Sign in to continue to ClubMatch."
                : "Get started — it's free."}
            </p>
          </div>

          {/* Role toggle */}
          <div
            className="relative flex rounded-xl bg-gray-100 p-1"
            role="tablist"
            aria-label="Select your role"
          >
            {/* Sliding pill */}
            <div
              className={cn(
                "absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-lg bg-white shadow-sm",
                "transition-transform duration-200 ease-in-out",
                role === "student" ? "translate-x-0" : "translate-x-[calc(100%+8px)]"
              )}
            />
            <button
              role="tab"
              aria-selected={role === "student"}
              onClick={() => { setRole("student"); setError(""); }}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors duration-150",
                role === "student" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <User size={13} />
              I'm a Student
            </button>
            <button
              role="tab"
              aria-selected={role === "admin"}
              onClick={() => { setRole("admin"); setError(""); }}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors duration-150",
                role === "admin" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Building2 size={13} />
              I'm a Club Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Name field — signup only */}
            {mode === "signup" && (
              <Input
                id="name"
                label={role === "admin" ? "Club / Organisation name" : "Full name"}
                value={name}
                onChange={setName}
                placeholder={role === "admin" ? "e.g. Robotics Society" : "e.g. Sarah Chen"}
                icon={role === "admin" ? Building2 : User}
                autoComplete="name"
                required
              />
            )}

            <Input
              id="email"
              label="University email"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); setError(""); }}
              placeholder="you@university.edu"
              icon={Mail}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(v) => { setPassword(v); setError(""); }}
              placeholder="Min. 6 characters"
              icon={Lock}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              }
            />

            {/* Forgot password — sign in only */}
            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs font-medium text-primary-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-200">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white",
                "bg-primary-600 shadow-md shadow-primary-200",
                "transition-all duration-150",
                "hover:bg-primary-500 active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-70"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {buttonLabel}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Mode toggle */}
          <p className="text-center text-sm text-gray-500">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("signin"); setError(""); }}
                  className="font-semibold text-primary-600 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Back to home */}
          <p className="text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
