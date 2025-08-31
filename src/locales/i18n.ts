import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

export const defaultNS = 'common';

export async function initTranslations({
  locale,
  namespaces = ['common'],
  i18nInstance,
  resources,
}: {
  locale: string;
  namespaces?: string[];
  i18nInstance?: any;
  resources?: any;
}) {
  const i18nInstanceToUse = i18nInstance || i18n;
  
  await i18nInstanceToUse
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: locale,
      fallbackLng: 'en',
      defaultNS,
      ns: namespaces,
      fallbackNS: defaultNS,
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      ...(resources && { resources }),
    });

  return i18nInstanceToUse;
}
