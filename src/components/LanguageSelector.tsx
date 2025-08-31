'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Update the URL to reflect the new language
    const segments = pathname.split('/');
    const currentLang = i18n.language;
    
    // Check if the current path has a language segment
    if (currentLang && i18n.languages.includes(segments[1])) {
      segments[1] = lng;
    } else {
      segments.splice(1, 0, lng);
    }
    
    const newPath = segments.join('/');
    router.push(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-transparent"
        >
          {i18n.language.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(t('languages', { returnObjects: true })).map(([code, name]) => (
          <DropdownMenuItem 
            key={code} 
            onClick={() => changeLanguage(code)}
            className={i18n.language === code ? 'bg-accent' : ''}
          >
            {String(name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
