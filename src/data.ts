import { Course, MarketingTool, WorkspaceJob, CommunityPost, BlogPost, AIPrompt } from "./types";

export const COURSES: Course[] = [
  {
    id: "dm-1",
    title: "The Ultimate Full-Stack Digital Marketing Academy",
    description: "Learn traffic acquisition, content positioning, performance marketing, SEO schemas, funnel building, conversion math, and automation from scratch.",
    category: "Digital Marketing",
    instructor: "Yamini Katara",
    difficulty: "All Levels",
    duration: "40 hrs",
    lessonsCount: 12,
    rating: 4.9,
    studentsEnrolled: 1840,
    price: 4999,
    originalPrice: 19999,
    enrolled: true,
    progress: 45,
    lessons: [
      { id: "dml-1", title: "Introduction to Brand Positioning & UVP", duration: "25 min", type: "video", url: "https://example.com/videos/1", completed: true },
      { id: "dml-2", title: "Funnel Engineering: TOFU, MOFU, and BOFU Layout", duration: "40 min", type: "video", url: "https://example.com/videos/2", completed: true },
      { id: "dml-3", title: "Copywriting Frameworks: AIDA vs PAS", duration: "18 min", type: "audio", url: "https://example.com/videos/3", completed: true },
      { id: "dml-4", title: "Lead Generation Architectures & CRM Capture", duration: "32 min", type: "video", url: "https://example.com/videos/4", completed: true },
      { id: "dml-5", title: "Setting up Google Analytics 4 (GA4)", duration: "45 min", type: "video", url: "https://example.com/videos/5", completed: false },
      { id: "dml-6", title: "Email Nurturing & Dynamic Campaign Automation", duration: "30 min", type: "video", url: "https://example.com/videos/6", completed: false },
      { id: "dml-7", title: "Interactive Campaign Case Study (B2B SaaS)", duration: "50 min", type: "pdf", url: "https://example.com/videos/7", completed: false }
    ],
    resources: [
      { name: "High-Converting Landings Checklist.pdf", type: "PDF", url: "#" },
      { name: "30-Day Content Matrix Strategy.xlsx", type: "Spreadsheet", url: "#" }
    ]
  },
  {
    id: "seo-1",
    title: "Advanced SEO, AEO & GEO Masterclass",
    description: "Deep dive into technical SEO, structured markup headers, voice search (AEO), and Generative Engine Optimization (GEO) to dominate Perplexity, Gemini, and Google Search.",
    category: "Search Engine Optimization",
    instructor: "Yamini Katara",
    difficulty: "Advanced",
    duration: "25 hrs",
    lessonsCount: 8,
    rating: 4.8,
    studentsEnrolled: 1250,
    price: 3499,
    originalPrice: 14999,
    enrolled: false,
    progress: 0,
    lessons: [
      { id: "seol-1", title: "SEO Fundamentals vs. AI Search Disruption", duration: "35 min", type: "video", url: "", completed: false },
      { id: "seol-2", title: "Local SEO, Google Map Packs, & Schema Markups", duration: "45 min", type: "video", url: "", completed: false },
      { id: "seol-3", title: "Optimizing for Answers: AEO Blueprint", duration: "28 min", type: "audio", url: "", completed: false },
      { id: "seol-4", title: "Generative Engine Optimization (GEO): Content Credibility Elements", duration: "50 min", type: "video", url: "", completed: false },
      { id: "seol-5", title: "Technical Auditing and Web Core Vitals Optimizations", duration: "40 min", type: "video", url: "", completed: false }
    ],
    resources: [
      { name: "FAQ & Local Schema Generator Template.txt", type: "Text", url: "#" },
      { name: "GEO Content Optimization Guideline.pdf", type: "PDF", url: "#" }
    ]
  },
  {
    id: "ai-1",
    title: "Generative AI for Digital Marketers & Growth Hackers",
    description: "Incorporate ChatGPT, Claude, Gemini, Midjourney, Canva AI, and specialized agents directly to double your workflow speed and visual asset generation.",
    category: "Generative AI",
    instructor: "Yamini Katara",
    difficulty: "Intermediate",
    duration: "18 hrs",
    lessonsCount: 10,
    rating: 4.95,
    studentsEnrolled: 2110,
    price: 3999,
    originalPrice: 15999,
    enrolled: false,
    progress: 0,
    lessons: [
      { id: "ail-1", title: "Mastering Large Language Models (LLMs) & Prompts", duration: "30 min", type: "video", url: "", completed: false },
      { id: "ail-2", title: "Custom GPT and Gemini Agent Workforces", duration: "45 min", type: "video", url: "", completed: false },
      { id: "ail-3", title: "Midjourney Visual Direction & Stylization parameters", duration: "35 min", type: "video", url: "", completed: false },
      { id: "ail-4", title: "Automating Content Writing with Canva AI & Copy.ai", duration: "25 min", type: "video", url: "", completed: false }
    ],
    resources: [
      { name: "Ultimate Master Prompt Playbook.pdf", type: "PDF", url: "#" },
      { name: "AI Agent Workforce Workspace Schema.png", type: "Image", url: "#" }
    ]
  },
  {
    id: "ads-1",
    title: "Meta & Google Performance Ads Framework",
    description: "Launch, structure, analyze, scale and optimize your Meta Pixel, custom conversions, Lookalikes, and and Google Search/Performance Max campaigns.",
    category: "Performance Ads",
    instructor: "Yamini Katara",
    difficulty: "Intermediate",
    duration: "30 hrs",
    lessonsCount: 14,
    rating: 4.75,
    studentsEnrolled: 1420,
    price: 4499,
    originalPrice: 16999,
    enrolled: false,
    progress: 0,
    lessons: [
      { id: "adsl-1", title: "Pixel Setup and Conversions API (CAPI)", duration: "30 min", type: "video", url: "", completed: false },
      { id: "adsl-2", title: "Meta Campaign Structure: CBO vs ABO Strategies", duration: "40 min", type: "video", url: "", completed: false },
      { id: "adsl-3", title: "Google Search Ads & Bidding Framework", duration: "35 min", type: "video", url: "", completed: false },
      { id: "adsl-4", title: "Performance Max Creative Quality Matrices", duration: "45 min", type: "video", url: "", completed: false }
    ],
    resources: [
      { name: "Ad Spend & ROAS Projection Sheets.xlsx", type: "Spreadsheet", url: "#" }
    ]
  }
];

