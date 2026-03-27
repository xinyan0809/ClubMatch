export type Status = "Pending" | "Interviewing" | "Accepted" | "Rejected";

export type Applicant = {
  id: number;
  name: string;
  initials: string;
  /** Tailwind bg color class for the avatar */
  avatarBg: string;
  email: string;
  major: string;
  year: "Year 1" | "Year 2" | "Year 3" | "Year 4";
  mbti: string;
  matchScore: number;
  status: Status;
  /** ISO date string */
  appliedAt: string;
  note: string;
};

export const APPLICANTS: Applicant[] = [
  {
    id: 1,
    name: "Sophia Chen",
    initials: "SC",
    avatarBg: "bg-violet-500",
    email: "sophia.chen@uni.edu",
    major: "Computer Science",
    year: "Year 1",
    mbti: "INTJ",
    matchScore: 97,
    status: "Pending",
    appliedAt: "2026-03-27",
    note: "Published a ML paper in high school.",
  },
  {
    id: 2,
    name: "Liam Park",
    initials: "LP",
    avatarBg: "bg-sky-500",
    email: "liam.park@uni.edu",
    major: "Data Science",
    year: "Year 1",
    mbti: "ENTP",
    matchScore: 93,
    status: "Interviewing",
    appliedAt: "2026-03-26",
    note: "Kaggle Competitions Expert tier.",
  },
  {
    id: 3,
    name: "Aisha Mensah",
    initials: "AM",
    avatarBg: "bg-emerald-500",
    email: "aisha.m@uni.edu",
    major: "Electrical Engineering",
    year: "Year 2",
    mbti: "ISFJ",
    matchScore: 91,
    status: "Pending",
    appliedAt: "2026-03-27",
    note: "Built a smart home system as side project.",
  },
  {
    id: 4,
    name: "Marcus Webb",
    initials: "MW",
    avatarBg: "bg-amber-500",
    email: "m.webb@uni.edu",
    major: "Mathematics",
    year: "Year 1",
    mbti: "INTP",
    matchScore: 88,
    status: "Accepted",
    appliedAt: "2026-03-24",
    note: "National Math Olympiad bronze medalist.",
  },
  {
    id: 5,
    name: "Priya Nair",
    initials: "PN",
    avatarBg: "bg-rose-500",
    email: "priya.n@uni.edu",
    major: "Information Systems",
    year: "Year 1",
    mbti: "ENFP",
    matchScore: 85,
    status: "Interviewing",
    appliedAt: "2026-03-25",
    note: "Organized tech workshops in secondary school.",
  },
  {
    id: 6,
    name: "Ethan Zhou",
    initials: "EZ",
    avatarBg: "bg-indigo-500",
    email: "ethan.z@uni.edu",
    major: "Software Engineering",
    year: "Year 2",
    mbti: "ISTJ",
    matchScore: 82,
    status: "Pending",
    appliedAt: "2026-03-26",
    note: "2 internships completed; strong systems background.",
  },
  {
    id: 7,
    name: "Zara Ahmed",
    initials: "ZA",
    avatarBg: "bg-teal-500",
    email: "zara.a@uni.edu",
    major: "Cognitive Science",
    year: "Year 1",
    mbti: "INFJ",
    matchScore: 79,
    status: "Pending",
    appliedAt: "2026-03-27",
    note: "Interested in AI + psychology intersection.",
  },
  {
    id: 8,
    name: "Noah Kim",
    initials: "NK",
    avatarBg: "bg-orange-500",
    email: "noah.k@uni.edu",
    major: "Physics",
    year: "Year 3",
    mbti: "ENTJ",
    matchScore: 76,
    status: "Rejected",
    appliedAt: "2026-03-22",
    note: "Applied to multiple clubs simultaneously.",
  },
  {
    id: 9,
    name: "Isabella Cruz",
    initials: "IC",
    avatarBg: "bg-pink-500",
    email: "i.cruz@uni.edu",
    major: "Computer Science",
    year: "Year 1",
    mbti: "ESFP",
    matchScore: 95,
    status: "Pending",
    appliedAt: "2026-03-27",
    note: "Hackathon winner, two consecutive years.",
  },
  {
    id: 10,
    name: "James Okonkwo",
    initials: "JO",
    avatarBg: "bg-cyan-600",
    email: "j.okonkwo@uni.edu",
    major: "Robotics",
    year: "Year 2",
    mbti: "ESTP",
    matchScore: 90,
    status: "Interviewing",
    appliedAt: "2026-03-25",
    note: "Built a line-following robot at 16.",
  },
  {
    id: 11,
    name: "Mei Lin",
    initials: "ML",
    avatarBg: "bg-fuchsia-500",
    email: "mei.lin@uni.edu",
    major: "Statistics",
    year: "Year 1",
    mbti: "INTJ",
    matchScore: 87,
    status: "Pending",
    appliedAt: "2026-03-26",
    note: "Research assistant since Year 1.",
  },
  {
    id: 12,
    name: "Oliver Grant",
    initials: "OG",
    avatarBg: "bg-lime-600",
    email: "o.grant@uni.edu",
    major: "Biomedical Engineering",
    year: "Year 1",
    mbti: "ENFJ",
    matchScore: 72,
    status: "Pending",
    appliedAt: "2026-03-27",
    note: "Interested in AI-assisted diagnostics.",
  },
];

// ── Derived stats (computed once, used by metric cards) ──────────────────────
const today = "2026-03-27";

export const STATS = {
  total: APPLICANTS.length,
  newToday: APPLICANTS.filter((a) => a.appliedAt === today).length,
  interviewing: APPLICANTS.filter((a) => a.status === "Interviewing").length,
};
