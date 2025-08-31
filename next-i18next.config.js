module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'hi', 'zh'],
    localeDetection: false, // Disable automatic locale detection
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
