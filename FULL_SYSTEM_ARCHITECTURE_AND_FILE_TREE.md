# FULL_SYSTEM_ARCHITECTURE_AND_FILE_TREE.md
# ResumeForge AI & GrowXLabs: Complete System Architecture, File Tree & Feature Specification

**Document Version:** 1.0.0  
**Generated:** October 2026  
**Status:** Living Canonical Specification  
**Platform URL:** `https://resumeforgeai.in` / `http://localhost:3000`

---

## 1. Executive System Architecture Overview

ResumeForgeAI is an **AI-Native Autonomous Career Intelligence Operating System** engineered with a unified **3-Pillar Triad**:

1. **ResumeForge (The Asset):** Canonical candidate profile, dynamic ATS score dial (0-100), keyword taxonomy optimizer, and headless vector PDF rendering.
2. **JobForge (The Target):** Live Google-grounded market vacancies, job description ingestion, and application lifecycle tracking.
3. **Omni Agent (The Autopilot Brain):** Central LLM agent with typed tool-calling, absorbing coding sandboxes, mock interviews, study roadmaps, portfolio projects, and salary negotiation into real-time interactive chat artifacts.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (Next.js 14)                            │
│                                                                                        │
│   ┌─────────────────────┐      ┌─────────────────────────────┐      ┌────────────────┐ │
│   │     ResumeForge     │      │         Omni Agent          │      │    JobForge    │ │
│   │  (Profile & ATS)    │      │ (Master Autonomous Brain)   │      │ (Target & ATS) │ │
│   └──────────┬──────────┘      └──────────────┬──────────────┘      └────────┬───────┘ │
└──────────────┼────────────────────────────────┼──────────────────────────────┼─────────┘
               │                                │                              │
               ▼                                ▼                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                SERVER / API ROUTE DISPATCHER                           │
│                                                                                        │
│   • /api/mentorforge/chat (SSE Stream)   • /api/resume/download  • /api/jobs/search    │
│   • /api/mentorforge/history             • /api/ats-live/analyze • /api/run-code       │
└───────────────────────────────────────────────┬────────────────────────────────────────┘
                                                │
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  LIB / AI-CORE ORCHESTRATION                           │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ agent-loop.ts (Autonomous ReAct Loop with Fallback Provider Chain)             │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
│                                           │ Dispatches Typed Tools                     │
│                                           ▼                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ tools/registry.ts (Server-side execution registry)                             │   │
│   │  • audit_resume_ats           • search_job_market     • trigger_study_plan     │   │
│   │  • tailor_resume_for_job      • run_code_sandbox      • generate_project_...   │   │
│   │  • trigger_resume_generation  • trigger_mock_interview• negotiate_salary_offer │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌────────────────────────────────────────┐
│            AI PROVIDER ROUTER         │       │          EXECUTION SANDBOXES           │
│                                       │       │                                        │
│  • OpenAI (GPT-5.6 Luna / GPT-4o)     │       │  • Judge0 Remote Sandbox Compilers     │
│  • Google Gemini (2.0 Flash / Pro)    │       │    (Python, JS, Java, C++, C)          │
│  • OpenRouter / Groq / Mistral / DS   │       │  • Headless Chromium PDF Generator     │
└───────────────────┬───────────────────┘       └───────────────────┬────────────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               PERSISTENCE & EXTERNAL SERVICES                          │
│                                                                                        │
│   • Supabase Postgres (Auth, Users, Resumes, Scores, Jobs, Applications, Memory)       │
│   • Brevo Transactional Email Gateway + Resend Newsletter Engine                      │
│   • Razorpay & Stripe Multi-Currency Payment Gateways                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Omni Agent Tool-Calling & Interactive Artifact Architecture

When candidates converse with Omni Agent, the agent does **not** simply output plain text. It emits typed tool executions that render rich, client-side interactive **Artifact Cards**:

