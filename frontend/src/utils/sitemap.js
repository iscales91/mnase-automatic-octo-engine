/**
 * Sitemap Generator for MNASE Basketball League
 */

const BASE_URL = 'https://courtside-22.preview.emergentagent.com';

const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/programs', priority: 0.9, changefreq: 'weekly' },
  { url: '/memberships', priority: 0.9, changefreq: 'weekly' },
  { url: '/events', priority: 0.9, changefreq: 'daily' },
  { url: '/calendar', priority: 0.8, changefreq: 'daily' },
  { url: '/facilities', priority: 0.8, changefreq: 'weekly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact', priority: 0.7, changefreq: 'monthly' },
  { url: '/faq', priority: 0.6, changefreq: 'monthly' },
  { url: '/news', priority: 0.8, changefreq: 'daily' },
  { url: '/gallery', priority: 0.6, changefreq: 'weekly' },
  { url: '/camps', priority: 0.8, changefreq: 'weekly' },
  { url: '/clinics', priority: 0.8, changefreq: 'weekly' },
  { url: '/workshops', priority: 0.8, changefreq: 'weekly' },
  { url: '/shoot-n-hoops', priority: 0.7, changefreq: 'monthly' },
  { url: '/summer-sizzle', priority: 0.7, changefreq: 'monthly' },
  { url: '/winter-wars', priority: 0.7, changefreq: 'monthly' },
  { url: '/media-gallery', priority: 0.6, changefreq: 'weekly' },
  { url: '/shop', priority: 0.6, changefreq: 'weekly' },
  { url: '/get-involved', priority: 0.6, changefreq: 'monthly' },
  { url: '/recruitment', priority: 0.6, changefreq: 'monthly' },
  { url: '/sponsorship', priority: 0.7, changefreq: 'monthly' },
  { url: '/foundation', priority: 0.6, changefreq: 'monthly' },
  { url: '/policies', priority: 0.5, changefreq: 'yearly' },
  { url: '/testimonials', priority: 0.6, changefreq: 'monthly' },
];

export const generateSitemap = () => {
  const today = new Date().toISOString().split('T')[0];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
};

// For manual download
export const downloadSitemap = () => {
  const sitemap = generateSitemap();
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  generateSitemap,
  downloadSitemap
};
