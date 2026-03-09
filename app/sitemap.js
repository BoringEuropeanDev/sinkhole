import { tools } from './lib/tools';

export default function sitemap() {
  const base = 'https://www.sinkhole.app';

  const toolPages = tools.map((tool) => ({
    url: `${base}/tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/tools`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/open-source`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...toolPages,
  ];
}
