import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/knowledge',
          '/posts',
          '/ai-resume-builder',
          '/ats-resume-builder',
          '/ai-mock-interview',
          '/job-interview-ai-coach',
          '/u/',
          '/job/',
          '/companies/',
          '/*-in/',
          '/*-us/',
          '/*-eu/',
        ],
        disallow: [
          '/dashboard',
          '/admin',
          '/login',
          '/signup',
          '/api/',
          '/complete-profile',
          '/settings',
          '/account',
          '/preview/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/dashboard', '/admin', '/api/'],
      }
    ],
    sitemap: 'https://resumeforgeai.in/sitemap.xml',
  };
}
