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

let cachedFoods: (IFood | SeedFood)[] | null = null;
let fuseInstance: Fuse<IFood | SeedFood> | null = null;

function getFuse(foods: (IFood | SeedFood)[]) {
  if (!fuseInstance) {
    fuseInstance = new Fuse(foods, {
      keys: [
        { name: 'nameBn', weight: 0.5 },
        { name: 'nameEn', weight: 0.4 },
        { name: 'aliases', weight: 0.3 },
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
    });
  }
  return fuseInstance;
}

export const foodService = {
  /**
   * Retrieves all foods with MongoDB Atlas priority and bundled seed fallback.
   * Cached in-memory with instant on-demand cache invalidation on admin writes.
   */
  async getAllFoods(): Promise<(IFood | SeedFood)[]> {
    if (cachedFoods && cachedFoods.length > 0) {
      return cachedFoods;
    }

    const db = await connectToDatabase();
    if (db) {
      try {
        const dbFoods = await FoodModel.find({}).sort({ createdAt: -1 }).lean();
        if (dbFoods && dbFoods.length > 0) {
          cachedFoods = dbFoods as IFood[];
          fuseInstance = null;
          return cachedFoods;
        }
      } catch (err) {
        console.warn('FoodModel.find failed, using bundled seed data fallback:', err);
      }
    }

    cachedFoods = BANGLADESHI_FOODS_DATA;
    fuseInstance = null;
    return cachedFoods;
  },

  /**
   * Invalidates food memory cache so newly imported or edited foods show immediately.
   */
  invalidateCache() {
    cachedFoods = null;
    fuseInstance = null;
  },

  /**
   * Search foods with fuzzy bilingual matching and database / memory fallback
   */
  async searchFoods(options: FoodSearchOptions = {}): Promise<FoodSearchResult> {
    const { q = '', category, page = 1, limit = 20 } = options;
    const db = await connectToDatabase();

    // If MongoDB Atlas is connected and text query provided, attempt direct DB search
    if (db && q.trim()) {
      try {
        const queryFilter: Record<string, unknown> = {};
        if (category && category !== 'all') {
          queryFilter.category = category;
        }

        queryFilter.$text = { $search: q.trim() };

        const skip = (page - 1) * limit;
        const [foods, total] = await Promise.all([
          FoodModel.find(queryFilter).skip(skip).limit(limit).lean(),
          FoodModel.countDocuments(queryFilter),
        ]);

        if (total > 0) {
          return {
            foods: foods as IFood[],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          };
        }
      } catch (err) {
        console.warn('MongoDB text search fallback to dynamic dataset Fuse:', err);
      }
    }

    // Dynamic Fuse.js in-memory search over complete dataset (DB foods or seed fallback)
    const allFoods = await this.getAllFoods();
    let matches: (IFood | SeedFood)[] = allFoods;

    if (category && category !== 'all') {
      matches = matches.filter((item) => item.category === category);
    }

    if (q.trim()) {
      const fuse = getFuse(allFoods);
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

    const allFoods = await this.getAllFoods();
    return (
      allFoods.find(
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
    const allFoods = await this.getAllFoods();
    return allFoods.length;
  },
};
