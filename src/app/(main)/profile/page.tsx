"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Pencil, Sparkles, Heart, Users,
  GraduationCap, BookOpen, Brain,
  FileText, ChevronRight, Star, X, Check,
  MessageCircle, AlignLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CLUBS, type Club } from "@/data/clubs";
import { avatarColour, TAG_COLOURS } from "@/components/discover/ClubCard";

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

type EditableField = "姓名" | "专业" | "MBTI" | "技能标签" | "个人介绍";

const MBTI_TYPES = [
  "INTJ","INTP","ENTJ","ENTP",
  "INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ",
  "ISTP","ISFP","ESTP","ESFP",
];

// ─────────────────────────────────────────────────────────────────────────────
//  SKILL PILLS
// ─────────────────────────────────────────────────────────────────────────────

function SkillPills({ raw }: { raw: string }) {
  const tags = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!tags.length) return <span className="text-sm font-semibold text-gray-300">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
          {t}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function EditModal({
  field, initialValue, onSave, onClose,
}: {
  field: EditableField;
  initialValue: string;
  onSave: (field: EditableField, value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => (inputRef.current as HTMLElement)?.focus(), 50);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSave = () => { onSave(field, value.trim()); onClose(); };

  const placeholder: Record<EditableField, string> = {
    姓名:    "请输入你的真实姓名",
    专业:    "例：新闻传播学、计算机科学",
    MBTI:    "",
    技能标签: "例：Python, 视频剪辑, 公共演讲（逗号分隔）",
    个人介绍: "介绍一下你自己，兴趣爱好、特长、你想加入社团的原因…",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">编辑 {field}</h3>
            <p className="mt-0.5 text-xs text-gray-400">修改后点击「保存」立即生效</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">{field}</label>

          {field === "MBTI" ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            >
              <option value="">请选择 MBTI 类型</option>
              {MBTI_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          ) : field === "个人介绍" ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder[field]}
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              placeholder={placeholder[field]}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            />
          )}

          {field === "技能标签" && (
            <p className="mt-2 text-xs text-gray-400">多个技能请用英文逗号「,」隔开，将自动显示为标签</p>
          )}
          {field === "技能标签" && value.trim() && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold text-gray-500">预览</p>
              <SkillPills raw={value} />
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={field !== "MBTI" && !value.trim()}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95",
              value.trim() || field === "MBTI"
                ? "bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-200"
                : "cursor-not-allowed bg-gray-200 text-gray-400",
            )}
          >
            <Check size={14} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  EMPTY SECTION
// ─────────────────────────────────────────────────────────────────────────────