export const MARKETING_TOOLS: MarketingTool[] = [
  {
    id: "meta-ads",
    name: "Conversion Meta Ad Copy Generator",
    description: "Input your business parameters, target audience, and specialty terms to generate instant high-conversion Meta ad copies using elite psychological hook models.",
    category: "Ads",
    icon: "Megaphone",
    fields: [
      { name: "businessName", label: "Business or Product Name", type: "text", placeholder: "e.g. FitTrack App" },
      { name: "offer", label: "Core Offer / Irresistible Deal", type: "text", placeholder: "e.g. Try for free for 14 days, then get 30% off" },
      { name: "audience", label: "Target Audience Demographics", type: "text", placeholder: "e.g. Busy corporate desk workers aged 25-40" },
      { name: "tone", label: "Tone of Copy", type: "select", options: ["High Energy & Direct", "Problem-Solving & Professional", "Witty & Relatable", "Premium & Sophisticated"] }
    ]
  },
  {
    id: "seo-keywords",
    name: "SEO Semantic Keyword Architect",
    description: "Create structured topic clusters, primary & secondary transactional keywords, search intents, SEO difficulties, and long-tail FAQs to guide your content blueprint.",
    category: "SEO",
    icon: "Key",
    fields: [
      { name: "topic", label: "Core Theme or Business Niche", type: "text", placeholder: "e.g. Eco-friendly cleaning products" },
      { name: "region", label: "Target Region/Country", type: "text", placeholder: "e.g. India / United States" },
      { name: "intent", label: "Target Search Intent Focus", type: "select", options: ["Commercial (Transactional & High Intent)", "Informational (Blogs & Guides)", "Mixed Intent"] }
    ]
  },
  {
    id: "email-sequence",
    name: "Automated Lead Nurture Sequence Writer",
    description: "Create a copy for a complete 3-step high-converting onboarding and email marketing follow-up sequence to convert cold subscribers into paid advocates.",
    category: "Content",
    icon: "Mail",
    fields: [
      { name: "productName", label: "Product or Academy Name", type: "text", placeholder: "e.g. Digital Marketing Mastery" },
      { name: "benefit", label: "Primary Pain Point Solved & Core Benefit", type: "textarea", placeholder: "e.g. Earn 2-3 Lakhs/month freelancing without a formal college degree" },
      { name: "targetAudience", label: "Ideal Buyer Persona", type: "text", placeholder: "e.g. College graduates and young professionals" }
    ]
  },
  {
    id: "landing-page",
    name: "Viral Landing Page Headline & Copy Outline",
    description: "Draft structural text elements of your main website funnel: hero headers, social proof callouts, features-to-benefits lists, and CTA prompts.",
    category: "Strategy",
    icon: "LayoutTemplate",
    fields: [
      { name: "productName", label: "Product Name", type: "text", placeholder: "e.g. Yamini's 1-on-1 Mentorship Club" },
      { name: "problem", label: "Core Problem/Gap", type: "text", placeholder: "e.g. Spending money on ads without converting any leads" },
      { name: "uvp", label: "Unique Value Proposition (UVP)", type: "textarea", placeholder: "e.g. Absolute hands-on digital campaign practice with real money on live clients." }
    ]
  },
  {
    id: "marketing-strategy",
    name: "30-Day Growth Marketing Roadmap",
    description: "Formulate your omnichannel business plan layout: traffic focuses, organic distribution hacks, budget projections, and key key performance indicators (KPIs).",
    category: "Strategy",
    icon: "Compass",
    fields: [
      { name: "brandName", label: "Brand / Startup Name", type: "text", placeholder: "e.g. Organic Yamini Spices" },
      { name: "niche", label: "Core Market Niche", type: "text", placeholder: "e.g. Handmilled preservative-free cooking spices" },
      { name: "competitor", label: "Key Major Competitor", type: "text", placeholder: "e.g. Eastern Spices / MDH" },
      { name: "budget", label: "Initial Monthly Budget", type: "select", options: ["Bootstrap / Organic focuses", "$100 to $500", "$500 to $2000", "$2000+"] }
    ]
  },
  {
    id: "interview-prep",
    name: "Digital Marketing Interview Coach",
    description: "Practice answering questions for digital marketing managers, performance specialists, or AI prompt architect roles with standard AI feedback.",
    category: "Career",
    icon: "Brain",
    fields: [
      { name: "candidateLevel", label: "Your Current Level", type: "select", options: ["Fresher / Job Seeker", "Mid-Level Professional", "Senior Consultant"] },
      { name: "specialty", label: "Job Specialization Target", type: "text", placeholder: "e.g. Meta & Analytics expert" }
    ]
  }
];

