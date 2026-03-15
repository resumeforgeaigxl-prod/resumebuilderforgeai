import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  FileSearch,
  FileText,
  FolderKanban,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Map,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  Workflow,
} from "lucide-react";

export const MAIN_DOMAIN = "resumeforgeai.in";
export const BASE_URL =
  process.env.NODE_ENV === "production"
    ? `https://${MAIN_DOMAIN}`
    : "http://localhost:3000";

export const DEFAULT_LOCALE = "en-in";

export type LandingCard = {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  eyebrow?: string;
};

export const heroNodes = [
  { label: "Resume", icon: FileText, x: 18, y: 18, accent: "from-sky-500/25 to-cyan-400/10" },
  { label: "Coding", icon: Code2, x: 50, y: 8, accent: "from-emerald-500/25 to-lime-400/10" },
  { label: "Interview", icon: Brain, x: 82, y: 18, accent: "from-blue-500/25 to-indigo-400/10" },
  { label: "Projects", icon: FolderKanban, x: 88, y: 50, accent: "from-amber-500/25 to-orange-400/10" },
  { label: "Roadmap", icon: Map, x: 82, y: 82, accent: "from-cyan-500/25 to-sky-400/10" },
  { label: "Learning", icon: BookOpen, x: 50, y: 92, accent: "from-violet-500/20 to-fuchsia-400/10" },
  { label: "Jobs", icon: BriefcaseBusiness, x: 18, y: 82, accent: "from-rose-500/20 to-orange-400/10" },
  { label: "Portfolio", icon: Globe, x: 12, y: 50, accent: "from-teal-500/25 to-emerald-400/10" },
] as const;

export const heroStats = [
  { label: "Career modules", value: "8" },
  { label: "AI workflows", value: "7" },
  { label: "Career path coverage", value: "End-to-end" },
] as const;

export const problemCards: LandingCard[] = [
  {
    title: "ATS Rejections",
    description: "Many resumes fail automated screening systems.",
    icon: FileSearch,
    accent: "text-rose-300",
  },
  {
    title: "Unclear Learning Path",
    description: "Developers struggle to know what to learn next.",
    icon: Map,
    accent: "text-cyan-300",
  },
  {
    title: "Interview Preparation Gap",
    description: "Technical interviews require structured preparation.",
    icon: Brain,
    accent: "text-sky-300",
  },
  {
    title: "Fragmented Tools",
    description: "Developers rely on many disconnected platforms.",
    icon: Workflow,
    accent: "text-amber-300",
  },
];

export const moduleCards: LandingCard[] = [
  {
    title: "ResumeForge",
    description: "Craft ATS-friendly resumes with role-aware writing guidance and scoring.",
    icon: FileText,
    accent: "from-sky-500/20 to-cyan-400/10",
  },
  {
    title: "CodingForge",
    description: "Practice problems, analyze patterns, and sharpen implementation speed.",
    icon: Code2,
    accent: "from-emerald-500/20 to-lime-400/10",
  },
  {
    title: "InterviewForge",
    description: "Train with structured mock interviews and targeted technical feedback.",
    icon: Brain,
    accent: "from-blue-500/20 to-indigo-400/10",
  },
  {
    title: "ProjectForge",
    description: "Turn roadmap milestones into practical, portfolio-ready project work.",
    icon: FolderKanban,
    accent: "from-amber-500/20 to-orange-400/10",
  },
  {
    title: "CareerForge",
    description: "Generate adaptive roadmaps built around your role, level, and goals.",
    icon: Map,
    accent: "from-cyan-500/20 to-sky-400/10",
  },
  {
    title: "LearnForge",
    description: "Follow guided learning loops that connect theory to interview outcomes.",
    icon: GraduationCap,
    accent: "from-violet-500/20 to-fuchsia-400/10",
  },
  {
    title: "JobForge",
    description: "Surface relevant openings and prepare faster with application intelligence.",
    icon: BriefcaseBusiness,
    accent: "from-rose-500/20 to-orange-400/10",
  },
  {
    title: "PortfolioForge",
    description: "Package proof of work into a clean, recruiter-ready developer portfolio.",
    icon: LayoutDashboard,
    accent: "from-teal-500/20 to-emerald-400/10",
  },
];

export const aiToolCards: LandingCard[] = [
  {
    title: "ExplainForge AI",
    description: "Break down difficult concepts, code, and interview answers into clear language.",
    icon: Sparkles,
    accent: "from-sky-500/20 to-cyan-400/10",
  },
  {
    title: "StudyForge AI",
    description: "Convert topics into focused study plans and revision loops that actually stick.",
    icon: BookOpen,
    accent: "from-violet-500/20 to-fuchsia-400/10",
  },
  {
    title: "InterviewForge Mock Test",
    description: "Run timed interview simulations with instant scoring and targeted feedback.",
    icon: Brain,
    accent: "from-blue-500/20 to-indigo-400/10",
  },
  {
    title: "JD-Based Interview Test",
    description: "Generate practice questions directly from the job description you want to win.",
    icon: Target,
    accent: "from-amber-500/20 to-orange-400/10",
  },
  {
    title: "AI Company Prep",
    description: "Study likely themes, technology stacks, and company-specific interview angles.",
    icon: Building2,
    accent: "from-teal-500/20 to-emerald-400/10",
  },
  {
    title: "CodingForge IDE",
    description: "Practice in a distraction-free coding workspace with feedback built into the loop.",
    icon: Code2,
    accent: "from-emerald-500/20 to-lime-400/10",
  },
  {
    title: "JobForge AI Assistant",
    description: "Summarize openings, extract priorities, and shape smarter applications faster.",
    icon: Bot,
    accent: "from-rose-500/20 to-orange-400/10",
  },
];

