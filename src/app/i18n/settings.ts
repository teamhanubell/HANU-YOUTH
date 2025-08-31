export const languages = ['en', 'es', 'fr', 'hi', 'zh'];
export const defaultLanguage = 'en';

export function getOptions(lng = defaultLanguage) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng: defaultLanguage,
    lng,
  };
}
