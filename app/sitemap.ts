import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.resumeforgeai.in';
  const primaryLocale = 'en-in';
  
  const routes = [
    { path: '', priority: 1.0 },
    { path: `/resume`, priority: 0.8 },
    { path: `/resumeforge`, priority: 0.8 },
    { path: `/codingforge`, priority: 0.8 },
    { path: `/jobforge`, priority: 0.8 },
    { path: `/interviewforge`, priority: 0.8 },
    { path: `/projectforge`, priority: 0.8 },
    { path: `/explainforge`, priority: 0.8 },
    { path: `/mentorforge`, priority: 0.8 },
    { path: `/careerforge`, priority: 0.8 },
    { path: `/studyforge`, priority: 0.8 },
    { path: `/company-prep`, priority: 0.8 },
    { path: `/ai-tools`, priority: 0.8 },
    { path: `/jobs`, priority: 0.7 },
  ];

  const sitemapData: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}/${primaryLocale}${route.path}`,
    lastModified: new Date(),
    changeFrequency: (route.path === '' ? 'daily' : 'weekly') as "daily" | "weekly",
    priority: route.priority,
  }));

  // Add the root homepage without locale
  sitemapData.unshift({
    url: `${baseUrl}/`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // ProductHunt visibility
  sitemapData.push({
    url: `${baseUrl}/?ref=producthunt`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  return sitemapData;
}
