import { languages } from '../../i18n/settings';
import ChatPageClient from './ChatPageClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({
    locale: lng
  }));
}

// Removed dynamic = 'force-dynamic' for static export compatibility

export default function ChatPage({ params }: { params: { locale: string } }) {
  return <ChatPageClient />;
}
