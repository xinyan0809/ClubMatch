"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Send, ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  from: "user" | "club";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
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
//  MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    clubName: "街舞社",
    adminName: "社长 · 陈梓涵",
    avatarBg: "bg-pink-500",
    avatarInitial: "舞",
    lastMessage: "好的，期待你来！现场报名即可 🎉",
    lastTime: "10:32",
    unread: 2,
    messages: [
      {
        id: 1,
        from: "club",
        text: "你好！感谢你对街舞社的关注 🎉 请问你有舞蹈基础吗？",
        time: "10:15",
      },
      {
        id: 2,
        from: "user",
        text: "你好！我没有基础，但很想学 Popping 风格，可以加入吗？",
        time: "10:18",
      },
      {
        id: 3,
        from: "club",
        text: "完全没问题！我们欢迎零基础同学，每周三晚上有公开课可以先体验一下 😊",
        time: "10:20",
      },
      {
        id: 4,
        from: "user",
        text: "太好了！请问本周的宣讲会还有名额吗？",
        time: "10:29",
      },
      {
        id: 5,
        from: "club",
        text: "好的，期待你来！现场报名即可 🎉",
        time: "10:32",
      },
    ],
  },
  {
    id: 2,
    clubName: "AI 与机器学习协会",
    adminName: "负责人 · 张睿",
    avatarBg: "bg-indigo-600",
    avatarInitial: "AI",
    lastMessage: "下周六上午 10 点读书会，欢迎来旁听",
    lastTime: "昨天",
    unread: 0,
    messages: [
      {
        id: 1,
        from: "user",
        text: "你好，请问加入协会需要什么编程基础要求吗？",
        time: "昨天 14:05",
      },
      {
        id: 2,
        from: "club",
        text: "你好！Python 基础即可，我们有配套的入门学习路径，不用担心 💪",
        time: "昨天 14:40",
      },
      {
        id: 3,
        from: "user",
        text: "好的，那大一新生可以参加项目实战吗？",
        time: "昨天 15:01",
      },
      {
        id: 4,
        from: "club",
        text: "下周六上午 10 点读书会，欢迎来旁听",
        time: "昨天 15:10",
      },
    ],
  },
  {
    id: 3,
    clubName: "辩论社",
    adminName: "社长 · 林宛宁",
    avatarBg: "bg-teal-500",
    avatarInitial: "辩",
    lastMessage: "欢迎你加入辩论社大家庭！✨",
    lastTime: "周一",
    unread: 0,
    messages: [
      {
        id: 1,
        from: "club",
        text: "欢迎你加入辩论社大家庭！✨",
        time: "周一 09:00",
      },
      {
        id: 2,
        from: "club",
        text: "请记得本周四晚 7 点来参加新生见面会，地点：图书馆 A104 室 📍",
        time: "周一 09:01",
      },
    ],
  },
];

// Avatar colour palette for auto-generated conversations
const AUTO_COLOURS = [
  "bg-primary-600",
  "bg-violet-600",
  "bg-rose-500",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-fuchsia-600",
  "bg-orange-500",
];
function pickColour(name: string) {
  let n = 0;
  for (let i = 0; i < name.length; i++) n += name.charCodeAt(i);
  return AUTO_COLOURS[n % AUTO_COLOURS.length];
}

// ─────────────────────────────────────────────────────────────────────────────
//  MESSAGES CONTENT  (must be separate component so Suspense can wrap it)
// ─────────────────────────────────────────────────────────────────────────────

