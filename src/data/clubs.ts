export type Club = {
  id: number;
  name: string;
  slogan: string;
  matchScore: number;
  /** picsum.photos seed — gives a stable, deterministic image */
  imageSeed: string;
  /** Tailwind gradient used as a fallback color tint overlay */
  gradientFrom: string;
  gradientTo: string;
  tags: [string, string, string];
  category: Category;
  members: number;
};

export type Category = "All" | "AI Match" | "Sports" | "Arts" | "Tech" | "Music" | "Business";

export const CATEGORIES: Category[] = [
  "All",
  "AI Match",
  "Sports",
  "Arts",
  "Tech",
  "Music",
  "Business",
];

export const ALL_CLUBS: Club[] = [
  {
    id: 1,
    name: "AI & Machine Learning Society",
    slogan: "Build the future, one model at a time.",
    matchScore: 95,
    imageSeed: "artificial-intelligence",
    gradientFrom: "#1e1b4b",
    gradientTo: "#312e81",
    tags: ["Beginner OK", "Weekend Activities", "Project-Based"],
    category: "Tech",
    members: 312,
  },
  {
    id: 2,
    name: "Street Football League",
    slogan: "No pitch? No problem. Just show up.",
    matchScore: 88,
    imageSeed: "football-sport",
    gradientFrom: "#14532d",
    gradientTo: "#166534",
    tags: ["Extrovert Friendly", "All Levels", "Weekly Meetups"],
    category: "Sports",
    members: 540,
  },
  {
    id: 3,
    name: "Digital Arts Collective",
    slogan: "Where pixels meet purpose.",
    matchScore: 82,
    imageSeed: "digital-art-design",
    gradientFrom: "#4a044e",
    gradientTo: "#701a75",
    tags: ["Creative Space", "Portfolio Help", "Introvert OK"],
    category: "Arts",
    members: 187,
  },
  {
    id: 4,
    name: "Founders & Builders Club",
    slogan: "Ship fast, learn faster.",
    matchScore: 79,
    imageSeed: "startup-business",
    gradientFrom: "#431407",
    gradientTo: "#9a3412",
    tags: ["Networking", "Pitch Nights", "Mentorship"],
    category: "Business",
    members: 228,
  },
  {
    id: 5,
    name: "Campus Jazz Ensemble",
    slogan: "Every note tells a story. What's yours?",
    matchScore: 74,
    imageSeed: "jazz-music-band",
    gradientFrom: "#1c1917",
    gradientTo: "#44403c",
    tags: ["Beginners Welcome", "Live Performances", "Fun Vibes"],
    category: "Music",
    members: 95,
  },
  {
    id: 6,
    name: "Robotics & Hardware Lab",
    slogan: "Break things. Build better things.",
    matchScore: 91,
    imageSeed: "robotics-engineering",
    gradientFrom: "#0c4a6e",
    gradientTo: "#075985",
    tags: ["Hands-On", "Team Projects", "Competitions"],
    category: "Tech",
    members: 176,
  },
];
