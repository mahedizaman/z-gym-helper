import { connectToDatabase } from '../db';
import { FoodModel } from '../models/food.model';
import { ExerciseModel } from '../models/exercise.model';
import { PlanModel } from '../models/plan.model';
import { BANGLADESHI_FOODS_DATA } from './foods.data';
import { CORE_EXERCISES_DATA } from './exercises.data';
import { WORKOUT_PLANS_DATA } from './plans.data';

export async function runDatabaseSeed() {
  console.log('🌱 Starting Z-Gym Helper Database Seeding...');
  const db = await connectToDatabase();

  if (!db) {
    console.log('⚠️ MongoDB connection not available. In-memory data is ready for standalone operation.');
    return { success: false, message: 'Database not connected' };
  }

  try {
    // 1. Seed Foods (300+ items)
    console.log(`🥦 Seeding ${BANGLADESHI_FOODS_DATA.length} Bangladeshi foods...`);
    for (const food of BANGLADESHI_FOODS_DATA) {
      await FoodModel.findOneAndUpdate(
        { nameEn: food.nameEn },
        { $set: food },
        { upsert: true, new: true }
      );
    }
    const foodCount = await FoodModel.countDocuments();
    console.log(`✅ Foods seeded: ${foodCount} total in database.`);

    // 2. Seed Exercises (30+ items)
    console.log(`🏋️ Seeding ${CORE_EXERCISES_DATA.length} core exercises...`);
    for (const ex of CORE_EXERCISES_DATA) {
      await ExerciseModel.findOneAndUpdate(
        { slug: ex.slug },
        { $set: ex },
        { upsert: true, new: true }
      );
    }
    const exCount = await ExerciseModel.countDocuments();
    console.log(`✅ Exercises seeded: ${exCount} total in database.`);

    // 3. Seed Workout Plans (4 splits)
    console.log(`📋 Seeding ${WORKOUT_PLANS_DATA.length} workout splits...`);
    for (const plan of WORKOUT_PLANS_DATA) {
      await PlanModel.findOneAndUpdate(
        { slug: plan.slug },
        { $set: plan },
        { upsert: true, new: true }
      );
    }
    const planCount = await PlanModel.countDocuments();
    console.log(`✅ Plans seeded: ${planCount} total in database.`);

    return {
      success: true,
      seeded: {
        foods: foodCount,
        exercises: exCount,
        plans: planCount,
      },
    };
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runDatabaseSeed()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
