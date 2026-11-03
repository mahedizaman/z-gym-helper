import React, { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { userService } from '@/server/services/user.service';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Console',
  robots: {
    index: false,
    follow: false,
  },
};

async function AdminContent() {
  const session = await auth();

  // 1. Server-side Authentication Guard
  if (!session?.user?.id || !session?.user?.email) {
    redirect('/login?callbackUrl=/admin');
  }

  // 2. Server-side Role & Authorization Guard
  const email = session.user.email.toLowerCase().trim();
  const isAdminEmail = userService.isAdminEmail(email);
  const isSessionAdmin = session.user.role === 'admin';

  if (!isAdminEmail && !isSessionAdmin) {
    return (
      <div className="container mx-auto px-4 max-w-lg py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-tomato-base/10 text-tomato-base flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 stroke-2" />
        </div>
        <h1 className="font-display font-black text-2xl text-foreground uppercase tracking-wide">
          403 — Access Forbidden
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This control portal is restricted solely to authorized platform administrators. Your Google account (
          <span className="font-mono text-foreground font-bold">{email}</span>) does not possess administrator privileges in ADMIN_EMAILS.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboardClient adminEmail={email} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 max-w-7xl py-12 flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-lime-brand border-t-transparent animate-spin" />
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Verifying Administrator Credentials...
            </span>
          </div>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
