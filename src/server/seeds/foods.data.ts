import { generateBangladeshiFoods, type SeedFood } from './generate-foods';

export type { SeedFood };
export const BANGLADESHI_FOODS_DATA: SeedFood[] = generateBangladeshiFoods();
