import { connectToDatabase } from '@/server/db';
import { PlanModel, IPlan } from '@/server/models/plan.model';
import { WORKOUT_PLANS_DATA, SeedPlan } from '@/server/seeds/plans.data';

/**
 * Standalone cached query function for a single plan by slug.
 * Uses Next.js 16 Cache Components 'use cache' directive to ensure deterministic
 * prerendering and eliminate unstable timestamp errors during static generation.
 */
async function fetchPlanBySlug(slug: string): Promise<IPlan | SeedPlan | null> {
  'use cache';
  const db = await connectToDatabase();
  if (db) {
    try {
      const plan = await PlanModel.findOne({ slug }).lean();
      if (plan) {
        return JSON.parse(JSON.stringify(plan)) as IPlan;
      }
    } catch {}
  }

  return WORKOUT_PLANS_DATA.find((p) => p.slug === slug) || null;
}

export const planService = {
  /**
   * Get all seeded plans with optional days and level filters
   */
  async getPlans(options: { days?: number; level?: string } = {}): Promise<(IPlan | SeedPlan)[]> {
    const { days, level } = options;
    const db = await connectToDatabase();

    if (db) {
      try {
        const query: Record<string, unknown> = {};
        if (days) query.daysPerWeek = days;
        if (level && level !== 'all') query.level = level;

        const plans = await PlanModel.find(query).lean();
        if (plans.length > 0) return JSON.parse(JSON.stringify(plans)) as IPlan[];
      } catch (err) {
        console.warn('PlanModel.find failed, falling back to seed memory:', err);
      }
    }

    return WORKOUT_PLANS_DATA.filter((p) => {
      if (days && p.daysPerWeek !== days) return false;
      if (level && level !== 'all' && p.level !== level) return false;
      return true;
    });
  },

  /**
   * Get single workout plan by slug
   */
  async getPlanBySlug(slug: string): Promise<IPlan | SeedPlan | null> {
    return fetchPlanBySlug(slug);
  },
};
