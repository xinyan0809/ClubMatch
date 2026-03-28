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
  id: string;
  senderType: "student" | "admin";
  text: string;
  time: string;
}

/**
 * A conversation is between ONE student and ONE club.
 * studentName === "" means seed data visible to any logged-in student.
 */
interface Conversation {
  id: string;
  clubName: string;
  studentName: string;
  avatarBg: string;
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

function hashColor(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** Rejects any old-format data that lacks the new required fields. */
function isValid(arr: unknown): arr is Conversation[] {
  return (
    Array.isArray(arr) &&
    arr.every(
      (item) =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).id          === "string" &&
        ((item as Record<string, unknown>).id as string).length > 0 &&
        typeof (item as Record<string, unknown>).clubName    === "string" &&
        typeof (item as Record<string, unknown>).studentName === "string",
    )
  );
}

/** Filter conversations visible to the current user. */
function visibleFor(
  convs: Conversation[],
  role: "student" | "admin",
  userName: string,
  adminClubName: string,
): Conversation[] {
  if (role === "admin") {
    return convs.filter((c) => c.clubName === adminClubName);
  }
  // Students see convs that belong to them, or seed rows (studentName === "")
  return convs.filter(
    (c) => c.studentName === "" || c.studentName === userName,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SEED DATA  (studentName = "" → any student can see these)
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "clubmatch_conversations";

const SEED_CONVERSATIONS: Conversation[] = [
  {
    id: "seed_club_7",
    clubName: "子衿汉服社",
    studentName: "",
    avatarBg: avatarColour(7),
    lastMessage: "欢迎加入！本周六有花朝节活动，期待你来 🌸",
    lastTime: "10:45",
    unread: 1,
    messages: [
      { id: "s7m1", senderType: "student", text: "你好！我对汉服文化很感兴趣，请问社团有什么加入要求吗？",                           time: "10:30" },
      { id: "s7m2", senderType: "admin",   text: "你好！我们完全零基础欢迎，不需要自备汉服，社团有借穿服务 😊 只要热爱传统文化就可以！", time: "10:38" },
      { id: "s7m3", senderType: "student", text: "太好了！那活动大概多久一次？",                                               time: "10:41" },
      { id: "s7m4", senderType: "admin",   text: "欢迎加入！本周六有花朝节活动，期待你来 🌸",                                    time: "10:45" },
    ],
  },
  {
    id: "seed_club_12",
    clubName: "模拟联合国协会",
    studentName: "",
    avatarBg: avatarColour(12),
    lastMessage: "新生不需要经验，我们有专门的培训课程 💪",
    lastTime: "昨天",
    unread: 0,
    messages: [
      { id: "s12m1", senderType: "student", text: "你好，请问加入模联需要有参赛经验吗？我是大一新生。", time: "昨天 16:10" },
      { id: "s12m2", senderType: "admin",   text: "新生不需要经验，我们有专门的培训课程 💪",          time: "昨天 17:35" },
    ],
  },
  {
    id: "seed_club_14",
    clubName: "青年创业社",
    studentName: "",
    avatarBg: avatarColour(14),
    lastMessage: "下周四晚 7 点有创业分享会，欢迎来听！",
    lastTime: "周一",
    unread: 0,
    messages: [
      { id: "s14m1", senderType: "admin",   text: "感谢你对青年创业社的关注 🚀 请问你目前有具体的创业方向吗？", time: "周一 10:00" },
      { id: "s14m2", senderType: "student", text: "我还在探索阶段，想了解新媒体创业方向。",                   time: "周一 10:20" },
      { id: "s14m3", senderType: "admin",   text: "下周四晚 7 点有创业分享会，欢迎来听！",                    time: "周一 10:25" },
    ],
  },
];

/** Generate 2 mock student→club conversations for a newly-logged-in admin. */
function adminMockConversations(clubName: string): Conversation[] {
  return [
    {
      id: `admin_mock_${clubName}_1`,
      clubName,
      studentName: "Mock - 李明",
      avatarBg: hashColor("Mock - 李明"),
      lastMessage: "社长你好，请问面试需要准备什么？",
      lastTime: "今天",
      unread: 1,
      messages: [
        { id: "am1m1", senderType: "student", text: "社长你好，请问面试需要准备什么？", time: "09:30" },
      ],
    },
    {
      id: `admin_mock_${clubName}_2`,
      clubName,
      studentName: "Mock - 王思",
      avatarBg: hashColor("Mock - 王思"),
      lastMessage: "我对贵社团非常感兴趣，能否介绍一下日常活动频率？",
      lastTime: "昨天",
      unread: 0,
      messages: [
        { id: "am2m1", senderType: "student", text: "我对贵社团非常感兴趣，能否介绍一下日常活动频率？",     time: "昨天 16:00" },
        { id: "am2m2", senderType: "admin",   text: "你好！我们每周有 1-2 次活动，欢迎你来了解详情 😊",  time: "昨天 17:00" },
      ],
    },
  ];
}

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

  // Immutable identity — set once on mount, never changes mid-session
  const [userRole,      setUserRole]      = useState<"student" | "admin">("student");
  const [userName,      setUserName]      = useState("");
  const [adminClubName, setAdminClubName] = useState("");

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const processedKeyRef = useRef<string>("");

  // ── 1. Load identity + conversations ─────────────────────────────────────
  useEffect(() => {
    const role      = (localStorage.getItem("cm_userRole") || "student") as "student" | "admin";
    const uName     = localStorage.getItem("cm_userName")?.trim() || "";
    const clubName  = localStorage.getItem("cm_adminClubName") || "";

    setUserRole(role);
    setUserName(uName);
    setAdminClubName(clubName);

    // Load + validate conversations
    let convs: Conversation[];
    try {
      const raw    = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (isValid(parsed)) {
        convs = parsed;
      } else {
        convs = SEED_CONVERSATIONS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CONVERSATIONS));
      }
    } catch {
      convs = SEED_CONVERSATIONS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CONVERSATIONS));
    }

