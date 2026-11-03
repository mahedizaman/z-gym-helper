'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Info,
  AlertTriangle,
  Sparkles,
  Megaphone,
  BellOff,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface AnnouncementItem {
  _id: string;
  title: string;
  titleBn: string;
  content: string;
  contentBn: string;
  type: 'info' | 'update' | 'warning' | 'celebration';
  createdAt: string;
}

export function AnnouncementBell() {
  const { locale } = useLanguage();
  const isBn = locale === 'bn';

  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile, { passive: true });
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const guestLastSeen =
      typeof window !== 'undefined'
        ? localStorage.getItem('zgym_last_seen_announcements')
        : null;
    const url = guestLastSeen
      ? `/api/announcements?lastSeen=${encodeURIComponent(guestLastSeen)}`
      : '/api/announcements';

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setAnnouncements(data.announcements || []);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {
        // Handled gracefully
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      setUnreadCount(0);
      const now = new Date().toISOString();
      try {
        localStorage.setItem('zgym_last_seen_announcements', now);
        await fetch('/api/announcements/read', { method: 'POST' });
      } catch {
        // Handled silently
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'celebration':
        return <Sparkles className="w-4 h-4 text-pink-brand shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-tomato-base shrink-0" />;
      case 'update':
        return <Megaphone className="w-4 h-4 text-lime-brand shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const renderAnnouncementList = () => (
    <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1 select-none">
      {announcements.length === 0 ? (
        <div className="py-10 text-center flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/60 mb-1">
            <BellOff className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-foreground">
            {isBn ? 'বর্তমানে কোনো নতুন বিজ্ঞপ্তি নেই' : 'No new notifications'}
          </p>
          <p className="text-[11px] text-muted-foreground max-w-[220px]">
            {isBn
              ? 'নতুন ফিটনেস আপডেট বা নোটিশ এলে এখানে দেখতে পাবেন।'
              : 'You are all caught up with community updates and alerts.'}
          </p>
        </div>
      ) : (
        announcements.map((item) => (
          <div
            key={item._id}
            className="p-3.5 rounded-2xl bg-secondary/60 hover:bg-secondary border border-border transition-colors flex flex-col gap-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {getIcon(item.type)}
                <h4 className="font-bold text-xs sm:text-sm text-foreground leading-tight">
                  {isBn ? item.titleBn || item.title : item.title}
                </h4>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                {new Date(item.createdAt).toLocaleDateString(
                  isBn ? 'bn-BD' : 'en-US',
                  {
                    month: 'short',
                    day: 'numeric',
                  }
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              {isBn ? item.contentBn || item.content : item.content}
            </p>
          </div>
        ))
      )}
    </div>
  );

  const bellButton = (
    <button
      aria-label="Announcements"
      type="button"
      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border/80 bg-background hover:bg-secondary text-foreground transition-transform active:scale-95 cursor-pointer shadow-sm"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-brand text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{bellButton}</SheetTrigger>
        <SheetContent
          side="bottom"
          className="p-6 bg-card text-card-foreground border-t-2 border-border shadow-2xl rounded-t-3xl max-h-[80vh] flex flex-col"
        >
          <SheetHeader className="text-left pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-lime-brand/15 text-lime-hover flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="font-display font-black text-lg uppercase tracking-wide">
                  {isBn ? 'নোটিশ ও আপডেট' : 'Announcements'}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {isBn
                    ? 'Z-Gym Helper কমিউনিটি নোটিফিকেশন'
                    : 'Latest alerts and community news'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {renderAnnouncementList()}
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="w-full py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-black text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{bellButton}</PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-5 bg-card text-card-foreground border-2 border-border shadow-2xl rounded-3xl"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-lime-brand/15 text-lime-hover flex items-center justify-center">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm uppercase tracking-wide text-foreground">
                {isBn ? 'নোটিশ ও আপডেট' : 'Announcements'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {renderAnnouncementList()}

        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{isBn ? 'কমিউনিটি নোটিফিকেশন' : 'Community updates'}</span>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="font-bold text-lime-hover hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Check className="w-3 h-3" />
            <span>{isBn ? 'ঠিক আছে' : 'Dismiss'}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