```
Candidate Prompt: "Audit my resume for ATS and tailor it for Google Senior Full-Stack role"
                             │
                             ▼
               Omni Agent (gemini-2.0-flash / gpt-5.6-luna)
                             │
                             ▼
                 Emits Tool Call: audit_resume_ats
                             │
                             ▼
         Server Executes: lib/ai-core/tools/registry.ts
                             │
                             ▼
               Streams SSE Event to Client: { artifacts: [...] }
                             │
                             ▼
       MentorForgeClient.tsx Dynamically Renders Artifact Card:
┌───────────────────────────────────────────────────────────────────────┐
│ 📄 Resume ATS Compatibility Audit Card                                 │
│ ┌──────────────────────┐  Score: 84 / 100 (Strong Baseline)           │
│ │   (84) ATS Dial      │  Delta: +18 pts with recommended keywords    │
│ └──────────────────────┘                                              │
│ • Matched Skills:  [React] [TypeScript] [Next.js] [PostgreSQL]        │
│ • Missing Skills:  [Kafka] [Distributed Tracing] [K8s]                │
│ • Actionable Enhancements: 3 quantified KPI improvements applied       │
│                                                                       │
│ [ Download Vector PDF ]     [ 1-Click Tailor for Google Senior SDE ]  │
└───────────────────────────────────────────────────────────────────────┘
```

### The 7 Registered In-Chat Artifact Cards:
1. **`ResumeArtifactCard.tsx`:** Interactive ATS score dial (0-100), score category badge, keyword matching chips, action item checklist, direct vector PDF download, and link to resume studio.
2. **`CodingArtifactCard.tsx`:** Problem statement display, starter code copying, Judge0 execution sandbox (pass/fail status, runtime in ms, stdout, stderr, and test cases diff table).
3. **`InterviewArtifactCard.tsx`:** Live question rounds, Bar Raiser evaluation across the STAR rubric (Situation, Task, Action, Result), strengths & weaknesses, and expandable exemplary answers.
4. **`JobArtifactCard.tsx`:** Real-time Google-grounded job listings with company badges, location, snippet, portal apply link, and 1-click **"Tailor Resume for this Role"** autonomous chaining.
5. **`LearningArtifactCard.tsx`:** Interactive multi-week curriculum roadmap, progress bar, clickable milestone checklists, and 1-click **"Practice Coding on this Topic"** drill trigger.
6. **`ProjectArtifactCard.tsx`:** Industry-grade portfolio project blueprint, tech stack chips, directory architecture, tabbed starter code viewer with 1-click copy, and ProjectForge link.
7. **`SalaryArtifactCard.tsx`:** 3-column compensation delta dial (Baseline vs. Recommended Counter vs. Target Goal), market benchmark percentile insights, leverage points, and copyable counter script.

---

## 3. Existing Features Catalog

### A. ResumeForge (The Asset Engine)
- **Multi-Template Vector PDF Engine:** Harvard, Stanford, Modern, Executive, Minimal Divider, Compact, Academic, and ATS-Light.
- **Live ATS Score Analyzer:** Lexical keyword extraction, section presence verification, bullet point impact quantification, and score calculation.
- **Dynamic Bullet Point Rewriter:** Converts passive descriptions into active STAR bullet points with measurable metrics.
- **Direct PDF Export API:** Generates clean, ATS-scannable PDFs via `/api/resume/download?id=...`.
- **Deduplicated Resume Storage:** Preserves candidate resume iterations in Supabase `resumes` table.

### B. JobForge (The Target Engine)
- **Grounded Live Job Search:** Real-time job search powered by Google Search grounding through Gemini.
- **Application Status Pipeline:** Tracks candidate applications across statuses: `Saved`, `Applied`, `Interviewing`, `Offered`, `Rejected`.
- **Job Match Scoring:** Automatically calculates ATS alignment between candidate's active resume and target role.
- **Job Alerts:** Custom alerts based on title, geography, and salary expectations.

### C. Omni Agent (Master Autonomous Operating System)
- **Unified Command Center:** `/mentorforge` client interface with streaming AI responses and real-time Agent Activity Panel.
- **Long-Term Memory Graph:** Supabase `mentor_memory` table tracking candidate weaknesses, strengths, target roles, and progress.
- **Cross-Forge Autonomous Chaining:** Seamless transitions from Job Search &rarr; Resume Tailoring &rarr; Mock Interview &rarr; Coding Drill.
- **Multi-Provider AI Router:** Automatic failover across Gemini, OpenRouter, Groq, Mistral, Together, and DeepSeek.

