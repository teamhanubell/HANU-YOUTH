/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://hanubell.netlify.app',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  exclude: ['/server-sitemap.xml', '/admin/*', '/api/*', '/_next/*', '/404', '/500'],
  generateIndexSitemap: true,
  outDir: 'public',
  // i18n configuration
  i18n: {
    locales: ['en', 'es', 'fr', 'hi', 'zh'],
    defaultLocale: 'en',
  },
  // Handle dynamic routes
  additionalPaths: async (config) => {
    const result = [];
    // Add any dynamic paths here if needed
    return result;
  },
  // Ensure proper handling of i18n routes
  trailingSlash: true,
};
