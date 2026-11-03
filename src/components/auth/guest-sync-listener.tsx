'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { guestStorage } from '@/lib/guest-storage';

export function GuestSyncListener() {
  const { data: session, status } = useSession();
  const hasMergedRef = useRef(false);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user || hasMergedRef.current) {
      return;
    }

    const checkAndMerge = async () => {
      try {
        const mergedFlag = localStorage.getItem('zgym_guest_data_merged');
        if (mergedFlag === 'true') {
          return;
        }

        // Collect all guest meals from localStorage
        const mealKeys = Object.keys(localStorage).filter((k) =>
          k.startsWith('zgym_guest_meals_')
        );

        const guestMeals = mealKeys
          .map((k) => {
            try {
              const val = localStorage.getItem(k);
              return val ? JSON.parse(val) : null;
            } catch {
              return null;
            }
          })
          .filter(Boolean);

        const guestProfile = guestStorage.getProfile();
        const activePlanSlug = guestStorage.getActivePlanSlug();

        // Check if there is anything to merge
        const hasMeals = guestMeals.length > 0;
        const hasProfile = !!guestProfile;

        if (!hasMeals && !hasProfile && !activePlanSlug) {
          localStorage.setItem('zgym_guest_data_merged', 'true');
          return;
        }

        hasMergedRef.current = true;

        const res = await fetch('/api/user/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: guestProfile,
            meals: guestMeals,
            activePlanSlug: activePlanSlug || undefined,
          }),
        });

        if (res.ok) {
          localStorage.setItem('zgym_guest_data_merged', 'true');
        }
      } catch (err) {
        console.error('Guest sync merge error:', err);
      }
    };

    checkAndMerge();
  }, [status, session]);

  return null;
}
