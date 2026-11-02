import Fuse from 'fuse.js';
import { connectToDatabase } from '@/server/db';
import { FoodModel, IFood } from '@/server/models/food.model';
import { BANGLADESHI_FOODS_DATA, SeedFood } from '@/server/seeds/foods.data';

export interface FoodSearchOptions {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface FoodSearchResult {
  foods: (IFood | SeedFood)[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// In-memory Fuse.js instance for instant fallback & offline-capable fuzzy search
const fuse = new Fuse(BANGLADESHI_FOODS_DATA, {
  keys: [
    { name: 'nameBn', weight: 0.5 },
    { name: 'nameEn', weight: 0.4 },
    { name: 'aliases', weight: 0.3 },
  ],
  threshold: 0.4,
  includeScore: true,
  ignoreLocation: true,
});

export const foodService = {
  /**
   * Search foods with fuzzy bilingual matching and database / memory fallback
   */
  async searchFoods(options: FoodSearchOptions = {}): Promise<FoodSearchResult> {
    const { q = '', category, page = 1, limit = 20 } = options;
    const db = await connectToDatabase();

    // If MongoDB Atlas is connected, use DB query
    if (db) {
      try {
        const queryFilter: Record<string, unknown> = {};
        if (category && category !== 'all') {
          queryFilter.category = category;
        }

        if (q.trim()) {
          queryFilter.$text = { $search: q.trim() };
        }

        const skip = (page - 1) * limit;
        const [foods, total] = await Promise.all([
          FoodModel.find(queryFilter).skip(skip).limit(limit).lean(),
          FoodModel.countDocuments(queryFilter),
        ]);

        if (total > 0 || !q.trim()) {
          return {
            foods: foods as IFood[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          };
        }
      } catch (err) {
        console.warn('MongoDB search failed or returned 0, using Fuse.js fallback:', err);
      }
    }

    // High-performance Fuse.js in-memory search fallback
    let matches: SeedFood[] = BANGLADESHI_FOODS_DATA;

    if (category && category !== 'all') {
      matches = matches.filter((item) => item.category === category);
    }

    if (q.trim()) {
      const searchResults = fuse.search(q.trim());
      matches = searchResults.map((res) => res.item);
      if (category && category !== 'all') {
        matches = matches.filter((item) => item.category === category);
      }
    }

    const total = matches.length;
    const startIndex = (page - 1) * limit;
    const paginated = matches.slice(startIndex, startIndex + limit);

    return {
      foods: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Get single food by ID / name
   */
  async getFoodById(idOrName: string) {
    const db = await connectToDatabase();
    if (db) {
      try {
        const found = await FoodModel.findById(idOrName).lean();
        if (found) return found;
      } catch {
        // ID might not be a valid Mongo ObjectId
      }
    }

    // Fallback to searching in-memory dataset
    return (
      BANGLADESHI_FOODS_DATA.find(
        (f) =>
          f.nameEn.toLowerCase() === idOrName.toLowerCase() ||
          f.nameBn === idOrName
      ) || null
    );
  },

  /**
   * Get total count of foods in dataset
   */
  async getTotalCount(): Promise<number> {
    const db = await connectToDatabase();
    if (db) {
      try {
        const count = await FoodModel.countDocuments();
        if (count > 0) return count;
      } catch {}
    }
    return BANGLADESHI_FOODS_DATA.length;
  },
};
