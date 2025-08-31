'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import LanguageSelector from './LanguageSelector';
import { Globe, Settings } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { t } = useTranslation('common');
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'navbar.home' },
    { href: '/about', label: 'navbar.about' },
    { href: '/contact', label: 'navbar.contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-foreground/70'
                )}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <div className="flex items-center text-sm font-medium text-foreground/70">
              <Globe className="mr-2 h-4 w-4" />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
