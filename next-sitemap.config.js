/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://your-site.com', // Replace with your site URL
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/', // Allow all routes
      },
    ],
  },
  exclude: ['/server-sitemap.xml', '/admin/*'],
  // Add any other languages you support
  i18n: {
    locales: ['en', 'es', 'fr', 'hi', 'zh'],
    defaultLocale: 'en',
  },
  // Optional: Add custom sitemap paths
  additionalPaths: async (config) => {
    const result = [];
    // Add any additional paths here if needed
    return result;
  },
};