export const WORKSPACE_JOBS: WorkspaceJob[] = [
  {
    id: "job-1",
    title: "Senior Digital Marketing Manager",
    company: "Dzylo Media Solutions",
    type: "Full-time",
    location: "Bangalore (Hybrid)",
    salary: "₹12,00,000 - ₹16,00,000 / year",
    experience: "4-6 Years",
    skills: ["Meta Ads", "Google Ads Engine", "GA4", "Marketing Automation", "Content Blueprinting"],
    description: "Looking for an energetic performance marketer who can deploy up to 15 Lakhs of ad spend monthly. Immediate joiner preferred.",
    link: "#",
    createdAt: "2026-05-26T06:00:00Z"
  },
  {
    id: "job-2",
    title: "AI Automation & Prompt Engineer Intern",
    company: "DigiYamini Partner Agency",
    type: "Internship",
    location: "Mumbai / Remote",
    salary: "₹15,000 - ₹25,000 / month",
    experience: "Freshers / Academy Students",
    skills: ["ChatGPT", "Midjourney", "Zapier Automation", "Schema Markup"],
    description: "Exclusively open to Digital Yamini Certified learners. Work alongside Yamini Katara on active client accounts to streamline copy creation and workflow automations.",
    link: "#",
    createdAt: "2026-05-27T02:00:00Z"
  },
  {
    id: "job-3",
    title: "SEO, AEO & Conversion Catalyst (Freelance)",
    company: "Apex Tech Labs",
    type: "Freelance",
    location: "Remote",
    salary: "₹40,000 / flat project",
    experience: "1-2 Years",
    skills: ["Local SEO", "GEO Content Strategy", "JSON-LD Schemas", "Technical Auditing"],
    description: "Re-architect our company blog to rank on Perplexity and Gemini search results, plus boost our ranking on local search indices.",
    link: "#",
    createdAt: "2026-05-25T11:00:00Z"
  }
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    author: "Siddharth Goel",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    authorTitle: "E-Commerce Startup Owner",
    content: "Sharing an incredible milestone! Applied Yamini'sPAS Copywriting Framework with Midjourney visual assets on my latest Instagram campaign. My CPC dropped from ₹18 down to ₹4.60, and we bagged 23 orders within 48 hours! Generative AI + Digital Marketing is an absolute superpower setup. 🔥",
    likes: 84,
    comments: 14,
    tags: ["Success Story", "Meta Ads", "Generative AI"],
    createdAt: "2 Hours ago",
  },
  {
    id: "post-2",
    author: "Kriti Sen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    authorTitle: "SEO Freelancer Candidate",
    content: "Has anyone implemented the modern GEO guidelines (Generative Engine Optimization) yet? I just added high-authority citations and FAQ schemas on my blogs. Looking to see how Perplexity indexes it in their next pull. Let's debate in the comments!",
    likes: 56,
    comments: 29,
    tags: ["SEO", "AEO", "GEO"],
    createdAt: "5 Hours ago"
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "The Death of Keyword Stuffing: How GEO and AEO are Redefining Search",
    excerpt: "With search models like Perplexity and Search GPT rising, classic key stuffing is dead. Learn how citations and user query mappings win search battles in 2026.",
    category: "SEO",
    author: "Yamini Katara",
    readTime: "6 min read",
    date: "Feb 24, 2026",
    content: `Search Engine Optimization is shifting into Generative Engine Optimization. 
    Users are no longer clicking classic blue links; they are reading direct curated summaries from Gemini, Claude, and Perplexity. 
    To win traffic, digital marketers must:
    1. Focus on deep expert citations & statistical proof
    2. Write directly for the Answer Engines using explicit Q&A formats
    3. Generate rich structural JSON-LD structures to enable models to crawl data effortlessly.`
  },
  {
    id: "blog-2",
    title: "How to Build High-Converting AI Ad Agents in 2026",
    excerpt: "Automated ads are scaling at unprecedented speeds. Find out how to configure custom GPT engines to write and cycle creative copy variations in micro-budgets.",
    category: "AI",
    author: "Yamini Katara",
    readTime: "8 min read",
    date: "May 12, 2026",
    content: `Performance advertising on platforms like Meta is heavily moving towards automated broad targeting. 
    The real leverage is the ad creative copy and thumbnail hooks. 
    Using AI assistants to construct Hook-Story-Offer segments and running systematic visual templates enables teams to run dynamic testing frameworks for pennies on the dollar.`
  }
];

