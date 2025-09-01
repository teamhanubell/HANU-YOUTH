import { languages } from '../../i18n/settings';
import ChatPageClient from './ChatPageClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({
    locale: lng
  }));
}

export const dynamic = 'force-dynamic';

export default ChatPageClient;
