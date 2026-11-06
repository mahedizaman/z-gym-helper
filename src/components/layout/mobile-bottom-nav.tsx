'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import {
  Calendar,
  Utensils,
  Dumbbell,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleOpenMore = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('zgym-open-more-menu'));
    }
  };

  const navItems = [
    { href: '/today', labelBn: 'আজ', labelEn: 'Today', icon: Calendar },
    { href: '/foods', labelBn: 'খাবার', labelEn: 'Foods', icon: Utensils },
    { href: '/exercises', labelBn: 'ব্যায়াম', labelEn: 'Workouts', icon: Dumbbell },
    { href: '/progress', labelBn: 'অগ্রগতি', labelEn: 'Progress', icon: TrendingUp },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-2xl">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/today' && pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all cursor-pointer',
                isActive
                  ? 'text-lime-brand font-bold scale-105'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] tracking-tight truncate">
                {t(item.labelBn, item.labelEn)}
              </span>
            </Link>
          );
        })}

        {/* 5th Tab: আরও (More Menu Trigger) */}
        <button
          type="button"
          onClick={handleOpenMore}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          aria-label={t('আরও মেনু', 'More Menu')}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight truncate">
            {t('আরও', 'More')}
          </span>
        </button>
      </nav>
    </div>
  );
}
