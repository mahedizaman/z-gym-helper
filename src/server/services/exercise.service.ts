import { connectToDatabase } from '@/server/db';
import { ExerciseModel, IExercise } from '@/server/models/exercise.model';
import { CORE_EXERCISES_DATA, SeedExercise } from '@/server/seeds/exercises.data';
import { getExerciseImages } from '@/server/seeds/exercise-images.data';

export interface ExerciseFilterOptions {
  muscle?: string;
  equipment?: string;
  level?: string;
  search?: string;
}

function withImages<T extends { slug: string; images?: string[] }>(exercise: T): T {
  if (!exercise.images || exercise.images.length === 0) {
    return { ...exercise, images: getExerciseImages(exercise.slug) };
  }
  return exercise;
}

/**
 * Standalone cached query function for a single exercise by slug.
 * Uses Next.js 16 Cache Components 'use cache' directive to ensure deterministic
 * prerendering and eliminate unstable timestamp errors during static generation.
 */
async function fetchExerciseBySlug(slug: string): Promise<IExercise | SeedExercise | null> {
  'use cache';
  const db = await connectToDatabase();
  if (db) {
    try {
      const ex = await ExerciseModel.findOne({ slug }).lean();
      if (ex) {
        return withImages(JSON.parse(JSON.stringify(ex)) as IExercise);
      }
    } catch {}
  }

  const ex = CORE_EXERCISES_DATA.find((e) => e.slug === slug);
  return ex ? withImages(ex) : null;
}

export const exerciseService = {
  /**
   * Get all exercises with optional muscle, equipment and level filters
   */
  async getExercises(filters: ExerciseFilterOptions = {}): Promise<(IExercise | SeedExercise)[]> {
    const { muscle, equipment, level, search } = filters;
    const db = await connectToDatabase();

    if (db) {
      try {
        const query: Record<string, unknown> = {};
        if (muscle && muscle !== 'all') query.muscle = muscle;
        if (equipment && equipment !== 'all') query.equipment = equipment;
        if (level && level !== 'all') query.level = level;
        if (search && search.trim()) {
          query.$or = [
            { nameBn: { $regex: search.trim(), $options: 'i' } },
            { nameEn: { $regex: search.trim(), $options: 'i' } },
          ];
        }

        const exercises = await ExerciseModel.find(query).lean();
        if (exercises.length > 0) {
          const plain = JSON.parse(JSON.stringify(exercises)) as IExercise[];
          return plain.map(withImages);
        }
      } catch (err) {
        console.warn('ExerciseModel.find failed, falling back to seed memory:', err);
      }
    }

    // In-memory fallback
    const filtered = CORE_EXERCISES_DATA.filter((ex) => {
      if (muscle && muscle !== 'all' && ex.muscle !== muscle) return false;
      if (equipment && equipment !== 'all' && ex.equipment !== equipment) return false;
      if (level && level !== 'all' && ex.level !== level) return false;
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesBn = ex.nameBn.toLowerCase().includes(q);
        const matchesEn = ex.nameEn.toLowerCase().includes(q);
        if (!matchesBn && !matchesEn) return false;
      }
      return true;
    });

    return filtered.map(withImages);
  },

  /**
   * Get single exercise by slug
   */
  async getExerciseBySlug(slug: string): Promise<IExercise | SeedExercise | null> {
    return fetchExerciseBySlug(slug);
  },
};
