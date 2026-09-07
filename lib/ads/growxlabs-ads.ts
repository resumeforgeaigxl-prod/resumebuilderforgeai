export interface GrowXLabsAdCampaign {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  tagline?: string;
}

export const GROWXLABS_CAMPAIGNS: Record<string, GrowXLabsAdCampaign> = {
  ai_engineering: {
    id: 'ai_engineering',
    badge: 'SPONSORED BY GROWXLABS ENTERPRISE',
    tagline: 'Enterprise AI & Autonomous Agent Lab',
    title: 'Architect & Deploy Autonomous AI Agents with GrowXLabs',
    description:
      'GrowXLabs helps high-growth companies and enterprises architect, evaluate, and scale custom AI agents, fine-tuned models, and production-grade engineering pipelines.',
    ctaText: 'Schedule an AI Consultation',
    ctaLink: 'https://growxlabs.tech?utm_source=resumeforgeai&utm_medium=blog_in_article&utm_campaign=ai_engineering'
  },
  talent_network: {
    id: 'talent_network',
    badge: 'GROWXLABS TALENT NETWORK',
    tagline: 'Exclusive Developer Placement',
    title: 'Get Fast-Tracked to Top Tech Companies via GrowXLabs',
    description:
      'Leading tech startups and global engineering teams hire vetted developers directly through GrowXLabs. Fast-track your application and bypass the resume queue.',
    ctaText: 'Explore Open Roles',
    ctaLink: 'https://careers.growxlabs.tech/'
  },
  product_engineering: {
    id: 'product_engineering',
    badge: 'GROWXLABS VENTURE STUDIO',
    tagline: 'Product Engineering & Scaling',
    title: 'Build Resilient Software Products with Elite Engineering Teams',
    description:
      'From zero-to-one product MVPs to enterprise distributed systems, GrowXLabs delivers dedicated engineering pods that build and ship fast.',
    ctaText: 'Explore Our Services',
    ctaLink: 'https://growxlabs.tech?utm_source=resumeforgeai&utm_medium=sidebar_ad&utm_campaign=product_engineering'
  }
};