### D. Auxiliary Absorbed Engines (Available as Agent Tools & Pages)
- **CodingForge:** Judge0 compiler integration supporting Python, JavaScript, Java, C++, and C with automated test suites.
- **InterviewForge:** Big Tech Bar Raiser mock interview simulator with STAR evaluation framework and voice support.
- **StudyForge / LearnForge:** Structured multi-week study roadmaps with milestone check-offs.
- **ProjectForge:** Full-stack starter project generator with folder hierarchies and code files.
- **SalaryForge:** Executive compensation benchmarking and offer letter counter-negotiation scripts.

### E. Commercial, Payment & Communication Systems
- **Dual Payment Engine:** Razorpay (India / INR) and Stripe (Global / USD) with automated invoice generation and coupon discount engine.
- **Email Infrastructure:** Brevo Transactional Email Gateway (v3) for invoices/auth + Resend isolated blog broadcast engine.
- **Streak & Gamification:** Activity logging and daily streak tracking for continuous user engagement.
- **Internationalization (i18n):** Route localization across `/en-in`, `/en-us`, and customizable language files.

---

## 4. Complete Annotated Project File Tree

```
c:\ResumeForgeAi\ai-resume-builder\
│
├── AGENT_ERA_BLUEPRINT.md               # Strategic blueprint on agent-era business model & $1M ARR path
├── DESIGN.md                            # Design tokens, typography, and UI guidelines
├── package.json                         # Dependencies, scripts (Next.js 14, Tailwind, Supabase, Lucide)
├── tailwind.config.ts                   # Tailwind CSS design system tokens
├── tsconfig.json                        # TypeScript configuration
├── middleware.ts                        # Next.js i18n and authentication route protection middleware
│
├── app/                                 # Next.js 14 App Router
│   ├── globals.css                      # Global styles, mesh gradients, scrollbar styling
│   ├── layout.tsx                       # Root layout with theme and toast providers
│   │
│   ├── [locale]/                        # Localized application routes
│   │   ├── page.tsx                     # Landing Page (v2 with AutoSend design system)
│   │   │
│   │   ├── (auth)/                      # Authentication routes
│   │   │   ├── login/                   # Login page
│   │   │   ├── signup/                  # Signup page
│   │   │   ├── forgot-password/         # Password recovery
│   │   │   └── reset-password/          # Password reset
│   │   │
│   │   ├── (dashboard)/                 # Authenticated User Dashboard
│   │   │   ├── layout.tsx               # Dashboard sidebar shell & navigation wrapper
│   │   │   ├── mentorforge/             # ⚡ OMNI AGENT: Master autonomous chat & artifact dashboard
│   │   │   │   ├── page.tsx
│   │   │   │   └── MentorForgeClient.tsx# Core client dispatcher for Omni Agent & all 7 Artifact Cards
│   │   │   ├── resumeforge/             # 📄 RESUMEFORGE: Interactive builder & ATS score studio
│   │   │   ├── resumes/                 # Resume list & manager
│   │   │   ├── ats-live/                # Real-time ATS scoring & comparison tool
│   │   │   ├── jobforge/                # 💼 JOBFORGE: Live jobs & application pipeline
│   │   │   ├── jobs/                    # Job listings explorer
│   │   │   ├── dashboard-jobs/          # Job dashboard
│   │   │   ├── codingforge/             # Coding practice & Judge0 sandbox interface
│   │   │   ├── interviewforge/          # Mock interview practice arena
│   │   │   ├── mock-interview/          # Interactive interview simulator
│   │   │   ├── studyforge/              # Study roadmaps & curriculum tracker
│   │   │   ├── learnforge/              # Learning paths
│   │   │   ├── projectforge/            # Portfolio project generator & studio
│   │   │   ├── salaryforge/             # Salary negotiator & compensation benchmarks
│   │   │   ├── careerforge/             # Career roadmaps
│   │   │   ├── recruiter/               # Recruiter candidate viewing portal
│   │   │   ├── account/                 # User profile & settings
│   │   │   └── api-keys/                # Developer API keys management
│   │   │
│   │   ├── blogs/                       # SEO blog articles & technical guides
│   │   ├── privacy-policy/              # Privacy policy page
│   │   ├── terms-of-service/            # Terms of service page
│   │   └── cookie-policy/               # Cookie policy page
│   │
│   └── api/                             # Serverless Backend Endpoints
│       ├── mentorforge/
│       │   ├── chat/route.ts            # SSE streaming Omni Agent loop dispatcher
│       │   └── history/route.ts         # Agent conversation history & artifact retrieval
│       ├── resume/
│       │   ├── download/route.ts        # Vector PDF generation & download
│       │   └── optimize/route.ts        # AI resume optimization
│       ├── resumes/route.ts             # CRUD operations on candidate resumes
│       ├── ats-live/analyze/route.ts    # Instant ATS scoring endpoint
│       ├── jobs/route.ts                # Grounded job market query API
│       ├── run-code/route.ts            # Judge0 code execution proxy
│       ├── mock-interview/route.ts      # Multi-turn mock interview session API
│       ├── projectforge/generate/route.ts# Full-stack portfolio project generation
│       ├── salaryforge/negotiate/route.ts# Salary negotiation strategy API
│       ├── payment/                     # Razorpay & Stripe checkout & webhook handlers
│       ├── invoices/route.ts            # PDF invoice generation
│       ├── newsletter/route.ts          # Waitlist & newsletter subscription
│       └── auth/                        # Supabase auth session endpoints
│
├── components/                          # UI & Agent Components
│   ├── agent/                           # 🤖 OMNI AGENT ARTIFACT CARDS
│   │   ├── ResumeArtifactCard.tsx       # ATS dial, keyword delta, PDF download
│   │   ├── CodingArtifactCard.tsx       # Judge0 test execution & code sandbox runner
│   │   ├── InterviewArtifactCard.tsx    # STAR rubric scorecard & Bar Raiser model answers
│   │   ├── JobArtifactCard.tsx          # Live job cards with 1-click resume tailoring
│   │   ├── LearningArtifactCard.tsx     # Curriculum roadmaps & milestone checklists
│   │   ├── ProjectArtifactCard.tsx      # Portfolio project blueprints & code viewer
│   │   └── SalaryArtifactCard.tsx       # Compensation dial & counter script generator
│   │
│   ├── ui/                              # Core design system primitives
│   │   ├── Button.tsx                   # Reusable button with variants
│   │   ├── Card.tsx                     # Card container
│   │   ├── Badge.tsx                    # Status badges
│   │   ├── Sidebar.tsx                  # Global navigation sidebar
│   │   ├── animated-ai-chat.tsx         # Omni Agent input bar & typing indicator
│   │   └── use-toast.ts                 # Toast notifications
│   │
│   ├── icons/                           # Custom SVG icon set (Lucide-based)
│   │   ├── IconBase.tsx
│   │   └── index.tsx                    # 100+ typed icons
│   │
│   ├── landing-v2/                      # AutoSend-inspired minimalist landing page
│   │   ├── Navbar.tsx                   # Sticky navigation bar
│   │   ├── HeroSection.tsx              # Hero headline with floating preview cards
│   │   ├── TrustBar.tsx                 # Capability badges
│   │   ├── FeaturesGrid.tsx             # 6-card capability grid
│   │   ├── WorkflowTimeline.tsx         # 5-step interactive workflow
│   │   ├── TemplatesShowcase.tsx        # Resume templates carousel
│   │   ├── ATSDashboard.tsx             # SaaS dashboard mockup
│   │   ├── PricingSection.tsx           # 3-tier pricing cards
│   │   ├── FinalCTA.tsx                 # Bottom call-to-action
│   │   └── FooterSection.tsx            # Minimal footer
│   │
│   └── builder/                         # Resume editor builder components
│
├── lib/                                 # Core Business Logic & Infrastructure
│   ├── ai-core/                         # 🧠 AGENT OS ENGINE
│   │   ├── agent-loop.ts                # Master autonomous ReAct loop with system prompts
│   │   ├── tools/
│   │   │   └── registry.ts              # Canonical tool registry (all 7 forges as tools)
│   │   ├── rag-engine.ts                # RAG retrieval & context injection
│   │   ├── retriever.ts                 # Vector/keyword database retriever
│   │   └── context-builder.ts           # Dynamic candidate profile prompt constructor
│   │
│   ├── ai/                              # MULTI-PROVIDER ROUTING
│   │   ├── router.ts                    # Intelligent fallback caller across providers
│   │   ├── config.ts                    # Routing chains & default models per task
│   │   ├── key-pool.ts                  # Multi-key rotation pool with cooldown tracking
│   │   ├── cache.ts                     # AI response in-memory cache
│   │   └── types.ts                     # AI types & task definitions
│   │
│   ├── supabase/                        # DATABASE CLIENTS
│   │   ├── server.ts                    # Server-side Supabase client with cookies
│   │   ├── client.ts                    # Client-side Supabase client
│   │   └── admin.ts                     # Service role admin client
│   │
│   ├── ats-score.ts                     # ATS scoring algorithm & keyword matching
│   ├── code-execution.ts                # Judge0 sandbox submission client
│   ├── gemini-service.ts                # Grounded Google Search & Gemini utilities
│   ├── projectforge-ai.ts               # Architecture & file generation engine
│   ├── brevo.ts                         # Brevo Transactional Email Gateway
│   ├── email/resend-broadcast.ts        # Resend blog newsletter batch broadcast
│   ├── pdf-generator.ts                 # Vector PDF generator
│   └── rate-limit.ts                    # IP & User rate limiting engine
│
├── templates/                           # Resume PDF Design Templates
│   ├── modern.ts                        # Modern two-column layout
│   ├── harvard.ts                       # Classic academic Harvard template
│   ├── stanford.ts                      # Clean engineering Stanford template
│   ├── executive.ts                     # Executive serif leadership template
│   ├── compact.ts                       # Dense single-page layout
│   ├── minimal-divider.ts               # Minimalist whitespace layout
│   ├── academic.ts                      # Multi-page research CV layout
│   └── ats-light.ts                     # Machine-parser-optimized layout
│
└── supabase/                            # Database Migrations & Schemas
    ├── schema.sql                       # Core database schema
    └── migrations/                      # 40+ incremental migrations
        ├── 20260305_global_job_board.sql
        ├── 20260305_multi_currency_payments.sql
        ├── 20260621_daily_credits_system.sql
        └── mentor_forge_upgrade.sql
```