export const careerPathCards: LandingCard[] = [
  {
    title: "Frontend Developer",
    description: "UI systems, interaction quality, accessibility, and product intuition.",
    icon: LayoutDashboard,
    accent: "from-sky-500/20 to-cyan-400/10",
  },
  {
    title: "Backend Developer",
    description: "APIs, databases, performance, architecture, and reliability fundamentals.",
    icon: Database,
    accent: "from-emerald-500/20 to-lime-400/10",
  },
  {
    title: "Full Stack Developer",
    description: "Ship end-to-end features with balanced depth across product and platform.",
    icon: Workflow,
    accent: "from-blue-500/20 to-indigo-400/10",
  },
  {
    title: "DevOps Engineer",
    description: "Automation, cloud delivery, observability, and release confidence.",
    icon: ShieldCheck,
    accent: "from-amber-500/20 to-orange-400/10",
  },
  {
    title: "AI / ML Engineer",
    description: "Model workflows, evaluation, deployment, and applied intelligence systems.",
    icon: Wand2,
    accent: "from-violet-500/20 to-fuchsia-400/10",
  },
  {
    title: "Software Engineer",
    description: "Problem solving, systems thinking, and interview-ready engineering breadth.",
    icon: Rocket,
    accent: "from-cyan-500/20 to-sky-400/10",
  },
  {
    title: "Data Analyst",
    description: "SQL, dashboards, experimentation, and decision-ready business insights.",
    icon: BarChart3,
    accent: "from-rose-500/20 to-orange-400/10",
  },
  {
    title: "Cloud Engineer",
    description: "Infrastructure, scalability, resilience, and environment automation.",
    icon: Globe,
    accent: "from-teal-500/20 to-emerald-400/10",
  },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Build Resume",
    description: "Create an ATS-optimized resume aligned to the roles you want.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Generate Career Roadmap",
    description: "Turn your target role into an actionable learning and project plan.",
    icon: Map,
  },
  {
    step: "03",
    title: "Practice Coding & Interviews",
    description: "Strengthen technical fluency with guided drills and mock evaluations.",
    icon: Brain,
  },
  {
    step: "04",
    title: "Apply to Jobs",
    description: "Use job intelligence and prep context to move faster with confidence.",
    icon: Search,
  },
] as const;

export const solutionPoints = [
  {
    title: "Shared career context",
    description: "Your resume, practice history, roadmap, and applications inform one another instead of living in silos.",
    icon: Workflow,
  },
  {
    title: "AI built for execution",
    description: "Each tool is designed to shorten the path between insight and action, not just generate more content.",
    icon: Bot,
  },
  {
    title: "Signals you can actually use",
    description: "Scores, job-fit data, roadmap priorities, and mock feedback keep momentum grounded in outcomes.",
    icon: CheckCircle2,
  },
] as const;

export const ecosystemSignals = [
  "Resume insights sharpen job targeting",
  "Roadmaps unlock coding and project practice",
  "Projects strengthen portfolios and interviews",
  "Company prep adapts from each new application",
] as const;

export const dashboardStats = [
  { label: "ATS score", value: "96" },
  { label: "Active roadmap", value: "Frontend Engineer" },
  { label: "Interview readiness", value: "84%" },
] as const;

export const pricingTiers = [
  {
    name: "Starter",
    price: "Free",
    cadence: "Forever",
    description: "A clean entry point for students and early-stage job seekers.",
    cta: "Start Free",
    href: "/signup",
    accent: "from-white/[0.12] to-white/[0.03]",
    featured: false,
    features: [
      "ATS-ready resume builder",
      "Basic roadmap generation",
      "Core interview prep prompts",
      "Explore the ResumeForgeAI workspace",
    ],
  },
  {
    name: "Pro",
    price: "$12",
    cadence: "/month",
    description: "For candidates actively preparing for interviews and applications.",
    cta: "Go Pro",
    href: "/billing?plan=PRO",
    accent: "from-sky-500/[0.30] to-cyan-400/[0.10]",
    featured: true,
    features: [
      "Unlimited ATS resume iterations",
      "CodingForge IDE practice sessions",
      "JD-based interview test generation",
      "AI company prep workflows",
    ],
  },
  {
    name: "Career",
    price: "$29",
    cadence: "/month",
    description: "Full access to every module for end-to-end career acceleration.",
    cta: "Unlock Career",
    href: "/billing?plan=CAREER",
    accent: "from-amber-500/[0.28] to-orange-400/[0.10]",
    featured: false,
    features: [
      "Everything in Pro",
      "ProjectForge and PortfolioForge workflows",
      "Priority JobForge AI assistance",
      "Advanced learning and roadmap orchestration",
    ],
  },
] as const;

export const sectionTransition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { delay, ...sectionTransition },
});

export const fadeInScale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.18 },
  transition: { delay, ...sectionTransition },
});

export const hoverLift = {
  y: -8,
  transition: {
    duration: 0.28,
    ease: [0.22, 1, 0.36, 1] as const,
  },
};
