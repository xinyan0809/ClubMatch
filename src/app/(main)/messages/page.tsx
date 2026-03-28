"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Send, ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CLUBS } from "@/data/clubs";
import { avatarColour } from "@/components/discover/ClubCard";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  from: "user" | "club";
  text: string;
  time: string;
}

/**
 * `id` is the single unique key (standard naming).
 * Club conversations:  id = "club_7", "club_12", etc.
 * Peer conversations:  id = "peer_<authorId>"
 */
interface Conversation {
  id: string;
  clubName: string;
  adminName: string;
  avatarBg: string;
  avatarInitial: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-rose-500",
  "bg-amber-500",  "bg-indigo-500", "bg-teal-500",  "bg-pink-500",
];

/** Deterministic color from any string — used for peer avatars. */
function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** Returns true if every item in the array has a non-empty string `id`. */
function isValidConversationArray(arr: unknown): arr is Conversation[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).id === "string" &&
        ((item as Record<string, unknown>).id as string).length > 0,
    )
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "clubmatch_conversations";

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "club_7",
    clubName: "子衿汉服社",
    adminName: "社长 · 林慧",
    avatarBg: avatarColour(7),
    avatarInitial: "子",
    lastMessage: "欢迎加入！本周六有花朝节活动，期待你来 🌸",
    lastTime: "10:45",
    unread: 1,
    messages: [
      { id: 1, from: "user", text: "你好！我对汉服文化很感兴趣，请问社团有什么加入要求吗？", time: "10:30" },
      { id: 2, from: "club", text: "你好！我们完全零基础欢迎，不需要自备汉服，社团有借穿服务 😊 只要热爱传统文化就可以！", time: "10:38" },
      { id: 3, from: "user", text: "太好了！那活动大概多久一次？", time: "10:41" },
      { id: 4, from: "club", text: "欢迎加入！本周六有花朝节活动，期待你来 🌸", time: "10:45" },
    ],
  },
  {
    id: "club_12",
    clubName: "模拟联合国协会",
    adminName: "主席 · 赵宇翔",
    avatarBg: avatarColour(12),
    avatarInitial: "模",
    lastMessage: "新生不需要经验，我们有专门的培训课程 💪",
    lastTime: "昨天",
    unread: 0,
    messages: [
      { id: 1, from: "user", text: "你好，请问加入模联需要有参赛经验吗？我是大一新生。", time: "昨天 16:10" },
      { id: 2, from: "club", text: "新生不需要经验，我们有专门的培训课程 💪", time: "昨天 17:35" },
    ],
  },
  {
    id: "club_14",
    clubName: "青年创业社",
    adminName: "社长 · 陈明",
    avatarBg: avatarColour(14),
    avatarInitial: "青",
    lastMessage: "下周四晚 7 点有创业分享会，欢迎来听！",
    lastTime: "周一",
    unread: 0,
    messages: [
      { id: 1, from: "club", text: "感谢你对青年创业社的关注 🚀 请问你目前有具体的创业方向吗？", time: "周一 10:00" },
      { id: 2, from: "user", text: "我还在探索阶段，想了解新媒体创业方向。", time: "周一 10:20" },
      { id: 3, from: "club", text: "下周四晚 7 点有创业分享会，欢迎来听！", time: "周一 10:25" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  MESSAGES CONTENT
// ─────────────────────────────────────────────────────────────────────────────

function MessagesContent() {
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId,      setActiveId]      = useState<string | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [inputText,     setInputText]     = useState("");
  const [mobileView,    setMobileView]    = useState<"list" | "chat">("list");
  const [loaded,        setLoaded]        = useState(false);
  const [adminClubName, setAdminClubName] = useState<string | null>(null);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const processedKeyRef = useRef<string>("");

  // ── 1. Load from localStorage (once on mount) ────────────────────────────
  //      If stored data is dirty (missing valid `id` fields), nuke and reseed.
  useEffect(() => {
    // Read admin identity
    if (localStorage.getItem("cm_userRole") === "admin") {
      setAdminClubName(localStorage.getItem("cm_adminClubName") || null);
    }

    try {
      const raw    = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;

      if (isValidConversationArray(parsed)) {
        setConversations(parsed);
      } else {
        // Dirty / stale / legacy data — clear and start fresh
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CONVERSATIONS));
        setConversations(SEED_CONVERSATIONS);
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CONVERSATIONS));
      setConversations(SEED_CONVERSATIONS);
    }
    setLoaded(true);
  }, []);

  // ── 2. Handle URL params: ?clubId= (legacy) or ?targetId= + ?targetName= ─
  useEffect(() => {
    if (!loaded) return;

    const clubIdStr  = searchParams.get("clubId")     ?? "";
    const targetId   = searchParams.get("targetId")   ?? "";
    const targetName = searchParams.get("targetName") ?? "";

    // Stable key for dedup guard
    const key = clubIdStr ? `club_${clubIdStr}` : targetId ? `peer_${targetId}` : "none";
    if (processedKeyRef.current === key) return;
    processedKeyRef.current = key;

    // ── Case A: ?targetId= — peer conversation ────────────────────────────
    if (targetId) {
      const convId = `peer_${targetId}`;
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === convId);
        if (existing) {
          setActiveId(convId);
          setMobileView("chat");
          if (existing.unread === 0) return prev;
          return prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c));
        }
        // Create ONE new peer conversation — id is deterministic so re-routing
        // to the same person never duplicates.
        const displayName = targetName || targetId;
        const newConv: Conversation = {
          id: convId,
          clubName: displayName,
          adminName: "",
          avatarBg: hashColor(targetId),
          avatarInitial: displayName[0] ?? "?",
          lastMessage: "发送第一条消息，开始沟通吧 👋",
          lastTime: "刚刚",
          unread: 0,
          messages: [],
        };
        setActiveId(convId);
        setMobileView("chat");
        return [newConv, ...prev];
      });
      return;
    }

    // ── Case B: ?clubId= — club conversation ─────────────────────────────
    const clubId = parseInt(clubIdStr, 10);
    if (isNaN(clubId)) {
      setConversations((prev) => {
        setActiveId(prev[0]?.id ?? null);
        return prev;
      });
      return;
    }

    const convId = `club_${clubId}`;
    setConversations((prev) => {
      const existing = prev.find((c) => c.id === convId);
      if (existing) {
        setActiveId(convId);
        setMobileView("chat");
        if (existing.unread === 0) return prev;
        return prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c));
      }
      const clubData = ALL_CLUBS.find((c) => c.id === clubId);
      if (!clubData) return prev;
      const newConv: Conversation = {
        id: convId,
        clubName: clubData.name,
        adminName: "负责人",
        avatarBg: avatarColour(clubId),
        avatarInitial: clubData.name[0],
        lastMessage: "发送第一条消息，开始沟通吧 👋",
        lastTime: "刚刚",
        unread: 0,
        messages: [],
      };
      setActiveId(convId);
      setMobileView("chat");
      return [newConv, ...prev];
    });
  }, [loaded, searchParams]);

  // ── 3. Persist conversations to localStorage ──────────────────────────────
  useEffect(() => {
    if (!loaded || conversations.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, loaded]);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  const activeConv = conversations.find((c) => c.id === activeId) ?? null;
  const msgCount   = activeConv?.messages.length ?? 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, msgCount]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.clubName.includes(q) || c.lastMessage.includes(q),
    );
  }, [conversations, searchQuery]);

  // ── Interactions ──────────────────────────────────────────────────────────
  const selectConv = (id: string) => {
    setActiveId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const sendMessage = () => {
    if (!inputText.trim() || activeId === null) return;
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const msg: Message = { id: Date.now(), from: "user", text: inputText.trim(), time };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastTime: time }
          : c,
      ),
    );
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100dvh-9rem)] overflow-hidden md:h-[calc(100dvh-4rem)]">

      {/* ════ LEFT: Contact list ════════════════════════════════════════════ */}
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-r border-gray-100 bg-white md:w-[300px]",
          mobileView === "chat" && "hidden md:flex",
        )}
      >
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">消息</h2>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5">
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="搜索对话"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-100 py-2 pl-8 pr-3 text-sm outline-none transition focus:bg-gray-50 focus:ring-1 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* Conversation list — fallback key prevents crash if data is partially corrupt */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">没有找到相关对话</p>
          ) : (
            filtered.map((conv, index) => (
              <button
                key={conv.id || `fallback-${index}`}
                onClick={() => selectConv(conv.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                  activeId === conv.id && "border-r-2 border-primary-600 bg-primary-50",
                )}
              >
                <div className={cn("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", conv.avatarBg)}>
                  {conv.avatarInitial}
                  {conv.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">{conv.clubName}</span>
                    <span className="shrink-0 text-[11px] text-gray-400">{conv.lastTime}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{conv.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ════ RIGHT: Chat window ════════════════════════════════════════════ */}
      <main
        className={cn(
          "flex flex-1 flex-col overflow-hidden",
          mobileView === "list" && "hidden md:flex",
        )}
      >
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-5 py-3.5 shadow-sm">
              <button
                onClick={() => setMobileView("list")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white", activeConv.avatarBg)}>
                {activeConv.avatarInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{activeConv.clubName}</p>
                {activeConv.adminName && (
                  <p className="text-xs text-gray-400">{activeConv.adminName}</p>
                )}
              </div>
              <button className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100">
                <MoreVertical size={17} />
              </button>
            </div>

            {/* Message history */}
            <div className="flex-1 overflow-y-auto bg-[#f0f2f5] px-4 py-5">
              {activeConv.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white", activeConv.avatarBg)}>
                    {activeConv.avatarInitial}
                  </div>
                  <p className="text-sm font-medium text-gray-600">{activeConv.clubName}</p>
                  <p className="text-xs text-gray-400">发送第一条消息，开始沟通吧 👋</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn("flex items-end gap-2", msg.from === "user" ? "flex-row-reverse" : "flex-row")}
                    >
                      {msg.from === "club" && (
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", activeConv.avatarBg)}>
                          {activeConv.avatarInitial}
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[65%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                          msg.from === "user"
                            ? "rounded-br-sm bg-primary-600 text-white"
                            : "rounded-bl-sm bg-white text-gray-800",
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className={cn("mb-0.5 shrink-0 text-[10px] text-gray-400", msg.from === "user" ? "mr-0.5" : "ml-0.5")}>
                        {msg.time}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-3 pt-2">
              {adminClubName && (
                <p className="mb-1.5 text-[11px] font-semibold text-amber-600">
                  以「{adminClubName}」身份发送
                </p>
              )}
              <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  adminClubName
                    ? `以「${adminClubName}」身份回复…`
                    : `发消息给 ${activeConv.clubName}…`
                }
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none transition focus:border-primary-300 focus:bg-white focus:ring-2 focus:ring-primary-100"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim()}
                aria-label="发送"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95",
                  inputText.trim()
                    ? "bg-primary-600 text-white hover:bg-primary-500"
                    : "cursor-not-allowed bg-gray-100 text-gray-400",
                )}
              >
                <Send size={16} />
              </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#f0f2f5] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Send size={24} className="text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">选择一个对话</p>
              <p className="mt-1 text-sm text-gray-400">从左侧列表中选择社团开始沟通</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE  (Suspense boundary required by useSearchParams in App Router)
// ─────────────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
