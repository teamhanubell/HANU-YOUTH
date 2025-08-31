'use client';

import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { initTranslations } from './i18n';
import { ReactNode, useEffect, useState } from 'react';

export let i18n: any;

export function I18nProviderClient({
  children,
  locale,
  namespaces,
  resources,
}: {
  children: ReactNode;
  locale: string;
  namespaces?: string[];
  resources?: any;
}) {
  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const newInstance = createInstance();
      
      await initTranslations({
        locale,
        namespaces,
        i18nInstance: newInstance,
        resources,
      });

      i18n = newInstance;
      setInstance(newInstance);
    };

    init();
  }, [locale, namespaces, resources]);

  if (!instance) return null;

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
