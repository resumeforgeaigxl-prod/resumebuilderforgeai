# AGENT_ERA_BLUEPRINT.md
# ResumeForge AI & GrowXLabs: Agent-Era Business Model & System Architecture

**Document Version:** 1.0.0  
**Author:** Antigravity AI & GrowXLabs Core Engineering  
**Created:** September 2026  
**Status:** Canonical Reference Specification  

---

## 1. Executive Summary: The Paradigm Shift (2022 I/O vs. 2026 Agent Era)

### The Failure of the 2022 LLM Model
* **The 2022 Model:** Prompt in, text out. A user manually navigates 12 different tools, prompts an LLM to rewrite bullet points, downloads a static PDF, and spends 4 hours copy-pasting applications into Workday and Greenhouse.
* **Commoditization:** Basic text generation is a $0 commodity. ChatGPT, Claude, and Gemini can generate resume text for free. Building 12 separate prompt boxes offers zero defensibility and results in 70%+ user churn.

### The 2026 Autonomous Agent Opportunity
* **The New Reality:** Users do not want a text editor; **users want to be hired with zero friction.**
* **The Solution:** **MentorForge** evolves from a passive chat window into the **Master Autonomous Career Agent Orchestrator**. The 12 separate Forges become **typed execution tools (sub-agents)** called by MentorForge to deliver end-to-end career outcomes.

```
       2022 (OLD I/O MODEL)                                2026 (AGENT ERA: OUTCOME ENGINE)
┌─────────────────────────────────┐           ┌─────────────────────────────────────────────────────┐
│ User manually types details     │           │ User defines high-level career goal                 │
│               ▼                 │           │                         ▼                           │
│ AI rewrites text (Chat wrapper) │           │ MentorForge plans multi-tool execution              │
│               ▼                 │    VS     │                         ▼                           │
│ User downloads static PDF       │           │ • Calls ResumeForge Tool (Tailor & format)          │
│               ▼                 │           │ • Calls CodingForge Tool (Sandbox code benchmark)   │
│ User spends 4 hrs copy-pasting  │           │ • Calls JobForge Tool (Live matching & auto-apply)  │
│ on 50 different company sites   │           │ • Calls GrowXLabs Talent Tool (Direct recruiter opt)│
└─────────────────────────────────┘           └─────────────────────────────────────────────────────┘
         Value: $9/mo                                            Value: $49 – $199/mo
       (High Churn Tool)                                       (Outcome-Based Service)
```

---

## 2. Technical Clarity: How the Agent Creates Resumes (Tool Calling Architecture)

### Question: Does the Agent write random code, hit an external API, or call internal tools?
**Answer:** The Agent uses **Typed Tool Calling (Function Calling)** executed server-side in Next.js against a canonical schema and database.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. USER PROMPT: "Tailor my resume for this Google Senior Cloud Architect position"     │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. MENTORFORGE LLM REASONING                                                           │
│    Emits function call: `tailor_resume_for_job({ resumeId, jobDescription })`          │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. NEXT.JS SERVER-SIDE TOOL EXECUTION (`lib/ai-core/tools/registry.ts`)                 │
│    Step A: Validates candidate identity & verifies credit balance.                     │
│    Step B: Ingests candidate profile, verified coding scores, and target job keywords. │
│    Step C: Emits structured JSON conforming to `DEFAULT_RESUME_JSON` schema.           │
│    Step D: Persists directly into Supabase `resumes` table (`resume_json`).            │
│    Step E: Triggers headless PDF generator (React-PDF / Chromium).                     │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. AGENT RESPONDS WITH INTERACTIVE ARTIFACT CARD                                       │
│    - "Resume tailored! ATS Match Score: 94/100"                                        │
│    - [Preview Resume]  [Download Vector PDF]  [Apply with 1-Click]                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Data Schema Integrity
The agent **never** writes arbitrary HTML or raw text files. It writes strict typed JSON:
```typescript
interface CanonicalResumeJSON {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summary: string;
  skills: { languages: string[]; frameworks: string[]; tools: string[]; other: string[] };
  experience: { id: string; company: string; role: string; duration: string; points: string[] }[];
  projects: { id: string; name: string; tech: string[]; description: string[] }[];
  education: { id: string; institution: string; degree: string; year: string; score: string }[];
  certifications: { id: string; title: string; issuer: string; year: string }[];
}
```

---

## 3. The Forge Tool-Calling Registry & Credit Engine

### Tool Catalog & Credit Costs

