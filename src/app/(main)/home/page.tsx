"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart, MessageCircle, Share2, MoreHorizontal,
  Circle, CheckCircle2, ChevronRight,
  CalendarClock, Inbox, Megaphone, HelpCircle, Newspaper,
  Sparkles, CalendarX, Clock, MapPin, SquarePen, X, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CLUBS, type Club } from "@/data/clubs";
import { avatarColour } from "@/components/discover/ClubCard";

// ─────────────────────────────────────────────────────────────────────────────
//  FEED TYPES & SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const FEED_KEY = "clubmatch_global_feed";

type TagStyle = "amber" | "blue" | "green" | "violet";

const TAG_STYLES: Record<TagStyle, string> = {
  amber:  "bg-amber-50   text-amber-700  ring-amber-200",
  blue:   "bg-blue-50    text-blue-700   ring-blue-200",
  green:  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50  text-violet-700  ring-violet-200",
};

const TAG_ICONS: Record<TagStyle, React.ElementType> = {
  amber:  Megaphone,
  blue:   Newspaper,
  green:  HelpCircle,
  violet: Sparkles,
};

interface FeedComment {
  id: string;
  authorName: string;
  text: string;
}

interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  authorAvatarBg: string;
  tag: string;
  tagStyle: TagStyle;
  content: string;
  timestamp: string;
  likes: number;
  isLikedByMe: boolean;
  comments: FeedComment[];
  shares: number;
  image?: { gradient: string; label: string };
}