function EmptySection({
  icon: Icon, title, desc, ctaLabel, ctaHref,
}: {
  icon: React.ElementType; title: string; desc: string;
  ctaLabel: string; ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white ring-1 ring-gray-200">
        <Icon size={22} className="text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
      </div>
      <Link href={ctaHref} className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95">
        {ctaLabel} <ChevronRight size={13} />
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AI MATCHING LOGIC
// ─────────────────────────────────────────────────────────────────────────────

function computeAIMatches(bio: string, mbti: string, major: string): Club[] {
  const scores = new Map<number, number>();
  const add = (id: number, pts: number) => scores.set(id, (scores.get(id) ?? 0) + pts);

  const b = bio.toLowerCase();
  const m = major.toLowerCase();

  // Bio keyword → club boosts (5 pts)
  const bioMap: [string, number[]][] = [
    ["棋",       [1]],
    ["篮球",     [2, 4]],
    ["羽毛球",   [3]],
    ["旅行",     [5]],
    ["游览",     [5]],
    ["涂鸦",     [6]],
    ["艺术",     [6, 8]],
    ["绘画",     [6]],
    ["汉服",     [7]],
    ["传统",     [7, 5]],
    ["广告",     [8]],
    ["创意",     [8, 6]],
    ["科学",     [9]],
    ["天文",     [9]],
    ["自然",     [9]],
    ["文学",     [10]],
    ["写作",     [10]],
    ["阅读",     [10]],
    ["历史",     [11]],
    ["纪录",     [11]],
    ["访谈",     [11]],
    ["辩论",     [12]],
    ["外交",     [12]],
    ["国际",     [12]],
    ["新媒体",   [13]],
    ["运营",     [13]],
    ["创业",     [14]],
    ["创新",     [14]],
    ["商业",     [14]],
    ["军事",     [15]],
    ["国防",     [15]],
    ["志愿",     [16, 17]],
    ["公益",     [16, 17]],
    ["动物",     [17]],
    ["猫",       [17]],
    ["狗",       [17]],
    ["宠物",     [17]],
    ["职业规划", [18]],
    ["就业",     [18]],
    ["迷茫",     [18]],
  ];
  for (const [kw, ids] of bioMap) {
    if (b.includes(kw)) ids.forEach(id => add(id, 5));
  }

  // Major keyword → club boosts (3 pts)
  const majorMap: [string, number[]][] = [
    ["广告",   [8]],
    ["新闻",   [8, 11, 13]],
    ["传播",   [8, 11, 13]],
    ["传媒",   [8, 11, 13]],
    ["播音",   [8, 13]],
    ["主持",   [8, 13]],
    ["计算机", [9, 14]],
    ["软件",   [9, 14]],
    ["信息",   [9, 14]],
    ["艺术",   [6, 8]],
    ["设计",   [6, 8]],
    ["文学",   [10]],
    ["中文",   [10]],
    ["汉语",   [10]],
    ["历史",   [11]],
    ["外语",   [12]],
    ["英语",   [12, 13]],
    ["国际",   [12]],
    ["经济",   [14]],
    ["管理",   [14]],
    ["金融",   [14]],
    ["思政",   [15, 16]],
    ["政治",   [15, 16]],
    ["体育",   [2, 3]],
  ];
  for (const [kw, ids] of majorMap) {
    if (m.includes(kw)) ids.forEach(id => add(id, 3));
  }

  // MBTI boosts (1–2 pts)
  if (mbti.length === 4) {
    if (mbti[0] === "E") [2, 12, 13, 14].forEach(id => add(id, 2));
    if (mbti[0] === "I") [1, 10, 11, 18].forEach(id => add(id, 2));
    if (mbti[1] === "N") [6, 10, 12, 14].forEach(id => add(id, 2));
    if (mbti[1] === "S") [2, 3, 7,  9].forEach(id  => add(id, 2));
    if (mbti[2] === "F") [5, 7, 11, 17].forEach(id => add(id, 2));
    if (mbti[2] === "T") [1, 9, 12, 14].forEach(id => add(id, 2));
    if (mbti[3] === "J") [1, 8, 15, 18].forEach(id => add(id, 1));
    if (mbti[3] === "P") [5, 6,  9, 11].forEach(id => add(id, 1));
  }

  // Pick top 3
  const maxScore = scores.size > 0 ? Math.max(...scores.values()) : 0;

  if (maxScore >= 5) {
    const ranked = ALL_CLUBS
      .filter(c => scores.has(c.id))
      .sort((a, bc) => (scores.get(bc.id) ?? 0) - (scores.get(a.id) ?? 0))
      .slice(0, 3);

    if (ranked.length >= 3) return ranked;

    const rankedIds = new Set(ranked.map(c => c.id));
    const extras = [...ALL_CLUBS]
      .filter(c => !rankedIds.has(c.id))
      .sort((a, bc) => bc.members - a.members)
      .slice(0, 3 - ranked.length);
    return [...ranked, ...extras];
  }

  return [...ALL_CLUBS].sort((a, bc) => bc.members - a.members).slice(0, 3);
}

function buildReason(club: Club, bio: string, mbti: string, major: string): string {
  const b = bio.toLowerCase();
  const m = major.toLowerCase();
  const mbtiLabel  = mbti  ? `你的 ${mbti} 特质` : "你的性格";
  const majorLabel = major ? `${major}专业` : "";

  const specific: Partial<Record<number, () => string>> = {
    1:  () => b.includes("棋")
          ? `你个人介绍中提到了对棋类的热爱，棋缘社正是切磋技艺与遇见棋友的最佳舞台。${mbti ? `${mbtiLabel}让你善于深度思考，在博弈中更能如鱼得水。` : ""}`
          : `${mbtiLabel}善于专注与逻辑推理，棋类运动将完美磨砺你的决策思维，期待你在棋盘上大放异彩。`,
    2:  () => b.includes("篮球") || b.includes("运动")
          ? `你对篮球的热情在介绍中清晰可见！花式篮球社能帮你把球技变成艺术，在街头表演舞台上发光。`
          : `${mbtiLabel}充满活力与表现欲，花式篮球将街头文化与竞技精神融为一体，非常契合你的风格。`,
    3:  () => b.includes("羽毛球")
          ? `羽毛球爱好者的首选！CUC羽毛球社有完善的联赛体系，${majorLabel ? `${majorLabel}的你` : "你"}可以在这里持续提升球技、拓展球友圈。`
          : `${mbtiLabel}与羽毛球运动的对抗性和社交性高度契合，以球会友，在运动中收获身心健康。`,
    4:  () => b.includes("篮球")
          ? `对篮球充满热情的你，在CUC女子篮球社里会找到最温暖的大家庭，竞技与友谊并行！`
          : `${mbtiLabel}适合在团队运动中展现协作精神，女子篮球社是绽放你运动光芒的温暖舞台。`,
    5:  () => b.includes("旅行") || b.includes("游览") || b.includes("北京")
          ? `你热爱探索文化与城市的心与游学社一拍即合，边走边学，每次游学都是一段难忘的经历。`
          : `${mbtiLabel}对新鲜事物充满好奇，游学社的主题游览将让你深度感受北京的历史厚度与文化魅力。`,
    6:  () => b.includes("涂鸦") || b.includes("艺术") || m.includes("艺术") || m.includes("设计")
          ? `你的艺术创作热情与916涂鸦社的气质完美契合！在合法的创作墙上，用喷漆书写属于你的故事。`
          : `${mbtiLabel}充满创意与表达欲，涂鸦艺术是最直接的自我表达方式，来这里释放内心的色彩。`,
    7:  () => b.includes("汉服") || b.includes("传统") || b.includes("礼仪")
          ? `你对传统文化的热爱让你与子衿汉服社天然契合，社内汉服雅集与礼仪活动将是最美好的大学记忆。`
          : `${mbtiLabel}对文化传承有独特感知力，子衿汉服社将带你深入感受中华服饰美学与传统礼仪的精髓。`,
    8:  () => b.includes("广告") || b.includes("创意") || m.includes("广告") || m.includes("传播") || m.includes("新闻")
          ? `${majorLabel ? `${majorLabel}的你` : "你"}与广告社高度契合，这里有真实赛事与行业资源，是积累作品集的绝佳平台。`
          : `${mbtiLabel}富有创意与洞察力，广告社的策划与赛事活动能让你在实战中快速成长。`,
    9:  () => b.includes("科学") || b.includes("天文") || b.includes("自然")
          ? `你对科学的热情清晰可见，自然科学社的户外探索与实验活动将完美满足你的求知欲。`
          : `${mbtiLabel}充满好奇心，天文观测、野外活动等将让你在探索中感受世界的奇妙。`,
    10: () => b.includes("文学") || b.includes("写作") || b.includes("阅读") || m.includes("文学") || m.includes("中文")
          ? `你对文学的深厚热情与鲁迅研究社高度契合，这里是深度阅读、思想碰撞、创意写作的最佳场所。`
          : `${mbtiLabel}善于深度思考与批判分析，鲁迅研究社将为你提供绝佳的学术训练与人文滋养。`,
    11: () => b.includes("历史") || b.includes("纪录") || b.includes("访谈") || m.includes("历史")
          ? `你对历史记录与人文故事的关注与白杨记忆社使命不谋而合，田野调查和口述记录将是你的独特实践。`
          : `${mbtiLabel}善于倾听与感悟，口述历史项目将让你在记录普通人故事中实现真正有价值的公益行动。`,
    12: () => b.includes("辩论") || b.includes("外交") || b.includes("国际") || m.includes("外语") || m.includes("国际")
          ? `你对国际事务与辩论的热情让你天然适合模联！在这里你将代表一个国家发声，锻炼逻辑与演讲。`
          : `${mbtiLabel}善于逻辑思辨与表达，模拟联合国协会是锻炼批判性思维、拓展国际视野的顶级平台。`,
    13: () => b.includes("新媒体") || b.includes("运营") || m.includes("传播") || m.includes("新闻") || m.includes("播音")
          ? `${majorLabel ? `${majorLabel}的你` : "你"}在新媒体运营方向潜力巨大，微博协会与新浪的深度合作将带给你真实的行业资源和实习机会。`
          : `${mbtiLabel}充满表达欲与社交活力，微博协会的内容创作实践将是你抢占传媒赛道的重要跳板。`,
    14: () => b.includes("创业") || b.includes("创新") || b.includes("商业")
          ? `你骨子里的创业精神与青年创业社完全共鸣！导师辅导、Pitch舞台与融资资源，正是你启航的地方。`
          : `${mbtiLabel}充满远见与行动力，青年创业社的训练营与投资人见面会将加速你把想法变成现实。`,
    15: () => b.includes("军事") || b.includes("国防") || b.includes("爱国")
          ? `你的家国情怀与CUC国防军事协会的精神内核高度契合，在这里你将接受真正的意志磨砺与荣誉洗礼。`
          : `${mbtiLabel}有坚定的意志力与执行力，国旗护卫队和军事训练将是你大学四年最难忘的精神历练。`,
    16: () => b.includes("志愿") || b.includes("公益") || m.includes("思政") || m.includes("政治")
          ? `你对志愿精神与学术研究的双重热情让你与雷锋研习社高度契合，在这里用学术态度传承一种精神力量。`
          : `${mbtiLabel}有强烈的社会责任感，雷锋研习社将带你以严肃的学术态度传承跨越时代的精神遗产。`,
    17: () => b.includes("动物") || b.includes("猫") || b.includes("狗") || b.includes("宠物") || b.includes("公益")
          ? `你对动物的爱在介绍中溢于言表！小动物保护协会正需要像你这样有爱心的伙伴，一起守护无声的生命。`
          : `${mbtiLabel}富有同理心与责任感，动物保护公益活动将让你在温情行动中找到真正有意义的大学体验。`,
    18: () => b.includes("职业") || b.includes("规划") || b.includes("就业") || b.includes("迷茫")
          ? `你对职业发展的关注与职业生涯规划社使命完全一致！MBTI测评、模拟面试、行业分享会将帮你走得更快更稳。`
          : `${mbtiLabel}适合通过系统规划实现长远目标，职业生涯规划社的完整成长体系是你大学四年最重要的投资。`,
  };

  return specific[club.id]?.() ??
    `${club.name}是「${club.category}」领域最具影响力的社团之一，${mbti ? `${mbtiLabel}与其活动氛围高度匹配，` : ""}期待你在这里遇见最好的自己。`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  AI RECOMMENDATION MODAL
// ─────────────────────────────────────────────────────────────────────────────

const LOADING_TEXTS = [
  "正在读取你的专业背景...",
  "正在分析你的 MBTI 标签...",
  "正在深度研读你的个人介绍...",
  "正在匹配最适合你的社团...",
];

function AIModal({
  bio, mbti, major, onClose,
}: {
  bio: string; mbti: string; major: string; onClose: () => void;
}) {
  const [phase,    setPhase]    = useState<"loading" | "results">("loading");
  const [textIdx,  setTextIdx]  = useState(0);
  const [progress, setProgress] = useState(0);

  const matches = useMemo(() => computeAIMatches(bio, mbti, major), [bio, mbti, major]);

  useEffect(() => {
    const raf       = requestAnimationFrame(() => setProgress(100));
    const textTimer = setInterval(() => setTextIdx(i => (i + 1) % LOADING_TEXTS.length), 600);
    const doneTimer = setTimeout(() => { clearInterval(textTimer); setPhase("results"); }, 2500);
    return () => { cancelAnimationFrame(raf); clearInterval(textTimer); clearTimeout(doneTimer); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {phase === "loading" ? (

          /* ── Loading ────────────────────────────────────────────── */
          <div className="flex flex-col items-center gap-6 px-8 py-14">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-100 border-t-amber-400" />
              <Sparkles size={28} className="text-amber-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">AI 正在为你匹配…</h3>
              <p className="mt-2 min-h-[1.25rem] text-sm text-gray-500 transition-all duration-300">
                {LOADING_TEXTS[textIdx]}
              </p>
            </div>
            <div className="w-full overflow-hidden rounded-full bg-gray-100 h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-[2400ms] ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

        ) : (

          /* ── Results ────────────────────────────────────────────── */
          <>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-base font-bold text-gray-900">AI 匹配结果</h3>
              </div>
              <button
                onClick={onClose}
                aria-label="关闭"
                className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {matches.map((club, rank) => (
                <div key={club.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
                      #{rank + 1}
                    </div>
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white", avatarColour(club.id))}>
                      {club.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-gray-900">{club.name}</p>
                      <span className="inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 ring-1 ring-primary-200">
                        {club.category}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-500">{club.shortDescription}</p>
                  <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 ring-1 ring-amber-200">
                    <p className="mb-1 text-[11px] font-bold text-amber-600">AI 推荐理由</p>
                    <p className="text-xs leading-relaxed text-amber-900">
                      {buildReason(club, bio, mbti, major)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-6 py-4">
              <Link
                href="/discover"
                onClick={onClose}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-500 active:scale-95"
              >
                关闭，去社团页查看 <ChevronRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [userName,   setUserName]   = useState("");
  const [userRole,   setUserRole]   = useState("student");
  const [userUni,    setUserUni]    = useState("中国传媒大学");
  const [major,      setMajor]      = useState("");
  const [mbti,       setMbti]       = useState("");
  const [skills,     setSkills]     = useState("");
  const [bio,        setBio]        = useState("");
  const [likedClubs, setLikedClubs] = useState<Club[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [editField,  setEditField]  = useState<EditableField | null>(null);
  const [aiOpen,     setAiOpen]     = useState(false);

  useEffect(() => {
    setUserName(localStorage.getItem("cm_userName")?.trim()   || "");
    setUserRole(localStorage.getItem("cm_userRole")           || "student");
    setUserUni (localStorage.getItem("cm_userUniversity")     || "中国传媒大学");

    const profile = JSON.parse(localStorage.getItem("cm_userProfile") || "{}");
    setMajor (profile.major  || "");
    setMbti  (profile.mbti   || "");
    setSkills(profile.skills || "");
    setBio   (profile.bio    || "");

    try {
      const raw = localStorage.getItem("clubmatch_liked_clubs");
      if (raw) {
        const ids = JSON.parse(raw) as number[];
        setLikedClubs(ALL_CLUBS.filter((c) => ids.includes(c.id)));
      }
    } catch { /* ignore */ }

    setIsHydrated(true);
  }, []);

  const handleSave = (field: EditableField, value: string) => {
    if (field === "姓名") {
      setUserName(value);
      localStorage.setItem("cm_userName", value);
      return;
    }
    const profile = JSON.parse(localStorage.getItem("cm_userProfile") || "{}");
    if (field === "专业")    { setMajor(value);  profile.major  = value; }
    if (field === "MBTI")    { setMbti(value);   profile.mbti   = value; }
    if (field === "技能标签") { setSkills(value); profile.skills = value; }
    if (field === "个人介绍") { setBio(value);    profile.bio    = value; }
    localStorage.setItem("cm_userProfile", JSON.stringify(profile));
  };

  const displayName = userName || "同学";
  const initial     = displayName[0];
  const isAdmin     = userRole === "admin";
  const roleLabel   = isAdmin ? "社长" : "在校学生";
  const roleBg      = isAdmin ? "bg-violet-100 text-violet-700" : "bg-primary-100 text-primary-700";

  const rows: { icon: React.ElementType; label: EditableField | "高校"; value: string; editable: boolean }[] = [
    { icon: FileText,      label: "姓名",    value: displayName,   editable: true  },
    { icon: GraduationCap, label: "高校",    value: userUni,       editable: false },
    { icon: BookOpen,      label: "专业",    value: major || "—",  editable: true  },
    { icon: Brain,         label: "MBTI",   value: mbti  || "—",  editable: true  },
    { icon: Star,          label: "技能标签", value: skills || "—", editable: true  },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {/* ══ PROFILE HEADER ══════════════════════════════════════════════ */}
        <div className="relative rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div
            className="relative h-36 rounded-t-3xl overflow-hidden"
            style={{ background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 55%,#0ea5e9 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)", backgroundSize: "22px 22px" }}
            />
          </div>

          <div
            className={cn(
              "absolute left-6 top-[88px] z-10",
              "flex h-24 w-24 items-center justify-center",
              "rounded-2xl border-4 border-white bg-primary-600 shadow-lg",
              "text-3xl font-black text-white select-none transition-opacity duration-300",
              !isHydrated && "opacity-0",
            )}
          >
            {initial}
          </div>

          <div className="px-6 pb-6 pt-16">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className={cn("text-2xl font-extrabold text-gray-900 transition-opacity", !isHydrated && "opacity-0")}>
                    {displayName}
                  </h1>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", roleBg)}>
                    {roleLabel}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-400">{userUni}</p>
              </div>

              {/* AI 社团推荐 — opens modal */}
              <button
                onClick={() => setAiOpen(true)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-5 py-3",
                  "bg-gradient-to-r from-amber-400 to-orange-500",
                  "text-sm font-extrabold text-white",
                  "shadow-lg shadow-orange-200/70 ring-1 ring-white/20",
                  "transition-all duration-150 hover:brightness-110 hover:shadow-orange-300/80 active:scale-95",
                )}
              >
                <Sparkles size={15} className="animate-pulse" />
                AI 社团推荐
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              ✨ 完善下方信息后，点击「AI 社团推荐」获取智能匹配结果
            </p>
          </div>
        </div>

        {/* ══ PERSONAL INFO ═══════════════════════════════════════════════ */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-bold text-gray-800">个人信息</h2>
          <div className="space-y-3">
            {rows.map(({ icon: Icon, label, value, editable }) => (
              <div key={label} className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                    <Icon size={14} className="text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-400">{label}</p>
                    {label === "技能标签" ? (
                      <div className="mt-1"><SkillPills raw={skills} /></div>
                    ) : (
                      <p className={cn("mt-0.5 truncate text-sm font-semibold", value === "—" ? "text-gray-300" : "text-gray-800")}>
                        {value}
                      </p>
                    )}
                  </div>
                </div>
                {editable && (
                  <button
                    onClick={() => setEditField(label as EditableField)}
                    aria-label={`编辑${label}`}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95"
                  >
                    <Pencil size={10} />
                    编辑
                  </button>
                )}
              </div>
            ))}

            {/* ── 个人介绍 (multi-line) ── */}
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                    <AlignLeft size={14} className="text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-gray-400">个人介绍</p>
                    {bio ? (
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{bio}</p>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-gray-300">—</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setEditField("个人介绍")}
                  aria-label="编辑个人介绍"
                  className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-500 transition-all hover:border-primary-300 hover:text-primary-600 active:scale-95"
                >
                  <Pencil size={10} />
                  编辑
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ══ LIKED CLUBS ═════════════════════════════════════════════════ */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-rose-500" />
              <h2 className="text-sm font-bold text-gray-800">心动社团</h2>
            </div>
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              likedClubs.length > 0 ? "bg-red-50 text-red-500 ring-1 ring-red-100" : "bg-gray-100 text-gray-400",
            )}>
              {likedClubs.length}
            </span>
          </div>

          {likedClubs.length === 0 ? (
            <EmptySection
              icon={Heart}
              title="还没有收藏的社团"
              desc="在社团页面点击 ❤️，喜欢的社团会出现在这里"
              ctaLabel="去发现社团"
              ctaHref="/discover"
            />
          ) : (
            <div className="space-y-3">
              {likedClubs.map((club) => (
                <div key={club.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white", avatarColour(club.id))}>
                    {club.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{club.name}</p>
                    <div className="mt-0.5 flex flex-wrap gap-1">
                      {club.tags.slice(0, 2).map((tag, i) => (
                        <span key={tag} className={cn("rounded-full px-2 py-0 text-[10px] font-semibold ring-1", TAG_COLOURS[i % TAG_COLOURS.length])}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/messages?clubId=${club.id}`}
                    className="flex shrink-0 items-center gap-1 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-500"
                  >
                    <MessageCircle size={12} />
                    去沟通
                  </Link>
                </div>
              ))}
              <Link
                href="/discover"
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 py-2 text-xs font-bold text-primary-600 transition-all hover:bg-primary-100 active:scale-95"
              >
                继续发现更多社团 <ChevronRight size={12} />
              </Link>
            </div>
          )}
        </div>

        {/* ══ JOINED CLUBS ════════════════════════════════════════════════ */}
        <div className="mt-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-primary-500" />
              <h2 className="text-sm font-bold text-gray-800">已加入社团</h2>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-400">0</span>
          </div>
          <EmptySection
            icon={Users}
            title="还没有加入任何社团"
            desc="完成申请并通过面试后，你的社团会显示在这里"
            ctaLabel="立即去申请"
            ctaHref="/discover"
          />
        </div>

      </div>

      {/* ══ EDIT MODAL ══════════════════════════════════════════════════════ */}
      {editField && (
        <EditModal
          field={editField}
          initialValue={
            editField === "姓名"    ? (userName || "") :
            editField === "专业"    ? major  :
            editField === "MBTI"   ? mbti   :
            editField === "个人介绍" ? bio    :
            skills
          }
          onSave={handleSave}
          onClose={() => setEditField(null)}
        />
      )}

      {/* ══ AI MODAL ════════════════════════════════════════════════════════ */}
      {aiOpen && (
        <AIModal
          bio={bio}
          mbti={mbti}
          major={major}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}