| Tool Name | Forge Domain | What the Agent Does | Credit Cost |
|---|---|---|---|
| `audit_resume_ats` | ResumeForge | Runs deep ATS parsing, keyword analysis, and formatting audit | **2 Credits** |
| `tailor_resume_for_job` | ResumeForge | Re-engineers resume bullets to match a specific job description | **5 Credits** |
| `run_code_sandbox` | CodingForge | Executes code against hidden test cases in Judge0 sandbox | **4 Credits** |
| `generate_coding_challenge`| CodingForge | Dynamically generates a verified algorithm/concurrency test | **3 Credits** |
| `start_mock_interview` | InterviewForge| Launches multi-turn voice/chat technical or behavioral interview | **6 Credits** |
| `match_and_score_jobs` | JobForge | Crawls and ranks live job openings matching the candidate's graph | **2 Credits** |
| `fast_track_talent_submission`| GrowXLabs | Submits candidate directly to GrowXLabs enterprise hiring queue | **10 Credits** |

### Atomic Credit Ledger Architecture
```sql
-- Prevents double-spend and ensures auditable usage
CREATE TABLE agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  total_credits_used INT DEFAULT 0,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INT NOT NULL, -- Negative for burn, Positive for reset/top-up
  balance_after INT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Why Users Lock Into ResumeForge AI (Beating ChatGPT / Claude)

1. **Persistent Career State & Verified History:** ChatGPT forgets your resume after a chat session. ResumeForge stores your canonical profile, ATS evolution history, coding challenge scores, and interview performance metrics.
2. **Real World Execution:** ChatGPT outputs words. MentorForge executes code in compilers, builds vector PDFs, and matches live job URLs.
3. **The Direct Hiring Moat (GrowXLabs Pipeline):** ChatGPT cannot hire you. ResumeForge connects top-scoring candidates directly to hiring partners at `careers.growxlabs.tech`.
4. **Outcome Delivery:** Candidates do not want to prompt; they want an autonomous agent handling their application pipeline.

---

## 5. Five Corporate & Business Models (The Path to $1M+ ARR)

### Model 1: B2C High-Conversion Dual Paywall (Immediate Cash Flow)
* **1st Resume Download:** Free forever (proves quality, builds trust, captures email).
* **2nd Resume & Beyond:** Dual-choice paywall:
  * **One-Time Pass:** ₹199 ($2.99) — impulse buy for single job applicants.
  * **Pro Job Sprint:** ₹599 ($8.99/mo) — unlimited exports + AI mock interviews.
* **Projected Revenue:** **$60,000 – $120,000 / year**.

### Model 2: B2B University & Campus Placement Licensing ("University OS")
* **Target:** Engineering colleges & universities (TPOs).
* **Product:** Bulk student licenses, TPO admin batch audit dashboard, PrepForge TCS NQT preparation suite.
* **Pricing:** ₹2.5L – ₹8L ($3,000 – $10,000) per college per year.
* **Projected Revenue:** **$150,000 – $300,000 / year** (30 colleges).

### Model 3: GrowXLabs Reverse-Recruiting & Vetted Talent Placement
* **Target:** Startups, remote US/EU tech companies, GCCs.
* **Mechanism:** Candidates with ATS > 85 and passed CodingForge benchmarks are recommended to companies.
* **Pricing:** 12%–15% first-year placement fee ($3,000 – $10,000 per hire).
* **Projected Revenue:** **$200,000 – $500,000 / year**.

### Model 4: Corporate Outplacement & Layoff Packages (B2B HR)
* **Target:** Tech enterprises restructuring staff.
* **Product:** Outplacement vouchers funded by corporate severance budgets ($75 – $150 per outgoing employee).
* **Projected Revenue:** **$50,000 – $100,000 / year**.

### Model 5: GrowXLabs Enterprise AI Consulting Lead Engine
* **Target:** CTOs and founders reading technical research blogs (e.g. GPT-6 Astra).
* **Mechanism:** Native in-article sponsor cards & top announcement bar.
* **Pricing:** $25,000 – $150,000 custom autonomous AI development deals.
* **Projected Revenue:** **$100,000 – $300,000 / year**.

---

## 6. Implementation Roadmap

### Phase 1: The Unified MentorForge Command Center (Weeks 1–2)
* Transform `/mentorforge` into the central agent interface.
* Connect existing tool functions (`trigger_resume_generation`, `run_code_sandbox`, `search_job_market`) into transparent action cards.
* Enforce atomic credit validation via `credit_ledger`.

### Phase 2: Dual Paywall & Download Gate (Weeks 3–4)
* Implement the "1 Free Download, Paywall on 2nd" modal (₹199 single pass vs. ₹599 Pro subscription).
* Add "Fast-track to GrowXLabs Talent Network" opt-in on resume download.

### Phase 3: B2B University Pilot & Enterprise Talent Portal (Months 2–3)
* Build the TPO college admin dashboard for batch resume audits.
* Launch the GrowXLabs Partner Candidate Portal for direct engineering placements.

---
*End of Blueprint. Maintained in project root as canonical specification.*
