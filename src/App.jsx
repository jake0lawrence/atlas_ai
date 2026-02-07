import { useState, useEffect, useRef, useCallback } from "react";

// ─── RESPONSIVE HOOK ────────────────────────────────────────────────
const useWindowSize = () => {
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1024, h: typeof window !== "undefined" ? window.innerHeight : 768 });
  useEffect(() => {
    const handle = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return size;
};

// ─── DATA ───────────────────────────────────────────────────────────
const TOPICS = [
  { id: "courtcollect", name: "CourtCollect", count: 47, words: 128400, color: "#F59E0B", category: "product", firstSeen: "Aug 2024", lastSeen: "Feb 2026", depth: 4.2, icon: "⚖️", platform: { claude: 38, gpt: 9 } },
  { id: "hmprg", name: "HMPRG Campaigns", count: 38, words: 98200, color: "#3B82F6", category: "client", firstSeen: "Sep 2024", lastSeen: "Feb 2026", depth: 3.8, icon: "🏥", platform: { claude: 30, gpt: 8 } },
  { id: "jobsearch", name: "Job Search", count: 62, words: 142000, color: "#EF4444", category: "career", firstSeen: "Dec 2024", lastSeen: "Feb 2026", depth: 3.5, icon: "💼", platform: { claude: 48, gpt: 14 } },
  { id: "gamedev", name: "Dice or Die", count: 23, words: 67800, color: "#8B5CF6", category: "creative", firstSeen: "Oct 2024", lastSeen: "Jan 2026", depth: 3.9, icon: "🎲", platform: { claude: 15, gpt: 8 } },
  { id: "keymaster", name: "Keymaster", count: 18, words: 52100, color: "#10B981", category: "product", firstSeen: "Jul 2024", lastSeen: "Dec 2025", depth: 4.0, icon: "🔐", platform: { claude: 14, gpt: 4 } },
  { id: "automation", name: "AI Automation", count: 34, words: 89500, color: "#EC4899", category: "tech", firstSeen: "Jun 2024", lastSeen: "Feb 2026", depth: 3.6, icon: "🤖", platform: { claude: 20, gpt: 14 } },
  { id: "resumes", name: "Resumes & Cover Letters", count: 41, words: 95300, color: "#F97316", category: "career", firstSeen: "Dec 2024", lastSeen: "Feb 2026", depth: 2.8, icon: "📄", platform: { claude: 36, gpt: 5 } },
  { id: "tyler", name: "Tyler Technologies", count: 89, words: 234500, color: "#6366F1", category: "work", firstSeen: "Mar 2023", lastSeen: "Dec 2025", depth: 3.4, icon: "🏢", platform: { claude: 31, gpt: 58 } },
  { id: "obsidian", name: "Knowledge Mgmt", count: 15, words: 41200, color: "#14B8A6", category: "tech", firstSeen: "Nov 2024", lastSeen: "Feb 2026", depth: 4.5, icon: "🧠", platform: { claude: 13, gpt: 2 } },
  { id: "finance", name: "Personal Finance", count: 28, words: 61400, color: "#84CC16", category: "personal", firstSeen: "Jun 2023", lastSeen: "Jan 2026", depth: 2.9, icon: "💰", platform: { claude: 10, gpt: 18 } },
  { id: "n8n", name: "n8n & Airtable", count: 21, words: 58900, color: "#A855F7", category: "tech", firstSeen: "Aug 2024", lastSeen: "Jan 2026", depth: 3.7, icon: "⚡", platform: { claude: 16, gpt: 5 } },
  { id: "webdev", name: "Web Development", count: 156, words: 412000, color: "#06B6D4", category: "tech", firstSeen: "Jan 2023", lastSeen: "Feb 2026", depth: 3.2, icon: "🌐", platform: { claude: 72, gpt: 84 } },
  { id: "writing", name: "Creative Writing", count: 32, words: 87600, color: "#FB923C", category: "creative", firstSeen: "Apr 2023", lastSeen: "Jan 2026", depth: 3.1, icon: "✍️", platform: { claude: 12, gpt: 20 } },
  { id: "govtech", name: "Gov Tech & Policy", count: 44, words: 119000, color: "#64748B", category: "domain", firstSeen: "Feb 2023", lastSeen: "Feb 2026", depth: 3.3, icon: "🏛️", platform: { claude: 22, gpt: 22 } },
];

const CONNECTIONS = [
  { from: "courtcollect", to: "tyler", label: "Domain expertise transferred", strength: 0.9 },
  { from: "courtcollect", to: "govtech", label: "Policy requirements", strength: 0.7 },
  { from: "courtcollect", to: "webdev", label: "Tech stack decisions", strength: 0.6 },
  { from: "jobsearch", to: "resumes", label: "Application materials", strength: 0.95 },
  { from: "jobsearch", to: "tyler", label: "Experience narratives", strength: 0.7 },
  { from: "jobsearch", to: "courtcollect", label: "Portfolio piece", strength: 0.5 },
  { from: "hmprg", to: "automation", label: "Campaign automation", strength: 0.6 },
  { from: "hmprg", to: "webdev", label: "Landing pages & ads", strength: 0.5 },
  { from: "keymaster", to: "webdev", label: "Full-stack build", strength: 0.7 },
  { from: "keymaster", to: "automation", label: "AI-native features", strength: 0.5 },
  { from: "gamedev", to: "writing", label: "Game narrative design", strength: 0.4 },
  { from: "n8n", to: "automation", label: "Workflow tooling", strength: 0.8 },
  { from: "n8n", to: "hmprg", label: "Analytics pipeline", strength: 0.6 },
  { from: "obsidian", to: "automation", label: "PKM + AI integration", strength: 0.5 },
  { from: "finance", to: "automation", label: "Budgeting systems", strength: 0.3 },
  { from: "govtech", to: "tyler", label: "Government sector", strength: 0.85 },
];

const TIMELINE_DATA = {
  courtcollect: [
    { date: "2024-08-12", title: "Initial concept brainstorm", summary: "First exploration of municipal court collections platform. Mapped out the problem space.", type: "idea", messages: 24 },
    { date: "2024-08-28", title: "Market research & competitive analysis", summary: "Analyzed existing GovTech collections solutions. Identified gaps.", type: "research", messages: 31 },
    { date: "2024-09-15", title: "Architecture decisions — Supabase + Next.js", summary: "Chose tech stack after evaluating options.", type: "decision", messages: 42 },
    { date: "2024-09-22", title: "Database schema design", summary: "Core data model for courts, cases, payments, and collection agencies.", type: "build", messages: 56 },
    { date: "2024-10-05", title: "GitHub org setup & CI/CD pipeline", summary: "Created CourtCollect GitHub organization. Automated testing and deployment.", type: "build", messages: 38 },
    { date: "2024-10-18", title: "Auth flow & multi-tenant architecture", summary: "Authentication for court staff and collection agency users.", type: "build", messages: 47 },
    { date: "2024-11-02", title: "Payment integration research", summary: "Evaluated payment processors for government compliance.", type: "research", messages: 29 },
    { date: "2024-11-14", title: "Deployment struggles — Docker + Railway", summary: "Major containerized deployment issues over 3 days.", type: "problem", messages: 68 },
    { date: "2024-11-16", title: "Pivoted to Vercel deployment", summary: "Switched strategy. Vercel + Supabase cloud simplified everything.", type: "pivot", messages: 35 },
    { date: "2024-12-01", title: "Demo prep & pitch deck", summary: "Investor-ready demo environment and pitch materials.", type: "milestone", messages: 44 },
    { date: "2025-01-10", title: "Clearwater KS data conversion", summary: "Real-world data migration from legacy system.", type: "build", messages: 52 },
    { date: "2025-01-28", title: "Collections agency portal MVP", summary: "First working agency-facing portal with case assignment.", type: "milestone", messages: 61 },
    { date: "2025-02-03", title: "Josephine TX integration", summary: "API design and data mapping for City of Josephine.", type: "build", messages: 33 },
  ],
  hmprg: [
    { date: "2024-09-05", title: "HMPRG onboarding & scope", summary: "Discovery for Health and Medicine Policy Research Group digital marketing.", type: "idea", messages: 18 },
    { date: "2024-09-20", title: "RAPID-IL campaign strategy", summary: "Marketing plan for Illinois youth health career pathways.", type: "decision", messages: 34 },
    { date: "2024-10-08", title: "YouTube video series planning", summary: "Content calendar and scripts for health career spotlight videos.", type: "build", messages: 28 },
    { date: "2024-10-25", title: "Meta advertising campaign setup", summary: "$800 budget Meta campaigns targeting Illinois youth.", type: "build", messages: 42 },
    { date: "2024-11-10", title: "Social media content calendar", summary: "3-month content plan across Instagram, Facebook, LinkedIn.", type: "build", messages: 22 },
    { date: "2024-12-02", title: "Campaign performance analysis", summary: "First month results exceeded benchmarks.", type: "research", messages: 31 },
    { date: "2025-01-15", title: "Q1 strategy pivot", summary: "Shifted budget — Instagram outperforming Facebook 3:1.", type: "pivot", messages: 26 },
    { date: "2025-02-01", title: "Landing page optimization", summary: "Redesigned conversion funnel. Improved CTR by 40%.", type: "milestone", messages: 38 },
  ],
  jobsearch: [
    { date: "2024-12-18", title: "Post-Tyler transition planning", summary: "Strategic planning after termination.", type: "idea", messages: 32 },
    { date: "2024-12-22", title: "Master resume overhaul", summary: "Complete rebuild emphasizing 100+ implementations.", type: "build", messages: 45 },
    { date: "2025-01-05", title: "OpenGov application package", summary: "Tailored resume and cover letter for CSM role.", type: "build", messages: 28 },
    { date: "2025-01-08", title: "Granicus application", summary: "Implementation Manager — GovTech domain expertise.", type: "build", messages: 22 },
    { date: "2025-01-14", title: "Veritone interview prep", summary: "Research on Veritone's AI platform.", type: "research", messages: 38 },
    { date: "2025-01-20", title: "TransUnion 3rd round prep", summary: "Deep preparation for final round interviews.", type: "research", messages: 52 },
    { date: "2025-01-25", title: "Unemployment benefits issue", summary: "Navigated IL unemployment system complications.", type: "problem", messages: 19 },
    { date: "2025-02-02", title: "Interview debrief & strategy update", summary: "Assessed pipeline status.", type: "decision", messages: 26 },
  ],
  gamedev: [
    { date: "2024-10-12", title: "Dice or Die concept", summary: "Push-your-luck mobile dice game with roguelike elements.", type: "idea", messages: 20 },
    { date: "2024-10-22", title: "Core mechanics design", summary: "Risk/reward gameplay loop and scoring system.", type: "decision", messages: 36 },
    { date: "2024-11-05", title: "Game design document", summary: "Comprehensive GDD: mechanics, monetization, art direction.", type: "build", messages: 48 },
    { date: "2024-11-18", title: "Prototype evaluation", summary: "Unity vs React Native for mobile.", type: "research", messages: 24 },
    { date: "2024-12-10", title: "UI/UX mockups", summary: "Main game screen, dice rolling animations.", type: "build", messages: 30 },
    { date: "2025-01-05", title: "Monetization strategy", summary: "F2P models analysis.", type: "decision", messages: 18 },
  ],
  keymaster: [
    { date: "2024-07-15", title: "AI-native password manager concept", summary: "Password manager using AI for intelligent credential management.", type: "idea", messages: 22 },
    { date: "2024-07-28", title: "Security architecture design", summary: "Zero-knowledge encryption with AI on encrypted metadata.", type: "decision", messages: 40 },
    { date: "2024-08-10", title: "Tech stack selection", summary: "Electron + React cross-platform, Rust for crypto.", type: "decision", messages: 28 },
    { date: "2024-09-01", title: "Password strength algorithm", summary: "Entropy-based scoring with contextual penalties.", type: "build", messages: 34 },
    { date: "2024-10-15", title: "Browser extension prototype", summary: "Chrome extension for auto-fill.", type: "build", messages: 42 },
    { date: "2024-12-05", title: "Project pause — prioritizing CourtCollect", summary: "Shelved to focus on CourtCollect and job search.", type: "pivot", messages: 12 },
  ],
  automation: [
    { date: "2024-06-10", title: "First automation exploration", summary: "Zapier vs Make vs n8n.", type: "research", messages: 16 },
    { date: "2024-07-05", title: "Bluesky analytics pipeline", summary: "Automated social media analytics.", type: "build", messages: 32 },
    { date: "2024-08-20", title: "AI workflow patterns", summary: "LLM-in-the-loop automation.", type: "research", messages: 28 },
    { date: "2024-10-01", title: "Client reporting automation", summary: "Automated weekly HMPRG campaign reports.", type: "build", messages: 24 },
    { date: "2024-11-15", title: "AI-for-good nonprofit concept", summary: "Bringing AI automation to underserved organizations.", type: "idea", messages: 20 },
    { date: "2025-01-20", title: "Personal productivity system", summary: "Integrated calendar, tasks, and AI assistants.", type: "build", messages: 30 },
  ],
  tyler: [
    { date: "2023-03-15", title: "First implementation challenges", summary: "Municipal court software deployment complexities.", type: "problem", messages: 18 },
    { date: "2023-06-20", title: "Data conversion methodology", summary: "Systematic approach to legacy system migration.", type: "build", messages: 34 },
    { date: "2023-09-10", title: "Client communication templates", summary: "Standardized frameworks for court stakeholders.", type: "build", messages: 22 },
    { date: "2024-02-15", title: "Process optimization proposals", summary: "Bottleneck identification.", type: "idea", messages: 28 },
    { date: "2024-06-01", title: "100th implementation milestone", summary: "Lessons learned across 100+ implementations.", type: "milestone", messages: 16 },
    { date: "2024-09-20", title: "Clearwater KS project", summary: "Complex data conversion.", type: "build", messages: 44 },
    { date: "2024-12-15", title: "Departure & knowledge capture", summary: "Documenting institutional knowledge.", type: "milestone", messages: 26 },
  ],
  resumes: [
    { date: "2024-12-20", title: "Base resume rebuild", summary: "Ground-up rewrite.", type: "build", messages: 38 },
    { date: "2025-01-02", title: "Cover letter framework", summary: "Modular template for CSM roles.", type: "build", messages: 24 },
    { date: "2025-01-10", title: "LinkedIn optimization", summary: "Rewrote profile for GovTech.", type: "build", messages: 20 },
    { date: "2025-01-18", title: "Helping others with resumes", summary: "Optimized resumes for professionals.", type: "build", messages: 32 },
    { date: "2025-02-01", title: "Portfolio narrative refinement", summary: "Tightened the career story.", type: "decision", messages: 28 },
  ],
  webdev: [
    { date: "2023-01-20", title: "HTML/CSS fundamentals", summary: "Early web development learning.", type: "research", messages: 14 },
    { date: "2023-04-10", title: "React deep dive", summary: "Components, hooks, and state.", type: "research", messages: 48 },
    { date: "2023-08-15", title: "Next.js & full-stack patterns", summary: "Server-side rendering and API routes.", type: "build", messages: 36 },
    { date: "2024-01-20", title: "Tailwind CSS adoption", summary: "Utility-first CSS.", type: "decision", messages: 22 },
    { date: "2024-05-10", title: "Supabase integration patterns", summary: "Auth, real-time subscriptions.", type: "build", messages: 40 },
    { date: "2024-08-01", title: "GitHub CI/CD mastery", summary: "Workflows, automated testing.", type: "build", messages: 34 },
    { date: "2025-01-15", title: "Performance optimization", summary: "Bundle analysis, lazy loading.", type: "research", messages: 26 },
  ],
  n8n: [
    { date: "2024-08-05", title: "n8n discovery & setup", summary: "Self-hosted automation.", type: "research", messages: 18 },
    { date: "2024-08-22", title: "Bluesky → Airtable pipeline", summary: "Automated analytics data pipeline.", type: "build", messages: 36 },
    { date: "2024-09-15", title: "HMPRG reporting automation", summary: "Meta Ads API to reports.", type: "build", messages: 28 },
    { date: "2024-11-01", title: "Webhook integrations", summary: "Event-driven workflows.", type: "build", messages: 22 },
    { date: "2025-01-10", title: "Complex multi-step workflows", summary: "Error handling, conditional branches.", type: "build", messages: 30 },
  ],
  obsidian: [
    { date: "2024-11-10", title: "PKM research", summary: "Zettelkasten method and digital gardens.", type: "research", messages: 24 },
    { date: "2024-12-01", title: "Obsidian vault architecture", summary: "Folder structure, tagging, templates.", type: "decision", messages: 30 },
    { date: "2025-01-20", title: "AI + PKM integration ideas", summary: "LLM-powered note extraction.", type: "idea", messages: 28 },
    { date: "2025-02-05", title: "LLM conversation extraction concept", summary: "System to turn chat history into knowledge.", type: "idea", messages: 45 },
  ],
  finance: [
    { date: "2023-06-15", title: "Budget optimization system", summary: "Personal budgeting framework.", type: "build", messages: 20 },
    { date: "2023-10-01", title: "Investment research", summary: "Index fund strategies.", type: "research", messages: 26 },
    { date: "2024-04-15", title: "Tax optimization strategies", summary: "Self-employment deductions.", type: "research", messages: 18 },
    { date: "2024-12-20", title: "Unemployment benefits navigation", summary: "IL unemployment process.", type: "problem", messages: 22 },
    { date: "2025-01-10", title: "Consulting income planning", summary: "Cash flow projections.", type: "build", messages: 16 },
  ],
  writing: [
    { date: "2023-04-20", title: "Blog post drafting", summary: "Early creative writing experiments.", type: "build", messages: 16 },
    { date: "2023-08-10", title: "Storytelling frameworks", summary: "Narrative structures.", type: "research", messages: 22 },
    { date: "2024-03-01", title: "Content marketing copy", summary: "Brand voice and content strategy.", type: "build", messages: 28 },
    { date: "2024-10-15", title: "Dice or Die narrative design", summary: "Game lore, character backstories.", type: "build", messages: 32 },
    { date: "2025-01-05", title: "Professional bio iterations", summary: "Multiple versions for contexts.", type: "build", messages: 14 },
  ],
  govtech: [
    { date: "2023-02-10", title: "GovTech landscape analysis", summary: "Government technology ecosystem.", type: "research", messages: 20 },
    { date: "2023-07-15", title: "Municipal procurement deep dive", summary: "RFP processes.", type: "research", messages: 28 },
    { date: "2024-03-20", title: "Both sides of the table", summary: "MPA + local gov + vendor experience.", type: "idea", messages: 16 },
    { date: "2024-08-10", title: "Court technology modernization", summary: "E-filing, virtual hearings.", type: "research", messages: 24 },
    { date: "2024-11-20", title: "AI in courts — ethics", summary: "Ethical considerations.", type: "research", messages: 30 },
    { date: "2025-02-01", title: "GovTech market positioning", summary: "CourtCollect in GovTech narrative.", type: "decision", messages: 22 },
  ],
};

const TYPE_META = {
  idea: { label: "Idea", color: "#FBBF24", icon: "💡" },
  research: { label: "Research", color: "#3B82F6", icon: "🔬" },
  decision: { label: "Decision", color: "#EF4444", icon: "🎯" },
  build: { label: "Build", color: "#10B981", icon: "🔨" },
  problem: { label: "Problem", color: "#F87171", icon: "🔥" },
  pivot: { label: "Pivot", color: "#A855F7", icon: "↩️" },
  milestone: { label: "Milestone", color: "#EAB308", icon: "🏆" },
};

const MONTHLY_ACTIVITY = [
  { month: "Jan 23", gpt: 45, claude: 0 }, { month: "Feb 23", gpt: 52, claude: 0 },
  { month: "Mar 23", gpt: 61, claude: 0 }, { month: "Apr 23", gpt: 58, claude: 0 },
  { month: "May 23", gpt: 73, claude: 0 }, { month: "Jun 23", gpt: 82, claude: 0 },
  { month: "Jul 23", gpt: 91, claude: 0 }, { month: "Aug 23", gpt: 88, claude: 2 },
  { month: "Sep 23", gpt: 96, claude: 8 }, { month: "Oct 23", gpt: 84, claude: 22 },
  { month: "Nov 23", gpt: 79, claude: 38 }, { month: "Dec 23", gpt: 72, claude: 51 },
  { month: "Jan 24", gpt: 68, claude: 55 }, { month: "Feb 24", gpt: 61, claude: 62 },
  { month: "Mar 24", gpt: 54, claude: 71 }, { month: "Apr 24", gpt: 48, claude: 78 },
  { month: "May 24", gpt: 52, claude: 84 }, { month: "Jun 24", gpt: 47, claude: 89 },
  { month: "Jul 24", gpt: 43, claude: 95 }, { month: "Aug 24", gpt: 38, claude: 108 },
  { month: "Sep 24", gpt: 35, claude: 112 }, { month: "Oct 24", gpt: 31, claude: 118 },
  { month: "Nov 24", gpt: 28, claude: 124 }, { month: "Dec 24", gpt: 34, claude: 131 },
  { month: "Jan 25", gpt: 22, claude: 138 }, { month: "Feb 25", gpt: 18, claude: 142 },
  { month: "Mar 25", gpt: 16, claude: 148 }, { month: "Apr 25", gpt: 14, claude: 151 },
  { month: "May 25", gpt: 15, claude: 155 }, { month: "Jun 25", gpt: 12, claude: 158 },
  { month: "Jul 25", gpt: 11, claude: 162 }, { month: "Aug 25", gpt: 10, claude: 159 },
  { month: "Sep 25", gpt: 9, claude: 164 }, { month: "Oct 25", gpt: 8, claude: 168 },
  { month: "Nov 25", gpt: 10, claude: 171 }, { month: "Dec 25", gpt: 12, claude: 175 },
  { month: "Jan 26", gpt: 8, claude: 180 }, { month: "Feb 26", gpt: 6, claude: 184 },
];

const SEARCH_RESULTS = [
  { query: "restaurant gina", title: "Date night restaurant recommendations", date: "2024-11-08", platform: "ChatGPT", preview: "Italian restaurant recommendations in the Elgin area for anniversary dinner..." },
  { query: "restaurant gina", title: "Chicago weekend trip planning", date: "2024-09-14", platform: "ChatGPT", preview: "Downtown Chicago day trip — restaurants near Millennium Park..." },
  { query: "deployment docker", title: "CourtCollect Docker debugging", date: "2024-11-14", platform: "Claude", preview: "Extended debugging for Railway deployment. Multi-stage build conflict..." },
  { query: "deployment docker", title: "Keymaster container setup", date: "2024-08-22", platform: "Claude", preview: "Docker Compose for local Keymaster development environment..." },
  { query: "interview transunion", title: "TransUnion 3rd round preparation", date: "2025-01-20", platform: "Claude", preview: "Comprehensive behavioral interview prep with STAR method..." },
  { query: "interview veritone", title: "Veritone Implementation Manager prep", date: "2025-01-14", platform: "Claude", preview: "Research on Veritone's AI platform and role-specific preparation..." },
  { query: "dice game", title: "Dice or Die core gameplay loop", date: "2024-10-22", platform: "ChatGPT", preview: "Risk/reward push-your-luck mechanics and scoring system..." },
  { query: "dice game", title: "Game design document creation", date: "2024-11-05", platform: "Claude", preview: "Comprehensive GDD: mechanics, monetization, art direction..." },
  { query: "gina counselor", title: "Supporting Gina's CRSS program", date: "2024-10-12", platform: "ChatGPT", preview: "Helping with the Elgin Community College certification program..." },
  { query: "meta ads budget", title: "HMPRG Meta campaign optimization", date: "2024-10-25", platform: "Claude", preview: "$800 budget campaigns targeting Illinois youth..." },
  { query: "supabase auth", title: "CourtCollect authentication flow", date: "2024-10-18", platform: "Claude", preview: "Multi-tenant auth with role-based access for courts and agencies..." },
  { query: "supabase auth", title: "Keymaster security architecture", date: "2024-07-28", platform: "Claude", preview: "Zero-knowledge encryption with client-side decryption..." },
];

const INSIGHTS = [
  { icon: "🧩", title: "Problem Decomposer", desc: "You break complex challenges into smaller parts in 73% of conversations.", pct: 73 },
  { icon: "🔄", title: "Relentless Iterator", desc: "Average 4.2 revision cycles per project. You refine, never restart.", pct: 84 },
  { icon: "🌉", title: "Cross-Pollinator", desc: "31% of ideas reference a different domain. GovTech informs product thinking.", pct: 31 },
  { icon: "📐", title: "Systems Thinker", desc: "You ask about architecture before implementation in 68% of technical chats.", pct: 68 },
  { icon: "🎓", title: "Active Learner", desc: "Question sophistication increased 3.4× from 2023.", pct: 88 },
];

const PLATFORM_INSIGHTS = [
  { label: "You use Claude for", items: ["Architecture & system design", "Long implementation sessions", "Resume & career materials", "Complex debugging"], color: "#FBBF24" },
  { label: "You use ChatGPT for", items: ["Quick research questions", "Creative brainstorming", "Personal & life topics", "Early-stage exploration"], color: "#3B82F6" },
];

const EVOLUTION_PHASES = [
  { period: "Jan – Jun 2023", title: "The Learner", desc: "Mostly how-to questions. Web dev fundamentals, career research, simple automations. Average conversation: 8 messages.", color: "#3B82F6", conversations: 371 },
  { period: "Jul – Dec 2023", title: "The Practitioner", desc: "Building real things. Tyler work got sophisticated. Financial planning and creative writing began.", color: "#10B981", conversations: 483 },
  { period: "Jan – Jun 2024", title: "The Builder", desc: "Launched Keymaster and automation projects. Shifted from 'how' to 'what should I build.' Claude adoption began.", color: "#F59E0B", conversations: 548 },
  { period: "Jul – Dec 2024", title: "The Architect", desc: "CourtCollect, HMPRG campaigns, game design. Multi-project orchestration. Average conversation: 35 messages.", color: "#EF4444", conversations: 726 },
  { period: "Jan – Jun 2025", title: "The Strategist", desc: "Job search + consulting + product development simultaneously. AI as thinking partner, not just tool.", color: "#A855F7", conversations: 520 },
  { period: "Jul 2025 – Feb 2026", title: "The Meta-Thinker", desc: "Designing systems to extract knowledge from your own AI use. Building Atlas. The snake eats its tail.", color: "#EC4899", conversations: 480 },
];

const REDISCOVERIES = [
  { icon: "💡", ago: "3 months ago", text: "You designed a password-strength scoring algorithm using entropy calculation with contextual penalties." },
  { icon: "🎯", ago: "9 months ago", text: "You found that municipal courts lose 23% of collectible revenue to outdated payment systems." },
  { icon: "🔄", ago: "2 years ago", text: "Your first conversation about AI automation — 'how do I connect APIs without coding.' Look how far that's come." },
];

// ─── REVIEW QUEUE DATA ──────────────────────────────────────
const REVIEW_QUEUE_DATA = [
  {
    id: 1, confidence: 96, topicId: "courtcollect",
    snippet: { user: "Can you help me design the database schema for tracking court cases, payments, and collection agency assignments?", ai: "I'll design a normalized schema with four core tables: courts, cases, payments, and agencies. We should add a junction table for agency-case assignments with status tracking..." },
    entities: ["Supabase", "PostgreSQL", "multi-tenant"],
    decisionFlag: true, decisionText: "Chose relational schema over document store",
  },
  {
    id: 2, confidence: 93, topicId: "jobsearch",
    snippet: { user: "I need to prepare for my TransUnion third-round interview. Can you help with behavioral questions?", ai: "For a third-round at TransUnion, expect questions focused on leadership, conflict resolution, and strategic thinking. Let's use the STAR method..." },
    entities: ["TransUnion", "STAR method", "behavioral interview"],
    decisionFlag: false,
  },
  {
    id: 3, confidence: 78, topicId: "automation",
    snippet: { user: "What's the best way to connect my n8n instance to the Meta Ads API for automated HMPRG reporting?", ai: "You'll want to use n8n's HTTP Request node with OAuth2 credentials for Meta. Set up a scheduled trigger for weekly pulls..." },
    entities: ["n8n", "Meta Ads API", "HMPRG", "OAuth2"],
    decisionFlag: false,
  },
  {
    id: 4, confidence: 91, topicId: "gamedev",
    snippet: { user: "Let's finalize the core gameplay loop for Dice or Die. I want a push-your-luck mechanic with roguelike progression.", ai: "Here's the loop: Roll phase → Risk/Reward decision → Score or Bust → Upgrade shop between rounds. The roguelike element comes from persistent unlocks..." },
    entities: ["Dice or Die", "push-your-luck", "roguelike"],
    decisionFlag: true, decisionText: "Defined core gameplay loop structure",
  },
  {
    id: 5, confidence: 62, topicId: "webdev",
    snippet: { user: "How do I fix this hydration mismatch error in Next.js? The server and client are rendering different content.", ai: "Hydration mismatches typically happen when you use browser-only APIs during render. Wrap the dynamic content in a useEffect or use dynamic imports with ssr: false..." },
    entities: ["Next.js", "hydration", "SSR"],
    decisionFlag: false,
  },
  {
    id: 6, confidence: 85, topicId: "hmprg",
    snippet: { user: "The Instagram campaigns are outperforming Facebook 3:1. Should we reallocate the budget?", ai: "With a 3:1 performance ratio, reallocating makes sense. I'd suggest shifting to 70/30 Instagram-heavy while keeping Facebook for the older demographic segments..." },
    entities: ["HMPRG", "Instagram", "Facebook", "budget optimization"],
    decisionFlag: true, decisionText: "Pivoted ad spend toward Instagram",
  },
  {
    id: 7, confidence: 55, topicId: "writing",
    snippet: { user: "Can you help me brainstorm character backstories for the Dice or Die game world?", ai: "Let's build characters around the dice theme. The Gambler's Ghost — a spectral figure who lost everything on a single roll. The Probability Witch — she sees all possible outcomes..." },
    entities: ["Dice or Die", "character design", "narrative"],
    decisionFlag: false,
  },
  {
    id: 8, confidence: 88, topicId: "keymaster",
    snippet: { user: "For Keymaster's security architecture, should we go with zero-knowledge encryption or standard E2EE?", ai: "Zero-knowledge is the right call for a password manager. The server should never see plaintext credentials. Use SRP for auth and AES-256-GCM with a key derived from the master password..." },
    entities: ["Keymaster", "zero-knowledge", "AES-256-GCM", "SRP"],
    decisionFlag: true, decisionText: "Selected zero-knowledge architecture",
  },
  {
    id: 9, confidence: 71, topicId: "govtech",
    snippet: { user: "What are the ethical implications of using AI in municipal court systems? I want to address this in the CourtCollect pitch.", ai: "Key concerns: algorithmic bias in case prioritization, transparency in automated decisions, data privacy for defendants. You should frame CourtCollect as augmenting human judgment, not replacing it..." },
    entities: ["AI ethics", "municipal courts", "algorithmic bias"],
    decisionFlag: false,
  },
  {
    id: 10, confidence: 94, topicId: "resumes",
    snippet: { user: "I need a tailored cover letter for the OpenGov CSM position. Focus on my 100+ Tyler implementations.", ai: "Opening hook: 'Having personally led 100+ municipal software implementations at Tyler Technologies, I understand the exact pain points OpenGov's customers face...' " },
    entities: ["OpenGov", "cover letter", "Tyler Technologies"],
    decisionFlag: false,
  },
];

// ─── INSIGHT & DECISION DATA (for Curation Step 4) ──────────
const INSIGHT_DECISIONS = [
  {
    id: 1, type: "decision",
    topicId: "courtcollect", date: "2024-09-15",
    aiProposal: "Chose Supabase + Next.js as the tech stack after evaluating Firebase, AWS Amplify, and custom solutions.",
    sourceSnippet: { user: "Can you help me design the database schema for tracking court cases, payments, and collection agency assignments?", ai: "I'll design a normalized schema with four core tables: courts, cases, payments, and agencies..." },
    sourceRef: "CourtCollect · Sep 15, 2024 · 42 messages",
  },
  {
    id: 2, type: "pivot",
    topicId: "courtcollect", date: "2024-11-16",
    aiProposal: "Pivoted from Docker + Railway deployment to Vercel + Supabase Cloud after 3 days of containerization issues.",
    sourceSnippet: { user: "Docker keeps failing on Railway. Multi-stage builds conflict with the Prisma client generation.", ai: "Given 3 days of deployment friction, Vercel + Supabase Cloud simplifies everything. The serverless model fits your architecture..." },
    sourceRef: "CourtCollect · Nov 16, 2024 · 35 messages",
  },
  {
    id: 3, type: "decision",
    topicId: "keymaster", date: "2024-07-28",
    aiProposal: "Selected zero-knowledge encryption architecture for Keymaster — server never sees plaintext credentials.",
    sourceSnippet: { user: "For Keymaster's security architecture, should we go with zero-knowledge encryption or standard E2EE?", ai: "Zero-knowledge is the right call for a password manager. Use SRP for auth and AES-256-GCM..." },
    sourceRef: "Keymaster · Jul 28, 2024 · 40 messages",
  },
  {
    id: 4, type: "pivot",
    topicId: "hmprg", date: "2025-01-15",
    aiProposal: "Shifted HMPRG ad budget from equal split to 70/30 Instagram-heavy after Instagram outperformed Facebook 3:1.",
    sourceSnippet: { user: "The Instagram campaigns are outperforming Facebook 3:1. Should we reallocate the budget?", ai: "With a 3:1 ratio, reallocating makes sense. Shift to 70/30 Instagram-heavy while keeping Facebook for older demographics..." },
    sourceRef: "HMPRG · Jan 15, 2025 · 26 messages",
  },
  {
    id: 5, type: "milestone",
    topicId: "tyler", date: "2024-06-01",
    aiProposal: "Reached 100th Tyler Technologies implementation — a career milestone spanning 4+ years of municipal software deployments.",
    sourceSnippet: { user: "I just completed my 100th implementation at Tyler. Can you help me reflect on lessons learned?", ai: "100 implementations is a remarkable body of work. Key patterns: your data conversion methodology evolved significantly..." },
    sourceRef: "Tyler · Jun 1, 2024 · 16 messages",
  },
  {
    id: 6, type: "decision",
    topicId: "gamedev", date: "2024-10-22",
    aiProposal: "Defined Dice or Die core gameplay loop: Roll → Risk/Reward → Score/Bust → Upgrade shop with roguelike progression.",
    sourceSnippet: { user: "Let's finalize the core gameplay loop. I want a push-your-luck mechanic with roguelike progression.", ai: "Here's the loop: Roll phase → Risk/Reward decision → Score or Bust → Upgrade shop between rounds..." },
    sourceRef: "Dice or Die · Oct 22, 2024 · 36 messages",
  },
  {
    id: 7, type: "decision",
    topicId: "obsidian", date: "2024-12-01",
    aiProposal: "Committed to Zettelkasten-based Obsidian vault architecture with atomic notes, MOCs, and daily journals.",
    sourceSnippet: { user: "I want to set up my Obsidian vault properly. What structure should I use?", ai: "For your use case, a Zettelkasten-inspired structure works best: atomic notes, Maps of Content for navigation, daily journals..." },
    sourceRef: "Knowledge Mgmt · Dec 1, 2024 · 30 messages",
  },
  {
    id: 8, type: "milestone",
    topicId: "courtcollect", date: "2025-01-28",
    aiProposal: "Shipped CourtCollect collections agency portal MVP — first working agency-facing product with case assignment.",
    sourceSnippet: { user: "The agency portal is live! Can you help me plan the next iteration?", ai: "Congratulations on the MVP launch. For the next iteration, focus on the highest-friction workflows: bulk case assignment..." },
    sourceRef: "CourtCollect · Jan 28, 2025 · 61 messages",
  },
];

// ─── TOPIC CURATION DATA ────────────────────────────────────
const CURATED_PALETTE = [
  "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6", "#10B981",
  "#EC4899", "#F97316", "#6366F1", "#14B8A6", "#84CC16",
  "#A855F7", "#06B6D4", "#FB923C", "#64748B", "#E11D48",
  "#0EA5E9", "#D946EF", "#22C55E",
];

// Mini-sparkline activity data per topic (last 6 months relative values)
const TOPIC_SPARKLINES = {
  courtcollect: [3, 5, 8, 6, 9, 7],
  hmprg: [2, 4, 6, 8, 5, 7],
  jobsearch: [1, 2, 6, 9, 8, 10],
  gamedev: [4, 6, 5, 3, 2, 1],
  keymaster: [5, 4, 3, 2, 1, 1],
  automation: [3, 4, 5, 6, 5, 7],
  resumes: [1, 1, 4, 8, 9, 7],
  tyler: [6, 5, 4, 3, 2, 1],
  obsidian: [1, 2, 3, 4, 5, 6],
  finance: [3, 2, 4, 2, 3, 2],
  n8n: [4, 5, 6, 4, 3, 2],
  webdev: [7, 6, 8, 7, 8, 9],
  writing: [3, 4, 2, 3, 2, 1],
  govtech: [4, 5, 6, 5, 4, 5],
};

// Suggested splits for broad topics
const SPLIT_SUGGESTIONS = {
  webdev: { into: ["Frontend", "DevOps"], icons: ["🎨", "🔧"] },
  automation: { into: ["AI Tools", "Workflow Automation"], icons: ["🤖", "⚡"] },
  govtech: { into: ["Public Policy", "GovTech Products"], icons: ["📜", "🏛️"] },
};

// Suggested merges (pairs that could be combined)
const MERGE_SUGGESTIONS = [
  { from: "n8n", into: "automation", suggestedName: "AI & Workflow Automation" },
  { from: "resumes", into: "jobsearch", suggestedName: "Career & Applications" },
];

// ─── STYLES ─────────────────────────────────────────────────
const FONTS = `'Playfair Display', 'Georgia', serif`;
const BODY = `'Libre Franklin', 'Helvetica Neue', sans-serif`;
const MONO = `'JetBrains Mono', 'Fira Code', monospace`;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Libre+Franklin:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #08080C; }
  @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 8px rgba(251,191,36,0.3)); transform: scale(1); } 50% { filter: drop-shadow(0 0 20px rgba(251,191,36,0.6)); transform: scale(1.08); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes borderGlow { 0%, 100% { border-color: rgba(251,191,36,0.15); } 50% { border-color: rgba(251,191,36,0.4); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes autoApprove { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.9; transform: scale(1.01); border-color: rgba(16,185,129,0.5); } 100% { opacity: 0; transform: scale(0.97) translateX(40px); } }
  @keyframes queueSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes topicCardIn { from { opacity: 0; transform: scale(0.92) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes mergeOut { 0% { opacity: 1; transform: scale(1); } 60% { opacity: 0.6; transform: scale(0.85); } 100% { opacity: 0; transform: scale(0.7) translateX(20px); height: 0; margin: 0; padding: 0; overflow: hidden; } }
  @keyframes starPop { 0% { transform: scale(1); } 50% { transform: scale(1.35); } 100% { transform: scale(1); } }
  @keyframes cardDismiss { 0% { opacity: 1; transform: translateX(0) scale(1); } 100% { opacity: 0; transform: translateX(60px) scale(0.92); } }
  @keyframes cardPromote { 0% { opacity: 1; transform: translateY(0); } 50% { box-shadow: 0 0 24px rgba(16,185,129,0.3); } 100% { opacity: 0; transform: translateY(-30px) scale(0.95); } }
  .fade-up { animation: fadeUp 0.6s ease both; }
  .slide-in { animation: slideIn 0.5s ease both; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(251,191,36,0.15); border-radius: 3px; }
`;

// ═══════════════════════════════════════════════════════════════
// NEW: ONBOARDING VIEW
// ═══════════════════════════════════════════════════════════════
const DropZone = ({ platform, icon, color, subtitle, accepted, onDrop, onFile, mobile }) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.length) onFile(files[0].name);
  };
  const handleClick = () => { if (!accepted) inputRef.current?.click(); };
  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f.name);
  };

  return (
    <div
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={handleClick}
      style={{
        flex: 1, minWidth: mobile ? "100%" : 280,
        border: `2px dashed ${accepted ? color : dragOver ? color : `${color}30`}`,
        borderRadius: 16, padding: mobile ? "28px 20px" : "36px 28px",
        background: accepted ? `${color}08` : dragOver ? `${color}06` : "rgba(255,255,255,0.015)",
        cursor: accepted ? "default" : "pointer",
        transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
        animation: dragOver ? "borderGlow 1.5s infinite" : "none",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}
    >
      <input ref={inputRef} type="file" style={{ display: "none" }} onChange={handleInputChange} accept=".json,.zip" />

      {accepted ? (
        <div className="fade-up" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✓</div>
          <div style={{ fontFamily: BODY, fontSize: 14, color, fontWeight: 600 }}>{platform} ready</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)", wordBreak: "break-all" }}>{accepted}</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: mobile ? 36 : 44, marginBottom: 12, animation: dragOver ? "float 1.5s infinite ease-in-out" : "none" }}>{icon}</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 15 : 17, color: "#fff", fontWeight: 600, marginBottom: 4 }}>{platform}</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.3)", marginBottom: 14, lineHeight: 1.5 }}>{subtitle}</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: `${color}12`, border: `1px solid ${color}25`,
            fontFamily: BODY, fontSize: 12, color, fontWeight: 500,
          }}>
            <span style={{ fontSize: 14 }}>📂</span>
            {mobile ? "Tap to browse" : "Drop file or click to browse"}
          </div>
        </>
      )}
    </div>
  );
};

const OnboardingView = ({ onStart, mobile, w }) => {
  const [gptFile, setGptFile] = useState(null);
  const [claudeFile, setClaudeFile] = useState(null);
  const [hovering, setHovering] = useState(false);

  const hasAnyFile = gptFile || claudeFile;

  const handleDemo = () => {
    setGptFile("conversations.json");
    setClaudeFile("claude-export-2026-02.zip");
    setTimeout(() => onStart(), 800);
  };

  const handleBuild = () => { if (hasAnyFile) onStart(); };

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? "32px 16px" : "48px 32px" }}>
      <style>{CSS}</style>

      {/* Background glow */}
      <div style={{ position: "fixed", top: "-20%", left: "50%", transform: "translateX(-50%)", width: "140%", height: "50%", background: "radial-gradient(ellipse at center, rgba(251,191,36,0.04) 0%, transparent 60%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 720, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Logo & Hero */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 36 : 48 }}>
          <div style={{ fontSize: mobile ? 48 : 64, marginBottom: 16, animation: "glow 3s infinite ease-in-out" }}>🧠</div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 36 : 52, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 8 }}>
            <span style={{ color: "#FBBF24" }}>Atlas</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 14 : 17, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            Transform your AI conversation history into a structured, searchable knowledge base.
          </p>
        </div>

        {/* How it works — tiny steps */}
        <div style={{ display: "flex", justifyContent: "center", gap: mobile ? 16 : 32, marginBottom: mobile ? 28 : 40, flexWrap: "wrap" }}>
          {[
            { n: "1", label: "Export your data", sub: "from ChatGPT & Claude" },
            { n: "2", label: "Drop files here", sub: "we parse & normalize" },
            { n: "3", label: "Explore your atlas", sub: "topics, connections, insights" },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 1 ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${i === 1 ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: 11, color: i === 1 ? "#FBBF24" : "rgba(255,255,255,0.3)", fontWeight: 600, flexShrink: 0 }}>{step.n}</div>
              <div>
                <div style={{ fontFamily: BODY, fontSize: 12, color: "#fff", fontWeight: 500 }}>{step.label}</div>
                <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Drop Zones */}
        <div style={{ display: "flex", gap: mobile ? 12 : 16, flexDirection: mobile ? "column" : "row", marginBottom: 20 }}>
          <DropZone
            platform="ChatGPT" icon="💬" color="#10B981"
            subtitle="Settings → Data controls → Export → Download conversations.json"
            accepted={gptFile} onFile={setGptFile} mobile={mobile}
          />
          <DropZone
            platform="Claude" icon="🟠" color="#FBBF24"
            subtitle="Settings → Account → Export data → Download ZIP file"
            accepted={claudeFile} onFile={setClaudeFile} mobile={mobile}
          />
        </div>

        {/* Build button */}
        {hasAnyFile && (
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={handleBuild} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #FBBF24, #F59E0B)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(251,191,36,0.25), 0 0 0 1px rgba(251,191,36,0.3)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.35), 0 0 0 1px rgba(251,191,36,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(251,191,36,0.25), 0 0 0 1px rgba(251,191,36,0.3)"; }}
            >
              Build My Atlas →
            </button>
            <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>
              {gptFile && claudeFile ? "Both sources ready" : gptFile ? "ChatGPT only — Claude is optional" : "Claude only — ChatGPT is optional"}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: `${hasAnyFile ? 12 : 24}px 0` }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Demo button */}
        <div style={{ textAlign: "center" }}>
          <button onClick={handleDemo}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(251,191,36,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            style={{
              fontFamily: BODY, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, padding: "12px 28px", cursor: "pointer", transition: "all 0.25s",
            }}
          >
            ✨ Use demo data instead
          </button>
          <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.15)", marginTop: 8 }}>
            3,847 conversations · 3 years · ChatGPT + Claude
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: mobile ? 40 : 56 }}>
          <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.08)" }}>
            Your data never leaves your browser. Atlas processes everything locally.
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ENHANCED LOADING VIEW
// ═══════════════════════════════════════════════════════════════
const LOAD_PIPELINE = [
  { pct: 3, phase: "parse", msg: "Reading ChatGPT conversations.json...", detail: "Found nested tree structure with 2,341 conversations" },
  { pct: 8, phase: "parse", msg: "Parsing conversation tree branches...", detail: "Flattening 847 branched conversations to longest path" },
  { pct: 14, phase: "parse", msg: "Reading Claude export archive...", detail: "Extracting contentChunks from 1,506 conversations" },
  { pct: 21, phase: "normalize", msg: "Normalizing cross-platform schemas...", detail: "Mapping ChatGPT 'mapping' nodes → unified message format" },
  { pct: 28, phase: "normalize", msg: "Deduplicating conversations...", detail: "Removed 0 duplicates across platforms" },
  { pct: 33, phase: "normalize", msg: "Indexing message timestamps...", detail: "Date range: January 2023 → February 2026" },
  { pct: 40, phase: "enrich", msg: "Classifying topics with semantic analysis...", detail: null, discovery: { icon: "🌐", name: "Web Development", count: 156 } },
  { pct: 46, phase: "enrich", msg: "Extracting named entities...", detail: null, discovery: { icon: "🏢", name: "Tyler Technologies", count: 89 } },
  { pct: 52, phase: "enrich", msg: "Identifying decision points...", detail: null, discovery: { icon: "💼", name: "Job Search", count: 62 } },
  { pct: 58, phase: "enrich", msg: "Mapping topic clusters...", detail: "14 distinct clusters identified", discovery: { icon: "⚖️", name: "CourtCollect", count: 47 } },
  { pct: 64, phase: "enrich", msg: "Scoring conversation depth...", detail: null, discovery: { icon: "🏛️", name: "Gov Tech & Policy", count: 44 } },
  { pct: 70, phase: "enrich", msg: "Detecting evolution phases...", detail: "6 cognitive phases found across 38 months" },
  { pct: 76, phase: "connect", msg: "Computing topic connections...", detail: "16 significant connections at >0.3 strength" },
  { pct: 82, phase: "connect", msg: "Generating cognitive insights...", detail: "You're a Relentless Iterator (84th percentile)" },
  { pct: 88, phase: "connect", msg: "Building activity timeline...", detail: "Peak month: January 2026 — 188 conversations" },
  { pct: 93, phase: "build", msg: "Generating search index...", detail: "2.4M words indexed across 3,847 conversations" },
  { pct: 97, phase: "build", msg: "Rendering knowledge atlas...", detail: null },
  { pct: 100, phase: "build", msg: "Your atlas is ready.", detail: null },
];

const PHASE_META = {
  parse: { label: "PARSING", color: "#3B82F6", icon: "📄" },
  normalize: { label: "NORMALIZING", color: "#10B981", icon: "🔄" },
  enrich: { label: "ENRICHING", color: "#FBBF24", icon: "🧠" },
  connect: { label: "CONNECTING", color: "#A855F7", icon: "🔗" },
  build: { label: "BUILDING", color: "#EC4899", icon: "✨" },
};

const LoadingView = ({ onComplete, mobile, w }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [discoveries, setDiscoveries] = useState([]);
  const [showReveal, setShowReveal] = useState(false);
  const totalConvos = 3847;

  useEffect(() => {
    const timings = [
      300, 900, 1600, 2300, 2800, 3400, 4100, 4800, 5500,
      6200, 6800, 7400, 8000, 8500, 9000, 9600, 10100, 10400,
    ];
    timings.forEach((t, i) => {
      setTimeout(() => {
        setStageIdx(i);
        if (LOAD_PIPELINE[i].discovery) {
          setDiscoveries(prev => [...prev, LOAD_PIPELINE[i].discovery]);
        }
      }, t);
    });
    setTimeout(() => setShowReveal(true), 10800);
    setTimeout(() => onComplete(), 12000);
  }, [onComplete]);

  const stage = LOAD_PIPELINE[stageIdx] || LOAD_PIPELINE[LOAD_PIPELINE.length - 1];
  const phaseMeta = PHASE_META[stage.phase];
  const convoCount = Math.floor((stage.pct / 100) * totalConvos);

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: mobile ? "24px 16px" : "32px", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* Ambient glow that shifts with phase */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 50% 40%, ${phaseMeta.color}08 0%, transparent 50%)`, transition: "background 1s ease", pointerEvents: "none" }} />

      <div style={{ maxWidth: 560, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Brain + phase indicator */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: mobile ? 48 : 56, marginBottom: 16, animation: "glow 2.5s infinite ease-in-out" }}>🧠</div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20,
            background: `${phaseMeta.color}12`, border: `1px solid ${phaseMeta.color}25`,
            fontFamily: MONO, fontSize: 10, color: phaseMeta.color, fontWeight: 600,
            letterSpacing: "0.08em", transition: "all 0.4s",
          }}>
            {phaseMeta.icon} {phaseMeta.label}
          </div>
        </div>

        {/* Status message */}
        <div style={{ textAlign: "center", minHeight: 56, marginBottom: 24 }}>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 22, color: "#fff", marginBottom: 6, transition: "all 0.3s" }}>
            {stage.msg}
          </div>
          {stage.detail && (
            <div key={stageIdx} className="fade-up" style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
              {stage.detail}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ width: "100%", height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${stage.pct}%`, height: "100%",
              background: `linear-gradient(90deg, ${phaseMeta.color}CC, ${phaseMeta.color})`,
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1), background 0.5s ease",
              boxShadow: `0 0 16px ${phaseMeta.color}40`,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
              {convoCount.toLocaleString()} / {totalConvos.toLocaleString()} conversations
            </span>
            <span style={{ fontFamily: MONO, fontSize: 10, color: phaseMeta.color + "80" }}>
              {stage.pct}%
            </span>
          </div>
        </div>

        {/* Phase progress dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "20px 0 28px" }}>
          {Object.entries(PHASE_META).map(([key, meta], i) => {
            const phaseOrder = ["parse", "normalize", "enrich", "connect", "build"];
            const currentPhaseIdx = phaseOrder.indexOf(stage.phase);
            const thisIdx = phaseOrder.indexOf(key);
            const isActive = thisIdx === currentPhaseIdx;
            const isDone = thisIdx < currentPhaseIdx;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: isActive ? 24 : 8, height: 8, borderRadius: 4,
                  background: isDone ? meta.color : isActive ? meta.color : "rgba(255,255,255,0.06)",
                  opacity: isDone ? 0.5 : 1,
                  transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow: isActive ? `0 0 8px ${meta.color}40` : "none",
                }} />
              </div>
            );
          })}
        </div>

        {/* Discovery feed */}
        {discoveries.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12, padding: mobile ? "14px 16px" : "16px 20px",
          }}>
            <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
              Discovered Topics
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {discoveries.map((d, i) => (
                <div key={i} className="slide-in" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)",
                  animationDelay: `${i * 50}ms`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{d.icon}</span>
                    <span style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(251,191,36,0.4)" }}>{d.count} convos</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reveal animation */}
        {showReveal && (
          <div className="fade-up" style={{ textAlign: "center", marginTop: 28 }}>
            <div style={{ fontFamily: FONTS, fontSize: mobile ? 20 : 24, color: "#FBBF24", fontWeight: 700 }}>
              Your atlas is ready.
            </div>
            <div style={{
              fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6,
              background: "linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.08) 50%, rgba(251,191,36,0) 100%)",
              backgroundSize: "200% 100%", animation: "shimmer 2s infinite linear",
              padding: "6px 0", borderRadius: 4,
            }}>
              Entering your knowledge map...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SHARED COMPONENTS (from v3) ────────────────────────────

const AnimatedNumber = ({ value, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setStarted(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!started) return;
    const dur = 1400, steps = 35, inc = value / steps;
    let cur = 0;
    const timer = setInterval(() => {
      cur += inc;
      if (cur >= value) { setCount(value); clearInterval(timer); } else setCount(Math.floor(cur));
    }, dur / steps);
    return () => clearInterval(timer);
  }, [started, value]);
  return <>{count.toLocaleString()}</>;
};

const Nav = ({ view, onNavigate, mobile }) => {
  const tabs = [
    { id: "dashboard", label: "Overview", icon: "◈" },
    { id: "connections", label: "Connections", icon: "◎" },
    { id: "evolution", label: "Evolution", icon: "◇" },
    { id: "search", label: "Search", icon: "⌕" },
  ];
  return (
    <nav style={{
      display: "flex", gap: 3, padding: 3,
      background: "rgba(255,255,255,0.03)", borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.06)",
      margin: mobile ? "0 0 28px" : "0 auto 36px",
      width: mobile ? "100%" : "fit-content",
      overflowX: mobile ? "auto" : "visible",
      WebkitOverflowScrolling: "touch", flexShrink: 0,
    }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onNavigate(tab.id)}
          style={{
            fontFamily: BODY, fontSize: mobile ? 12 : 13, fontWeight: view === tab.id ? 600 : 400,
            color: view === tab.id ? "#08080C" : "rgba(255,255,255,0.4)",
            background: view === tab.id ? "#FBBF24" : "transparent",
            border: "none", borderRadius: 8,
            padding: mobile ? "9px 14px" : "10px 20px",
            cursor: "pointer", transition: "all 0.25s",
            whiteSpace: "nowrap", flex: mobile ? 1 : "none", minWidth: mobile ? 0 : "auto",
          }}
        >{tab.icon} {tab.label}</button>
      ))}
    </nav>
  );
};

const StatCard = ({ label, value, sub, delay, accent, mobile }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const isNum = typeof value === "number";
  return (
    <div style={{
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, padding: mobile ? "18px 16px" : "22px 20px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: accent || "#FBBF24", opacity: 0.5, borderRadius: "3px 0 0 3px" }} />
      <div style={{ fontFamily: FONTS, fontSize: mobile ? 32 : 38, fontWeight: 700, color: accent || "#FBBF24", lineHeight: 1, letterSpacing: "-0.02em" }}>
        {isNum ? <AnimatedNumber value={value} delay={delay} /> : value}
      </div>
      <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{sub}</div>}
    </div>
  );
};

const TopicBubble = ({ topic, maxCount, onClick, index, mobile }) => {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const baseSize = mobile ? 44 : 52;
  const scaleRange = mobile ? 56 : 80;
  const size = baseSize + (topic.count / maxCount) * scaleRange;
  useEffect(() => { const t = setTimeout(() => setVisible(true), 600 + index * 50); return () => clearTimeout(t); }, [index]);

  return (
    <div onClick={() => onClick(topic)}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)} onTouchEnd={() => { setTimeout(() => setHovered(false), 1500); }}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${topic.color}35, ${topic.color}10)`,
        border: `2px solid ${hovered ? topic.color : topic.color + "40"}`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        transform: `scale(${visible ? (hovered ? 1.15 : 1) : 0.5})`,
        opacity: visible ? 1 : 0, transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        cursor: "pointer", position: "relative", flexShrink: 0,
        boxShadow: hovered ? `0 0 30px ${topic.color}20, inset 0 0 15px ${topic.color}08` : "none",
      }}>
      <span style={{ fontSize: size > 80 ? 22 : size > 60 ? 16 : 13 }}>{topic.icon}</span>
      {size > (mobile ? 65 : 75) && (
        <span style={{ fontFamily: BODY, fontSize: mobile ? 7 : 9, color: "rgba(255,255,255,0.6)", marginTop: 1, textAlign: "center", padding: "0 4px", lineHeight: 1.2, fontWeight: 500 }}>
          {topic.name.length > 12 ? topic.name.slice(0, 10) + "…" : topic.name}
        </span>
      )}
      {hovered && !mobile && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,8,12,0.97)", border: `1px solid ${topic.color}40`, borderRadius: 10,
          padding: "10px 14px", whiteSpace: "nowrap", zIndex: 50, minWidth: 180,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontFamily: BODY, fontSize: 13, color: "#fff", fontWeight: 600 }}>{topic.icon} {topic.name}</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 5 }}>{topic.count} conversations · {(topic.words / 1000).toFixed(0)}k words</div>
          <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{topic.firstSeen} → {topic.lastSeen}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 10, fontFamily: MONO, color: "#FBBF24" }}>Claude {topic.platform.claude}</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: "#3B82F6" }}>GPT {topic.platform.gpt}</span>
          </div>
          <div style={{ fontFamily: BODY, fontSize: 10, color: topic.color, marginTop: 5, fontWeight: 500 }}>Click to explore →</div>
        </div>
      )}
    </div>
  );
};

