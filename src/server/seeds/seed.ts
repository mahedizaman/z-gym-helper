import { connectToDatabase, loadEnvLocal, sanitizeDbError } from '../db';
import { FoodModel } from '../models/food.model';
import { ExerciseModel } from '../models/exercise.model';
import { PlanModel } from '../models/plan.model';
import { BANGLADESHI_FOODS_DATA } from './foods.data';
import { CORE_EXERCISES_DATA } from './exercises.data';
import { WORKOUT_PLANS_DATA } from './plans.data';

export async function runDatabaseSeed(options?: { throwOnError?: boolean }) {
  loadEnvLocal();
  console.log('🌱 Starting Z-Gym Helper Database Seeding...');
  const db = await connectToDatabase({ throwOnError: options?.throwOnError ?? false });

  if (!db) {
    const errorMsg = 'MongoDB connection not available. Unable to seed database.';
    console.error(`❌ ${errorMsg}`);
    if (options?.throwOnError) {
      throw new Error(errorMsg);
    }
    return { success: false, message: errorMsg };
  }

  try {
    // 1. Seed Foods (300+ items)
    console.log(`🥦 Seeding ${BANGLADESHI_FOODS_DATA.length} Bangladeshi foods...`);
    for (const food of BANGLADESHI_FOODS_DATA) {
      await FoodModel.findOneAndUpdate(
        { nameEn: food.nameEn },
        { $set: food },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // 2. Seed Exercises (30+ items)
    console.log(`🏋️ Seeding ${CORE_EXERCISES_DATA.length} core exercises...`);
    for (const ex of CORE_EXERCISES_DATA) {
      await ExerciseModel.findOneAndUpdate(
        { slug: ex.slug },
        { $set: ex },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // 3. Seed Workout Plans (4 splits)
    console.log(`📋 Seeding ${WORKOUT_PLANS_DATA.length} workout splits...`);
    for (const plan of WORKOUT_PLANS_DATA) {
      await PlanModel.findOneAndUpdate(
        { slug: plan.slug },
        { $set: plan },
        { upsert: true, returnDocument: 'after' }
      );
    }

    const foodCount = await FoodModel.countDocuments();
    const exCount = await ExerciseModel.countDocuments();
    const planCount = await PlanModel.countDocuments();

    console.log('📊 Collection document counts:');
    console.log(`- Foods (foods): ${foodCount}`);
    console.log(`- Exercises (exercises): ${exCount}`);
    console.log(`- Workout Plans (plans): ${planCount}`);

    return {
      success: true,
      seeded: {
        foods: foodCount,
        exercises: exCount,
        plans: planCount,
      },
    };
  } catch (error) {
    const sanitized = sanitizeDbError(error);
    console.error('❌ Error during database seeding:', sanitized);
    throw new Error(sanitized);
  }
}

// Run if called directly via CLI
const isDirectRun = Boolean(
  process.argv[1] &&
    (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))
);

if (isDirectRun) {
  loadEnvLocal();
  runDatabaseSeed({ throwOnError: true })
    .then((result) => {
      if (result.success) {
        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Seeding failed:', result.message);
        process.exit(1);
      }
    })
    .catch((err) => {
      const sanitized = sanitizeDbError(err);
      console.error('❌ Seeding failed:', sanitized);
      process.exit(1);
    });
}