    // Admin: inject mock conversations if their club has none
    if (role === "admin" && clubName) {
      const hasMine = convs.some((c) => c.clubName === clubName);
      if (!hasMine) {
        const mocks = adminMockConversations(clubName);
        convs = [...mocks, ...convs];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
      }
    }

    setConversations(convs);
    setLoaded(true);
  }, []);

  // ── 2. Handle URL params ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;

    const clubIdStr  = searchParams.get("clubId")     ?? "";
    const targetId   = searchParams.get("targetId")   ?? "";
    const targetName = searchParams.get("targetName") ?? "";

    const key = clubIdStr  ? `clubid_${clubIdStr}`
              : targetId   ? `target_${targetId}`
              : "none";
    if (processedKeyRef.current === key) return;
    processedKeyRef.current = key;

    if (key === "none") {
      // No param → open first visible conversation
      setConversations((prev) => {
        const vis = visibleFor(prev, userRole, userName, adminClubName);
        setActiveId(vis[0]?.id ?? null);
        return prev;
      });
      return;
    }

    // Resolve which club + student this conversation belongs to
    let targetClubName    = "";
    let targetStudentName = "";

    if (clubIdStr) {
      // From /discover "去沟通" button — always a student contacting a club
      const clubId   = parseInt(clubIdStr, 10);
      const clubData = ALL_CLUBS.find((c) => c.id === clubId);
      if (!clubData) return;
      targetClubName    = clubData.name;
      targetStudentName = userName || "";
    } else if (targetId) {
      // From home feed avatar click
      if (userRole === "admin") {
        // Admin replies to a student who posted in the feed
        targetClubName    = adminClubName;
        targetStudentName = targetName || targetId;
      } else {
        // Student contacts a club (targetId = "org_xxx", targetName = club name)
        targetClubName    = targetName || targetId;
        targetStudentName = userName || "";
      }
    }

    if (!targetClubName) return;

    // Deterministic id — prevents duplicates on repeated routing
    const safeClub    = targetClubName.replace(/\s/g, "_");
    const safeStudent = (targetStudentName || "anon").replace(/\s/g, "_");
    const convId      = `conv_${safeClub}_${safeStudent}`;

    setConversations((prev) => {
      // Find by exact id or by matching clubName+studentName
      const existing = prev.find(
        (c) =>
          c.id === convId ||
          (c.clubName === targetClubName &&
            (c.studentName === targetStudentName ||
              (targetStudentName === "" && c.studentName === ""))),
      );
      if (existing) {
        setActiveId(existing.id);
        setMobileView("chat");
        if (existing.unread === 0) return prev;
        return prev.map((c) => (c.id === existing.id ? { ...c, unread: 0 } : c));
      }

      // Create new conversation
      const clubData = ALL_CLUBS.find((c) => c.name === targetClubName);
      const bg = userRole === "admin"
        ? hashColor(targetStudentName)
        : clubData ? avatarColour(clubData.id) : hashColor(targetClubName);

      const newConv: Conversation = {
        id: convId,
        clubName:    targetClubName,
        studentName: targetStudentName,
        avatarBg:    bg,
        lastMessage: "发送第一条消息，开始沟通吧 👋",
        lastTime:    "刚刚",
        unread:      0,
        messages:    [],
      };
      setActiveId(convId);
      setMobileView("chat");
      return [newConv, ...prev];
    });
  }, [loaded, searchParams, userRole, userName, adminClubName]);

  // ── 3. Persist ────────────────────────────────────────────────────────────
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
  const visible = useMemo(
    () => visibleFor(conversations, userRole, userName, adminClubName),
    [conversations, userRole, userName, adminClubName],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return visible;
    return visible.filter(
      (c) =>
        c.clubName.includes(q) ||
        c.studentName.includes(q) ||
        c.lastMessage.includes(q),
    );
  }, [visible, searchQuery]);

  // ── Per-role display helpers ──────────────────────────────────────────────

  /** Text shown in the conversation list item */
  const listLabel  = (c: Conversation) => userRole === "admin" ? c.studentName : c.clubName;
  /** Initial letter for the avatar circle */
  const listInitial = (c: Conversation) => (userRole === "admin" ? c.studentName : c.clubName)[0] ?? "?";
  /** Title in the chat window header */
  const headerTitle = (c: Conversation) => userRole === "admin" ? c.studentName : c.clubName;
  /** Subtitle in the chat window header */
  const headerSub   = (c: Conversation) =>
    userRole === "admin" ? `申请人 · ${c.clubName}` : "社团官方";

  /** Is this message one I sent (outgoing = blue right)? */
  const isOutgoing = (msg: Message) =>
    userRole === "admin" ? msg.senderType === "admin" : msg.senderType === "student";

  // ── Interactions ──────────────────────────────────────────────────────────
  const selectConv = (id: string) => {
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
    const msg: Message = {
      id:         Date.now().toString(),
      senderType: userRole === "admin" ? "admin" : "student",
      text:       inputText.trim(),
      time,
    };
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
          {userRole === "admin" && adminClubName && (
            <p className="mt-0.5 text-[11px] font-semibold text-amber-600">
              {adminClubName} · 收到的消息
            </p>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2.5">
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索对话"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-gray-100 py-2 pl-8 pr-3 text-sm outline-none transition focus:bg-gray-50 focus:ring-1 focus:ring-primary-200"
            />
          </div>
        </div>

        {/* List */}
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
                  {listInitial(conv)}
                  {conv.unread > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-900">{listLabel(conv)}</span>
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
                {listInitial(activeConv)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{headerTitle(activeConv)}</p>
                <p className="text-xs text-gray-400">{headerSub(activeConv)}</p>
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
                    {listInitial(activeConv)}
                  </div>
                  <p className="text-sm font-medium text-gray-600">{headerTitle(activeConv)}</p>
                  <p className="text-xs text-gray-400">发送第一条消息，开始沟通吧 👋</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeConv.messages.map((msg) => {
                    const out = isOutgoing(msg);
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex items-end gap-2", out ? "flex-row-reverse" : "flex-row")}
                      >
                        {!out && (
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white", activeConv.avatarBg)}>
                            {listInitial(activeConv)}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[65%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                            out
                              ? "rounded-br-sm bg-primary-600 text-white"
                              : "rounded-bl-sm bg-white text-gray-800",
                          )}
                        >
                          {msg.text}
                        </div>
                        <span className={cn("mb-0.5 shrink-0 text-[10px] text-gray-400", out ? "mr-0.5" : "ml-0.5")}>
                          {msg.time}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="shrink-0 border-t border-gray-100 bg-white px-4 pb-3 pt-2.5">
              {userRole === "admin" && adminClubName && (
                <p className="mb-1.5 text-[11px] font-semibold text-amber-600">
                  以「{adminClubName}」身份回复 {activeConv.studentName}
                </p>
              )}
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    userRole === "admin"
                      ? `回复 ${activeConv.studentName}…`
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
              <p className="mt-1 text-sm text-gray-400">
                {userRole === "admin"
                  ? "从左侧选择申请人消息开始回复"
                  : "从左侧列表中选择社团开始沟通"}
              </p>
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