function MessagesContent() {
  const searchParams = useSearchParams();
  const clubParam    = searchParams.get("club");

  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeId,      setActiveId]      = useState<number | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [inputText,     setInputText]     = useState("");
  const [mobileView,    setMobileView]    = useState<"list" | "chat">("list");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Handle ?club= URL param ────────────────────────────────────────────────
  useEffect(() => {
    if (!clubParam) {
      // Default: open first conversation
      setActiveId(INITIAL_CONVERSATIONS[0]?.id ?? null);
      return;
    }

    // Try to find existing conversation
    const existing = INITIAL_CONVERSATIONS.find((c) => c.clubName === clubParam);
    if (existing) {
      setActiveId(existing.id);
      setMobileView("chat");
      return;
    }

    // Create a new empty conversation for this club
    const newConv: Conversation = {
      id: Date.now(),
      clubName: clubParam,
      adminName: "负责人",
      avatarBg: pickColour(clubParam),
      avatarInitial: clubParam[0],
      lastMessage: "发送第一条消息，开始沟通吧 👋",
      lastTime: "刚刚",
      unread: 0,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setMobileView("chat");
  }, [clubParam]);

  // ── Auto-scroll to latest message ─────────────────────────────────────────
  const activeConv  = conversations.find((c) => c.id === activeId) ?? null;
  const msgCount    = activeConv?.messages.length ?? 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, msgCount]);

  // ── Filtered conversation list ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.clubName.includes(q) || c.lastMessage.includes(q),
    );
  }, [conversations, searchQuery]);

  // ── Interactions ──────────────────────────────────────────────────────────
  const selectConv = (id: number) => {
    setActiveId(id);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
  };

  const sendMessage = () => {
    if (!inputText.trim() || !activeId) return;
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
    // Full height: subtract TopNav (4rem) + BottomNav on mobile (5rem)
    <div className="flex h-[calc(100dvh-9rem)] overflow-hidden md:h-[calc(100dvh-4rem)]">

      {/* ════ LEFT: Contact list ════════════════════════════════════════════ */}
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-r border-gray-100 bg-white md:w-[300px]",
          mobileView === "chat" && "hidden md:flex",
        )}
      >
        {/* Panel header */}
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

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">没有找到相关对话</p>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConv(conv.id)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                  activeId === conv.id && "border-r-2 border-primary-600 bg-primary-50",
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                    conv.avatarBg,
                  )}
                >
                  {conv.avatarInitial}
                  {conv.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>

                {/* Text info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">
                      {conv.clubName}
                    </span>
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
            {/* ── Chat header ────────────────────────────────────────────── */}
            <div className="flex shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-5 py-3.5 shadow-sm">
              {/* Back arrow — mobile only */}
              <button
                onClick={() => setMobileView("list")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
              >
                <ArrowLeft size={18} />
              </button>

              {/* Club avatar */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
                  activeConv.avatarBg,
                )}
              >
                {activeConv.avatarInitial}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{activeConv.clubName}</p>
                <p className="text-xs text-gray-400">{activeConv.adminName}</p>
              </div>

              <button className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100">
                <MoreVertical size={17} />
              </button>
            </div>

            {/* ── Message history ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto bg-[#f0f2f5] px-4 py-5">
              {activeConv.messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white",
                      activeConv.avatarBg,
                    )}
                  >
                    {activeConv.avatarInitial}
                  </div>
                  <p className="text-sm font-medium text-gray-600">{activeConv.clubName}</p>
                  <p className="text-xs text-gray-400">发送第一条消息，开始与社团沟通吧 👋</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeConv.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2",
                        msg.from === "user" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      {/* Club avatar — only on club messages */}
                      {msg.from === "club" && (
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                            activeConv.avatarBg,
                          )}
                        >
                          {activeConv.avatarInitial}
                        </div>
                      )}

                      {/* Bubble */}
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

                      {/* Timestamp */}
                      <span
                        className={cn(
                          "mb-0.5 shrink-0 text-[10px] text-gray-400",
                          msg.from === "user" ? "mr-0.5" : "ml-0.5",
                        )}
                      >
                        {msg.time}
                      </span>
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ── Input area ─────────────────────────────────────────────── */}
            <div className="flex shrink-0 items-center gap-2.5 border-t border-gray-100 bg-white px-4 py-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`发消息给 ${activeConv.clubName}…`}
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
          </>
        ) : (
          /* ── No selection placeholder (desktop only) ─────────────────── */
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
//  PAGE  (Suspense wrapper required by useSearchParams in App Router)
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
