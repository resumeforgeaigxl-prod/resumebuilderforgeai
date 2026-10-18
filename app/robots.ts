import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/omni/', '/applications/'],
    },
    sitemap: [
      'https://resumeforgeai.in/sitemap.xml',
      'https://resumeforgeai.in/sitemap-jobs.xml',
    ],
  };
}