export const AIPROMPTS: AIPrompt[] = [
  {
    id: "pr-1",
    title: "Ultimate Meta Ads Hook Generator Prompt",
    category: "Meta Ads",
    prompt: "Act as a world-class performance marketing copywriter. Write 5 scroll-stopping hooks for my [Product/Service] solving the pain point of [Target Pain Point]. Use the Hook-Story-Offer model."
  },
  {
    id: "pr-2",
    title: "Technical Schema Creator Schema Prompt",
    category: "SEO",
    prompt: "Generate a fully valid JSON-LD FAQ schema for the following question-answers list of my website about [Topic]. Return inside clean typescript/JSON tags."
  },
  {
    id: "pr-3",
    title: "30-Day Automated Content Calendar Formula Prompt",
    category: "Content Writing",
    prompt: "Create a 4-week thematic social media content matrix for [Niche]. For each post, map the psychological funnel stage (TOFU, MOFU, or BOFU), suggest a visual layout concept, and write standard outline keywords."
  },
  {
    id: "pr-4",
    title: "B2B Cold Email Campaign Sequence Prompt",
    category: "Email Marketing",
    prompt: "Write a high-converting cold outreach email targeting [Decision Maker Title] at [Industry Sector Companies] showcasing our value proposition to boost [Value Metrix e.g. Conversion rate / Organic traffic] by 40%."
  }
];
