'use client';

import { ReactNode } from 'react';
import { dir } from 'i18next';
import { languages } from '../i18n/settings';
import { Inter } from 'next/font/google';
import '../../globals.css';
import { I18nProviderClient } from '@/locales/client';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} dir={dir(locale)}>
      <body className={inter.className}>
        <I18nProviderClient locale={locale}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </I18nProviderClient>
      </body>
    </html>
  );
}
