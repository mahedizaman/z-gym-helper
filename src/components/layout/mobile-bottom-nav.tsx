'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useLanguage } from '@/lib/language-context';
import { LayoutDashboard, PlusCircle, TrendingUp, Dumbbell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { t } = useLanguage();

  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  const items = [
    { href: '/dashboard', labelBn: 'ড্যাশবোর্ড', labelEn: 'Home', icon: LayoutDashboard },
    { href: '/log', labelBn: 'লগ', labelEn: 'Log', icon: PlusCircle },
    { href: '/progress', labelBn: 'ওজন', labelEn: 'Progress', icon: TrendingUp },
    { href: '/plans', labelBn: 'প্ল্যান', labelEn: 'Plans', icon: Dumbbell },
    { href: '/settings', labelBn: 'সেটিংস', labelEn: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-xl border-t border-border/80 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-2xl">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
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
      </nav>
    </div>
  );
}
