/**
 * Verified Free Exercise DB image mappings.
 * Source: https://github.com/yuhonas/free-exercise-db (The Unlicense / Public Domain)
 * Each exercise provides starting (0.jpg) and finishing (1.jpg) positions.
 */

const BASE_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export const EXERCISE_IMAGES_MAP: Record<string, [string, string]> = {
  'barbell-bench-press': [
    `${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/0.jpg`,
    `${BASE_URL}/Barbell_Bench_Press_-_Medium_Grip/1.jpg`,
  ],
  'incline-dumbbell-press': [
    `${BASE_URL}/Incline_Dumbbell_Press/0.jpg`,
    `${BASE_URL}/Incline_Dumbbell_Press/1.jpg`,
  ],
  'dumbbell-flye': [
    `${BASE_URL}/Dumbbell_Flyes/0.jpg`,
    `${BASE_URL}/Dumbbell_Flyes/1.jpg`,
  ],
  'cable-crossover': [
    `${BASE_URL}/Cable_Crossover/0.jpg`,
    `${BASE_URL}/Cable_Crossover/1.jpg`,
  ],
  'push-ups': [
    `${BASE_URL}/Pushups/0.jpg`,
    `${BASE_URL}/Pushups/1.jpg`,
  ],
  'parallel-bar-dips': [
    `${BASE_URL}/Dips_-_Chest_Version/0.jpg`,
    `${BASE_URL}/Dips_-_Chest_Version/1.jpg`,
  ],
  'barbell-deadlift': [
    `${BASE_URL}/Barbell_Deadlift/0.jpg`,
    `${BASE_URL}/Barbell_Deadlift/1.jpg`,
  ],
  'pull-ups': [
    `${BASE_URL}/Pullups/0.jpg`,
    `${BASE_URL}/Pullups/1.jpg`,
  ],
  'lat-pulldown': [
    `${BASE_URL}/Wide-Grip_Lat_Pulldown/0.jpg`,
    `${BASE_URL}/Wide-Grip_Lat_Pulldown/1.jpg`,
  ],
  'barbell-bent-over-row': [
    `${BASE_URL}/Bent_Over_Barbell_Row/0.jpg`,
    `${BASE_URL}/Bent_Over_Barbell_Row/1.jpg`,
  ],
  'seated-cable-row': [
    `${BASE_URL}/Seated_Cable_Rows/0.jpg`,
    `${BASE_URL}/Seated_Cable_Rows/1.jpg`,
  ],
  'single-arm-dumbbell-row': [
    `${BASE_URL}/One-Arm_Dumbbell_Row/0.jpg`,
    `${BASE_URL}/One-Arm_Dumbbell_Row/1.jpg`,
  ],
  'overhead-press-barbell': [
    `${BASE_URL}/Barbell_Shoulder_Press/0.jpg`,
    `${BASE_URL}/Barbell_Shoulder_Press/1.jpg`,
  ],
  'dumbbell-lateral-raise': [
    `${BASE_URL}/Side_Lateral_Raise/0.jpg`,
    `${BASE_URL}/Side_Lateral_Raise/1.jpg`,
  ],
  'seated-dumbbell-shoulder-press': [
    `${BASE_URL}/Dumbbell_Shoulder_Press/0.jpg`,
    `${BASE_URL}/Dumbbell_Shoulder_Press/1.jpg`,
  ],
  'face-pulls': [
    `${BASE_URL}/Face_Pull/0.jpg`,
    `${BASE_URL}/Face_Pull/1.jpg`,
  ],
  'dumbbell-front-raise': [
    `${BASE_URL}/Front_Dumbbell_Raise/0.jpg`,
    `${BASE_URL}/Front_Dumbbell_Raise/1.jpg`,
  ],
  'barbell-back-squat': [
    `${BASE_URL}/Barbell_Full_Squat/0.jpg`,
    `${BASE_URL}/Barbell_Full_Squat/1.jpg`,
  ],
  'romanian-deadlift': [
    `${BASE_URL}/Romanian_Deadlift/0.jpg`,
    `${BASE_URL}/Romanian_Deadlift/1.jpg`,
  ],
  'leg-press': [
    `${BASE_URL}/Leg_Press/0.jpg`,
    `${BASE_URL}/Leg_Press/1.jpg`,
  ],
  'walking-lunges': [
    `${BASE_URL}/Dumbbell_Lunges/0.jpg`,
    `${BASE_URL}/Dumbbell_Lunges/1.jpg`,
  ],
  'leg-extension': [
    `${BASE_URL}/Leg_Extensions/0.jpg`,
    `${BASE_URL}/Leg_Extensions/1.jpg`,
  ],
  'standing-calf-raises': [
    `${BASE_URL}/Standing_Calf_Raises/0.jpg`,
    `${BASE_URL}/Standing_Calf_Raises/1.jpg`,
  ],
  'barbell-bicep-curl': [
    `${BASE_URL}/Barbell_Curl/0.jpg`,
    `${BASE_URL}/Barbell_Curl/1.jpg`,
  ],
  'dumbbell-hammer-curl': [
    `${BASE_URL}/Hammer_Curls/0.jpg`,
    `${BASE_URL}/Hammer_Curls/1.jpg`,
  ],
  'tricep-rope-pushdown': [
    `${BASE_URL}/Triceps_Pushdown_-_Rope_Attachment/0.jpg`,
    `${BASE_URL}/Triceps_Pushdown_-_Rope_Attachment/1.jpg`,
  ],
  'skull-crushers': [
    `${BASE_URL}/Lying_Dumbbell_Tricep_Extension/0.jpg`,
    `${BASE_URL}/Lying_Dumbbell_Tricep_Extension/1.jpg`,
  ],
  'overhead-dumbbell-tricep-extension': [
    `${BASE_URL}/Dumbbell_Tricep_Extension_-Pronated_Grip/0.jpg`,
    `${BASE_URL}/Dumbbell_Tricep_Extension_-Pronated_Grip/1.jpg`,
  ],
  'hanging-leg-raise': [
    `${BASE_URL}/Hanging_Leg_Raise/0.jpg`,
    `${BASE_URL}/Hanging_Leg_Raise/1.jpg`,
  ],
  'plank': [
    `${BASE_URL}/Plank/0.jpg`,
    `${BASE_URL}/Plank/1.jpg`,
  ],
  'cable-woodchopper': [
    `${BASE_URL}/Standing_Cable_Wood_Chop/0.jpg`,
    `${BASE_URL}/Standing_Cable_Wood_Chop/1.jpg`,
  ],
  'ab-wheel-rollout': [
    `${BASE_URL}/Barbell_Ab_Rollout_-_On_Knees/0.jpg`,
    `${BASE_URL}/Barbell_Ab_Rollout_-_On_Knees/1.jpg`,
  ],
  'russian-twist': [
    `${BASE_URL}/Russian_Twist/0.jpg`,
    `${BASE_URL}/Russian_Twist/1.jpg`,
  ],
};

export function getExerciseImages(slug: string): string[] {
  return EXERCISE_IMAGES_MAP[slug] || [];
}
