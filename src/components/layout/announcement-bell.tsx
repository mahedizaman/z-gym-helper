'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Info, AlertTriangle, Sparkles, Megaphone } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

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

  useEffect(() => {
    let isMounted = true;
    const guestLastSeen = typeof window !== 'undefined' ? localStorage.getItem('zgym_last_seen_announcements') : null;
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

  const handleOpen = async () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      setUnreadCount(0);
      const now = new Date().toISOString();
      localStorage.setItem('zgym_last_seen_announcements', now);

      try {
        await fetch('/api/announcements/read', { method: 'POST' });
      } catch {
        // Handled silently
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'celebration':
        return <Sparkles className="w-4 h-4 text-pink-brand" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-tomato-base" />;
      case 'update':
        return <Megaphone className="w-4 h-4 text-lime-brand" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Announcements"
        className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border/60 hover:bg-secondary text-foreground transition-all duration-200 cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-brand text-white text-[10px] font-black flex items-center justify-center animate-pulse shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-lime-brand/10 border border-lime-brand/30 flex items-center justify-center text-lime-brand">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl tracking-wide text-foreground">
                    {isBn ? 'নোটিশ ও আপডেট' : 'Announcements'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? 'Z-Gym কমিউনিটি নোটিফিকেশন' : 'Latest updates from Z-Gym'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {announcements.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  {isBn ? 'বর্তমানে কোনো নতুন ঘোষণা নেই।' : 'No active announcements at this time.'}
                </div>
              ) : (
                announcements.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl bg-secondary/50 border border-border/60 hover:border-lime-brand/40 transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getIcon(item.type)}
                        <h4 className="font-bold text-sm text-foreground">
                          {isBn ? item.titleBn || item.title : item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(item.createdAt).toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isBn ? item.contentBn || item.content : item.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs transition-colors"
              >
                {isBn ? 'ঠিক আছে' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
