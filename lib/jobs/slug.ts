/**
 * ResumeForge — Canonical Job Slug & URL Helper
 * Provides deterministic, human-readable, and future-proof canonical URL slugs.
 */

const BASE_SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://resumeforgeai.in';

/**
 * Standard text slugifier: converts text to lowercase kebab-case.
 */
export function slugify(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/[\s_-]+/g, '-')   // swap multiple spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, '');   // strip leading/trailing hyphens
}

/**
 * Generates a stable, SEO-optimized canonical slug for a job.
 * Pattern: [company]-[title]-[location]-[canonical-uuid]
 * Example: razorpay-backend-engineer-bengaluru-9c12a83f-42e1-4c12-9218-028471e84712
 */
export function generateJobSlug(job: {
  id: string;
  company?: string | null;
  title?: string | null;
  city?: string | null;
  location?: string | null;
}): string {
  const company = slugify(job.company) || 'company';
  const title = slugify(job.title) || 'role';
  const location = slugify(job.city || job.location) || 'remote';
  const id = job.id.trim();

  return `${company}-${title}-${location}-${id}`;
}

/**
 * Extracts a canonical Job ID (UUID) from a public URL slug.
 * Robustly matches 36-char standard UUIDs anywhere in the slug,
 * with fallbacks for hyphen-delimited UUID suffixes.
 */
export function extractJobIdFromSlug(slug: string): string | null {
  if (!slug) return null;

  // 1. Direct UUID regex match anywhere in the slug
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = slug.match(uuidRegex);
  if (match) {
    return match[0].toLowerCase();
  }

  // 2. Trailing 5-segment UUID reconstruction
  const parts = slug.split('-');
  if (parts.length >= 5) {
    const candidate = parts.slice(-5).join('-');
    if (uuidRegex.test(candidate)) {
      return candidate.toLowerCase();
    }
  }

  // 3. If slug is itself an exact UUID
  if (uuidRegex.test(slug)) {
    return slug.toLowerCase();
  }

  return null;
}

/**
 * Constructs the canonical public URL for an active job.
 */
export function getCanonicalJobUrl(
  job: {
    id: string;
    slug?: string | null;
    company?: string | null;
    title?: string | null;
    city?: string | null;
    location?: string | null;
  },
  locale = 'en-in'
): string {
  const slug = job.slug || generateJobSlug(job);
  const cleanLocale = locale.toLowerCase();
  return `${BASE_SITE_URL}/${cleanLocale}/jobs/${slug}`;
}
