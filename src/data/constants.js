export const TOPICS = [
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

export const CONNECTIONS = [
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

export const TIMELINE_DATA = {
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

export const TYPE_META = {
  idea: { label: "Idea", color: "#FBBF24", icon: "💡" },
  research: { label: "Research", color: "#3B82F6", icon: "🔬" },
  decision: { label: "Decision", color: "#EF4444", icon: "🎯" },
  build: { label: "Build", color: "#10B981", icon: "🔨" },
  problem: { label: "Problem", color: "#F87171", icon: "🔥" },
  pivot: { label: "Pivot", color: "#A855F7", icon: "↩️" },
  milestone: { label: "Milestone", color: "#EAB308", icon: "🏆" },
};

export const MONTHLY_ACTIVITY = [
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

export const SEARCH_RESULTS = [
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

export const INSIGHTS = [
  { icon: "🧩", title: "Problem Decomposer", desc: "You break complex challenges into smaller parts in 73% of conversations.", pct: 73 },
  { icon: "🔄", title: "Relentless Iterator", desc: "Average 4.2 revision cycles per project. You refine, never restart.", pct: 84 },
  { icon: "🌉", title: "Cross-Pollinator", desc: "31% of ideas reference a different domain. GovTech informs product thinking.", pct: 31 },
  { icon: "📐", title: "Systems Thinker", desc: "You ask about architecture before implementation in 68% of technical chats.", pct: 68 },
  { icon: "🎓", title: "Active Learner", desc: "Question sophistication increased 3.4× from 2023.", pct: 88 },
];

export const PLATFORM_INSIGHTS = [
  { label: "You use Claude for", items: ["Architecture & system design", "Long implementation sessions", "Resume & career materials", "Complex debugging"], color: "#FBBF24" },
  { label: "You use ChatGPT for", items: ["Quick research questions", "Creative brainstorming", "Personal & life topics", "Early-stage exploration"], color: "#3B82F6" },
];

export const EVOLUTION_PHASES = [
  { period: "Jan – Jun 2023", title: "The Learner", desc: "Mostly how-to questions. Web dev fundamentals, career research, simple automations. Average conversation: 8 messages.", color: "#3B82F6", conversations: 371 },
  { period: "Jul – Dec 2023", title: "The Practitioner", desc: "Building real things. Tyler work got sophisticated. Financial planning and creative writing began.", color: "#10B981", conversations: 483 },
  { period: "Jan – Jun 2024", title: "The Builder", desc: "Launched Keymaster and automation projects. Shifted from 'how' to 'what should I build.' Claude adoption began.", color: "#F59E0B", conversations: 548 },
  { period: "Jul – Dec 2024", title: "The Architect", desc: "CourtCollect, HMPRG campaigns, game design. Multi-project orchestration. Average conversation: 35 messages.", color: "#EF4444", conversations: 726 },
  { period: "Jan – Jun 2025", title: "The Strategist", desc: "Job search + consulting + product development simultaneously. AI as thinking partner, not just tool.", color: "#A855F7", conversations: 520 },
  { period: "Jul 2025 – Feb 2026", title: "The Meta-Thinker", desc: "Designing systems to extract knowledge from your own AI use. Building Atlas. The snake eats its tail.", color: "#EC4899", conversations: 480 },
];

export const REDISCOVERIES = [
  { icon: "💡", ago: "3 months ago", text: "You designed a password-strength scoring algorithm using entropy calculation with contextual penalties." },
  { icon: "🎯", ago: "9 months ago", text: "You found that municipal courts lose 23% of collectible revenue to outdated payment systems." },
  { icon: "🔄", ago: "2 years ago", text: "Your first conversation about AI automation — 'how do I connect APIs without coding.' Look how far that's come." },
];

// ─── ASK ATLAS — COMPANION RESPONSE DATA ───────────────────
export const COMPANION_RESPONSES = {
  "What's my current thinking on serverless architecture?": {
    answer: "You've moved toward a pragmatic serverless-first approach, but with clear boundaries. Your CourtCollect work solidified the view that serverless (via Vercel + Supabase edge functions) is ideal for frontend-heavy SaaS products where you're the sole developer [1]. You explicitly chose against containerized deployment after a painful Docker + Railway debugging session that cost you three days [2]. However, you've noted that serverless has limits — for event-driven backend processing, you've been exploring pub/sub patterns that sit between pure serverless and traditional servers [3]. Your current position: serverless for the web layer, managed services for data, and evaluate case-by-case for background processing.",
    confidence: 0.91,
    freshness: "recent",
    sources: [
      { id: 1, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-09-15", title: "Architecture decisions — Supabase + Next.js", excerpt: "Chose tech stack after evaluating options. Vercel + Supabase simplified the deployment story compared to self-managed infrastructure. For a solo developer, serverless is the obvious choice — I don't want to be on-call for my own side project.", highlight: "For a solo developer, serverless is the obvious choice" },
      { id: 2, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-11-14", title: "Deployment struggles — Docker + Railway", excerpt: "Three days lost to multi-stage Docker build conflicts. Railway's build system fought with our Next.js config at every turn. This is exactly the kind of infrastructure yak-shaving that kills solo projects.", highlight: "Three days lost to multi-stage Docker build conflicts" },
      { id: 3, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-11-16", title: "Pivoted to Vercel deployment", excerpt: "Switched strategy. Vercel + Supabase cloud simplified everything. The serverless model means I deploy and forget — no containers to manage, no scaling to configure. For background jobs, I'll evaluate pub/sub when the need is concrete.", highlight: "Vercel + Supabase cloud simplified everything" },
    ],
  },
  "When did I decide to use TypeScript for CourtCollect?": {
    answer: "You didn't start CourtCollect with TypeScript — the initial architecture decision in September 2024 was Next.js with JavaScript [1]. The shift to TypeScript happened gradually through your web development conversations, where you identified type safety as critical for multi-tenant systems with complex data models [2]. By the time you were designing the database schema with RLS policies and tenant isolation, the complexity of the type relationships (courts, cases, payments, agencies) made the case for TypeScript self-evident [3]. The formal decision crystallized during the CI/CD pipeline setup in October 2024, when you configured the build system with strict TypeScript checking from day one [4].",
    confidence: 0.85,
    freshness: "recent",
    sources: [
      { id: 1, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-09-15", title: "Architecture decisions — Supabase + Next.js", excerpt: "Chose tech stack after evaluating options. Next.js 14 with App Router for the frontend, Supabase for the backend. Initial setup in JavaScript to move fast.", highlight: "Initial setup in JavaScript to move fast" },
      { id: 2, topicId: "webdev", topicName: "Web Development", date: "2025-01-15", title: "Performance optimization", excerpt: "TypeScript catches entire categories of bugs at build time. For multi-tenant SaaS where a wrong tenant_id means a security breach, type safety isn't optional — it's a requirement.", highlight: "type safety isn't optional — it's a requirement" },
      { id: 3, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-09-22", title: "Database schema design", excerpt: "The schema has 6 interconnected tables with RLS policies on each. Keeping track of which agency can see which cases, which payments belong to which court — without types, this is a bug factory.", highlight: "without types, this is a bug factory" },
      { id: 4, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-10-05", title: "GitHub org setup & CI/CD pipeline", excerpt: "Configured strict TypeScript in tsconfig. Required CI to pass before merge. If the types don't check out, the code doesn't ship.", highlight: "Required CI to pass before merge" },
    ],
  },
  "What are the tradeoffs I've identified with n8n vs. custom automation?": {
    answer: "You've been living in both worlds and have a nuanced take. n8n wins for speed-to-value: your Bluesky analytics pipeline and HMPRG reporting automation were both stood up in hours, not days [1][2]. The visual workflow builder is genuinely powerful for connecting APIs without writing glue code. But you've hit real limits — complex conditional logic becomes a spaghetti of nodes, error handling is clunky, and debugging multi-step workflows is harder than reading equivalent code [3]. Your current philosophy is 'strategic automation': use n8n for the boring, repetitive data pipelines (API → transform → store), but hand-craft anything that involves complex business logic or needs to be maintained long-term [4]. The key tradeoff you keep coming back to: n8n's ceiling is lower but you hit it faster. Custom code's ceiling is unlimited but the ramp-up cost is real.",
    confidence: 0.88,
    freshness: "recent",
    sources: [
      { id: 1, topicId: "n8n", topicName: "n8n & Airtable", date: "2024-08-22", title: "Bluesky → Airtable pipeline", excerpt: "Built the full Bluesky analytics pipeline in n8n in about 3 hours. API calls, data transformation, Airtable write — all visual, no code. This would have been a full day in Node.js.", highlight: "Built the full Bluesky analytics pipeline in n8n in about 3 hours" },
      { id: 2, topicId: "n8n", topicName: "n8n & Airtable", date: "2024-09-15", title: "HMPRG reporting automation", excerpt: "Meta Ads API → data cleanup → formatted report → email. n8n handled this beautifully. The scheduling and retry logic comes free.", highlight: "n8n handled this beautifully" },
      { id: 3, topicId: "n8n", topicName: "n8n & Airtable", date: "2025-01-10", title: "Complex multi-step workflows", excerpt: "Hit the wall on a workflow with 8 conditional branches and error recovery. The visual canvas becomes unreadable. Debugging means clicking into each node individually. At this complexity level, I'd rather read 200 lines of code.", highlight: "The visual canvas becomes unreadable" },
      { id: 4, topicId: "automation", topicName: "AI Automation", date: "2024-11-15", title: "AI-for-good nonprofit concept", excerpt: "My framework now: automate the boring stuff with no-code tools, hand-craft the critical stuff with real code. The 80/20 rule applies — 80% of automations are simple enough for n8n, 20% need proper engineering.", highlight: "automate the boring stuff with no-code tools, hand-craft the critical stuff with real code" },
    ],
  },
  "Summarize my evolution on AI-assisted development": {
    answer: "Your journey with AI-assisted development spans three distinct phases. In early 2023, you were a consumer — asking how-to questions, getting code snippets, treating AI as a smarter Stack Overflow [1]. By mid-2024, you'd become a collaborator: your conversations shifted from 'how do I do X' to 'help me think through the architecture of X.' The CourtCollect and Keymaster projects show this clearly — you're using AI to stress-test ideas, not just generate code [2]. The current phase, starting around late 2025, is what you'd call meta-cognitive: you're not just using AI to build things, you're building systems to extract knowledge from your AI usage itself. Atlas is the embodiment of this — the snake eating its tail [3]. The most telling metric: your average conversation length went from 8 messages in early 2023 to 35 messages by late 2024. You're not asking more questions — you're having deeper conversations [4].",
    confidence: 0.94,
    freshness: "mixed",
    freshnessWarning: "Some sources are from early 2023. Your earliest thinking may have evolved further than captured here.",
    sources: [
      { id: 1, topicId: "webdev", topicName: "Web Development", date: "2023-01-20", title: "HTML/CSS fundamentals", excerpt: "Early web development learning. Asking basic questions about flexbox, CSS grid, responsive design. Each conversation was short and transactional — get the answer, move on.", highlight: "Each conversation was short and transactional" },
      { id: 2, topicId: "courtcollect", topicName: "CourtCollect", date: "2024-09-22", title: "Database schema design", excerpt: "Can you help me think through the multi-tenant data model? I want to stress-test the approach before I commit to it. Here are the constraints I'm working with...", highlight: "I want to stress-test the approach before I commit" },
      { id: 3, topicId: "obsidian", topicName: "Knowledge Mgmt", date: "2025-02-05", title: "LLM conversation extraction concept", excerpt: "What if I could turn all my AI conversations into a searchable, structured knowledge base? Not just the answers — the reasoning, the decisions, the evolution of my thinking. The system that extracts knowledge from the system I use to generate knowledge.", highlight: "The system that extracts knowledge from the system I use to generate knowledge" },
      { id: 4, topicId: "automation", topicName: "AI Automation", date: "2024-08-20", title: "AI workflow patterns", excerpt: "LLM-in-the-loop automation is fundamentally different from traditional automation. You're not scripting deterministic steps — you're designing conversations with outcomes. Average session is now 35+ messages, multiple iterations.", highlight: "you're designing conversations with outcomes" },
    ],
  },
};

export const COMPANION_SUGGESTION_CHIPS = [
  "What's my current thinking on serverless architecture?",
  "When did I decide to use TypeScript for CourtCollect?",
  "What are the tradeoffs I've identified with n8n vs. custom automation?",
  "Summarize my evolution on AI-assisted development",
];

// ─── CONVERSATION PREVIEW DATA ──────────────────────────────
export const CONVERSATION_PREVIEWS = {
  "courtcollect:4": {
    topicId: "courtcollect",
    eventIndex: 4,
    platform: "Claude",
    date: "2024-10-05",
    wordCount: 3420,
    whyItMatters: "This was the moment CourtCollect went from concept to real codebase — the first commit established the engineering foundation.",
    entities: ["GitHub", "CI/CD", "Jest", "GitHub Actions", "Vercel"],
    topicTags: ["CourtCollect", "Web Development"],
    messages: [
      { role: "user", text: "I want to set up the GitHub organization for CourtCollect today. I'm thinking a monorepo with the Next.js frontend and Supabase edge functions together. Can you help me plan the repo structure and get CI/CD running?" },
      { role: "ai", text: "Great call on the monorepo approach for this stage — it keeps deployment simple while you're the sole developer. Here's what I'd recommend for your repo structure:", extractions: [{ type: "entity", text: "monorepo", start: 18, end: 26 }] },
      { role: "ai", text: "```\ncourtcollect/\n├── apps/\n│   └── web/          # Next.js 14 app\n├── packages/\n│   └── db/           # Supabase types & migrations\n├── .github/\n│   └── workflows/\n│       └── ci.yml    # GitHub Actions\n├── turbo.json\n└── package.json\n```" },
      { role: "user", text: "Perfect. What should the CI pipeline look like? I want tests, linting, and auto-deploy to Vercel on merge to main." },
      { role: "ai", text: "Here's a GitHub Actions workflow that covers all three. The key decision is whether to gate deployments on test passage — I'd recommend yes, even though it slows things down slightly.", extractions: [{ type: "decision", text: "gate deployments on test passage", start: 80, end: 111 }] },
      { role: "user", text: "Yeah, let's gate it. I've been burned by shipping broken builds at Tyler. What testing framework do you recommend for this stack?" },
      { role: "ai", text: "For Next.js + Supabase, I'd go with Jest for unit tests and Playwright for e2e. Jest integrates cleanly with the Next.js toolchain, and Playwright handles the auth flows you'll need to test for multi-tenant access. Start with Jest — you can add Playwright once you have actual UI flows to test.", extractions: [{ type: "decision", text: "Jest for unit tests and Playwright for e2e", start: 46, end: 88 }] },
      { role: "user", text: "Makes sense. Let me push the initial commit and see if the pipeline runs. One more thing — should I set up branch protection rules now or wait?" },
      { role: "ai", text: "Set them up now. Future-you will thank present-you. Require PR reviews (even if it's just you reviewing your own after a beat), require CI to pass, and prevent force-pushes to main. It builds good habits and protects you when you're coding at 2am.", extractions: [{ type: "decision", text: "Require PR reviews", start: 52, end: 71 }] },
    ],
  },
  "courtcollect:3": {
    topicId: "courtcollect",
    eventIndex: 3,
    platform: "Claude",
    date: "2024-09-22",
    wordCount: 5180,
    whyItMatters: "The database schema became the backbone of the entire product — every feature since traces back to decisions made here.",
    entities: ["PostgreSQL", "Supabase", "RLS", "multi-tenant", "row-level security"],
    topicTags: ["CourtCollect", "Gov Tech & Policy"],
    messages: [
      { role: "user", text: "I need to design the core database schema for CourtCollect. The system needs to handle: courts (clients), cases with amounts owed, payments from defendants, and collection agency assignments. Multi-tenant is critical — agencies should only see their assigned cases." },
      { role: "ai", text: "This is a classic multi-tenant SaaS schema problem, but with a government twist — you need audit trails for everything. Let me walk through the core tables and then we'll handle the tenancy model.", extractions: [{ type: "entity", text: "multi-tenant SaaS schema", start: 19, end: 43 }] },
      { role: "user", text: "Exactly. And I need to think about Supabase's row-level security for the tenancy. Each collection agency should only see cases assigned to them, but court admins see everything." },
      { role: "ai", text: "Perfect use case for Supabase RLS. Here's my recommended approach: use a `tenant_id` column on every table, then write RLS policies that check the user's JWT claims against the tenant_id. Court admin roles bypass with a separate policy.", extractions: [{ type: "decision", text: "use a `tenant_id` column on every table", start: 56, end: 94 }, { type: "entity", text: "RLS policies", start: 101, end: 113 }] },
      { role: "user", text: "What about the payments table? Defendants might pay in installments, and we need to track which agency gets credit for the collection." },
      { role: "ai", text: "I'd model payments as a separate table with a foreign key to both the case and the collecting agency. Each payment record tracks: amount, date, method (online/in-person/mail), and a `collected_by` reference. This lets you run commission reports per agency and track partial payments against total owed." },
      { role: "user", text: "This is coming together. One concern — what if a case gets reassigned from one agency to another? We need history." },
      { role: "ai", text: "Add an `assignments` junction table instead of a direct agency-case link. Each row has: case_id, agency_id, assigned_date, unassigned_date (nullable), and status. Active assignment has null unassigned_date. This preserves full reassignment history and makes the audit trail trivial to query.", extractions: [{ type: "decision", text: "assignments junction table instead of a direct agency-case link", start: 7, end: 69 }] },
    ],
  },
  "tyler:5": {
    topicId: "tyler",
    eventIndex: 5,
    platform: "ChatGPT",
    date: "2024-09-20",
    wordCount: 4210,
    whyItMatters: "The Clearwater KS project became the template for all future data conversions — and later directly informed CourtCollect's import system.",
    entities: ["Clearwater KS", "data conversion", "legacy systems", "CSV", "SQL Server"],
    topicTags: ["Tyler Technologies", "Gov Tech & Policy"],
    messages: [
      { role: "user", text: "I'm working on the Clearwater Kansas data conversion for their municipal court. Their legacy system exports to CSV but the date formats are inconsistent and there are duplicate case numbers. How should I approach this?" },
      { role: "ai", text: "Data conversion for municipal courts is notoriously messy. Let me suggest a three-phase approach: 1) Profile the data to catalog inconsistencies, 2) Build a transformation pipeline with validation rules, 3) Run parallel testing against the legacy system before cutover." },
      { role: "user", text: "The date formats are the biggest headache. I'm seeing MM/DD/YYYY, M/D/YY, and even some with dashes. And about 200 cases have dates that seem wrong — like court dates in 1901." },
      { role: "ai", text: "The 1901 dates are almost certainly null/default values from the legacy SQL Server database — that's a known pattern. For the format inconsistencies, build a date parser that tries formats in order of frequency. Flag anything that doesn't parse for manual review rather than guessing.", extractions: [{ type: "entity", text: "SQL Server", start: 65, end: 75 }] },
      { role: "user", text: "Good catch on the 1901 dates. What about the duplicate case numbers? Some look like real duplicates (same defendant, same charges) and others seem like different cases that reused numbers." },
      { role: "ai", text: "You need a deduplication strategy. I'd suggest: match on case_number + defendant_last_name + charge_date. If all three match, it's a true duplicate — keep the most recent record. If only case_number matches, append a suffix (-A, -B) to preserve both. Document every merge and split decision for the court clerk to review.", extractions: [{ type: "decision", text: "match on case_number + defendant_last_name + charge_date", start: 43, end: 99 }] },
      { role: "user", text: "That makes sense. I think I'll build this as a reusable script since we have 4 more conversions coming up this quarter." },
      { role: "ai", text: "Smart. Parameterize the date format list and the deduplication rules. Each court will have different quirks, but the three-phase approach (profile → transform → validate) stays the same. Build a summary report that shows: records imported, duplicates merged, records flagged, and validation failures. The court clerks will want that paper trail.", extractions: [{ type: "decision", text: "Parameterize the date format list and the deduplication rules", start: 7, end: 68 }] },
    ],
  },
  "courtcollect:9": {
    topicId: "courtcollect",
    eventIndex: 9,
    platform: "Claude",
    date: "2024-12-01",
    wordCount: 3890,
    whyItMatters: "The pivot from technical builder to business storyteller — this conversation shaped how CourtCollect would be presented to investors.",
    entities: ["pitch deck", "TAM", "municipal courts", "SaaS metrics", "demo environment"],
    topicTags: ["CourtCollect", "Job Search"],
    messages: [
      { role: "user", text: "I need to build a pitch deck for CourtCollect. I have the product working but I've never pitched to investors before. Where do I start?" },
      { role: "ai", text: "Start with the problem, not the product. Investors need to feel the pain before they see the solution. For CourtCollect, the pain is quantifiable: municipal courts lose millions annually to outdated collections processes. Lead with that number." },
      { role: "user", text: "I know from my Tyler days that courts lose about 23% of collectible revenue to process inefficiency. Is that a strong enough hook?" },
      { role: "ai", text: "That's a strong hook — it's specific, credible (comes from your direct experience), and implies a large TAM. Frame it as: 'Municipal courts lose 23% of collectible revenue — that's $X billion nationally.' Then show how CourtCollect closes that gap. Your insider experience is your unfair advantage; make that explicit.", extractions: [{ type: "entity", text: "TAM", start: 127, end: 130 }, { type: "decision", text: "Lead with the 23% revenue loss statistic", start: 49, end: 89 }] },
      { role: "user", text: "What about the demo? I want something that feels real but I can't use actual court data obviously." },
      { role: "ai", text: "Build a demo environment with synthetic data that mirrors real patterns. Create 3-4 fictional courts with realistic case volumes, payment histories, and agency assignments. The key is making the data feel lived-in — include some overdue cases, partial payments, and recently assigned cases. Investors should see the dashboard and immediately understand the value.", extractions: [{ type: "decision", text: "synthetic data that mirrors real patterns", start: 31, end: 71 }] },
      { role: "user", text: "Great. I'll put together the deck this week and set up the demo environment. Any last thoughts on the presentation itself?" },
      { role: "ai", text: "Three things: 1) Keep it to 12 slides max — problem, solution, market, traction, team, ask. 2) Your 'team' slide is really about your unfair advantage: 100+ municipal court implementations at Tyler gave you domain expertise no competitor has. 3) End with a live demo, not more slides. Let the product speak." },
    ],
  },
};

// ─── REVIEW QUEUE DATA ──────────────────────────────────────
export const REVIEW_QUEUE_DATA = [
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
export const INSIGHT_DECISIONS = [
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

// ─── BELIEF DIFFS DATA ──────────────────────────────────────
export const BELIEF_DIFFS = [
  {
    id: "ai-tools",
    topic: "AI Development Tools",
    icon: "🤖",
    color: "#EC4899",
    earlier: { label: "Early 2024", date: "2024-03" },
    current: { label: "Late 2025", date: "2025-11" },
    lines: [
      { type: "removed", text: "ChatGPT is sufficient for all coding tasks" },
      { type: "removed", text: "One model fits every use case" },
      { type: "removed", text: "AI coding = copy-paste from chat into IDE" },
      { type: "context", text: "AI dramatically accelerates development" },
      { type: "context", text: "Prompt engineering is a real skill" },
      { type: "added", text: "Claude for architecture & system design, GPT for quick research" },
      { type: "added", text: "Specialized models for specific tasks (code gen, analysis, writing)" },
      { type: "added", text: "AI-in-the-loop workflows via n8n, not just chat interfaces" },
      { type: "added", text: "The model you use matters less than how you structure the conversation" },
    ],
  },
  {
    id: "automation",
    topic: "Automation Philosophy",
    icon: "⚡",
    color: "#A855F7",
    earlier: { label: "Mid 2024", date: "2024-06" },
    current: { label: "2025", date: "2025-09" },
    lines: [
      { type: "removed", text: "Automate everything with no-code tools" },
      { type: "removed", text: "If it can be automated, it should be" },
      { type: "removed", text: "No-code means no technical debt" },
      { type: "context", text: "Repetitive manual work is a waste of human attention" },
      { type: "context", text: "Good automation requires understanding the process first" },
      { type: "added", text: "Strategic automation — automate the boring, hand-craft the critical" },
      { type: "added", text: "No-code creates its own maintenance burden; choose deliberately" },
      { type: "added", text: "The best automation is invisible — users shouldn't know it's there" },
      { type: "added", text: "Build monitoring before you build automation" },
    ],
  },
  {
    id: "courtcollect-arch",
    topic: "CourtCollect Architecture",
    icon: "⚖️",
    color: "#F59E0B",
    earlier: { label: "Initial (Aug 2024)", date: "2024-08" },
    current: { label: "Current (Feb 2026)", date: "2026-02" },
    lines: [
      { type: "removed", text: "Monolith with REST API on Railway" },
      { type: "removed", text: "Single PostgreSQL database for everything" },
      { type: "removed", text: "Docker-based deployment pipeline" },
      { type: "removed", text: "Server-side rendered pages for all views" },
      { type: "context", text: "Supabase for auth and real-time features" },
      { type: "context", text: "Multi-tenant architecture with row-level security" },
      { type: "context", text: "Court staff and agency users have different access levels" },
      { type: "added", text: "Vercel + Supabase Cloud — serverless, not containerized" },
      { type: "added", text: "Event-driven with specialized microservices for payments" },
      { type: "added", text: "Separate data conversion pipeline (learned from Tyler)" },
      { type: "added", text: "API-first design enabling third-party integrations (Josephine TX)" },
    ],
  },
];

// ─── DECISION ARCHAEOLOGY CHAINS ────────────────────────────
export const ARCHAEOLOGY_CHAINS = {
  "why-typescript": {
    id: "why-typescript",
    title: "Why TypeScript?",
    summary: "From JavaScript frustration to full TypeScript adoption across all projects",
    icon: "🔷",
    color: "#3178C6",
    topicId: "webdev",
    resolution: "TypeScript became the default for all new projects after team scalability concerns crystallized",
    nodes: [
      {
        id: "ts-seed",
        role: "seed",
        date: "2023-03-14",
        title: "JavaScript type bugs in production",
        summary: "Spent 4 hours debugging a runtime TypeError that a type system would have caught at compile time. First expressed frustration with JS's lack of type safety.",
        topicId: "webdev",
        eventIndex: 0,
        confidence: 0.95,
        messages: 18,
        snippet: { user: "I just lost 4 hours to a bug where I passed a string to a function expecting a number. JavaScript didn't catch it.", ai: "This is a common pain point. TypeScript's static type checking would catch this at compile time..." },
      },
      {
        id: "ts-support-1",
        role: "supporting",
        date: "2023-06-22",
        title: "Tyler codebase refactor nightmare",
        summary: "Large-scale refactor at Tyler with no type annotations made changes terrifying. Every rename was a potential production bug.",
        topicId: "tyler",
        eventIndex: 2,
        confidence: 0.88,
        messages: 32,
        snippet: { user: "Refactoring this Tyler module is terrifying. No types, 200+ files, I have no idea what breaks when I rename something.", ai: "This is the exact scenario where TypeScript's refactoring tools shine. The compiler becomes your safety net..." },
      },
      {
        id: "ts-challenge-1",
        role: "challenging",
        date: "2023-09-10",
        title: "TypeScript config complexity pushback",
        summary: "Explored TS config and was frustrated by tsconfig complexity and the type gymnastics required for some patterns. Briefly considered staying with JS + JSDoc.",
        topicId: "webdev",
        eventIndex: 3,
        confidence: 0.72,
        messages: 24,
        snippet: { user: "This tsconfig.json has 47 options and I don't understand half of them. Is TypeScript really worth this complexity?", ai: "The configuration complexity is a valid concern. However, a strict but minimal config covers 90% of use cases..." },
      },
      {
        id: "ts-support-2",
        role: "supporting",
        date: "2024-02-18",
        title: "Team onboarding friction with untyped code",
        summary: "Discussed how untyped codebases create onboarding bottlenecks. Types serve as living documentation that scales with team size.",
        topicId: "webdev",
        eventIndex: 5,
        confidence: 0.91,
        messages: 28,
        snippet: { user: "New developer on the project can't understand the data flow. No types, no docs, just 'read the code.'", ai: "Types are self-documenting contracts. With TypeScript interfaces, new team members can understand data shapes instantly..." },
      },
      {
        id: "ts-resolution",
        role: "resolution",
        date: "2024-08-25",
        title: "TypeScript as default for all new projects",
        summary: "CourtCollect, Keymaster, and Atlas all started as TypeScript-first. The decision crystallized: the upfront cost is worth the long-term safety and developer experience.",
        topicId: "courtcollect",
        eventIndex: 2,
        confidence: 0.97,
        messages: 42,
        snippet: { user: "Starting CourtCollect. TypeScript from day one — I'm never starting a project in plain JS again.", ai: "Strong choice. TypeScript-first means you catch integration bugs early, especially with Supabase's generated types..." },
      },
    ],
  },
  "why-event-driven": {
    id: "why-event-driven",
    title: "Why event-driven architecture?",
    summary: "From monolithic pain to event-driven design for CourtCollect's payment and notification systems",
    icon: "⚡",
    color: "#F59E0B",
    topicId: "courtcollect",
    resolution: "Event-driven architecture adopted for CourtCollect after monolith scaling issues at Tyler and successful pub/sub prototyping",
    nodes: [
      {
        id: "eda-seed",
        role: "seed",
        date: "2023-04-20",
        title: "Tyler monolith pain points",
        summary: "First articulated frustration with Tyler's monolithic architecture — a payment processing change required redeploying the entire application.",
        topicId: "tyler",
        eventIndex: 1,
        confidence: 0.90,
        messages: 22,
        snippet: { user: "Changing one payment field at Tyler requires a full app redeploy. The monolith is killing our deployment velocity.", ai: "This is the classic monolith coupling problem. Event-driven architectures decouple these concerns..." },
      },
      {
        id: "eda-support-1",
        role: "supporting",
        date: "2024-01-12",
        title: "Pub/sub research for notification systems",
        summary: "Researched event-driven patterns for handling court notifications. Discovered that pub/sub decouples the 'what happened' from the 'who cares.'",
        topicId: "webdev",
        eventIndex: 6,
        confidence: 0.85,
        messages: 36,
        snippet: { user: "I need courts to get notified when a payment comes in, but I don't want the payment service to know about courts.", ai: "Classic use case for pub/sub. The payment service publishes a 'payment.received' event, courts subscribe independently..." },
      },
      {
        id: "eda-challenge-1",
        role: "challenging",
        date: "2024-06-05",
        title: "Event-driven complexity concerns",
        summary: "Pushed back on event-driven complexity. Debugging distributed events is harder than debugging a monolith. Considered whether the complexity was justified for a one-person project.",
        topicId: "webdev",
        eventIndex: 8,
        confidence: 0.78,
        messages: 20,
        snippet: { user: "Debugging events across services sounds like a nightmare for a solo developer. Am I over-engineering this?", ai: "Valid concern. For a solo project, start with a modular monolith that uses events internally, not across services..." },
      },
      {
        id: "eda-support-2",
        role: "supporting",
        date: "2024-09-08",
        title: "Supabase Realtime as lightweight event bus",
        summary: "Discovered that Supabase Realtime provides a lightweight event system without the overhead of Kafka or RabbitMQ. This made event-driven practical for a solo developer.",
        topicId: "courtcollect",
        eventIndex: 1,
        confidence: 0.93,
        messages: 30,
        snippet: { user: "Supabase has real-time subscriptions built in. Could I use this as a lightweight event bus instead of standing up Kafka?", ai: "Absolutely. Supabase Realtime with database triggers gives you event-driven semantics without infrastructure overhead..." },
      },
      {
        id: "eda-resolution",
        role: "resolution",
        date: "2024-11-20",
        title: "Event-driven commitment for CourtCollect",
        summary: "Committed to event-driven architecture for CourtCollect's payment processing and notification systems. Used Supabase triggers + edge functions as the event backbone.",
        topicId: "courtcollect",
        eventIndex: 6,
        confidence: 0.96,
        messages: 44,
        snippet: { user: "The event-driven approach with Supabase triggers is working beautifully for payments. When a payment comes in, the agency portal updates automatically.", ai: "This validates the architecture. The decoupling means you can add new subscribers (email notifications, audit logs) without touching payment code..." },
      },
    ],
  },
  "why-vercel": {
    id: "why-vercel",
    title: "Why Vercel over Docker?",
    summary: "From Docker containerization struggles to serverless simplicity with Vercel",
    icon: "▲",
    color: "#10B981",
    topicId: "courtcollect",
    resolution: "Pivoted to Vercel after 3 days of Docker deployment pain, embracing serverless as the right fit for the project's scale",
    nodes: [
      {
        id: "v-seed",
        role: "seed",
        date: "2024-10-01",
        title: "Initial Docker + Railway deployment plan",
        summary: "Started with the assumption that containerized deployment was the 'professional' choice. Began setting up multi-stage Docker builds.",
        topicId: "courtcollect",
        eventIndex: 4,
        confidence: 0.82,
        messages: 26,
        snippet: { user: "Setting up Docker for CourtCollect. Multi-stage build with Prisma client generation. This is how real apps deploy, right?", ai: "Docker is a solid choice for predictable environments. Here's a multi-stage Dockerfile optimized for Next.js..." },
      },
      {
        id: "v-support-1",
        role: "supporting",
        date: "2024-10-20",
        title: "Tyler deployment complexity flashbacks",
        summary: "Reflected on how Tyler's deployment pipeline was overengineered for its actual needs. Drew parallels to CourtCollect's Docker setup.",
        topicId: "tyler",
        eventIndex: 5,
        confidence: 0.75,
        messages: 14,
        snippet: { user: "Tyler had a 20-step deployment checklist. I'm building the same kind of complexity for CourtCollect with Docker.", ai: "If a solo developer needs a 20-step deploy, the tooling is fighting you. Serverless platforms eliminate most of those steps..." },
      },
      {
        id: "v-challenge-1",
        role: "challenging",
        date: "2024-11-14",
        title: "Docker debugging marathon — 3 days lost",
        summary: "Three days of Docker build failures. Prisma client conflicted with multi-stage builds, node_modules issues, Railway cold starts.",
        topicId: "courtcollect",
        eventIndex: 7,
        confidence: 0.99,
        messages: 68,
        snippet: { user: "Day 3 of Docker issues. Prisma client generation breaks in the production stage. Railway cold starts are 8+ seconds. I'm losing my mind.", ai: "After 3 days of friction, it's worth reconsidering the deployment strategy entirely. Vercel + Supabase Cloud would eliminate all of these issues..." },
      },
      {
        id: "v-resolution",
        role: "resolution",
        date: "2024-11-16",
        title: "Pivoted to Vercel — deployed in 20 minutes",
        summary: "Switched to Vercel. What took 3 days with Docker was done in 20 minutes. The pivot validated that simpler infrastructure was the right choice.",
        topicId: "courtcollect",
        eventIndex: 8,
        confidence: 0.98,
        messages: 35,
        snippet: { user: "Switched to Vercel. Deployed CourtCollect in 20 minutes. Three days of Docker hell replaced by a git push.", ai: "This is a textbook example of right-sizing your infrastructure. Vercel's serverless model fits Next.js + Supabase perfectly..." },
      },
    ],
  },
};

// ─── MONTHLY THINKING DIGEST DATA ──────────────────────────
export const DIGEST_DATA = [
  {
    id: "feb-2026",
    month: "February 2026",
    generating: true,
    stats: { conversations: 18, newTopics: 0, pivots: 0, insights: 2 },
    newTopics: [],
    deepened: [
      { topicId: "courtcollect", name: "CourtCollect", icon: "⚖️", color: "#F59E0B", delta: "+6 conversations", detail: "Josephine TX integration and agency portal refinements" },
      { topicId: "jobsearch", name: "Job Search", icon: "💼", color: "#EF4444", delta: "+4 conversations", detail: "Interview pipeline strategy updates" },
    ],
    goneQuiet: [],
    decisions: [
      { text: "GovTech market positioning finalized for CourtCollect", topicId: "govtech", color: "#64748B" },
    ],
    pivots: [],
    connections: [
      { from: "CourtCollect", to: "Gov Tech & Policy", label: "GovTech narrative alignment", color: "#F59E0B" },
    ],
  },
  {
    id: "jan-2026",
    month: "January 2026",
    theme: "Heavy CourtCollect Sprint",
    stats: { conversations: 47, newTopics: 0, pivots: 1, insights: 5 },
    newTopics: [],
    deepened: [
      { topicId: "courtcollect", name: "CourtCollect", icon: "⚖️", color: "#F59E0B", delta: "+12 conversations", detail: "Clearwater KS data conversion, collections agency portal MVP, Josephine TX integration" },
      { topicId: "jobsearch", name: "Job Search", icon: "💼", color: "#EF4444", delta: "+8 conversations", detail: "TransUnion 3rd round, Veritone prep, pipeline management" },
      { topicId: "resumes", name: "Resumes & Cover Letters", icon: "📄", color: "#F97316", delta: "+5 conversations", detail: "Portfolio narrative refinement and helping others" },
      { topicId: "automation", name: "AI Automation", icon: "🤖", color: "#EC4899", delta: "+3 conversations", detail: "Personal productivity system with integrated AI assistants" },
    ],
    goneQuiet: [
      { topicId: "gamedev", name: "Dice or Die", icon: "🎲", color: "#8B5CF6", lastActive: "Jan 5", detail: "Monetization strategy was last touch — waiting for CourtCollect to stabilize" },
      { topicId: "writing", name: "Creative Writing", icon: "✍️", color: "#FB923C", lastActive: "Jan 5", detail: "Professional bio iterations, but no creative work" },
    ],
    decisions: [
      { text: "Portfolio narrative refined — leading with 100+ implementations story", topicId: "resumes", color: "#F97316" },
      { text: "Consulting income cash flow projections completed", topicId: "finance", color: "#84CC16" },
      { text: "Personal productivity system architecture selected", topicId: "automation", color: "#EC4899" },
    ],
    pivots: [
      { text: "HMPRG: Shifted budget from Facebook to Instagram (3:1 outperformance)", topicId: "hmprg", color: "#3B82F6", before: "Even split across Meta platforms", after: "Instagram-heavy allocation" },
    ],
    connections: [
      { from: "CourtCollect", to: "Tyler Technologies", label: "Clearwater KS data conversion leveraged Tyler expertise", color: "#F59E0B" },
      { from: "Job Search", to: "CourtCollect", label: "Portfolio piece for interview narratives", color: "#EF4444" },
    ],
  },
  {
    id: "dec-2025",
    month: "December 2025",
    theme: "The Claude-Native Shift",
    stats: { conversations: 58, newTopics: 0, pivots: 2, insights: 4 },
    newTopics: [],
    deepened: [
      { topicId: "courtcollect", name: "CourtCollect", icon: "⚖️", color: "#F59E0B", delta: "+9 conversations", detail: "Demo prep, pitch deck creation, investor-ready demo environment" },
      { topicId: "jobsearch", name: "Job Search", icon: "💼", color: "#EF4444", delta: "+7 conversations", detail: "Post-Tyler transition planning, master resume overhaul" },
      { topicId: "obsidian", name: "Knowledge Mgmt", icon: "🧠", color: "#14B8A6", delta: "+4 conversations", detail: "Obsidian vault architecture decisions, AI + PKM integration ideas" },
    ],
    goneQuiet: [
      { topicId: "keymaster", name: "Keymaster", icon: "🔐", color: "#10B981", lastActive: "Dec 5", detail: "Project paused — prioritizing CourtCollect and job search" },
    ],
    decisions: [
      { text: "Tyler departure — knowledge capture and institutional docs completed", topicId: "tyler", color: "#6366F1" },
      { text: "CourtCollect pitch: lead with 23% revenue loss statistic", topicId: "courtcollect", color: "#F59E0B" },
      { text: "Obsidian vault folder structure and tagging system finalized", topicId: "obsidian", color: "#14B8A6" },
    ],
    pivots: [
      { text: "Keymaster shelved to focus on CourtCollect + job search", topicId: "keymaster", color: "#10B981", before: "Active development on browser extension", after: "Project paused indefinitely" },
      { text: "Shifted from ChatGPT-primary to Claude-primary workflow", topicId: "webdev", color: "#06B6D4", before: "ChatGPT for most development tasks", after: "Claude for architecture & long sessions, ChatGPT for quick research" },
    ],
    connections: [
      { from: "Tyler Technologies", to: "CourtCollect", label: "Domain expertise transfer crystallized in pitch deck", color: "#6366F1" },
      { from: "Knowledge Mgmt", to: "AI Automation", label: "PKM + AI integration concept emerged", color: "#14B8A6" },
      { from: "Job Search", to: "Resumes & Cover Letters", label: "Application materials pipeline established", color: "#EF4444" },
    ],
  },
  {
    id: "oct-2025",
    month: "October 2025",
    theme: "Automation Deep-Dive",
    stats: { conversations: 52, newTopics: 0, pivots: 1, insights: 3 },
    newTopics: [],
    deepened: [
      { topicId: "automation", name: "AI Automation", icon: "🤖", color: "#EC4899", delta: "+8 conversations", detail: "AI-for-good nonprofit concept, client reporting automation" },
      { topicId: "n8n", name: "n8n & Airtable", icon: "⚡", color: "#A855F7", delta: "+6 conversations", detail: "Complex multi-step workflows, error handling patterns" },
      { topicId: "hmprg", name: "HMPRG Campaigns", icon: "🏥", color: "#3B82F6", delta: "+5 conversations", detail: "Campaign performance analysis and content calendar" },
    ],
    goneQuiet: [
      { topicId: "finance", name: "Personal Finance", icon: "💰", color: "#84CC16", lastActive: "Aug 2025", detail: "Tax strategies settled, no active financial planning" },
      { topicId: "tyler", name: "Tyler Technologies", icon: "🏢", color: "#6366F1", lastActive: "Sep 2025", detail: "Winding down, approaching departure" },
    ],
    decisions: [
      { text: "Strategic automation philosophy: automate the boring, hand-craft the critical", topicId: "automation", color: "#EC4899" },
      { text: "n8n for simple pipelines, custom code for complex logic", topicId: "n8n", color: "#A855F7" },
    ],
    pivots: [
      { text: "From 'automate everything' to strategic automation", topicId: "automation", color: "#EC4899", before: "If it can be automated, it should be", after: "Automate the boring, hand-craft the critical" },
    ],
    connections: [
      { from: "n8n & Airtable", to: "AI Automation", label: "Workflow tooling matured into automation philosophy", color: "#A855F7" },
      { from: "HMPRG Campaigns", to: "n8n & Airtable", label: "Campaign reporting automated via n8n pipeline", color: "#3B82F6" },
    ],
  },
];

// ─── PIVOT ENTRIES (FULL-FORMAT DECISION JOURNAL) ───────────
export const PIVOT_ENTRIES = [
  {
    id: "pivot-claude-shift",
    date: "Dec 2025",
    topicId: "webdev",
    topicName: "Web Development",
    topicIcon: "🌐",
    topicColor: "#06B6D4",
    title: "Shifted from ChatGPT-primary to Claude-primary workflow",
    before: "ChatGPT for most development tasks, including architecture and debugging",
    trigger: "A week-long architecture session with Claude on CourtCollect showed dramatically better context retention and code quality. Claude handled the multi-tenant RLS schema design in a single session that took three ChatGPT conversations to approximate.",
    after: "Claude for architecture & long sessions, ChatGPT for quick research and one-off questions",
    annotation: "Claude's long-context window changed everything. The ability to hold an entire codebase in context meant fewer repeated explanations. ChatGPT is still faster for quick lookups, but anything requiring sustained reasoning goes to Claude now.",
    impact: ["CourtCollect", "AI Automation", "Knowledge Mgmt"],
    annotated: true,
  },
  {
    id: "pivot-automation-philosophy",
    date: "Oct 2025",
    topicId: "automation",
    topicName: "AI Automation",
    topicIcon: "🤖",
    topicColor: "#EC4899",
    title: "From 'automate everything' to strategic automation",
    before: "If it can be automated, it should be — spent weeks building complex n8n workflows for edge cases",
    trigger: "An n8n workflow for client reporting broke silently for 2 weeks. The maintenance burden of over-automated systems became clear when a simple manual process would have taken 5 minutes per week.",
    after: "Automate the boring, hand-craft the critical. Only automate processes that are truly repetitive and where failure is detectable.",
    annotation: null,
    impact: ["n8n & Airtable", "HMPRG Campaigns"],
    annotated: false,
  },
  {
    id: "pivot-keymaster-shelved",
    date: "Dec 2025",
    topicId: "keymaster",
    topicName: "Keymaster",
    topicIcon: "🔐",
    topicColor: "#10B981",
    title: "Keymaster shelved to focus on CourtCollect + job search",
    before: "Active development on browser extension with weekly progress milestones",
    trigger: "Tyler departure accelerated job search timeline. CourtCollect became the primary portfolio piece. Available hours dropped by 60% and Keymaster wasn't generating revenue.",
    after: "Project paused indefinitely — code archived, learnings documented for potential resume",
    annotation: null,
    impact: ["CourtCollect", "Job Search"],
    annotated: false,
  },
  {
    id: "pivot-hmprg-budget",
    date: "Jan 2026",
    topicId: "hmprg",
    topicName: "HMPRG Campaigns",
    topicIcon: "🏥",
    topicColor: "#3B82F6",
    title: "Shifted budget from Facebook to Instagram (3:1 outperformance)",
    before: "Even split across Meta platforms — running similar campaigns on both Facebook and Instagram",
    trigger: "Q4 2025 analytics showed Instagram Stories outperforming Facebook feed ads by 3:1 on CPE. The HMPRG target demographic (healthcare workers 25-45) was engaging far more on Instagram.",
    after: "Instagram-heavy allocation with Facebook for retargeting only",
    annotation: null,
    impact: ["AI Automation"],
    annotated: false,
  },
];

// ─── PRE-FLIGHT BRIEFINGS DATA ──────────────────────────────
export const BRIEFINGS = {
  courtcollect: {
    summary: "CourtCollect is your municipal court collections SaaS platform, built on Supabase + Next.js with a serverless Vercel deployment. You've completed the agency portal MVP with multi-tenant RLS, onboarded two pilot courts (Clearwater KS and Josephine TX), and pivoted away from Docker after a painful Railway experience. The architecture is now event-driven with API-first design enabling third-party integrations. You're the sole developer, leveraging your 100+ Tyler Technologies implementations as domain expertise.",
    decisions: [
      "Chose Supabase + Next.js over Firebase and AWS Amplify (Sep 2024)",
      "Pivoted from Docker + Railway to Vercel + Supabase Cloud after 3 days of issues (Nov 2024)",
      "Multi-tenant architecture with row-level security and tenant_id on every table",
      "Assignments junction table instead of direct agency-case link for audit history",
      "Gated deployments on test passage — CI must pass before merge",
      "TypeScript with strict checking for type safety in multi-tenant data models",
    ],
    openQuestions: [
      "Payment processing edge cases for partial payments across reassigned agencies",
      "When to introduce pub/sub for background event processing vs. keeping serverless",
      "Pricing model for courts — per-case vs. flat monthly vs. percentage of collections",
      "How to handle data migration from legacy systems at scale beyond pilot courts",
    ],
    connections: [
      { topicId: "tyler", summary: "Domain expertise from 100+ municipal implementations directly informs product design" },
      { topicId: "govtech", summary: "Policy requirements and procurement processes shape go-to-market strategy" },
      { topicId: "webdev", summary: "Tech stack decisions flow from your React/Next.js/Supabase experience" },
      { topicId: "jobsearch", summary: "CourtCollect serves as a key portfolio piece in applications" },
    ],
    lastActivity: { date: "Feb 3, 2026", title: "Josephine TX integration", summary: "API design and data mapping for City of Josephine." },
    suggestedPrompt: "Continue from where we left off on CourtCollect — last time we were designing the API integration for Josephine TX. I want to discuss how to generalize the data mapping layer so onboarding new courts is faster. Also, I'm hitting edge cases with partial payment calculations when cases get reassigned between agencies.",
  },
  jobsearch: {
    summary: "You're in an active job search after leaving Tyler Technologies in December 2024, targeting Customer Success Manager and Implementation Manager roles in GovTech and adjacent SaaS. You've built a strong application pipeline with tailored materials, completed multiple rounds at TransUnion and Veritone, and refined your narrative around 100+ municipal software implementations. Your strategy balances traditional job search with consulting and CourtCollect as a startup path.",
    decisions: [
      "Focus on CSM/Implementation Manager roles leveraging GovTech domain expertise",
      "Rebuilt resume from scratch emphasizing 100+ Tyler implementations (Dec 2024)",
      "Created modular cover letter framework for rapid tailoring per role",
      "Positioned CourtCollect as entrepreneurial initiative, not just side project",
      "Shifted LinkedIn profile toward GovTech + AI narrative",
    ],
    openQuestions: [
      "Whether to pursue full-time employment or go all-in on CourtCollect consulting",
      "How to handle the gap narrative — framing the transition positively",
      "Which offer criteria matter most: salary, equity, remote flexibility, or mission alignment",
      "Should you expand search beyond GovTech into broader B2B SaaS?",
    ],
    connections: [
      { topicId: "resumes", summary: "Application materials are continuously refined based on interview feedback" },
      { topicId: "tyler", summary: "100+ implementations provide the core experience narrative" },
      { topicId: "courtcollect", summary: "Demonstrates entrepreneurial initiative and technical ability" },
    ],
    lastActivity: { date: "Feb 2, 2026", title: "Interview debrief & strategy update", summary: "Assessed pipeline status across active applications." },
    suggestedPrompt: "Let's do a job search pipeline review. I want to assess where each active application stands, identify which roles I should prioritize follow-ups on, and discuss whether my current positioning is working or if I need to adjust my narrative for the next round of applications.",
  },
  automation: {
    summary: "Your automation philosophy has evolved from 'automate everything with no-code' to 'strategic automation — automate the boring, hand-craft the critical.' You use n8n for data pipelines and repetitive workflows (Bluesky analytics, HMPRG reporting) but write custom code for complex business logic. You've built a personal productivity system integrating calendar, tasks, and AI assistants, and you're exploring LLM-in-the-loop automation patterns for document classification and content processing.",
    decisions: [
      "Strategic automation philosophy: no-code for simple pipelines, code for complex logic",
      "n8n as primary workflow automation tool over Zapier and Make (Jun 2024)",
      "Automated HMPRG campaign reporting via Meta Ads API → n8n → formatted reports",
      "Build monitoring before building automation",
      "AI-in-the-loop workflows via n8n rather than pure chat interfaces",
    ],
    openQuestions: [
      "How to productize automation consulting for nonprofits (AI-for-good concept)",
      "Best patterns for error handling in multi-step n8n workflows at scale",
      "Whether to build a unified personal automation dashboard or keep tools separate",
      "How Claude API integration with n8n changes the automation possibilities",
    ],
    connections: [
      { topicId: "n8n", summary: "Primary tool for implementing workflow automations" },
      { topicId: "hmprg", summary: "Client reporting automation is the most production-tested use case" },
      { topicId: "obsidian", summary: "PKM + AI integration explores automated knowledge extraction" },
      { topicId: "courtcollect", summary: "Event-driven architecture decisions informed by automation experience" },
    ],
    lastActivity: { date: "Jan 20, 2025", title: "Personal productivity system", summary: "Integrated calendar, tasks, and AI assistants." },
    suggestedPrompt: "I want to revisit my automation stack. I've been using the Claude API with n8n for document classification — let's discuss patterns for building reliable LLM-in-the-loop workflows. Specifically, how to handle model failures gracefully and when to fall back to deterministic processing.",
  },
  hmprg: {
    summary: "HMPRG (Health and Medicine Policy Research Group) is your digital marketing client focused on the RAPID-IL campaign for Illinois youth health career pathways. You've run Meta ad campaigns, built a YouTube content series, and managed a multi-platform social media presence. Instagram significantly outperforms Facebook (3:1), leading to a budget reallocation. Recent focus has been on landing page conversion optimization with measurable results.",
    decisions: [
      "Shifted ad budget to 70/30 Instagram-heavy after 3:1 performance ratio (Jan 2025)",
      "YouTube video series format for health career spotlight content",
      "$800 Meta advertising budget targeting Illinois youth demographics",
      "3-month rolling content calendar across Instagram, Facebook, LinkedIn",
      "Redesigned conversion funnel, improving CTR by 40%",
    ],
    openQuestions: [
      "Whether to expand beyond Meta to TikTok for reaching younger demographics",
      "How to measure long-term impact beyond click-through rates",
      "Sustainability of current content production pace with available resources",
      "Whether AI-generated content could supplement the video production pipeline",
    ],
    connections: [
      { topicId: "automation", summary: "Campaign reporting automated via n8n + Meta Ads API" },
      { topicId: "webdev", summary: "Landing page optimization draws on web development skills" },
      { topicId: "n8n", summary: "Analytics pipeline built on n8n → Airtable for reporting" },
    ],
    lastActivity: { date: "Feb 1, 2026", title: "Landing page optimization", summary: "Redesigned conversion funnel. Improved CTR by 40%." },
    suggestedPrompt: "Let's review the HMPRG campaign performance for Q1 2026. I want to analyze whether the Instagram-heavy budget allocation is still optimal, discuss the landing page changes and their impact on conversion rates, and plan the next content calendar cycle.",
  },
};

// ─── CONTRADICTION DETECTION DATA ────────────────────────────
export const CONTRADICTIONS_INITIAL = [
  {
    id: "contradiction-1",
    type: "hard",
    severity: "high",
    topic: "CourtCollect Architecture",
    topicId: "courtcollect",
    icon: "⚖️",
    color: "#F59E0B",
    summary: "In March you explicitly decided against microservices. Your last 3 conversations assume a microservices architecture.",
    earlier: {
      date: "2024-11-16",
      position: "Monolith-first approach — \"serverless for the web layer, managed services for data.\" Explicitly rejected microservices as premature for a solo developer.",
      source: { topicId: "courtcollect", topicName: "CourtCollect", title: "Pivoted to Vercel deployment", conversationDate: "Nov 2024" },
    },
    current: {
      date: "2026-01-28",
      position: "Recent conversations reference \"the payments microservice\" and \"separate data conversion pipeline\" as distinct services with independent deployment.",
      source: { topicId: "courtcollect", topicName: "CourtCollect", title: "Josephine TX integration planning", conversationDate: "Jan 2026" },
    },
    resolution: null,
  },
  {
    id: "contradiction-2",
    type: "soft",
    severity: "medium",
    topic: "Automation Philosophy",
    topicId: "automation",
    icon: "🤖",
    color: "#EC4899",
    summary: "Your early conversations emphasized no-code tools. Recent conversations are increasingly code-heavy. Intentional evolution?",
    earlier: {
      date: "2024-06-10",
      position: "\"Automate everything with no-code tools\" — strong preference for n8n and Airtable over custom code for all automation needs.",
      source: { topicId: "automation", topicName: "AI Automation", title: "No-code automation strategy", conversationDate: "Jun 2024" },
    },
    current: {
      date: "2026-01-20",
      position: "Recent workflows use Claude API with custom Python scripts. Last 5 automation conversations involve writing code, not configuring n8n.",
      source: { topicId: "automation", topicName: "AI Automation", title: "Claude API integration for n8n workflows", conversationDate: "Jan 2026" },
    },
    resolution: null,
  },
  {
    id: "contradiction-3",
    type: "stale",
    severity: "medium",
    topic: "n8n & Airtable",
    topicId: "n8n",
    icon: "⚡",
    color: "#A855F7",
    summary: "This conversation references your Airtable setup, but you migrated away from Airtable 4 months ago.",
    earlier: {
      date: "2024-08-22",
      position: "Airtable was the primary data store for automation pipelines — Bluesky analytics, HMPRG reporting, personal CRM all lived in Airtable bases.",
      source: { topicId: "n8n", topicName: "n8n & Airtable", title: "Bluesky → Airtable pipeline", conversationDate: "Aug 2024" },
    },
    current: {
      date: "2025-10-15",
      position: "Migrated analytics to Supabase and reporting to direct API integrations. Airtable bases are now read-only archives, but recent conversations still reference \"updating the Airtable base.\"",
      source: { topicId: "n8n", topicName: "n8n & Airtable", title: "Pipeline migration to Supabase", conversationDate: "Oct 2025" },
    },
    resolution: null,
  },
  {
    id: "contradiction-4",
    type: "hard",
    severity: "low",
    topic: "Job Search",
    topicId: "jobsearch",
    icon: "💼",
    color: "#EF4444",
    summary: "You decided to focus exclusively on GovTech roles, but your last 2 applications were to general B2B SaaS companies.",
    earlier: {
      date: "2025-01-15",
      position: "\"Focus on CSM/Implementation Manager roles leveraging GovTech domain expertise\" — explicitly narrowed search to government technology sector.",
      source: { topicId: "jobsearch", topicName: "Job Search", title: "Job search strategy refinement", conversationDate: "Jan 2025" },
    },
    current: {
      date: "2026-02-02",
      position: "Recent applications include a B2B SaaS company (Veritone) and a health-tech startup outside the GovTech space.",
      source: { topicId: "jobsearch", topicName: "Job Search", title: "Interview debrief & strategy update", conversationDate: "Feb 2026" },
    },
    resolution: null,
  },
];

export const CONTRADICTION_TYPE_CONFIG = {
  hard: { label: "Hard Contradiction", color: "#EF4444", icon: "⊘", bgAlpha: "0.06" },
  soft: { label: "Soft Drift", color: "#F97316", icon: "◎", bgAlpha: "0.05" },
  stale: { label: "Stale Assumption", color: "#A855F7", icon: "⏳", bgAlpha: "0.05" },
};

export const RESOLUTION_OPTIONS = [
  { id: "pivot", label: "Intentional Pivot", icon: "↻", desc: "I consciously changed direction" },
  { id: "evolution", label: "Updated My Thinking", icon: "◇", desc: "My thinking evolved naturally" },
  { id: "correction", label: "Good Catch, Fix It", icon: "✓", desc: "This drift was unintentional" },
];

// ─── FRESHNESS & STALENESS ───────────────────────────────────
export const FRESHNESS_CONFIG = {
  active:   { label: "Active",   color: "#10B981", icon: "●" },
  cooling:  { label: "Cooling",  color: "#F59E0B", icon: "◐" },
  dormant:  { label: "Dormant",  color: "#64748B", icon: "○" },
  archived: { label: "Archived", color: "#475569", icon: "◻" },
};

export const MONTH_MAP = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
export const DEMO_NOW = new Date(2026, 1, 7); // Feb 7 2026 — the demo "today"

export const getTopicFreshness = (topic) => {
  if (topic.archived) return "archived";
  const [m, y] = topic.lastSeen.split(" ");
  const last = new Date(parseInt(y), MONTH_MAP[m], 28);
  const days = Math.floor((DEMO_NOW - last) / 864e5);
  if (days <= 30) return "active";
  if (days <= 90) return "cooling";
  return "dormant";
};

export const getInsightStaleness = (dateStr) => {
  const d = new Date(dateStr);
  const months = Math.round((DEMO_NOW - d) / (864e5 * 30.44));
  if (months >= 6) return `This was made ${months} months ago — still relevant?`;
  return null;
};

// Simulated uncurated-conversation counts per topic since last review
export const RECURATION_COUNTS = {
  courtcollect: 5, hmprg: 3, jobsearch: 7, webdev: 4, automation: 2,
};

// New events surfaced after an incremental sync (demo data)
export const SYNC_NEW_EVENTS = {
  courtcollect: { date: "2026-02-07", title: "Payment processing edge case fix", summary: "Resolved edge case in partial payment calculations for Josephine TX accounts.", type: "build", messages: 18 },
  automation: { date: "2026-02-06", title: "Claude API integration for n8n workflows", summary: "Connected Claude API to n8n for automated document classification.", type: "build", messages: 24 },
  jobsearch: { date: "2026-02-07", title: "Follow-up strategy after second interview", summary: "Prepared targeted follow-up materials with portfolio highlights.", type: "decision", messages: 12 },
};

// ─── TOPIC CURATION DATA ────────────────────────────────────
export const CURATED_PALETTE = [
  "#F59E0B", "#3B82F6", "#EF4444", "#8B5CF6", "#10B981",
  "#EC4899", "#F97316", "#6366F1", "#14B8A6", "#84CC16",
  "#A855F7", "#06B6D4", "#FB923C", "#64748B", "#E11D48",
  "#0EA5E9", "#D946EF", "#22C55E",
];

// Mini-sparkline activity data per topic (last 6 months relative values)
export const TOPIC_SPARKLINES = {
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
export const SPLIT_SUGGESTIONS = {
  webdev: { into: ["Frontend", "DevOps"], icons: ["🎨", "🔧"] },
  automation: { into: ["AI Tools", "Workflow Automation"], icons: ["🤖", "⚡"] },
  govtech: { into: ["Public Policy", "GovTech Products"], icons: ["📜", "🏛️"] },
};

// Suggested merges (pairs that could be combined)
export const MERGE_SUGGESTIONS = [
  { from: "n8n", into: "automation", suggestedName: "AI & Workflow Automation" },
  { from: "resumes", into: "jobsearch", suggestedName: "Career & Applications" },
];

export const DEMO_PERSONAS = [
  { id: "power", label: "Power User", convos: "3,847", detail: "3 years · ChatGPT + Claude", icon: "⚡", color: "#FBBF24", enabled: true },
  { id: "new", label: "New User", convos: "200", detail: "3 months · ChatGPT only", icon: "🌱", color: "#10B981", enabled: true },
  { id: "team", label: "Team Lead", convos: "—", detail: "Multi-user · Coming soon", icon: "👥", color: "#8B5CF6", enabled: false },
];

export const LOAD_PIPELINE = [
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

export const PHASE_META = {
  parse: { label: "PARSING", color: "#3B82F6", icon: "📄" },
  normalize: { label: "NORMALIZING", color: "#10B981", icon: "🔄" },
  enrich: { label: "ENRICHING", color: "#FBBF24", icon: "🧠" },
  connect: { label: "CONNECTING", color: "#A855F7", icon: "🔗" },
  build: { label: "BUILDING", color: "#EC4899", icon: "✨" },
};

export const VAULT_TREE = [
  { type: "folder", name: "Atlas Vault", children: [
    { type: "file", name: "🗺️ Map of Content.md", content: "# Map of Content\n\nYour curated knowledge atlas — 14 topics, 3,847 conversations.\n\n## Topic Index\n- [[CourtCollect]] — ⚖️ 47 conversations\n- [[HMPRG Campaigns]] — 🏥 38 conversations\n- [[Job Search]] — 💼 62 conversations\n- [[Dice or Die]] — 🎲 23 conversations\n- [[Keymaster]] — 🔐 18 conversations\n- [[AI Automation]] — 🤖 34 conversations\n\n## Connections\n- [[CourtCollect]] ↔ [[Tyler Technologies]] — Domain expertise transferred\n- [[Job Search]] ↔ [[Resumes & Cover Letters]] — Application materials\n- [[n8n & Airtable]] ↔ [[AI Automation]] — Workflow tooling\n\n## Evolution\nSee [[Evolution Timeline]] for your journey from Learner → Meta-Thinker." },
    { type: "folder", name: "CourtCollect", children: [
      { type: "file", name: "⚖️ CourtCollect.md", content: "# CourtCollect\n\n**Category:** Product · **Depth:** 4.2 · **Status:** Active\n\n47 conversations · 128,400 words · Aug 2024 – Feb 2026\n\n## Key Decisions\n- Architecture: Supabase + Next.js — [[2024-09-15 Architecture decisions]]\n- Pivoted from Docker/Railway → Vercel — [[2024-11-16 Deployment pivot]]\n\n## Connections\n- [[Tyler Technologies]] — Domain expertise transferred (strength: 0.9)\n- [[Gov Tech & Policy]] — Policy requirements (strength: 0.7)\n- [[Web Development]] — Tech stack decisions (strength: 0.6)" },
      { type: "file", name: "2024-09-15 Architecture decisions.md", content: "# Architecture decisions — Supabase + Next.js\n\n**Date:** 2024-09-15 · **Type:** Decision · **Messages:** 42\n\nChose tech stack after evaluating options. Selected Supabase for backend with Next.js frontend.\n\n**Extracted Entities:** Supabase, Next.js, PostgreSQL, Vercel\n\n**Related:** [[CourtCollect]] · [[Web Development]]" },
    ]},
    { type: "folder", name: "Job Search", children: [
      { type: "file", name: "💼 Job Search.md", content: "# Job Search\n\n**Category:** Career · **Depth:** 3.5 · **Status:** Active\n\n62 conversations · 142,000 words · Dec 2024 – Feb 2026\n\n## Key Decisions\n- Master resume overhaul emphasizing 100+ implementations\n- Strategic applications: OpenGov, Granicus, Veritone, TransUnion\n\n## Connections\n- [[Resumes & Cover Letters]] — Application materials (strength: 0.95)\n- [[Tyler Technologies]] — Experience narratives (strength: 0.7)" },
    ]},
    { type: "folder", name: "AI Automation", children: [
      { type: "file", name: "🤖 AI Automation.md", content: "# AI Automation\n\n**Category:** Tech · **Depth:** 3.6 · **Status:** Active\n\n34 conversations · 89,500 words · Jun 2024 – Feb 2026\n\n## Connections\n- [[n8n & Airtable]] — Workflow tooling (strength: 0.8)\n- [[HMPRG Campaigns]] — Campaign automation (strength: 0.6)\n- [[Knowledge Mgmt]] — PKM + AI integration (strength: 0.5)" },
    ]},
    { type: "file", name: "Evolution Timeline.md", content: "# Evolution Timeline\n\nYour thinking evolution across 6 phases:\n\n## The Learner (Jan – Jun 2023)\nMostly how-to questions. 371 conversations.\n\n## The Practitioner (Jul – Dec 2023)\nBuilding real things. 483 conversations.\n\n## The Builder (Jan – Jun 2024)\nLaunched Keymaster and automation projects. 548 conversations.\n\n## The Architect (Jul – Dec 2024)\nMulti-project orchestration. 726 conversations.\n\n## The Strategist (Jan – Jun 2025)\nAI as thinking partner, not just tool. 520 conversations.\n\n## The Meta-Thinker (Jul 2025 – Feb 2026)\nDesigning systems to extract knowledge. 480 conversations." },
  ]},
];

export const EXPORT_FORMATS = [
  { id: "obsidian", label: "Obsidian", icon: "💎", desc: "Vault with wikilinks & MOC", ext: ".md" },
  { id: "markdown", label: "Markdown", icon: "📝", desc: "Plain markdown files", ext: ".md" },
  { id: "json", label: "JSON", icon: "{ }", desc: "Structured data export", ext: ".json" },
  { id: "csv", label: "CSV", icon: "📊", desc: "Spreadsheet-compatible", ext: ".csv" },
];

export const TOUR_STEPS = [
  { title: "Welcome to Atlas", description: "Let's take a quick tour of your AI Knowledge Atlas. We'll highlight the key features that make this platform unique.", icon: "🗺️" },
  { title: "Navigation", description: "Switch between views: Overview for your dashboard, Connections for your knowledge graph, Evolution for decisions & milestones, Search, and Export.", icon: "◈", target: "[data-tour='nav']" },
  { title: "Knowledge Map", description: "Your topics are visualized as interactive bubbles — sized by conversation count. Click any topic to dive into its timeline.", icon: "🧠", target: "[data-tour='knowledge-map']" },
  { title: "AI Journey", description: "Track your activity over time and see the shift between AI platforms. The heatmap reveals your thinking patterns across months.", icon: "📊", target: "[data-tour='ai-journey']" },
  { title: "Human-Curated Pipeline", description: "This is what makes Atlas different. Every insight passes through your curation — the AI proposes, you decide. Your knowledge base is human-verified, not just AI-generated.", icon: "⚖️", highlight: true },
  { title: "Quick Navigation", description: "Press ⌘K (or Ctrl+K) anytime to open the command palette. Jump to any topic or view instantly.", icon: "⌕", target: "[data-tour='cmd-k']" },
  { title: "Incremental Sync", description: "Atlas isn't a one-time tool. Hit Sync to pull in new conversations and keep your knowledge base current.", icon: "⟳", target: "[data-tour='sync']" },
  { title: "You're All Set!", description: "Explore your 3 years of AI conversations, mapped and curated. Your mind, your atlas.", icon: "✨" },
];

export const TOUR_STORAGE_KEY = "atlas_tour_completed";
