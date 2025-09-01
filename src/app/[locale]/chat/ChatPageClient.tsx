'use client';

import ChatComponent from './ChatComponent';
import { languages } from '../../i18n/settings';

export async function generateStaticParams() {
  return languages.map((lng) => ({
    locale: lng
  }));
}

export default function ChatPage() {
  return <ChatComponent />;
}