const ActivityChart = ({ mobile }) => {
  const [visible, setVisible] = useState(false);
  const maxVal = Math.max(...MONTHLY_ACTIVITY.map(m => m.gpt + m.claude));
  useEffect(() => { const t = setTimeout(() => setVisible(true), 300); return () => clearTimeout(t); }, []);
  const labelMonths = ["Jan 23", "Jul 23", "Jan 24", "Jul 24", "Jan 25", "Jul 25", "Jan 26"];
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: "opacity 1s ease" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: mobile ? 1 : 2, height: mobile ? 80 : 110, padding: "0 2px" }}>
        {MONTHLY_ACTIVITY.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <div style={{ height: (m.claude / maxVal) * (mobile ? 68 : 95), background: "linear-gradient(180deg, #FBBF24, #D97706)", borderRadius: "2px 2px 0 0", transition: "height 1s ease", transitionDelay: `${i * 20}ms` }} />
              <div style={{ height: (m.gpt / maxVal) * (mobile ? 68 : 95), background: "linear-gradient(180deg, #3B82F6, #1D4ED8)", borderRadius: "0 0 2px 2px", transition: "height 1s ease", transitionDelay: `${i * 20}ms` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 2px" }}>
        {MONTHLY_ACTIVITY.map((m, i) => (
          <span key={i} style={{ fontFamily: MONO, fontSize: mobile ? 6 : 8, color: "rgba(255,255,255,0.12)", flex: 1, textAlign: "center" }}>
            {labelMonths.includes(m.month) ? m.month : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

const TimelineView = ({ topic, onBack, mobile }) => {
  const events = TIMELINE_DATA[topic.id] || [];
  const [visibleCount, setVisibleCount] = useState(0);
  useEffect(() => {
    setVisibleCount(0);
    const interval = setInterval(() => {
      setVisibleCount(prev => { if (prev >= events.length) { clearInterval(interval); return prev; } return prev + 1; });
    }, 90);
    return () => clearInterval(interval);
  }, [topic.id, events.length]);
  const typeCounts = {};
  events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const totalMsgs = events.reduce((a, e) => a + e.messages, 0);

  return (
    <div style={{ padding: "0 0 40px" }}>
      <button onClick={onBack} style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", marginBottom: 24 }}>← Back</button>
      <div style={{ display: "flex", alignItems: mobile ? "flex-start" : "center", gap: mobile ? 12 : 16, marginBottom: 6, flexDirection: mobile ? "column" : "row" }}>
        <span style={{ fontSize: mobile ? 32 : 40 }}>{topic.icon}</span>
        <div>
          <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 32, fontWeight: 700, color: "#fff" }}>{topic.name}</h2>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{topic.count} conversations · {(topic.words / 1000).toFixed(0)}k words · {topic.firstSeen} → {topic.lastSeen}</p>
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${topic.color}08, transparent)`, border: `1px solid ${topic.color}20`, borderRadius: 12, padding: mobile ? "14px 16px" : "16px 20px", margin: "18px 0 24px" }}>
        <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          <span style={{ color: topic.color, fontWeight: 600 }}>Story arc: </span>
          {events.length} threads. {typeCounts.build || 0} build sessions, {typeCounts.decision || 0} decisions, {typeCounts.pivot || 0} pivots, {typeCounts.milestone || 0} milestones. {totalMsgs} messages exchanged.
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {Object.entries(TYPE_META).map(([type, meta]) => (
          typeCounts[type] ? (
            <span key={type} style={{ fontFamily: BODY, fontSize: 10, padding: "3px 9px", borderRadius: 20, background: `${meta.color}12`, color: meta.color, border: `1px solid ${meta.color}20`, fontWeight: 500 }}>{meta.icon} {meta.label} ({typeCounts[type]})</span>
          ) : null
        ))}
      </div>
      <div style={{ position: "relative", paddingLeft: mobile ? 28 : 36 }}>
        <div style={{ position: "absolute", left: mobile ? 9 : 12, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${topic.color}70, ${topic.color}08)` }} />
        {events.map((event, i) => {
          const meta = TYPE_META[event.type] || TYPE_META.build;
          const isVisible = i < visibleCount;
          return (
            <div key={i} style={{ marginBottom: 14, position: "relative", opacity: isVisible ? 1 : 0, transform: isVisible ? "translateX(0)" : "translateX(-10px)", transition: "all 0.45s cubic-bezier(0.16,1,0.3,1)" }}>
              <div style={{ position: "absolute", left: mobile ? -24 : -30, top: 10, width: mobile ? 12 : 14, height: mobile ? 12 : 14, borderRadius: "50%", background: meta.color, border: "3px solid #08080C", boxShadow: `0 0 8px ${meta.color}35` }} />
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 11, padding: mobile ? "12px 14px" : "14px 18px", borderLeft: `3px solid ${meta.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${meta.color}12`, color: meta.color, fontWeight: 500 }}>{meta.icon} {meta.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{event.date}</span>
                </div>
                <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: "#fff", margin: "5px 0 3px", fontWeight: 600 }}>{event.title}</h3>
                <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{event.summary}</p>
                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.15)", marginTop: 6 }}>{event.messages} messages</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ConnectionsView = ({ onTopicClick, mobile }) => {
  const [selected, setSelected] = useState(null);
  const topicMap = {};
  TOPICS.forEach(t => { topicMap[t.id] = t; });
  const adjacency = {};
  CONNECTIONS.forEach(c => {
    if (!adjacency[c.from]) adjacency[c.from] = [];
    if (!adjacency[c.to]) adjacency[c.to] = [];
    adjacency[c.from].push({ target: c.to, label: c.label, strength: c.strength });
    adjacency[c.to].push({ target: c.from, label: c.label, strength: c.strength });
  });
  const highlighted = new Set();
  if (selected) { highlighted.add(selected); (adjacency[selected] || []).forEach(a => highlighted.add(a.target)); }
  const handleInteract = (id) => setSelected(selected === id ? null : id);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 28, color: "#fff", marginBottom: 6, fontWeight: 700 }}>How Your Ideas Connect</h2>
        <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)" }}>{mobile ? "Tap" : "Hover"} topics to see relationships.</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 12, justifyContent: "center", padding: mobile ? "20px 12px" : "24px 16px", background: "rgba(255,255,255,0.015)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.04)", marginBottom: 20 }}>
        {TOPICS.map(topic => {
          const isHighlighted = !selected || highlighted.has(topic.id);
          const isSource = selected === topic.id;
          const maxC = Math.max(...TOPICS.map(t => t.count));
          const size = (mobile ? 42 : 52) + (topic.count / maxC) * (mobile ? 40 : 56);
          return (
            <div key={topic.id}
              onMouseEnter={() => !mobile && setSelected(topic.id)}
              onMouseLeave={() => !mobile && setSelected(null)}
              onClick={() => mobile ? (isSource ? onTopicClick(topic) : handleInteract(topic.id)) : onTopicClick(topic)}
              style={{
                width: size, height: size, borderRadius: "50%",
                background: isSource ? `radial-gradient(circle, ${topic.color}45, ${topic.color}15)` : `radial-gradient(circle, ${topic.color}20, ${topic.color}06)`,
                border: `2px solid ${isSource ? topic.color : isHighlighted ? topic.color + "50" : topic.color + "10"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                opacity: isHighlighted ? 1 : 0.15,
                transform: isSource ? "scale(1.18)" : "scale(1)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", cursor: "pointer",
                boxShadow: isSource ? `0 0 24px ${topic.color}25` : "none", flexShrink: 0,
              }}>
              <span style={{ fontSize: size > 70 ? 18 : size > 50 ? 14 : 11 }}>{topic.icon}</span>
              {size > (mobile ? 55 : 65) && <span style={{ fontFamily: BODY, fontSize: mobile ? 6 : 8, color: `rgba(255,255,255,${isHighlighted ? 0.55 : 0.15})`, marginTop: 1, textAlign: "center", fontWeight: 500 }}>{topic.name.slice(0, 10)}</span>}
            </div>
          );
        })}
      </div>
      {selected && adjacency[selected] ? (
        <div className="fade-up" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: mobile ? "16px 18px" : "20px 24px" }}>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 13 : 14, color: "#fff", fontWeight: 600, marginBottom: 12 }}>{topicMap[selected]?.icon} {topicMap[selected]?.name} connects to:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {adjacency[selected].sort((a, b) => b.strength - a.strength).map((conn, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ width: mobile ? 50 : 80, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}><div style={{ width: `${conn.strength * 100}%`, height: "100%", background: topicMap[conn.target]?.color || "#666", borderRadius: 2 }} /></div>
                <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: topicMap[conn.target]?.color || "#666", fontWeight: 500 }}>{topicMap[conn.target]?.icon} {topicMap[conn.target]?.name}</span>
                <span style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.25)" }}>— {conn.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: "rgba(255,255,255,0.015)", borderRadius: 14, padding: "18px 22px", border: "1px dashed rgba(255,255,255,0.06)", textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.25)" }}>{CONNECTIONS.length} connections across {TOPICS.length} clusters.</div>
        </div>
      )}
    </div>
  );
};

const EvolutionView = ({ mobile }) => {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 28, color: "#fff", marginBottom: 6, fontWeight: 700 }}>How You Evolved</h2>
        <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)" }}>From asking "how do I" to designing entire systems.</p>
      </div>
      <div style={{ position: "relative", paddingLeft: mobile ? 32 : 40 }}>
        <div style={{ position: "absolute", left: mobile ? 12 : 16, top: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #3B82F6, #10B981, #F59E0B, #EF4444, #A855F7, #EC4899)" }} />
        {EVOLUTION_PHASES.map((phase, i) => (
          <div key={i} style={{ marginBottom: 16, position: "relative", cursor: "pointer" }} onClick={() => setExpanded(expanded === i ? null : i)}>
            <div style={{ position: "absolute", left: mobile ? -26 : -30, top: 8, width: mobile ? 16 : 20, height: mobile ? 16 : 20, borderRadius: "50%", background: phase.color, border: "3px solid #08080C", boxShadow: `0 0 10px ${phase.color}35` }} />
            <div style={{
              background: expanded === i ? `linear-gradient(135deg, ${phase.color}0C, transparent)` : "rgba(255,255,255,0.025)",
              border: `1px solid ${expanded === i ? phase.color + "28" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 12, padding: expanded === i ? (mobile ? "16px 18px" : "20px 24px") : (mobile ? "14px 16px" : "16px 20px"), transition: "all 0.3s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: mobile ? 10 : 11, color: phase.color }}>{phase.period}</span>
                  <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: "#fff", margin: "3px 0 0", fontWeight: 600 }}>{phase.title}</h3>
                </div>
                <div style={{ fontFamily: BODY, fontSize: mobile ? 20 : 24, fontWeight: 700, color: phase.color + "50", flexShrink: 0 }}>{phase.conversations}</div>
              </div>
              {expanded === i && (
                <div style={{ marginTop: 10 }} className="fade-up">
                  <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{phase.desc}</p>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>{phase.conversations} conversations</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 14, marginTop: 36 }}>
        {PLATFORM_INSIGHTS.map((p, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${p.color}06, transparent)`, border: `1px solid ${p.color}18`, borderRadius: 12, padding: mobile ? "16px 18px" : "20px 24px" }}>
            <h4 style={{ fontFamily: BODY, fontSize: 12, color: p.color, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.label}</h4>
            {p.items.map((item, j) => (
              <div key={j} style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.45)", padding: "4px 0", borderBottom: j < p.items.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const SearchView = ({ mobile }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const doSearch = useCallback((q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    setTimeout(() => {
      const words = q.toLowerCase().split(/\s+/);
      const matches = SEARCH_RESULTS.filter(r => words.some(w => r.query.includes(w) || r.title.toLowerCase().includes(w) || r.preview.toLowerCase().includes(w)));
      setResults(matches); setSearching(false);
    }, 350);
  }, []);
  const suggestions = ["restaurant gina", "deployment docker", "dice game", "interview transunion", "supabase auth", "meta ads budget", "gina counselor"];

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 28, color: "#fff", marginBottom: 6, fontWeight: 700 }}>Search Everything</h2>
        <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)" }}>Topic, person, keyword, or even vague memory.</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: mobile ? "10px 14px" : "12px 18px", marginBottom: 20 }}>
        <span style={{ fontSize: 18, opacity: 0.4 }}>🔍</span>
        <input ref={inputRef} type="text" value={query} onChange={e => { setQuery(e.target.value); doSearch(e.target.value); }} placeholder="Search your conversations..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: BODY, fontSize: mobile ? 14 : 15, color: "#fff" }} />
        {query && <button onClick={() => { setQuery(""); setResults([]); }} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Clear</button>}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => { setQuery(s); doSearch(s); }}
            style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: query === s ? "#08080C" : "rgba(255,255,255,0.35)", background: query === s ? "#FBBF24" : "rgba(255,255,255,0.04)", border: `1px solid ${query === s ? "#FBBF24" : "rgba(255,255,255,0.08)"}`, borderRadius: 20, padding: mobile ? "5px 10px" : "5px 12px", cursor: "pointer", transition: "all 0.2s", fontWeight: 500 }}>
            {s}
          </button>
        ))}
      </div>
      {searching && <div style={{ fontFamily: BODY, fontSize: 13, color: "rgba(251,191,36,0.5)", textAlign: "center", padding: 40 }}>Searching across 3,847 conversations...</div>}
      {!searching && results.length > 0 && (
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>{results.length} result{results.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} className="slide-in" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 11, padding: mobile ? "12px 14px" : "14px 18px", cursor: "pointer", transition: "all 0.2s", animationDelay: `${i * 60}ms` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ fontFamily: BODY, fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: r.platform === "Claude" ? "rgba(251,191,36,0.08)" : "rgba(59,130,246,0.08)", color: r.platform === "Claude" ? "#FBBF24" : "#3B82F6" }}>{r.platform}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.18)" }}>{r.date}</span>
                </div>
                <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 15, color: "#fff", margin: "4px 0", fontWeight: 600 }}>{r.title}</h3>
                <p style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{r.preview}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {!searching && query && results.length === 0 && <div style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.2)", textAlign: "center", padding: 40, background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>Try one of the suggested queries above</div>}
      {!query && <div style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.15)", textAlign: "center", padding: 40, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.06)" }}>Your 3+ years of AI conversations, instantly searchable.</div>}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// REVIEW QUEUE (v5 Curation Pipeline — Section 1A)
// ═══════════════════════════════════════════════════════════════

const ConfidenceBadge = ({ confidence }) => {
  const isHigh = confidence >= 90;
  const isMed = confidence >= 70 && confidence < 90;
  const color = isHigh ? "#10B981" : isMed ? "#F59E0B" : "#EF4444";
  const label = isHigh ? "High" : isMed ? "Medium" : "Low";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: `${color}12`, border: `1px solid ${color}25`,
      fontFamily: MONO, fontSize: 11, color, fontWeight: 600,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}60` }} />
      {confidence}% {label}
    </div>
  );
};

const ReviewQueue = ({ onComplete, mobile, w }) => {
  const [items, setItems] = useState(() => REVIEW_QUEUE_DATA.map(item => ({ ...item, status: "pending" })));
  const [activeIdx, setActiveIdx] = useState(null);
  const [autoApproving, setAutoApproving] = useState(new Set());
  const [started, setStarted] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const topicMap = {};
  TOPICS.forEach(t => { topicMap[t.id] = t; });

  const reviewed = items.filter(i => i.status !== "pending").length;
  const total = items.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;

  // Auto-approve high-confidence items sequentially after start
  useEffect(() => {
    if (started) return;
    setStarted(true);
    const highConfItems = items
      .map((item, idx) => ({ ...item, idx }))
      .filter(i => i.confidence >= 90);

    let delay = 800;
    highConfItems.forEach((item) => {
      setTimeout(() => {
        setAutoApproving(prev => new Set([...prev, item.id]));
      }, delay);
      setTimeout(() => {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "approved" } : i));
        setAutoApproving(prev => { const next = new Set(prev); next.delete(item.id); return next; });
      }, delay + 700);
      delay += 900;
    });
    // Set active to first non-high-confidence item after auto-approves
    setTimeout(() => {
      setItems(prev => {
        const firstPending = prev.findIndex(i => i.status === "pending");
        if (firstPending >= 0) setActiveIdx(firstPending);
        return prev;
      });
    }, delay + 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if all done
  useEffect(() => {
    if (reviewed === total && total > 0 && started) {
      setTimeout(() => setAllDone(true), 400);
    }
  }, [reviewed, total, started]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (!activeItem) return;
      if (e.key === "Enter") { e.preventDefault(); handleAction(activeItem.id, "approved"); }
      else if (e.key === "e" || e.key === "E") { e.preventDefault(); handleAction(activeItem.id, "edited"); }
      else if (e.key === "x" || e.key === "X") { e.preventDefault(); handleAction(activeItem.id, "rejected"); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); handleAction(activeItem.id, "skipped"); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = (id, action) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: action } : i));
    // Move to next pending item
    setTimeout(() => {
      setItems(prev => {
        const nextPending = prev.findIndex(i => i.status === "pending");
        setActiveIdx(nextPending >= 0 ? nextPending : null);
        return prev;
      });
    }, 150);
  };

  const activeItem = activeIdx !== null ? items[activeIdx] : null;
  const activeTopic = activeItem ? topicMap[activeItem.topicId] : null;

  const tablet = w >= 640 && w < 1024;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#FBBF24", fontWeight: 600,
            letterSpacing: "0.08em",
          }}>
            CURATION
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Review <span style={{ color: "#FBBF24" }}>Queue</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            AI classified your conversations. Verify, edit, or reject each one.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              {reviewed} / {total} reviewed
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: progress === 100 ? "#10B981" : "rgba(251,191,36,0.5)" }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #FBBF24CC, #FBBF24)",
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: progress === 100 ? "0 0 16px rgba(16,185,129,0.4)" : "0 0 12px rgba(251,191,36,0.3)",
            }} />
          </div>
        </div>

        {/* All done state */}
        {allDone ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#10B981", marginBottom: 8 }}>
              Queue Complete
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {items.filter(i => i.status === "approved").length} approved, {items.filter(i => i.status === "edited").length} edited, {items.filter(i => i.status === "rejected").length} rejected, {items.filter(i => i.status === "skipped").length} skipped
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              Your atlas is now human-verified.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #FBBF24, #F59E0B)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(251,191,36,0.25)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(251,191,36,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(251,191,36,0.25)"; }}
            >
              Enter Your Atlas →
            </button>
          </div>
        ) : (
          <>
            {/* Item list / queue */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {items.map((item, idx) => {
                const topic = topicMap[item.topicId];
                const isActive = idx === activeIdx;
                const isAutoApproving = autoApproving.has(item.id);
                const isDone = item.status !== "pending";

                return (
                  <div key={item.id} style={{
                    background: isActive ? "rgba(255,255,255,0.04)" : isDone ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? "rgba(251,191,36,0.3)" : isDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, overflow: "hidden",
                    opacity: isDone && !isAutoApproving ? 0.4 : 1,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                    animation: isAutoApproving ? "autoApprove 0.7s ease forwards" : "queueSlideUp 0.5s ease both",
                    animationDelay: isAutoApproving ? "0s" : `${idx * 60}ms`,
                  }}>
                    {/* Compact row for non-active items */}
                    {!isActive ? (
                      <div style={{
                        display: "flex", alignItems: "center", gap: mobile ? 8 : 14,
                        padding: mobile ? "10px 12px" : "12px 18px",
                        cursor: item.status === "pending" ? "pointer" : "default",
                      }}
                        onClick={() => { if (item.status === "pending") setActiveIdx(idx); }}
                      >
                        {/* Status indicator */}
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: item.status === "approved" ? "#10B981" : item.status === "edited" ? "#3B82F6" : item.status === "rejected" ? "#EF4444" : item.status === "skipped" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
                        }} />
                        {/* Topic icon + name */}
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{topic?.icon}</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.5)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {topic?.name}
                        </span>
                        <ConfidenceBadge confidence={item.confidence} />
                        {isDone && (
                          <span style={{ fontFamily: MONO, fontSize: 10, color: item.status === "approved" ? "#10B981" : item.status === "edited" ? "#3B82F6" : item.status === "rejected" ? "#EF4444" : "rgba(255,255,255,0.2)", textTransform: "uppercase", flexShrink: 0 }}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Expanded active item — three-column layout */
                      <div style={{ padding: mobile ? "16px 14px" : "20px 24px" }}>
                        {/* Three-column layout (stacks on mobile) */}
                        <div style={{
                          display: mobile ? "flex" : "grid",
                          gridTemplateColumns: tablet ? "1fr 1.5fr auto" : "280px 1fr 200px",
                          flexDirection: mobile ? "column" : undefined,
                          gap: mobile ? 16 : 20,
                        }}>
                          {/* LEFT: AI Classification */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              AI Classification
                            </div>
                            {/* Topic */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 20 }}>{activeTopic?.icon}</span>
                              <div>
                                <div style={{ fontFamily: BODY, fontSize: 14, color: activeTopic?.color, fontWeight: 600 }}>{activeTopic?.name}</div>
                                <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{activeTopic?.count} conversations in topic</div>
                              </div>
                            </div>
                            {/* Confidence */}
                            <div style={{ marginBottom: 10 }}>
                              <ConfidenceBadge confidence={activeItem.confidence} />
                            </div>
                            {/* Entities */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                              {activeItem.entities.map((entity, ei) => (
                                <span key={ei} style={{
                                  fontFamily: MONO, fontSize: 10, padding: "3px 8px", borderRadius: 6,
                                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                  color: "rgba(255,255,255,0.45)",
                                }}>{entity}</span>
                              ))}
                            </div>
                            {/* Decision flag */}
                            {activeItem.decisionFlag && (
                              <div style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "6px 10px", borderRadius: 8,
                                background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
                              }}>
                                <span style={{ fontSize: 12 }}>🎯</span>
                                <div>
                                  <div style={{ fontFamily: BODY, fontSize: 9, color: "#EF4444", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Decision Detected</div>
                                  <div style={{ fontFamily: BODY, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{activeItem.decisionText}</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* CENTER: Source Conversation */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Conversation Snippet
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {/* User message */}
                              <div style={{
                                background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)",
                                borderRadius: "12px 12px 12px 4px", padding: mobile ? "10px 12px" : "12px 16px",
                              }}>
                                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(59,130,246,0.5)", marginBottom: 4, fontWeight: 600 }}>YOU</div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{activeItem.snippet.user}</div>
                              </div>
                              {/* AI message */}
                              <div style={{
                                background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.1)",
                                borderRadius: "12px 12px 4px 12px", padding: mobile ? "10px 12px" : "12px 16px",
                              }}>
                                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.5)", marginBottom: 4, fontWeight: 600 }}>AI</div>
                                <div style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.55 }}>{activeItem.snippet.ai}</div>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: Action Panel */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Actions
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {[
                                { action: "approved", label: "Approve", color: "#10B981", icon: "✓" },
                                { action: "edited", label: "Edit", color: "#3B82F6", icon: "✎" },
                                { action: "rejected", label: "Reject", color: "#EF4444", icon: "✕" },
                                { action: "skipped", label: "Skip", color: "rgba(255,255,255,0.3)", icon: "→" },
                              ].map(btn => (
                                <button key={btn.action} onClick={() => handleAction(activeItem.id, btn.action)}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    width: "100%", padding: mobile ? "10px 14px" : "11px 16px",
                                    fontFamily: BODY, fontSize: 13, fontWeight: 600,
                                    color: btn.action === "approved" ? "#08080C" : btn.color,
                                    background: btn.action === "approved" ? btn.color : `${btn.color}10`,
                                    border: `1px solid ${btn.action === "approved" ? btn.color : btn.color + "30"}`,
                                    borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${btn.color}25`; }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                  <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                            {/* Keyboard hint */}
                            {!mobile && (
                              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.12)", lineHeight: 1.8 }}>
                                Enter approve · E edit · X reject · → skip
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Skip all / proceed button when no active item but not all done */}
            {activeIdx === null && !allDone && reviewed < total && (
              <div className="fade-up" style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>
                  Auto-approving high-confidence items...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TOPIC CURATION PANEL (v5 Curation Pipeline — Section 1B)
// ═══════════════════════════════════════════════════════════════

const MiniSparkline = ({ data, color, width = 48, height = 16 }) => {
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
    </svg>
  );
};

const TopicCurationPanel = ({ onComplete, mobile, w }) => {
  const [topics, setTopics] = useState(() => TOPICS.map(t => ({
    ...t, starred: false, confidence: Math.floor(70 + Math.random() * 25),
  })));
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [colorPickerId, setColorPickerId] = useState(null);
  const [merging, setMerging] = useState(null); // { fromId, suggestion }
  const [merged, setMerged] = useState(new Set()); // IDs that have been merged away
  const [changeLog, setChangeLog] = useState([]); // track user actions for summary
  const [done, setDone] = useState(false);

  const tablet = w >= 640 && w < 1024;

  const startRename = (t) => { setEditingId(t.id); setEditName(t.name); };
  const commitRename = () => {
    if (editingId && editName.trim()) {
      setTopics(prev => prev.map(t => t.id === editingId ? { ...t, name: editName.trim() } : t));
      setChangeLog(prev => [...prev, "renamed"]);
    }
    setEditingId(null);
  };

  const toggleStar = (id) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
    setChangeLog(prev => [...prev, "starred"]);
  };

  const changeColor = (id, color) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, color } : t));
    setColorPickerId(null);
    setChangeLog(prev => [...prev, "recolored"]);
  };

  const startMerge = (fromId) => {
    const suggestion = MERGE_SUGGESTIONS.find(m => m.from === fromId);
    setMerging({ fromId, suggestion });
  };

  const executeMerge = (targetId) => {
    if (!merging) return;
    const source = topics.find(t => t.id === merging.fromId);
    const suggestion = merging.suggestion;
    setTopics(prev => prev.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          name: suggestion?.suggestedName || `${t.name} + ${source?.name}`,
          count: t.count + (source?.count || 0),
          words: t.words + (source?.words || 0),
        };
      }
      return t;
    }));
    setMerged(prev => new Set([...prev, merging.fromId]));
    setMerging(null);
    setSelectedId(null);
    setChangeLog(prev => [...prev, "merged"]);
  };

  const executeSplit = (topicId) => {
    const suggestion = SPLIT_SUGGESTIONS[topicId];
    if (!suggestion) return;
    const original = topics.find(t => t.id === topicId);
    if (!original) return;
    const half = Math.floor(original.count / 2);
    const halfWords = Math.floor(original.words / 2);
    setTopics(prev => {
      const idx = prev.findIndex(t => t.id === topicId);
      const newTopics = [...prev];
      newTopics[idx] = { ...original, name: suggestion.into[0], icon: suggestion.icons[0], count: half, words: halfWords };
      newTopics.splice(idx + 1, 0, {
        ...original, id: topicId + "_split", name: suggestion.into[1], icon: suggestion.icons[1],
        count: original.count - half, words: original.words - halfWords, color: CURATED_PALETTE[Math.floor(Math.random() * CURATED_PALETTE.length)],
      });
      return newTopics;
    });
    setSelectedId(null);
    setChangeLog(prev => [...prev, "split"]);
  };

  const visibleTopics = topics.filter(t => !merged.has(t.id));
  const renames = changeLog.filter(c => c === "renamed").length;
  const merges = changeLog.filter(c => c === "merged").length;
  const splits = changeLog.filter(c => c === "split").length;
  const stars = topics.filter(t => t.starred).length;
  const totalChanges = renames + merges + splits + stars + changeLog.filter(c => c === "recolored").length;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#3B82F6", fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION · STEP 2
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Curate <span style={{ color: "#3B82F6" }}>Topics</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            Rename, recolor, merge, split, or star the topics AI discovered.
          </p>
        </div>

        {done ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✨</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#3B82F6", marginBottom: 8 }}>
              Topics Curated
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {visibleTopics.length} topics{merges > 0 ? `, ${merges} merged` : ""}{splits > 0 ? `, ${splits} split` : ""}{renames > 0 ? `, ${renames} renamed` : ""}{stars > 0 ? `, ${stars} starred` : ""}
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              Your knowledge map now reflects your intent.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #3B82F6, #2563EB)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(59,130,246,0.25)", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.25)"; }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Merge mode banner */}
            {merging && (
              <div className="fade-up" style={{
                background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)",
                borderRadius: 10, padding: "10px 16px", marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: BODY, fontSize: 13, color: "#A855F7" }}>
                  Select a target topic to merge <strong>{topics.find(t => t.id === merging.fromId)?.name}</strong> into
                  {merging.suggestion && <span style={{ color: "rgba(255,255,255,0.3)" }}> — suggested: {merging.suggestion.suggestedName}</span>}
                </span>
                <button onClick={() => setMerging(null)} style={{
                  fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.3)",
                  background: "none", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                }}>Cancel</button>
              </div>
            )}

            {/* Topic grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: mobile ? "1fr" : tablet ? "1fr 1fr" : "1fr 1fr 1fr",
              gap: mobile ? 10 : 14, marginBottom: 24,
            }}>
              {visibleTopics.map((topic, idx) => {
                const isSelected = selectedId === topic.id;
                const isMergeTarget = merging && merging.fromId !== topic.id;
                const sparkData = TOPIC_SPARKLINES[topic.id] || [3, 3, 3, 3, 3, 3];
                const hasSplit = SPLIT_SUGGESTIONS[topic.id];
                const hasMerge = MERGE_SUGGESTIONS.find(m => m.from === topic.id);

                return (
                  <div key={topic.id} style={{
                    background: isSelected ? "rgba(255,255,255,0.05)" : isMergeTarget ? "rgba(168,85,247,0.04)" : "rgba(255,255,255,0.025)",
                    border: `1px solid ${isSelected ? "rgba(59,130,246,0.35)" : isMergeTarget ? "rgba(168,85,247,0.25)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, padding: mobile ? "14px 14px" : "16px 18px",
                    cursor: merging ? (isMergeTarget ? "pointer" : "default") : "pointer",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    animation: `topicCardIn 0.4s ease both`,
                    animationDelay: `${idx * 50}ms`,
                  }}
                    onClick={() => {
                      if (merging && isMergeTarget) { executeMerge(topic.id); return; }
                      if (!merging) setSelectedId(isSelected ? null : topic.id);
                    }}
                    onMouseEnter={e => { if (isMergeTarget) e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)"; }}
                    onMouseLeave={e => { if (isMergeTarget) e.currentTarget.style.borderColor = "rgba(168,85,247,0.25)"; }}
                  >
                    {/* Card header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{topic.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {editingId === topic.id ? (
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditingId(null); }}
                            autoFocus
                            style={{
                              fontFamily: BODY, fontSize: 14, fontWeight: 600, color: topic.color,
                              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: 6, padding: "2px 6px", width: "100%", outline: "none",
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <div style={{ fontFamily: BODY, fontSize: 14, fontWeight: 600, color: topic.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {topic.name}
                          </div>
                        )}
                        <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>
                          {topic.count} convos · {(topic.words / 1000).toFixed(0)}k words
                        </div>
                      </div>
                      {/* Star button */}
                      <div
                        onClick={e => { e.stopPropagation(); toggleStar(topic.id); }}
                        style={{
                          cursor: "pointer", fontSize: 16, flexShrink: 0,
                          animation: topic.starred ? "starPop 0.3s ease" : "none",
                          filter: topic.starred ? "none" : "grayscale(1) opacity(0.3)",
                          transition: "filter 0.2s",
                        }}
                      >
                        {topic.starred ? "⭐" : "☆"}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isSelected ? 12 : 0 }}>
                      <ConfidenceBadge confidence={topic.confidence} />
                      <MiniSparkline data={sparkData} color={topic.color} />
                      {/* Color dot */}
                      <div style={{ position: "relative", marginLeft: "auto" }}>
                        <div
                          onClick={e => { e.stopPropagation(); setColorPickerId(colorPickerId === topic.id ? null : topic.id); }}
                          style={{
                            width: 14, height: 14, borderRadius: "50%", background: topic.color,
                            cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)", transition: "transform 0.2s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                        />
                        {/* Color picker popup */}
                        {colorPickerId === topic.id && (
                          <div onClick={e => e.stopPropagation()} style={{
                            position: "absolute", top: 22, right: 0, zIndex: 10,
                            background: "rgba(20,20,28,0.95)", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10, padding: 8, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 140,
                          }}>
                            {CURATED_PALETTE.map(c => (
                              <div key={c} onClick={() => changeColor(topic.id, c)} style={{
                                width: 18, height: 18, borderRadius: "50%", background: c, cursor: "pointer",
                                border: c === topic.color ? "2px solid #fff" : "2px solid transparent",
                                transition: "transform 0.15s",
                              }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.25)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded actions when selected */}
                    {isSelected && !merging && (
                      <div className="fade-up" style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
                        <button onClick={e => { e.stopPropagation(); startRename(topic); }} style={{
                          fontFamily: BODY, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8, padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                        >Rename</button>
                        {hasMerge && (
                          <button onClick={e => { e.stopPropagation(); startMerge(topic.id); }} style={{
                            fontFamily: BODY, fontSize: 11, fontWeight: 500, color: "#A855F7",
                            background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)",
                            borderRadius: 8, padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(168,85,247,0.06)"; }}
                          >Merge →</button>
                        )}
                        {hasSplit && (
                          <button onClick={e => { e.stopPropagation(); executeSplit(topic.id); }} style={{
                            fontFamily: BODY, fontSize: 11, fontWeight: 500, color: "#10B981",
                            background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)",
                            borderRadius: 8, padding: "5px 12px", cursor: "pointer", transition: "all 0.2s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.12)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.06)"; }}
                          >Split</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: mobile ? "14px 0" : "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {totalChanges > 0 ? `${totalChanges} change${totalChanges > 1 ? "s" : ""} made` : "Click a topic to curate"}
              </div>
              <button onClick={() => setDone(true)} style={{
                fontFamily: BODY, fontSize: 14, fontWeight: 600,
                color: totalChanges > 0 ? "#08080C" : "rgba(255,255,255,0.5)",
                background: totalChanges > 0 ? "linear-gradient(135deg, #3B82F6, #2563EB)" : "rgba(255,255,255,0.06)",
                border: totalChanges > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "10px 28px", cursor: "pointer",
                boxShadow: totalChanges > 0 ? "0 4px 20px rgba(59,130,246,0.25)" : "none",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {totalChanges > 0 ? "Looks Good →" : "Skip — Looks Good →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CONNECTION VALIDATION (v5 Curation Pipeline — Section 1C)
// ═══════════════════════════════════════════════════════════════

const ConnectionValidation = ({ onComplete, mobile, w }) => {
  const [connections, setConnections] = useState(() =>
    CONNECTIONS.map((c, i) => ({ ...c, id: i, status: "pending" }))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [done, setDone] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const topicMap = {};
  TOPICS.forEach(t => { topicMap[t.id] = t; });

  const reviewed = connections.filter(c => c.status !== "pending").length;
  const total = connections.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;
  const active = activeIdx !== null ? connections[activeIdx] : null;
  const tablet = w >= 640 && w < 1024;

  const moveNext = (fromIdx) => {
    const start = (fromIdx ?? activeIdx ?? -1) + 1;
    let next = connections.findIndex((c, i) => i >= start && c.status === "pending");
    if (next < 0) next = connections.findIndex(c => c.status === "pending");
    setActiveIdx(next >= 0 ? next : null);
  };

  const handleAction = (idx, action) => {
    setConnections(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      const s = action === "confirmed" ? Math.min(c.strength + 0.1, 1) : c.strength;
      return { ...c, status: action, strength: s };
    }));
    setTimeout(() => moveNext(idx), 150);
  };

  const startEdit = (idx) => { setEditingIdx(idx); setEditLabel(connections[idx].label); };
  const commitEdit = () => {
    if (editingIdx !== null && editLabel.trim()) {
      setConnections(prev => prev.map((c, i) =>
        i === editingIdx ? { ...c, label: editLabel.trim(), status: "edited" } : c
      ));
      setTimeout(() => moveNext(editingIdx), 150);
    }
    setEditingIdx(null);
  };

  const addConnection = () => {
    if (newFrom && newTo && newFrom !== newTo && newLabel.trim()) {
      setConnections(prev => [...prev, {
        id: prev.length, from: newFrom, to: newTo,
        label: newLabel.trim(), strength: 0.5, status: "confirmed",
      }]);
      setAdding(false); setNewFrom(""); setNewTo(""); setNewLabel("");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (editingIdx !== null || done || adding) return;
      if (activeIdx === null) return;
      if (e.key === "Enter") { e.preventDefault(); handleAction(activeIdx, "confirmed"); }
      else if (e.key === "e" || e.key === "E") { e.preventDefault(); startEdit(activeIdx); }
      else if (e.key === "x" || e.key === "X") { e.preventDefault(); handleAction(activeIdx, "rejected"); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = connections.findIndex((c, i) => i > activeIdx && c.status === "pending");
        setActiveIdx(next >= 0 ? next : activeIdx);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reviewed === total && total > 0 && !done) setTimeout(() => setDone(true), 400);
  }, [reviewed, total, done]);

  const confirmed = connections.filter(c => c.status === "confirmed").length;
  const edited = connections.filter(c => c.status === "edited").length;
  const rejected = connections.filter(c => c.status === "rejected").length;

  // Mini-graph: determine highlighted topics from active connection
  const highlightedTopics = new Set();
  if (active) { highlightedTopics.add(active.from); highlightedTopics.add(active.to); }

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(168,85,247,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#A855F7", fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION · STEP 3
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Validate <span style={{ color: "#A855F7" }}>Connections</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            AI discovered {CONNECTIONS.length} connections between your topics. Confirm, edit, or reject.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{reviewed} / {total} reviewed</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: progress === 100 ? "#10B981" : "rgba(168,85,247,0.5)" }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #A855F7CC, #A855F7)",
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: progress === 100 ? "0 0 16px rgba(16,185,129,0.4)" : "0 0 12px rgba(168,85,247,0.3)",
            }} />
          </div>
        </div>

        {done ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔗</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#A855F7", marginBottom: 8 }}>
              Connections Validated
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {confirmed} confirmed, {edited} edited, {rejected} rejected{connections.length > CONNECTIONS.length ? `, ${connections.length - CONNECTIONS.length} added` : ""}
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              Your knowledge graph now reflects real relationships.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #A855F7, #7C3AED)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(168,85,247,0.25)", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(168,85,247,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(168,85,247,0.25)"; }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Mini connection graph */}
            <div style={{
              background: "rgba(255,255,255,0.015)", borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.04)", padding: mobile ? "16px 12px" : "20px 16px",
              marginBottom: mobile ? 16 : 24, overflow: "hidden",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 6 : 10, justifyContent: "center", alignItems: "center" }}>
                {TOPICS.map(topic => {
                  const isHighlighted = highlightedTopics.has(topic.id);
                  const isFrom = active && active.from === topic.id;
                  const isTo = active && active.to === topic.id;
                  const size = mobile ? 36 : 44;
                  return (
                    <div key={topic.id} style={{
                      width: size, height: size, borderRadius: "50%",
                      background: isFrom || isTo ? `radial-gradient(circle, ${topic.color}40, ${topic.color}15)` : `radial-gradient(circle, ${topic.color}12, ${topic.color}04)`,
                      border: `2px solid ${isFrom || isTo ? topic.color : topic.color + "15"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: active ? (isHighlighted ? 1 : 0.2) : 0.5,
                      transform: isFrom || isTo ? "scale(1.15)" : "scale(1)",
                      transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                      boxShadow: isFrom || isTo ? `0 0 16px ${topic.color}30` : "none",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontSize: mobile ? 12 : 15 }}>{topic.icon}</span>
                    </div>
                  );
                })}
              </div>
              {active && (
                <div className="fade-up" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: mobile ? 8 : 12,
                  marginTop: mobile ? 10 : 14, padding: "8px 0",
                }}>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: topicMap[active.from]?.color, fontWeight: 600 }}>
                    {topicMap[active.from]?.icon} {topicMap[active.from]?.name}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(168,85,247,0.5)" }}>←→</span>
                  <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 13, color: topicMap[active.to]?.color, fontWeight: 600 }}>
                    {topicMap[active.to]?.icon} {topicMap[active.to]?.name}
                  </span>
                </div>
              )}
            </div>

            {/* Connection cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {connections.map((conn, idx) => {
                const fromT = topicMap[conn.from];
                const toT = topicMap[conn.to];
                const isActive = idx === activeIdx;
                const isDone = conn.status !== "pending";
                const isEditing = editingIdx === idx;

                return (
                  <div key={conn.id} style={{
                    background: isActive ? "rgba(255,255,255,0.04)" : isDone ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isActive ? "rgba(168,85,247,0.3)" : isDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 14, overflow: "hidden",
                    opacity: isDone && !isActive ? 0.4 : 1,
                    transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                    animation: `queueSlideUp 0.5s ease both`,
                    animationDelay: `${idx * 40}ms`,
                  }}>
                    {!isActive ? (
                      /* Compact row */
                      <div style={{
                        display: "flex", alignItems: "center", gap: mobile ? 6 : 12,
                        padding: mobile ? "10px 12px" : "12px 18px",
                        cursor: conn.status === "pending" ? "pointer" : "default",
                      }}
                        onClick={() => { if (conn.status === "pending") setActiveIdx(idx); }}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                          background: conn.status === "confirmed" ? "#10B981" : conn.status === "edited" ? "#3B82F6" : conn.status === "rejected" ? "#EF4444" : "rgba(255,255,255,0.1)",
                        }} />
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{fromT?.icon}</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {fromT?.name}
                        </span>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.12)", flexShrink: 0 }}>↔</span>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{toT?.icon}</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                          {toT?.name}
                        </span>
                        {/* Strength bar */}
                        <div style={{ width: mobile ? 30 : 50, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ width: `${conn.strength * 100}%`, height: "100%", background: "#A855F7", borderRadius: 2 }} />
                        </div>
                        {isDone && (
                          <span style={{
                            fontFamily: MONO, fontSize: 10, flexShrink: 0, textTransform: "uppercase",
                            color: conn.status === "confirmed" ? "#10B981" : conn.status === "edited" ? "#3B82F6" : "#EF4444",
                          }}>{conn.status}</span>
                        )}
                      </div>
                    ) : (
                      /* Expanded active card */
                      <div style={{ padding: mobile ? "16px 14px" : "20px 24px" }}>
                        <div style={{
                          display: mobile ? "flex" : "grid",
                          gridTemplateColumns: tablet ? "1fr 1fr auto" : "1fr 1.2fr 200px",
                          flexDirection: mobile ? "column" : undefined,
                          gap: mobile ? 16 : 20,
                        }}>
                          {/* LEFT: Connection info */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Connection
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                              <span style={{ fontSize: 20 }}>{fromT?.icon}</span>
                              <span style={{ fontFamily: BODY, fontSize: 14, color: fromT?.color, fontWeight: 600 }}>{fromT?.name}</span>
                            </div>
                            <div style={{
                              fontFamily: MONO, fontSize: 11, color: "rgba(168,85,247,0.4)",
                              padding: "2px 0", marginBottom: 10, marginLeft: 4,
                            }}>↕ connects to</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                              <span style={{ fontSize: 20 }}>{toT?.icon}</span>
                              <span style={{ fontFamily: BODY, fontSize: 14, color: toT?.color, fontWeight: 600 }}>{toT?.name}</span>
                            </div>
                            {/* Strength */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Strength</span>
                              <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${conn.strength * 100}%`, height: "100%", background: "linear-gradient(90deg, #A855F7, #7C3AED)", borderRadius: 3 }} />
                              </div>
                              <span style={{ fontFamily: MONO, fontSize: 10, color: "#A855F7" }}>{Math.round(conn.strength * 100)}%</span>
                            </div>
                          </div>

                          {/* CENTER: Label */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              AI-Generated Label
                            </div>
                            {isEditing ? (
                              <div>
                                <input
                                  value={editLabel}
                                  onChange={e => setEditLabel(e.target.value)}
                                  onBlur={commitEdit}
                                  onKeyDown={e => { if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditingIdx(null); }}
                                  autoFocus
                                  style={{
                                    fontFamily: BODY, fontSize: 15, fontWeight: 500, color: "#fff",
                                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(168,85,247,0.3)",
                                    borderRadius: 8, padding: "8px 12px", width: "100%", outline: "none",
                                  }}
                                />
                                <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.15)", marginTop: 6 }}>
                                  Enter to save · Escape to cancel
                                </div>
                              </div>
                            ) : (
                              <div style={{
                                fontFamily: BODY, fontSize: mobile ? 15 : 17, fontWeight: 500,
                                color: "rgba(255,255,255,0.65)", lineHeight: 1.5,
                                padding: "8px 14px", borderRadius: 10,
                                background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.1)",
                              }}>
                                "{conn.label}"
                              </div>
                            )}
                          </div>

                          {/* RIGHT: Actions */}
                          <div>
                            <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600 }}>
                              Actions
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {[
                                { action: "confirmed", label: "Confirm", color: "#10B981", icon: "✓" },
                                { action: "edit", label: "Edit Label", color: "#3B82F6", icon: "✎" },
                                { action: "rejected", label: "Reject", color: "#EF4444", icon: "✕" },
                              ].map(btn => (
                                <button key={btn.action} onClick={() => btn.action === "edit" ? startEdit(idx) : handleAction(idx, btn.action)}
                                  style={{
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    width: "100%", padding: mobile ? "10px 14px" : "11px 16px",
                                    fontFamily: BODY, fontSize: 13, fontWeight: 600,
                                    color: btn.action === "confirmed" ? "#08080C" : btn.color,
                                    background: btn.action === "confirmed" ? btn.color : `${btn.color}10`,
                                    border: `1px solid ${btn.action === "confirmed" ? btn.color : btn.color + "30"}`,
                                    borderRadius: 10, cursor: "pointer", transition: "all 0.2s",
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${btn.color}25`; }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                >
                                  <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                            {!mobile && (
                              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.12)", lineHeight: 1.8 }}>
                                Enter confirm · E edit · X reject
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new connection */}
            {adding ? (
              <div className="fade-up" style={{
                background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.2)",
                borderRadius: 14, padding: mobile ? "16px 14px" : "20px 24px", marginBottom: 20,
              }}>
                <div style={{ fontFamily: BODY, fontSize: 13, color: "#A855F7", fontWeight: 600, marginBottom: 12 }}>
                  Add a Connection AI Missed
                </div>
                <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: 10, marginBottom: 12 }}>
                  <select value={newFrom} onChange={e => setNewFrom(e.target.value)} style={{
                    fontFamily: BODY, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", flex: 1, outline: "none",
                  }}>
                    <option value="" style={{ background: "#1a1a2e" }}>From topic...</option>
                    {TOPICS.map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a2e" }}>{t.icon} {t.name}</option>)}
                  </select>
                  <select value={newTo} onChange={e => setNewTo(e.target.value)} style={{
                    fontFamily: BODY, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", flex: 1, outline: "none",
                  }}>
                    <option value="" style={{ background: "#1a1a2e" }}>To topic...</option>
                    {TOPICS.filter(t => t.id !== newFrom).map(t => <option key={t.id} value={t.id} style={{ background: "#1a1a2e" }}>{t.icon} {t.name}</option>)}
                  </select>
                </div>
                <input
                  value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  placeholder="Connection label (e.g., 'Shared tech stack')"
                  onKeyDown={e => { if (e.key === "Enter") addConnection(); }}
                  style={{
                    fontFamily: BODY, fontSize: 13, color: "#fff", background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px",
                    width: "100%", outline: "none", marginBottom: 12,
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={addConnection} disabled={!newFrom || !newTo || !newLabel.trim()} style={{
                    fontFamily: BODY, fontSize: 13, fontWeight: 600, color: newFrom && newTo && newLabel.trim() ? "#08080C" : "rgba(255,255,255,0.3)",
                    background: newFrom && newTo && newLabel.trim() ? "#A855F7" : "rgba(255,255,255,0.04)",
                    border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", transition: "all 0.2s",
                  }}>Add Connection</button>
                  <button onClick={() => setAdding(false)} style={{
                    fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.3)",
                    background: "none", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                  }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{
                fontFamily: BODY, fontSize: 12, fontWeight: 500, color: "rgba(168,85,247,0.6)",
                background: "none", border: "1px dashed rgba(168,85,247,0.2)",
                borderRadius: 10, padding: "10px 18px", cursor: "pointer", width: "100%",
                marginBottom: 20, transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.4)"; e.currentTarget.style.color = "#A855F7"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(168,85,247,0.2)"; e.currentTarget.style.color = "rgba(168,85,247,0.6)"; }}
              >
                + Add a connection AI missed
              </button>
            )}

            {/* Bottom bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: mobile ? "14px 0" : "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {reviewed > 0 ? `${confirmed} confirmed · ${edited} edited · ${rejected} rejected` : "Review each connection"}
              </div>
              <button onClick={() => {
                setConnections(prev => prev.map(c => c.status === "pending" ? { ...c, status: "confirmed" } : c));
              }} style={{
                fontFamily: BODY, fontSize: 14, fontWeight: 600,
                color: reviewed > 0 ? "#08080C" : "rgba(255,255,255,0.5)",
                background: reviewed > 0 ? "linear-gradient(135deg, #A855F7, #7C3AED)" : "rgba(255,255,255,0.06)",
                border: reviewed > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "10px 28px", cursor: "pointer",
                boxShadow: reviewed > 0 ? "0 4px 20px rgba(168,85,247,0.25)" : "none",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {reviewed > 0 ? "Approve Remaining →" : "Approve All →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// INSIGHT & DECISION REVIEW (v5 Curation Pipeline — Section 1D)
// ═══════════════════════════════════════════════════════════════

const InsightDecisionReview = ({ onComplete, mobile, w }) => {
  const [decisions, setDecisions] = useState(() =>
    INSIGHT_DECISIONS.map(d => ({ ...d, status: "pending", humanEdit: null }))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [done, setDone] = useState(false);
  const [showTrail, setShowTrail] = useState(null);
  const [dismissAnim, setDismissAnim] = useState(null); // "correct" | "reject" | null

  const topicMap = {};
  TOPICS.forEach(t => { topicMap[t.id] = t; });

  const reviewed = decisions.filter(d => d.status !== "pending").length;
  const total = decisions.length;
  const progress = total > 0 ? (reviewed / total) * 100 : 0;
  const active = activeIdx !== null && activeIdx < total ? decisions[activeIdx] : null;

  const typeMeta = {
    decision: { label: "Decision", color: "#EF4444", icon: "🎯" },
    pivot: { label: "Pivot", color: "#A855F7", icon: "↩️" },
    milestone: { label: "Milestone", color: "#EAB308", icon: "🏆" },
  };

  const moveNext = (fromIdx) => {
    const start = (fromIdx ?? activeIdx ?? -1) + 1;
    let next = decisions.findIndex((d, i) => i >= start && d.status === "pending");
    if (next < 0) next = decisions.findIndex(d => d.status === "pending");
    setActiveIdx(next >= 0 ? next : null);
  };

  const handleCorrect = (idx) => {
    setDismissAnim("correct");
    setTimeout(() => {
      setDecisions(prev => prev.map((d, i) => i === idx ? { ...d, status: "correct" } : d));
      setDismissAnim(null);
      moveNext(idx);
    }, 400);
  };

  const handleEdit = (idx) => {
    setEditing(true);
    setEditText(decisions[idx].aiProposal);
  };

  const commitEdit = (idx) => {
    if (editText.trim() && editText.trim() !== decisions[idx].aiProposal) {
      setDismissAnim("correct");
      setTimeout(() => {
        setDecisions(prev => prev.map((d, i) =>
          i === idx ? { ...d, status: "edited", humanEdit: editText.trim() } : d
        ));
        setDismissAnim(null);
        setEditing(false);
        setEditText("");
        moveNext(idx);
      }, 400);
    } else {
      setEditing(false);
      setEditText("");
    }
  };

  const handleReject = (idx) => {
    setDismissAnim("reject");
    setTimeout(() => {
      setDecisions(prev => prev.map((d, i) => i === idx ? { ...d, status: "rejected" } : d));
      setDismissAnim(null);
      moveNext(idx);
    }, 400);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (editing || done) return;
      if (activeIdx === null) return;
      if (e.key === "Enter") { e.preventDefault(); handleCorrect(activeIdx); }
      else if (e.key === "e" || e.key === "E") { e.preventDefault(); handleEdit(activeIdx); }
      else if (e.key === "x" || e.key === "X") { e.preventDefault(); handleReject(activeIdx); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reviewed === total && total > 0 && !done) setTimeout(() => setDone(true), 500);
  }, [reviewed, total, done]);

  const correct = decisions.filter(d => d.status === "correct").length;
  const edited = decisions.filter(d => d.status === "edited").length;
  const rejected = decisions.filter(d => d.status === "rejected").length;
  const promoted = correct + edited;

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(234,179,8,0.04) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: mobile ? 20 : 28 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)",
            fontFamily: MONO, fontSize: 10, color: "#EAB308", fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION · STEP 4
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Review <span style={{ color: "#EAB308" }}>Decisions & Insights</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 6 }}>
            AI extracted {total} key decisions, pivots, and milestones. Confirm accuracy before they join your timeline.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: mobile ? 20 : 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{reviewed} / {total} reviewed</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: progress === 100 ? "#10B981" : "rgba(234,179,8,0.5)" }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              width: `${progress}%`, height: "100%",
              background: progress === 100 ? "linear-gradient(90deg, #10B981, #059669)" : "linear-gradient(90deg, #EAB308CC, #EAB308)",
              borderRadius: 3, transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: progress === 100 ? "0 0 16px rgba(16,185,129,0.4)" : "0 0 12px rgba(234,179,8,0.3)",
            }} />
          </div>
        </div>

        {done ? (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "48px 20px" : "64px 40px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 24 : 32, fontWeight: 700, color: "#EAB308", marginBottom: 8 }}>
              Insights Reviewed
            </h2>
            <p style={{ fontFamily: BODY, fontSize: mobile ? 13 : 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, lineHeight: 1.6 }}>
              {correct} confirmed, {edited} edited, {rejected} rejected
            </p>
            <p style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.2)", marginBottom: 28 }}>
              {promoted} insight{promoted !== 1 ? "s" : ""} promoted to your Evolution timeline.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #EAB308, #CA8A04)", border: "none",
              borderRadius: 12, padding: "14px 40px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(234,179,8,0.25)", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(234,179,8,0.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(234,179,8,0.25)"; }}
            >
              Continue →
            </button>
          </div>
        ) : (
          <>
            {/* Active card (card stack top) */}
            {active && (
              <div
                key={active.id}
                className="fade-up"
                style={{
                  background: "rgba(255,255,255,0.03)", borderRadius: 18,
                  border: "1px solid rgba(234,179,8,0.2)", overflow: "hidden",
                  marginBottom: 16, position: "relative",
                  animation: dismissAnim === "correct" ? "cardPromote 0.4s ease both"
                    : dismissAnim === "reject" ? "cardDismiss 0.4s ease both" : undefined,
                }}
              >
                {/* Card header with type badge and topic */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: mobile ? "14px 16px 10px" : "16px 24px 12px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 12,
                      background: `${typeMeta[active.type].color}15`,
                      border: `1px solid ${typeMeta[active.type].color}30`,
                      fontFamily: MONO, fontSize: 10, color: typeMeta[active.type].color, fontWeight: 600,
                    }}>
                      {typeMeta[active.type].icon} {typeMeta[active.type].label}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 14 }}>{topicMap[active.topicId]?.icon}</span>
                      <span style={{ fontFamily: BODY, fontSize: 13, color: topicMap[active.topicId]?.color, fontWeight: 600 }}>
                        {topicMap[active.topicId]?.name}
                      </span>
                    </span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.15)" }}>
                    {activeIdx + 1} / {total}
                  </span>
                </div>

                {/* AI proposal */}
                <div style={{ padding: mobile ? "16px 16px 12px" : "20px 24px 16px" }}>
                  <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
                    AI-Extracted Insight
                  </div>
                  {editing ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        autoFocus
                        rows={3}
                        style={{
                          fontFamily: BODY, fontSize: mobile ? 15 : 17, fontWeight: 500, color: "#fff",
                          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(234,179,8,0.3)",
                          borderRadius: 10, padding: "12px 14px", width: "100%", outline: "none",
                          lineHeight: 1.5, resize: "vertical",
                        }}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(activeIdx); }
                          if (e.key === "Escape") { setEditing(false); setEditText(""); }
                        }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.15)" }}>
                          Enter to save · Escape to cancel
                        </span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => { setEditing(false); setEditText(""); }} style={{
                            fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.3)",
                            background: "none", border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                          }}>Cancel</button>
                          <button onClick={() => commitEdit(activeIdx)} style={{
                            fontFamily: BODY, fontSize: 12, fontWeight: 600, color: "#08080C",
                            background: "#EAB308", border: "none",
                            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
                          }}>Save Edit</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: BODY, fontSize: mobile ? 16 : 19, fontWeight: 500,
                      color: "rgba(255,255,255,0.75)", lineHeight: 1.5,
                      padding: "12px 16px", borderRadius: 12,
                      background: "rgba(234,179,8,0.04)", border: "1px solid rgba(234,179,8,0.1)",
                    }}>
                      {active.aiProposal}
                    </div>
                  )}
                </div>

                {/* Source conversation snippet */}
                <div style={{ padding: mobile ? "0 16px 16px" : "0 24px 20px" }}>
                  <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 600 }}>
                    Source Conversation
                  </div>
                  <div style={{
                    background: "rgba(255,255,255,0.02)", borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.04)", padding: mobile ? "10px 12px" : "12px 16px",
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(251,191,36,0.35)", marginRight: 6 }}>YOU</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                        {active.sourceSnippet.user}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(168,85,247,0.4)", marginRight: 6 }}>AI</span>
                      <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>
                        {active.sourceSnippet.ai}
                      </span>
                    </div>
                    <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.1)", marginTop: 8 }}>
                      {active.sourceRef}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!editing && (
                  <div style={{
                    display: "flex", gap: 8, padding: mobile ? "0 16px 16px" : "0 24px 20px",
                    flexDirection: mobile ? "column" : "row",
                  }}>
                    {[
                      { action: "correct", label: "Correct", color: "#10B981", icon: "✓", desc: "Promote to timeline" },
                      { action: "edit", label: "Partially Correct", color: "#3B82F6", icon: "✎", desc: "Edit & promote" },
                      { action: "reject", label: "Not a Real Decision", color: "#EF4444", icon: "✕", desc: "Dismiss" },
                    ].map(btn => (
                      <button key={btn.action}
                        onClick={() => {
                          if (btn.action === "correct") handleCorrect(activeIdx);
                          else if (btn.action === "edit") handleEdit(activeIdx);
                          else handleReject(activeIdx);
                        }}
                        style={{
                          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                          padding: mobile ? "12px 14px" : "14px 16px",
                          fontFamily: BODY, fontSize: 13, fontWeight: 600,
                          color: btn.action === "correct" ? "#08080C" : btn.color,
                          background: btn.action === "correct" ? btn.color : `${btn.color}10`,
                          border: `1px solid ${btn.action === "correct" ? btn.color : btn.color + "30"}`,
                          borderRadius: 12, cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 16px ${btn.color}25`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, lineHeight: 1 }}>{btn.icon}</span>
                          {btn.label}
                        </span>
                        <span style={{
                          fontSize: 9, fontWeight: 400, opacity: 0.7,
                          color: btn.action === "correct" ? "#08080C" : btn.color,
                        }}>{btn.desc}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Keyboard hints */}
                {!editing && !mobile && (
                  <div style={{
                    padding: "0 24px 14px", fontFamily: MONO, fontSize: 9,
                    color: "rgba(255,255,255,0.1)", textAlign: "center",
                  }}>
                    Enter correct · E edit · X reject
                  </div>
                )}
              </div>
            )}

            {/* Stacked cards behind (visual depth) */}
            {active && decisions.filter(d => d.status === "pending").length > 1 && (
              <div style={{ position: "relative", height: 12, marginBottom: 12 }}>
                {[1, 2].map(offset => {
                  const remaining = decisions.filter(d => d.status === "pending").length - 1;
                  if (offset > remaining) return null;
                  return (
                    <div key={offset} style={{
                      position: "absolute", left: offset * 6, right: offset * 6, top: -4 - offset * 4,
                      height: 8, borderRadius: "0 0 14px 14px",
                      background: `rgba(255,255,255,${0.015 - offset * 0.005})`,
                      border: "1px solid rgba(255,255,255,0.03)",
                      borderTop: "none", zIndex: -offset,
                    }} />
                  );
                })}
              </div>
            )}

            {/* Reviewed items (edit trail) */}
            {reviewed > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{
                  fontFamily: BODY, fontSize: 9, color: "rgba(255,255,255,0.15)",
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>Edit Trail</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.08)" }}>
                    — AI proposed vs. human confirmed
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {decisions.filter(d => d.status !== "pending").map(d => {
                    const topic = topicMap[d.topicId];
                    const meta = typeMeta[d.type];
                    const isTrailOpen = showTrail === d.id;
                    return (
                      <div key={d.id} style={{
                        background: "rgba(255,255,255,0.015)", borderRadius: 12,
                        border: `1px solid rgba(255,255,255,0.04)`,
                        overflow: "hidden", transition: "all 0.3s",
                      }}>
                        <div
                          style={{
                            display: "flex", alignItems: "center", gap: mobile ? 8 : 12,
                            padding: mobile ? "10px 12px" : "11px 16px",
                            cursor: d.status === "edited" ? "pointer" : "default",
                          }}
                          onClick={() => d.status === "edited" && setShowTrail(isTrailOpen ? null : d.id)}
                        >
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: d.status === "correct" ? "#10B981" : d.status === "edited" ? "#3B82F6" : "#EF4444",
                          }} />
                          <span style={{ fontSize: 13, flexShrink: 0 }}>{meta.icon}</span>
                          <span style={{ fontSize: 12, flexShrink: 0 }}>{topic?.icon}</span>
                          <span style={{
                            fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.4)",
                            fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {d.humanEdit || d.aiProposal}
                          </span>
                          <span style={{
                            fontFamily: MONO, fontSize: 10, flexShrink: 0, textTransform: "uppercase",
                            color: d.status === "correct" ? "#10B981" : d.status === "edited" ? "#3B82F6" : "#EF4444",
                          }}>
                            {d.status === "correct" ? "promoted" : d.status === "edited" ? "edited ▾" : "dismissed"}
                          </span>
                        </div>
                        {/* Expanded edit trail for edited items */}
                        {isTrailOpen && d.status === "edited" && (
                          <div className="fade-up" style={{
                            padding: mobile ? "0 12px 12px" : "0 16px 14px",
                            display: "flex", flexDirection: "column", gap: 8,
                          }}>
                            <div style={{
                              background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)",
                              borderRadius: 8, padding: "8px 12px",
                            }}>
                              <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(239,68,68,0.5)", display: "block", marginBottom: 4 }}>AI PROPOSED</span>
                              <span style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.5, textDecoration: "line-through", textDecorationColor: "rgba(239,68,68,0.3)" }}>
                                {d.aiProposal}
                              </span>
                            </div>
                            <div style={{
                              background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)",
                              borderRadius: 8, padding: "8px 12px",
                            }}>
                              <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(16,185,129,0.5)", display: "block", marginBottom: 4 }}>HUMAN CONFIRMED</span>
                              <span style={{ fontFamily: BODY, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                                {d.humanEdit}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: mobile ? "14px 0" : "16px 0", marginTop: 12,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                {reviewed > 0 ? `${promoted} promoted · ${rejected} dismissed` : "Review each insight"}
              </div>
              <button onClick={() => {
                setDecisions(prev => prev.map(d => d.status === "pending" ? { ...d, status: "correct" } : d));
              }} style={{
                fontFamily: BODY, fontSize: 14, fontWeight: 600,
                color: reviewed > 0 ? "#08080C" : "rgba(255,255,255,0.5)",
                background: reviewed > 0 ? "linear-gradient(135deg, #EAB308, #CA8A04)" : "rgba(255,255,255,0.06)",
                border: reviewed > 0 ? "none" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "10px 28px", cursor: "pointer",
                boxShadow: reviewed > 0 ? "0 4px 20px rgba(234,179,8,0.25)" : "none",
                transition: "all 0.3s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {reviewed > 0 ? "Approve Remaining →" : "Approve All →"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CURATION SUMMARY & CONFIDENCE DASHBOARD (v5 1E)
// ═══════════════════════════════════════════════════════════════

const CurationSummary = ({ onComplete, mobile, w }) => {
  const [phase, setPhase] = useState(0); // 0: counting, 1: stats revealed, 2: before/after, 3: ready
  const [counters, setCounters] = useState({ reviewed: 0, approved: 0, edited: 0, rejected: 0, confidence: 0 });

  const tablet = w >= 640 && w < 1024;

  // Aggregate stats from the full curation pipeline (simulated from demo data)
  const finalStats = {
    reviewed: 48, // 10 queue + 14 topics + 16 connections + 8 insights
    approved: 34,
    edited: 9,
    rejected: 5,
    confidence: 91,
  };

  const beforeAfter = [
    { label: "Topics merged", before: "14 separate topics", after: "12 focused topics", icon: "🔗", delta: "2 merged" },
    { label: "Topics renamed", before: "AI-generated labels", after: "Human-verified names", icon: "✏️", delta: "3 renamed" },
    { label: "Connections validated", before: "16 AI-discovered", after: "14 confirmed + 1 added", icon: "🕸️", delta: "2 rejected" },
    { label: "Insights promoted", before: "8 AI-extracted", after: "7 on your timeline", icon: "🎯", delta: "1 dismissed" },
    { label: "Overall confidence", before: "72%", after: "91%", icon: "📊", delta: "+19%" },
  ];

  // Animate counters on mount
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounters({
        reviewed: Math.round(finalStats.reviewed * ease),
        approved: Math.round(finalStats.approved * ease),
        edited: Math.round(finalStats.edited * ease),
        rejected: Math.round(finalStats.rejected * ease),
        confidence: Math.round(finalStats.confidence * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    // Phase transitions
    setTimeout(() => setPhase(1), 1400);
    setTimeout(() => setPhase(2), 2200);
    setTimeout(() => setPhase(3), 3000);

    return () => clearInterval(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statCards = [
    { label: "Items Reviewed", value: counters.reviewed, color: "#FBBF24", icon: "📋" },
    { label: "Approved", value: counters.approved, color: "#10B981", icon: "✓" },
    { label: "Edited", value: counters.edited, color: "#3B82F6", icon: "✎" },
    { label: "Rejected", value: counters.rejected, color: "#EF4444", icon: "✕" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", display: "flex", flexDirection: "column", padding: mobile ? "24px 16px" : "32px 40px" }}>
      <style>{CSS}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(16,185,129,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 800, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: mobile ? 24 : 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 14px", borderRadius: 20, marginBottom: 14,
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
            fontFamily: MONO, fontSize: 10, color: "#10B981", fontWeight: 600, letterSpacing: "0.08em",
          }}>
            CURATION COMPLETE
          </div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 26 : 36, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Your Atlas is Now <span style={{ color: "#10B981" }}>Human-Verified</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.3)", marginTop: 8, lineHeight: 1.6 }}>
            You reviewed AI classifications, curated topics, validated connections, and confirmed insights.
            <br />Every data point in your knowledge base has been shaped by your judgment.
          </p>
        </div>

        {/* Confidence ring */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: mobile ? 28 : 40, animationDelay: "0.2s" }}>
          <div style={{ position: "relative", display: "inline-block", width: mobile ? 120 : 150, height: mobile ? 120 : 150 }}>
            <svg width={mobile ? 120 : 150} height={mobile ? 120 : 150} viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="75" cy="75" r="62" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
              <circle cx="75" cy="75" r="62" fill="none" stroke="url(#confidenceGrad)" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 62}`}
                strokeDashoffset={`${2 * Math.PI * 62 * (1 - counters.confidence / 100)}`}
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }} />
              <defs>
                <linearGradient id="confidenceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: MONO, fontSize: mobile ? 32 : 40, fontWeight: 700, color: "#10B981", lineHeight: 1 }}>
                {counters.confidence}%
              </div>
              <div style={{ fontFamily: BODY, fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                confidence
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: mobile ? 10 : 14, marginBottom: mobile ? 28 : 40,
        }}>
          {statCards.map((stat, i) => (
            <div key={stat.label} className="fade-up" style={{
              background: "rgba(255,255,255,0.025)", borderRadius: 14,
              border: `1px solid ${stat.color}15`, padding: mobile ? "16px 14px" : "20px 18px",
              textAlign: "center", animationDelay: `${0.3 + i * 0.1}s`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{
                fontFamily: MONO, fontSize: mobile ? 28 : 32, fontWeight: 700,
                color: stat.color, lineHeight: 1, marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)",
                fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Before/After comparison */}
        {phase >= 2 && (
          <div className="fade-up" style={{ marginBottom: mobile ? 28 : 40 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: mobile ? 14 : 18,
            }}>
              <h2 style={{ fontFamily: FONTS, fontSize: mobile ? 18 : 22, fontWeight: 700, color: "#fff" }}>
                How Curation Improved Your Atlas
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 8 : 10 }}>
              {beforeAfter.map((item, i) => (
                <div key={item.label} className="fade-up" style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden",
                  animationDelay: `${i * 0.1}s`,
                }}>
                  <div style={{
                    display: "flex", alignItems: mobile ? "flex-start" : "center",
                    flexDirection: mobile ? "column" : "row",
                    gap: mobile ? 8 : 0,
                    padding: mobile ? "14px 14px" : "14px 20px",
                  }}>
                    {/* Label */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: mobile ? "100%" : "160px", flexShrink: 0,
                    }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontFamily: BODY, fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                        {item.label}
                      </span>
                    </div>

                    {/* Before → After */}
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", gap: mobile ? 8 : 12,
                      flexDirection: mobile ? "column" : "row", width: mobile ? "100%" : "auto",
                    }}>
                      <div style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8,
                        background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.1)",
                        width: mobile ? "100%" : "auto",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(239,68,68,0.4)", display: "block", marginBottom: 2 }}>BEFORE</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.3)" }}>{item.before}</span>
                      </div>

                      <span style={{ fontFamily: MONO, fontSize: 14, color: "rgba(255,255,255,0.15)", flexShrink: 0 }}>→</span>

                      <div style={{
                        flex: 1, padding: "8px 12px", borderRadius: 8,
                        background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.1)",
                        width: mobile ? "100%" : "auto",
                      }}>
                        <span style={{ fontFamily: MONO, fontSize: 9, color: "rgba(16,185,129,0.4)", display: "block", marginBottom: 2 }}>AFTER</span>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)" }}>{item.after}</span>
                      </div>
                    </div>

                    {/* Delta badge */}
                    {!mobile && (
                      <div style={{
                        flexShrink: 0, marginLeft: 12,
                        padding: "4px 10px", borderRadius: 8,
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
                        fontFamily: MONO, fontSize: 10, color: "#10B981", fontWeight: 500,
                      }}>
                        {item.delta}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue button */}
        {phase >= 3 && (
          <div className="fade-up" style={{ textAlign: "center", padding: mobile ? "16px 0 48px" : "24px 0 64px" }}>
            <p style={{
              fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.2)",
              marginBottom: 20, lineHeight: 1.6,
            }}>
              Your knowledge base is ready. Every insight, connection, and classification has been shaped by you.
            </p>
            <button onClick={onComplete} style={{
              fontFamily: BODY, fontSize: 16, fontWeight: 600, color: "#08080C",
              background: "linear-gradient(135deg, #10B981, #059669)", border: "none",
              borderRadius: 12, padding: "14px 44px", cursor: "pointer",
              boxShadow: "0 4px 24px rgba(16,185,129,0.3)", transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(16,185,129,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(16,185,129,0.3)"; }}
            >
              Explore Your Atlas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN APP ───────────────────────────────────────────────

export default function App() {
  const { w } = useWindowSize();
  const mobile = w < 640;
  const tablet = w >= 640 && w < 1024;
  const [view, setView] = useState("onboarding");
  const [selectedTopic, setSelectedTopic] = useState(null);

  const maxCount = Math.max(...TOPICS.map(t => t.count));
  const totalWords = TOPICS.reduce((a, t) => a + t.words, 0) + 680000;
  const totalConvos = 3847;

  const handleTopicClick = (topic) => { setSelectedTopic(topic); setView("timeline"); };
  const handleStartProcessing = useCallback(() => setView("loading"), []);
  const handleLoadingComplete = useCallback(() => setView("curation"), []);
  const handleCurationComplete = useCallback(() => setView("topicCuration"), []);
  const handleTopicCurationComplete = useCallback(() => setView("connectionValidation"), []);
  const handleConnectionValidationComplete = useCallback(() => setView("insightReview"), []);
  const handleInsightReviewComplete = useCallback(() => setView("curationSummary"), []);
  const handleCurationSummaryComplete = useCallback(() => setView("dashboard"), []);

  // ─── ONBOARDING ──────────────────────────────────
  if (view === "onboarding") {
    return <OnboardingView onStart={handleStartProcessing} mobile={mobile} w={w} />;
  }

  // ─── LOADING ─────────────────────────────────────
  if (view === "loading") {
    return <LoadingView onComplete={handleLoadingComplete} mobile={mobile} w={w} />;
  }

  // ─── CURATION (Review Queue) ────────────────────
  if (view === "curation") {
    return <ReviewQueue onComplete={handleCurationComplete} mobile={mobile} w={w} />;
  }

  // ─── TOPIC CURATION ────────────────────────────
  if (view === "topicCuration") {
    return <TopicCurationPanel onComplete={handleTopicCurationComplete} mobile={mobile} w={w} />;
  }

  // ─── CONNECTION VALIDATION ─────────────────────
  if (view === "connectionValidation") {
    return <ConnectionValidation onComplete={handleConnectionValidationComplete} mobile={mobile} w={w} />;
  }

  // ─── INSIGHT & DECISION REVIEW ────────────────
  if (view === "insightReview") {
    return <InsightDecisionReview onComplete={handleInsightReviewComplete} mobile={mobile} w={w} />;
  }

  // ─── CURATION SUMMARY ──────────────────────────
  if (view === "curationSummary") {
    return <CurationSummary onComplete={handleCurationSummaryComplete} mobile={mobile} w={w} />;
  }

  // ─── TIMELINE ────────────────────────────────────
  if (view === "timeline" && selectedTopic) {
    return (
      <div style={{ minHeight: "100vh", background: "#08080C", padding: mobile ? "20px 16px" : "28px 40px", maxWidth: 820, margin: "0 auto" }}>
        <style>{CSS}</style>
        <TimelineView topic={selectedTopic} onBack={() => { setView("dashboard"); setSelectedTopic(null); }} mobile={mobile} />
      </div>
    );
  }

  // ─── MAIN LAYOUT ────────────────────────────────
  const gridCols = mobile ? "1fr 1fr" : tablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)";
  const insightGrid = mobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ minHeight: "100vh", background: "#08080C", padding: mobile ? "24px 16px 60px" : tablet ? "28px 24px 80px" : "32px 40px 80px" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mobile ? 24 : 32 }}>
          <div style={{ fontSize: mobile ? 10 : 12, fontFamily: BODY, color: "rgba(251,191,36,0.35)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: mobile ? 10 : 14, fontWeight: 600 }}>Your AI Knowledge Atlas</div>
          <h1 style={{ fontFamily: FONTS, fontSize: mobile ? 32 : tablet ? 40 : 48, fontWeight: 800, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            3 Years of Thinking,{mobile ? <br /> : " "}<span style={{ color: "#FBBF24" }}>Mapped</span>
          </h1>
          <p style={{ fontFamily: BODY, fontSize: mobile ? 12 : 14, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Jan 2023 — Feb 2026 · ChatGPT + Claude · {(totalWords / 1000000).toFixed(1)}M words</p>
        </div>

        <Nav view={view === "timeline" ? "dashboard" : view} onNavigate={setView} mobile={mobile} />

        {view === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: mobile ? 10 : 14, marginBottom: mobile ? 28 : 40 }}>
              <StatCard label="Conversations" value={totalConvos} sub="across 2 platforms" delay={100} accent="#FBBF24" mobile={mobile} />
              <StatCard label="Your Words" value={Math.floor(totalWords * 0.38)} sub={mobile ? "your thinking in text" : "that's a 1,600-page book"} delay={250} accent="#10B981" mobile={mobile} />
              <StatCard label="Topic Clusters" value={TOPICS.length} sub="auto-discovered" delay={400} accent="#3B82F6" mobile={mobile} />
              <StatCard label="Longest Streak" value={34} sub="days · Nov 2024" delay={550} accent="#A855F7" mobile={mobile} />
            </div>

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: mobile ? "16px 14px 10px" : "20px 22px 14px", marginBottom: mobile ? 28 : 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mobile ? 10 : 14 }}>
                <div>
                  <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 15 : 17, color: "#fff" }}>Your AI Journey</h3>
                  <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{mobile ? "ChatGPT → Claude shift" : "Watch the shift from ChatGPT to Claude"}</p>
                </div>
                <div style={{ display: "flex", gap: mobile ? 10 : 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#3B82F6" }} /><span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" }}>GPT</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: "#FBBF24" }} /><span style={{ fontFamily: BODY, fontSize: mobile ? 9 : 10, color: "rgba(255,255,255,0.3)" }}>Claude</span></div>
                </div>
              </div>
              <ActivityChart mobile={mobile} />
            </div>

            <div style={{ marginBottom: mobile ? 28 : 40 }}>
              <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 17 : 20, color: "#fff", marginBottom: 3 }}>Knowledge Map</h3>
              <p style={{ fontFamily: BODY, fontSize: mobile ? 10 : 12, color: "rgba(255,255,255,0.2)", marginBottom: 14 }}>Sized by conversation count. {mobile ? "Tap" : "Click"} to explore.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: mobile ? 8 : 12, justifyContent: "center", alignItems: "center", padding: mobile ? "20px 10px" : "28px 16px", background: "rgba(255,255,255,0.015)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.04)" }}>
                {TOPICS.map((topic, i) => <TopicBubble key={topic.id} topic={topic} maxCount={maxCount} index={i} onClick={handleTopicClick} mobile={mobile} />)}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: insightGrid, gap: mobile ? 24 : 20 }}>
              <div>
                <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 16 : 18, color: "#fff", marginBottom: 12 }}>📊 How You Think</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {INSIGHTS.slice(0, mobile ? 3 : 5).map((trait, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: mobile ? "12px 14px" : "13px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontFamily: BODY, fontSize: mobile ? 12 : 13, color: "#FBBF24", fontWeight: 600 }}>{trait.icon} {trait.title}</span>
                        <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(251,191,36,0.35)" }}>{trait.pct}%</span>
                      </div>
                      <div style={{ fontFamily: BODY, fontSize: mobile ? 10 : 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4, marginBottom: 5 }}>{trait.desc}</div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${trait.pct}%`, height: "100%", background: "linear-gradient(90deg, #FBBF24, #F59E0B)", borderRadius: 2 }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: FONTS, fontSize: mobile ? 16 : 18, color: "#fff", marginBottom: 12 }}>✨ Rediscovered Today</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {REDISCOVERIES.map((item, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: mobile ? "11px 14px" : "12px 16px", display: "flex", gap: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily: BODY, fontSize: 9, color: "rgba(251,191,36,0.35)", marginBottom: 3, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.ago}</div>
                        <div style={{ fontFamily: BODY, fontSize: mobile ? 11 : 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {view === "connections" && <ConnectionsView onTopicClick={handleTopicClick} mobile={mobile} />}
        {view === "evolution" && <EvolutionView mobile={mobile} />}
        {view === "search" && <SearchView mobile={mobile} />}

        <div style={{ textAlign: "center", marginTop: mobile ? 40 : 60, padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ fontFamily: FONTS, fontSize: mobile ? 14 : 16, color: "rgba(255,255,255,0.18)" }}>This is your mind, mapped.</div>
          <div style={{ fontFamily: BODY, fontSize: mobile ? 9 : 11, color: "rgba(255,255,255,0.08)", marginTop: 5 }}>Atlas · v5 · Data simulated from real conversation patterns</div>
        </div>
      </div>
    </div>
  );
}
