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
 * `clubId` is the single unique key — matches Club.id from ALL_CLUBS.
 * Replaces the old random Date.now() id that caused duplicate key warnings.
 */
interface Conversation {
  clubId: number;
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
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "clubmatch_conversations";

// Seed conversations use real Club IDs (7 = 子衿汉服社, 12 = 模联, 14 = 青年创业社)
const SEED_CONVERSATIONS: Conversation[] = [
  {
    clubId: 7,
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
    clubId: 12,
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
    clubId: 14,
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
  const [activeClubId,  setActiveClubId]  = useState<number | null>(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [inputText,     setInputText]     = useState("");
  const [mobileView,    setMobileView]    = useState<"list" | "chat">("list");
  const [loaded,        setLoaded]        = useState(false);

  const messagesEndRef   = useRef<HTMLDivElement>(null);
  // Track which clubId URL param we've already processed to avoid re-running
  const processedKeyRef  = useRef<string>("");

  // ── 1. Load from localStorage (once on mount) ────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const convs: Conversation[] = raw ? JSON.parse(raw) : SEED_CONVERSATIONS;
      if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CONVERSATIONS));
      setConversations(convs);
    } catch {
      setConversations(SEED_CONVERSATIONS);
    }
    setLoaded(true);
  }, []);

  // ── 2. Handle ?clubId= URL param ─────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;

    const idStr  = searchParams.get("clubId") ?? "";
    const key    = idStr || "none";
    if (processedKeyRef.current === key) return; // already handled
    processedKeyRef.current = key;

    const clubId = parseInt(idStr, 10);

    if (isNaN(clubId)) {
      // No clubId param → activate the first conversation
      setConversations((prev) => {
        setActiveClubId(prev[0]?.clubId ?? null);
        return prev; // no structural change — React will bail out
      });
      return;
    }

    // Has valid clubId → find or create conversation
    setConversations((prev) => {
      const existing = prev.find((c) => c.clubId === clubId);
      if (existing) {
        setActiveClubId(clubId);
        setMobileView("chat");
        if (existing.unread === 0) return prev;
        return prev.map((c) => (c.clubId === clubId ? { ...c, unread: 0 } : c));
      }
      // Create a new conversation for this club
      const clubData = ALL_CLUBS.find((c) => c.id === clubId);
      if (!clubData) return prev;
      const newConv: Conversation = {
        clubId,
        clubName: clubData.name,
        adminName: "负责人",
        avatarBg: avatarColour(clubId),
        avatarInitial: clubData.name[0],
        lastMessage: "发送第一条消息，开始沟通吧 👋",
        lastTime: "刚刚",
        unread: 0,
        messages: [],
      };
      setActiveClubId(clubId);
      setMobileView("chat");
      return [newConv, ...prev];
    });
  }, [loaded, searchParams]);

  // ── 3. Persist conversations to localStorage ──────────────────────────────
  useEffect(() => {
    if (!loaded || conversations.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, loaded]);

  // ── Auto-scroll to latest message ────────────────────────────────────────
  const activeConv = conversations.find((c) => c.clubId === activeClubId) ?? null;
  const msgCount   = activeConv?.messages.length ?? 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeClubId, msgCount]);

  // ── Filtered conversation list ────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return conversations;
    return conversations.filter(
      (c) => c.clubName.includes(q) || c.lastMessage.includes(q),
    );
  }, [conversations, searchQuery]);

  // ── Interactions ──────────────────────────────────────────────────────────
  const selectConv = (clubId: number) => {
    setActiveClubId(clubId);
    setMobileView("chat");
    setConversations((prev) =>
      prev.map((c) => (c.clubId === clubId ? { ...c, unread: 0 } : c)),
    );
  };

  const sendMessage = () => {
    if (!inputText.trim() || activeClubId === null) return;
    const now  = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    // message id only needs to be unique within its conversation — Date.now() is fine here
    const msg: Message = { id: Date.now(), from: "user", text: inputText.trim(), time };
    setConversations((prev) =>
      prev.map((c) =>
        c.clubId === activeClubId
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

        {/* Conversation list — key uses clubId string to guarantee uniqueness */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">没有找到相关对话</p>
          ) : (
            filtered.map((conv) => (
              <button
                key={`conv_${conv.clubId}`}
                onClick={() => selectConv(conv.clubId)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                  activeClubId === conv.clubId && "border-r-2 border-primary-600 bg-primary-50",
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
                <p className="text-xs text-gray-400">{activeConv.adminName}</p>
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
                  <p className="text-xs text-gray-400">发送第一条消息，开始与社团沟通吧 👋</p>
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
