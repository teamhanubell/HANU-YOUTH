'use client';

import { languages } from '../../i18n/settings';
import dynamic from 'next/dynamic';

// Import the chat component with SSR disabled
const ChatComponent = dynamic(() => import('./ChatComponent'), { ssr: false });

export async function generateStaticParams() {
  return languages.map((lng) => ({
    locale: lng
  }));
}

export default function ChatPage() {
  return <ChatComponent />;
}

export const dynamic = 'force-dynamic';