---

## 5. Supabase Database Schema Entities (Core Tables)

| Table Name | Primary Purpose | Key Fields |
| :--- | :--- | :--- |
| `users` | Candidate accounts | `id`, `email`, `role`, `created_at` |
| `profiles` | Extended candidate profile | `full_name`, `phone`, `city`, `linkedin_url`, `skills`, `education` |
| `resumes` | Canonical candidate resumes | `id`, `user_id`, `title`, `resume_json`, `template_selected`, `updated_at` |
| `resume_scores` | Historical ATS score logs | `id`, `resume_id`, `score`, `target_role`, `created_at` |
| `jobs` | Grounded job listings cache | `id`, `title`, `company`, `location`, `description`, `source_url` |
| `job_applications` | Application tracking pipeline | `id`, `user_id`, `job_id`, `status` (Applied/Interview/etc), `notes` |
| `mentor_chats` | Omni Agent chat messages | `id`, `user_id`, `role`, `content`, `metadata` (persisted artifacts) |
| `mentor_memory` | Agent candidate memory | `user_id`, `goals`, `weaknesses`, `improvements`, `target_role` |
| `coding_questions` | DSA & algorithm challenge bank | `id`, `title`, `slug`, `difficulty`, `tags`, `starter_code` |
| `coding_submissions`| Judge0 sandbox run history | `id`, `user_id`, `problem_id`, `language`, `status`, `runtime_ms` |
| `mock_interviews` | Interview simulation records | `id`, `user_id`, `role`, `score`, `questions`, `feedback` |
| `roadmaps` | Curriculum study roadmaps | `id`, `user_id`, `title`, `syllabus`, `progress`, `status` |
| `credit_ledger` | Atomic credit burn & grant logs | `id`, `user_id`, `amount`, `balance_after`, `reason`, `created_at` |

---

## 6. Verification Status

- **TypeScript Compilation:** `npx tsc --noEmit` &rarr; **0 Errors**.
- **Development Server:** Verified operational on `http://localhost:3000/en-in/mentorforge` (**HTTP 200 OK**).
- **Tool-Calling Registry:** 10+ server-side typed tools wired with JSON Schemas.
- **Client Dispatcher:** 7 Artifact Cards dynamically rendering in Omni Agent chat.