const SEED_POSTS: FeedPost[] = [
  {
    id: "seed_1",
    authorId: "org_jiewu",
    authorName: "街舞社",
    authorInitials: "舞",
    authorRole: "官方账号",
    authorAvatarBg: "bg-pink-500",
    tag: "招新公告",
    tagStyle: "amber",
    content:
      "🔥 街舞社招新宣讲会今晚正式开始！\n\n今晚 19:00，主楼大厅见！带上你的热情，不需要任何舞蹈基础，只要你敢来！现场设有 Breaking、Popping、Urban 风格展示，报名即送周边礼品 🎁\n\n快来找到属于你的节拍！",
    timestamp: "2 分钟前",
    image: { gradient: "from-pink-500 via-rose-500 to-purple-600", label: "今晚 19:00 · 主楼大厅" },
    likes: 48, isLikedByMe: false, comments: [], shares: 7,
  },
  {
    id: "seed_2",
    authorId: "org_aiml",
    authorName: "AI 与机器学习协会",
    authorInitials: "AI",
    authorRole: "官方账号",
    authorAvatarBg: "bg-indigo-600",
    tag: "社团动态",
    tagStyle: "blue",
    content:
      "📖 本周读书会推荐：《深度学习》（Goodfellow 著）第三章 — 概率与信息论\n\n周六上午 10:00，图书馆 B3 研讨室。本期由大三的张学长主讲，他刚拿到 CVPR 2026 的 paper！感兴趣的同学提前在群里打卡即可参加 🧠",
    timestamp: "15 分钟前",
    likes: 31, isLikedByMe: false, comments: [], shares: 3,
  },
  {
    id: "seed_3",
    authorId: "user_linyuxuan",
    authorName: "林宇轩",
    authorInitials: "林",
    authorRole: "新闻传播学 · 大一",
    authorAvatarBg: "bg-teal-500",
    tag: "同学提问",
    tagStyle: "green",
    content:
      "求问大家 📢\n\n作为大一新生，同时加入两个社团会不会太累？我在考虑辩论社和摄影协会，两个都很喜欢，但不知道能不能兼顾课业…\n\n有没有学长学姐能分享一下经验？🙏",
    timestamp: "1 小时前",
    likes: 19, isLikedByMe: false, comments: [], shares: 1,
  },
  {
    id: "seed_4",
    authorId: "org_robot",
    authorName: "机器人与硬件实验室",
    authorInitials: "机",
    authorRole: "官方账号",
    authorAvatarBg: "bg-cyan-600",
    tag: "社团动态",
    tagStyle: "blue",
    content:
      "🤖 本学期第一个项目——智能分拣机械臂，已完成主体搭建！\n\n感谢所有参与同学连续 4 周的努力。下周进入 AI 视觉识别模块的训练阶段，有兴趣的同学可以申请旁听，私信我们即可。",
    timestamp: "3 小时前",
    image: { gradient: "from-cyan-600 via-blue-600 to-indigo-700", label: "智能分拣机械臂 · 项目进度 Week 4" },
    likes: 67, isLikedByMe: false, comments: [], shares: 22,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  POST CARD
// ─────────────────────────────────────────────────────────────────────────────

function PostCard({
  post, onLike, onAvatarClick,
  commentExpanded, onToggleComment, onAddComment,
}: {
  post: FeedPost;
  onLike: () => void;
  onAvatarClick: () => void;
  commentExpanded: boolean;
  onToggleComment: () => void;
  onAddComment: (text: string) => void;
}) {
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const TagIcon = TAG_ICONS[post.tagStyle];

  useEffect(() => {
    if (commentExpanded) setTimeout(() => commentInputRef.current?.focus(), 50);
  }, [commentExpanded]);

  const submitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText("");
  };

  return (
    <article className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div className="flex items-start gap-3">
          <button
            onClick={onAvatarClick}
            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80", post.authorAvatarBg)}
          >
            {post.authorInitials}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <button onClick={onAvatarClick} className="text-sm font-bold text-gray-900 hover:underline">
                {post.authorName}
              </button>
              <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1", TAG_STYLES[post.tagStyle])}>
                <TagIcon size={9} />
                {post.tag}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">{post.authorRole} · {post.timestamp}</p>
          </div>
        </div>
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pt-3">
        <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{post.content}</p>
      </div>

      {/* Optional image */}
      {post.image && (
        <div className="mx-5 mt-3 overflow-hidden rounded-xl">
          <div className={cn("relative flex h-44 items-end bg-gradient-to-br p-4 sm:h-52", post.image.gradient)}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle,#ffffff 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
            <span className="relative z-10 rounded-lg bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">{post.image.label}</span>
          </div>
        </div>
      )}

      {/* Comments */}
      {post.comments.length > 0 && (
        <div className="mx-5 mt-3 space-y-1.5">
          {post.comments.map((c) => (
            <div key={c.id} className="rounded-xl bg-gray-50 px-3 py-2 text-xs">
              <span className="font-semibold text-gray-800">{c.authorName}</span>
              <span className="ml-1 text-gray-600">{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Inline comment input */}
      {commentExpanded && (
        <div className="mx-5 mt-2.5 flex items-center gap-2">
          <input
            ref={commentInputRef}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitComment(); } }}
            placeholder="写下你的评论…"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
          <button
            onClick={submitComment}
            disabled={!commentText.trim()}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95",
              commentText.trim() ? "bg-primary-600 text-white hover:bg-primary-500" : "bg-gray-100 text-gray-400",
            )}
          >
            <Send size={13} />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-1 border-t border-gray-50 px-4 py-3">
        <button
          onClick={onLike}
          className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all", post.isLikedByMe ? "bg-red-50 text-red-500" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700")}
        >
          <Heart size={15} className={cn("transition-transform", post.isLikedByMe && "scale-110")} fill={post.isLikedByMe ? "currentColor" : "none"} />
          {post.likes}
        </button>
        <button
          onClick={onToggleComment}
          className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors", commentExpanded ? "bg-primary-50 text-primary-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700")}
        >
          <MessageCircle size={15} />
          {post.comments.length > 0 ? post.comments.length : "评论"}
        </button>
        <button className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Share2 size={15} />
          {post.shares > 0 ? post.shares : "转发"}
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPOSE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ComposeModal({
  onPublish, onClose,
}: {
  onPublish: (content: string) => void;
  onClose: () => void;
}) {
  const [text,        setText]       = useState("");
  const [authorName,  setAuthorName] = useState("");
  const [isAdmin,     setIsAdmin]    = useState(false);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const role     = localStorage.getItem("cm_userRole");
    const clubName = localStorage.getItem("cm_adminClubName") || "";
    const userName = localStorage.getItem("cm_userName")?.trim() || "同学";
    const admin    = role === "admin";
    setIsAdmin(admin);
    setAuthorName(admin && clubName ? clubName : userName);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">发布动态</h3>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-3 flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white",
              isAdmin ? "bg-amber-500" : "bg-primary-600",
            )}>
              {authorName[0] || "我"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-400">
                {isAdmin ? "以社团官方账号发布" : "发布到校园动态"}
              </p>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={isAdmin ? "发布招新公告、活动通知…" : "分享你的想法、活动信息、求问…"}
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
          />
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95">
            取消
          </button>
          <button
            onClick={() => { if (text.trim()) { onPublish(text.trim()); onClose(); } }}
            disabled={!text.trim()}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95",
              text.trim()
                ? isAdmin
                  ? "bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-200"
                  : "bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-200"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
          >
            发布
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIDEBAR WIDGETS
// ─────────────────────────────────────────────────────────────────────────────

function ProfileWidget() {
  const [steps, setSteps] = useState([
    { label: "基本信息",  done: false },
    { label: "技能标签",  done: false },
    { label: "MBTI 测试", done: false },
    { label: "自我介绍",  done: false },
    { label: "上传头像",  done: false },
  ]);

  useEffect(() => {
    const name    = localStorage.getItem("cm_userName")?.trim() ?? "";
    const profile = JSON.parse(localStorage.getItem(name ? `profile_data_${name}` : "cm_userProfile") ?? "{}") as {
      major?: string; mbti?: string; skills?: string; bio?: string; avatar?: string;
    };
    setSteps([
      { label: "基本信息",  done: name.length > 0 },
      { label: "技能标签",  done: (profile.skills ?? "").trim().length > 0 },
      { label: "MBTI 测试", done: (profile.mbti   ?? "").trim().length > 0 },
      { label: "自我介绍",  done: (profile.bio    ?? "").trim().length > 0 },
      { label: "上传头像",  done: (profile.avatar ?? "").trim().length > 0 },
    ]);
  }, []);

  const doneCount = steps.filter((s) => s.done).length;
  const pct       = Math.round((doneCount / steps.length) * 100);
  const allDone   = doneCount === steps.length;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">完善个人名片</h3>
        <span className={cn("text-xs font-bold", pct === 100 ? "text-emerald-500" : "text-gray-400")}>{pct}%</span>
      </div>
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400">
        {allDone ? "🏅 已解锁「优质候选人」徽章！" : `还差 ${steps.length - doneCount} 项解锁「优质候选人」徽章 🏅`}
      </p>
      <ul className="mt-4 space-y-2">
        {steps.map(({ label, done }) => (
          <li key={label} className="flex items-center gap-2.5 text-xs">
            {done ? <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> : <Circle size={14} className="shrink-0 text-gray-300" />}
            <span className={cn("font-medium", done ? "text-gray-500 line-through" : "text-gray-700")}>{label}</span>
            {done
              ? <span className="ml-auto rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200">已完成</span>
              : <span className="ml-auto rounded-full bg-amber-50  px-1.5 py-0.5 text-[10px] font-semibold text-amber-600  ring-1 ring-amber-200">待完善</span>
            }
          </li>
        ))}
      </ul>
      <Link href="/profile" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-xs font-bold text-white transition-colors hover:bg-primary-500 active:scale-95">
        去完善 <ChevronRight size={13} />
      </Link>
      <p className="mt-2 text-center text-[11px] text-gray-400">完善简历，让心仪社团主动发现你！</p>
    </div>
  );
}

function InterviewWidget() {
  const [appliedClubs, setAppliedClubs] = useState<Club[]>([]);

  useEffect(() => {
    try {
      const userName = localStorage.getItem("cm_userName")?.trim() || "";
      const raw = localStorage.getItem(`applied_clubs_${userName}`);
      if (raw) {
        const ids = JSON.parse(raw) as number[];
        setAppliedClubs(ALL_CLUBS.filter((c) => ids.includes(c.id)));
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={15} className={appliedClubs.length > 0 ? "text-primary-500" : "text-gray-400"} />
          <h3 className="text-sm font-bold text-gray-900">近期日程</h3>
        </div>
        {appliedClubs.length > 0 && (
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600 ring-1 ring-primary-200">
            {appliedClubs.length} 场
          </span>
        )}
      </div>

      {appliedClubs.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 py-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100">
            <CalendarX size={20} className="text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">暂无日程</p>
            <p className="mt-0.5 text-xs text-gray-400">申请社团后，面试通知会出现在这里</p>
          </div>
          <Link href="/discover" className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95">
            去申请社团 <ChevronRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {appliedClubs.map((club) => (
            <div key={club.id} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white", avatarColour(club.id))}>
                  {club.name[0]}
                </div>
                <p className="truncate text-sm font-semibold text-gray-900">{club.name}</p>
              </div>
              <div className="mt-2 space-y-1 pl-[2.375rem]">
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={11} className="shrink-0 text-primary-400" />
                  {club.interviewTime}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin size={11} className="shrink-0 text-primary-400" />
                  {club.interviewLocation}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationsWidget() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const userName = localStorage.getItem("cm_userName")?.trim() || "";
      const raw = localStorage.getItem(`applied_clubs_${userName}`);
      if (raw) setCount((JSON.parse(raw) as number[]).length);
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">我的投递</h3>
        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", count > 0 ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "bg-gray-100 text-gray-500")}>
          {count} 条
        </span>
      </div>

      {count === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-3 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 ring-1 ring-gray-100">
            <Inbox size={24} className="text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">你还没有投递任何组织哦～</p>
            <p className="mt-1 text-xs text-gray-400">去发现感兴趣的社团，开启你的大学故事</p>
          </div>
          <Link href="/discover" className="mt-1 flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95">
            点击去寻找适合的社团 <ChevronRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <p className="text-xs text-gray-400">已成功投递 {count} 个社团，请留意面试通知。</p>
          <Link href="/discover" className="flex items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95">
            继续发现更多社团 <ChevronRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();

  const [posts,           setPosts]           = useState<FeedPost[]>([]);
  const [userName,        setUserName]        = useState("");
  const [isAdmin,         setIsAdmin]         = useState(false);
  const [adminClubName,   setAdminClubName]   = useState("");
  const [showCompose,     setShowCompose]     = useState(false);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);

  // ── Load feed from localStorage on mount (seed if empty) ──────────────────
  useEffect(() => {
    const role     = localStorage.getItem("cm_userRole");
    const clubName = localStorage.getItem("cm_adminClubName") || "";
    setIsAdmin(role === "admin");
    setAdminClubName(clubName);
    setUserName(localStorage.getItem("cm_userName")?.trim() || "");
    try {
      const raw = localStorage.getItem(FEED_KEY);
      if (raw) {
        setPosts(JSON.parse(raw) as FeedPost[]);
      } else {
        setPosts(SEED_POSTS);
        localStorage.setItem(FEED_KEY, JSON.stringify(SEED_POSTS));
      }
    } catch {
      setPosts(SEED_POSTS);
    }
  }, []);

  const savePosts = (updated: FeedPost[]) => {
    setPosts(updated);
    localStorage.setItem(FEED_KEY, JSON.stringify(updated));
  };

  // ── Feed interactions ──────────────────────────────────────────────────────
  const handleLike = (id: string) =>
    savePosts(posts.map((p) =>
      p.id === id
        ? { ...p, isLikedByMe: !p.isLikedByMe, likes: p.isLikedByMe ? p.likes - 1 : p.likes + 1 }
        : p,
    ));

  const handleAddComment = (id: string, text: string) => {
    const authorName = localStorage.getItem("cm_userName")?.trim() || "同学";
    const comment: FeedComment = { id: Date.now().toString(), authorName, text };
    savePosts(posts.map((p) => p.id === id ? { ...p, comments: [...p.comments, comment] } : p));
    setExpandedComment(null);
  };

  const handlePublish = (content: string) => {
    const isAdmin  = localStorage.getItem("cm_userRole") === "admin";
    const clubName = localStorage.getItem("cm_adminClubName") || "";
    const userName = localStorage.getItem("cm_userName")?.trim() || "同学";

    const authorName     = isAdmin && clubName ? clubName : userName;
    const authorId       = isAdmin && clubName ? `org_${clubName}` : `user_${userName}`;
    const authorInitials = authorName[0] || "我";

    const newPost: FeedPost = {
      id:             "post_" + Date.now(),
      authorId,
      authorName,
      authorInitials,
      authorRole:     isAdmin ? "官方账号" : "在校学生",
      authorAvatarBg: isAdmin ? "bg-amber-500" : "bg-primary-600",
      tag:            isAdmin ? "招新公告" : "社团动态",
      tagStyle:       isAdmin ? "amber" : "blue",
      content,
      timestamp:      "刚刚",
      likes:          0,
      isLikedByMe:    false,
      comments:       [],
      shares:         0,
    };
    savePosts([newPost, ...posts]);
  };

  const handleAvatarClick = (authorId: string, authorName: string) => {
    router.push(
      `/messages?targetId=${encodeURIComponent(authorId)}&targetName=${encodeURIComponent(authorName)}`,
    );
  };

  const displayName = isAdmin
    ? (adminClubName || "社团")
    : (userName || "同学");

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className={cn("mx-auto px-4 py-6 sm:px-6", isAdmin ? "max-w-3xl" : "max-w-6xl")}>

        {/* ── Greeting ─────────────────────────────────────────── */}
        <header className="mb-6">
          {isAdmin ? (
            <>
              <h1 className="text-xl font-bold text-gray-900">
                你好，<span className="text-amber-600">{displayName}</span> 负责人 👋
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                欢迎来到&nbsp;
                <span className="font-semibold text-primary-600">校园动态管理中心</span>
                &nbsp;· 在这里发布招新公告，吸引优质学生 ✨
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900">你好，{displayName} 👋</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                欢迎加入&nbsp;
                <span className="font-semibold text-primary-600">中国传媒大学</span>
                &nbsp;· 期待你找到心仪的圈子 ✨
              </p>
            </>
          )}
        </header>

        {isAdmin ? (
          /* ── Admin: single-column centered feed ── */
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700">校园动态</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-400 active:scale-95"
                >
                  <SquarePen size={13} />
                  发布公告
                </button>
              </div>
            </div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onAvatarClick={() => handleAvatarClick(post.authorId, post.authorName)}
                commentExpanded={expandedComment === post.id}
                onToggleComment={() => setExpandedComment((prev) => prev === post.id ? null : post.id)}
                onAddComment={(text) => handleAddComment(post.id, text)}
              />
            ))}
          </section>
        ) : (
          /* ── Student: two-column layout ── */
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

            {/* ═══ LEFT: FEED ═══ */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-700">校园动态</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCompose(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-500 active:scale-95"
                  >
                    <SquarePen size={13} />
                    发布
                  </button>
                  <button className="text-xs font-semibold text-primary-600 hover:underline">查看全部</button>
                </div>
              </div>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => handleLike(post.id)}
                  onAvatarClick={() => handleAvatarClick(post.authorId, post.authorName)}
                  commentExpanded={expandedComment === post.id}
                  onToggleComment={() => setExpandedComment((prev) => prev === post.id ? null : post.id)}
                  onAddComment={(text) => handleAddComment(post.id, text)}
                />
              ))}
            </section>

            {/* ═══ RIGHT: SIDEBAR ═══ */}
            <aside className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-gray-700">个人行动中心</h2>
              <ProfileWidget />
              <InterviewWidget />
              <ApplicationsWidget />
            </aside>
          </div>
        )}
      </div>

      {/* ── Compose modal ────────────────────────────────────────────────── */}
      {showCompose && (
        <ComposeModal
          onPublish={handlePublish}
          onClose={() => setShowCompose(false)}
        />
      )}
    </div>
  );
}
