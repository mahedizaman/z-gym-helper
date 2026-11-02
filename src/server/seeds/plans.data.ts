export interface SeedPlanExercise {
  exerciseSlug: string;
  nameBn: string;
  nameEn: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface SeedPlanSchedule {
  dayIndex: number;
  dayNameBn: string;
  dayNameEn: string;
  focusBn: string;
  focusEn: string;
  exercises: SeedPlanExercise[];
}

export interface SeedPlan {
  slug: string;
  nameBn: string;
  nameEn: string;
  daysPerWeek: number;
  splitType: 'full_body' | 'upper_lower' | 'ppl' | 'hybrid';
  level: 'beginner' | 'intermediate' | 'advanced';
  descriptionBn: string;
  descriptionEn: string;
  schedule: SeedPlanSchedule[];
}

export const WORKOUT_PLANS_DATA: SeedPlan[] = [
  // 1. 3-Day Full Body Split (A/B/C)
  {
    slug: 'full-body-3',
    nameBn: '৩-দিনের ফুল বডি স্প্লিট (A/B/C)',
    nameEn: '3-Day Full Body Split (A/B/C)',
    daysPerWeek: 3,
    splitType: 'full_body',
    level: 'beginner',
    descriptionBn:
      'ব্যস্ত মানুষদের এবং নতুন জিমগামীদের জন্য সবচেয়ে বিজ্ঞানসম্মত রুটিন। সপ্তাহে ৩ দিন প্রতিটি প্রধান পেশিতে উদ্দীপনা দেওয়া হয় এবং বাকি ৪ দিন রিকভারির সুযোগ থাকে।',
    descriptionEn:
      'Ideal for busy professionals and beginners. Hits every major muscle group 3 times a week with ample recovery.',
    schedule: [
      {
        dayIndex: 1,
        dayNameBn: 'দিন ১ (রবিবার) - ফুল বডি A',
        dayNameEn: 'Day 1 (Sunday) - Full Body A',
        focusBn: 'কোয়াডস, চেস্ট, ল্যাটস',
        focusEn: 'Quads, Chest, Lats',
        exercises: [
          { exerciseSlug: 'barbell-back-squat', nameBn: 'বারবেল ব্যাক স্কোয়াট', nameEn: 'Barbell Back Squat', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseSlug: 'barbell-bench-press', nameBn: 'বারবেল ফ্ল্যাট বেঞ্চ প্রেস', nameEn: 'Barbell Bench Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'lat-pulldown', nameBn: 'ল্যাট পুলডাউন', nameEn: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'dumbbell-lateral-raise', nameBn: 'ডাম্বেল ল্যাটারাল রেইজ', nameEn: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'barbell-bicep-curl', nameBn: 'বারবেল বাইসেপ কার্ল', nameEn: 'Barbell Bicep Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseSlug: 'plank', nameBn: 'স্ট্যান্ডার্ড প্ল্যাঙ্ক', nameEn: 'Plank', sets: 3, reps: '45-60 sec', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 2,
        dayNameBn: 'দিন ২ (মঙ্গলবার) - ফুল বডি B',
        dayNameEn: 'Day 2 (Tuesday) - Full Body B',
        focusBn: 'হ্যামস্ট্রিং, শোল্ডার, আপার ব্যাক',
        focusEn: 'Hamstrings, Shoulders, Upper Back',
        exercises: [
          { exerciseSlug: 'romanian-deadlift', nameBn: 'রোমানিয়ান ডেডলিফট (RDL)', nameEn: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseSlug: 'overhead-press-barbell', nameBn: 'ওভারহেড বারবেল প্রেস', nameEn: 'Overhead Barbell Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'barbell-bent-over-row', nameBn: 'বারবেল বেন্ট ওভার রো', nameEn: 'Bent-Over Row', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'push-ups', nameBn: 'পুশ-আপ', nameEn: 'Push-Ups', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'tricep-rope-pushdown', nameBn: 'কেবল ট্রাইসেপ রোপ পুশডাউন', nameEn: 'Tricep Rope Pushdown', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseSlug: 'hanging-leg-raise', nameBn: 'হ্যাংগিং লেগ রেইজ', nameEn: 'Hanging Leg Raise', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 3,
        dayNameBn: 'দিন ৩ (বৃহস্পতিবার) - ফুল বডি C',
        dayNameEn: 'Day 3 (Thursday) - Full Body C',
        focusBn: 'লেগস, ইনক্লাইন চেস্ট, আপার ব্যাক',
        focusEn: 'Legs, Incline Chest, Upper Back',
        exercises: [
          { exerciseSlug: 'leg-press', nameBn: 'মেশিন লেগ প্রেস', nameEn: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'incline-dumbbell-press', nameBn: 'ইনক্লাইন ডাম্বেল প্রেস', nameEn: 'Incline Dumbbell Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'seated-cable-row', nameBn: 'সিটেড কেবল রো', nameEn: 'Seated Cable Row', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'face-pulls', nameBn: 'কেবল ফেস পুল', nameEn: 'Cable Face Pull', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'dumbbell-hammer-curl', nameBn: 'ডাম্বেল হ্যামার কার্ল', nameEn: 'Dumbbell Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseSlug: 'standing-calf-raises', nameBn: 'স্ট্যান্ডিং কাফ রেইজ', nameEn: 'Standing Calf Raise', sets: 4, reps: '15', restSeconds: 60 },
        ],
      },
    ],
  },

  // 2. 4-Day Upper / Lower Split
  {
    slug: 'upper-lower-4',
    nameBn: '৪-দিনের আপার / লোয়ার হাইপারট্রফি',
    nameEn: '4-Day Upper / Lower Hypertrophy',
    daysPerWeek: 4,
    splitType: 'upper_lower',
    level: 'intermediate',
    descriptionBn:
      'মাংসপেশি গঠন ও শক্তির জন্য সারা বিশ্বে সর্বাধিক প্রশংসিত গোল্ড স্ট্যান্ডার্ড স্প্লিট। প্রতি পেশি সপ্তাহে ২ বার ট্রেন করার মাধ্যমে সেরা ফলাফল পাওয়া যায়।',
    descriptionEn:
      'The gold standard hypertrophy split. Trains each muscle group twice weekly with optimal rest.',
    schedule: [
      {
        dayIndex: 1,
        dayNameBn: 'দিন ১ (সোমবার) - আপার বডি A',
        dayNameEn: 'Day 1 (Monday) - Upper Body A',
        focusBn: 'ভারী চেস্ট ও ব্যাক',
        focusEn: 'Heavy Chest & Back',
        exercises: [
          { exerciseSlug: 'barbell-bench-press', nameBn: 'বারবেল ফ্ল্যাট বেঞ্চ প্রেস', nameEn: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 120 },
          { exerciseSlug: 'barbell-bent-over-row', nameBn: 'বারবেল বেন্ট ওভার রো', nameEn: 'Bent-Over Row', sets: 4, reps: '6-8', restSeconds: 120 },
          { exerciseSlug: 'seated-dumbbell-shoulder-press', nameBn: 'সিটেড ডাম্বেল শোল্ডার প্রেস', nameEn: 'Shoulder Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'lat-pulldown', nameBn: 'ল্যাট পুলডাউন', nameEn: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'skull-crushers', nameBn: 'স্কাল ক্রাশার', nameEn: 'Skull Crushers', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseSlug: 'barbell-bicep-curl', nameBn: 'বারবেল বাইসেপ কার্ল', nameEn: 'Bicep Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 2,
        dayNameBn: 'দিন ২ (মঙ্গলবার) - লোয়ার বডি A',
        dayNameEn: 'Day 2 (Tuesday) - Lower Body A',
        focusBn: 'কোয়াডস ও কোর',
        focusEn: 'Quads & Abs',
        exercises: [
          { exerciseSlug: 'barbell-back-squat', nameBn: 'বারবেল ব্যাক স্কোয়াট', nameEn: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150 },
          { exerciseSlug: 'romanian-deadlift', nameBn: 'রোমানিয়ান ডেডলিফট (RDL)', nameEn: 'Romanian Deadlift', sets: 3, reps: '8-10', restSeconds: 120 },
          { exerciseSlug: 'leg-press', nameBn: 'মেশিন লেগ প্রেস', nameEn: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'leg-extension', nameBn: 'লেগ এক্সটেনশন', nameEn: 'Leg Extension', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'standing-calf-raises', nameBn: 'স্ট্যান্ডিং কাফ রেইজ', nameEn: 'Calf Raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'hanging-leg-raise', nameBn: 'হ্যাংগিং লেগ রেইজ', nameEn: 'Hanging Leg Raise', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 3,
        dayNameBn: 'দিন ৩ (বৃহস্পতিবার) - আপার বডি B',
        dayNameEn: 'Day 3 (Thursday) - Upper Body B',
        focusBn: 'ইনক্লাইন চেস্ট, ল্যাটস, কাঁধ',
        focusEn: 'Incline Chest, Lats, Delts',
        exercises: [
          { exerciseSlug: 'incline-dumbbell-press', nameBn: 'ইনক্লাইন ডাম্বেল প্রেস', nameEn: 'Incline Dumbbell Press', sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'pull-ups', nameBn: 'ওয়াইড গ্রিপ পুল-আপ', nameEn: 'Pull-Up', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'cable-crossover', nameBn: 'কেবল ক্রসওভার', nameEn: 'Cable Crossover', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'seated-cable-row', nameBn: 'সিটেড কেবল রো', nameEn: 'Seated Cable Row', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'dumbbell-lateral-raise', nameBn: 'ডাম্বেল ল্যাটারাল রেইজ', nameEn: 'Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'tricep-rope-pushdown', nameBn: 'ট্রাইসেপ রোপ পুশডাউন', nameEn: 'Rope Pushdown', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseSlug: 'dumbbell-hammer-curl', nameBn: 'ডাম্বেল হ্যামার কার্ল', nameEn: 'Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 4,
        dayNameBn: 'দিন ৪ (শুক্রবার) - লোয়ার বডি B',
        dayNameEn: 'Day 4 (Friday) - Lower Body B',
        focusBn: 'পোস্টেরিয়র চেইন ও গ্লুটস',
        focusEn: 'Posterior Chain & Glutes',
        exercises: [
          { exerciseSlug: 'barbell-deadlift', nameBn: 'বারবেল ডেডলিফট', nameEn: 'Conventional Deadlift', sets: 3, reps: '5', restSeconds: 180 },
          { exerciseSlug: 'walking-lunges', nameBn: 'ওয়াকিং লাঞ্জেস', nameEn: 'Walking Lunges', sets: 3, reps: '10 প্রতি পা', restSeconds: 90 },
          { exerciseSlug: 'leg-press', nameBn: 'মেশিন লেগ প্রেস', nameEn: 'Leg Press', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseSlug: 'standing-calf-raises', nameBn: 'স্ট্যান্ডিং কাফ রেইজ', nameEn: 'Calf Raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'plank', nameBn: 'প্ল্যাঙ্ক', nameEn: 'Plank', sets: 3, reps: '60 sec', restSeconds: 60 },
        ],
      },
    ],
  },

  // 3. 5-Day Hybrid Split
  {
    slug: 'hybrid-5',
    nameBn: '৫-দিনের অ্যাথলেটিক হাইব্রিড স্প্লিট',
    nameEn: '5-Day Athletic Hybrid Split',
    daysPerWeek: 5,
    splitType: 'hybrid',
    level: 'intermediate',
    descriptionBn:
      'পুশ-পুল-লেগস এবং আপার-লোয়ারের সংমিশ্রণে বিশেষায়িত ৫ দিনের তীব্র হাইপারট্রফি প্ল্যান।',
    descriptionEn:
      'Intense Push-Pull-Legs and Upper-Lower hybrid for dedicated lifters wanting balanced volume.',
    schedule: [
      {
        dayIndex: 1,
        dayNameBn: 'দিন ১ - পুশ (Push)',
        dayNameEn: 'Day 1 - Push',
        focusBn: 'চেস্ট, শোল্ডার, ট্রাইসেপস',
        focusEn: 'Chest, Shoulders, Triceps',
        exercises: [
          { exerciseSlug: 'barbell-bench-press', nameBn: 'বারবেল বেঞ্চ প্রেস', nameEn: 'Bench Press', sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'overhead-press-barbell', nameBn: 'ওভারহেড প্রেস', nameEn: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'incline-dumbbell-press', nameBn: 'ইনক্লাইন প্রেস', nameEn: 'Incline Press', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseSlug: 'dumbbell-lateral-raise', nameBn: 'ল্যাটারাল রেইজ', nameEn: 'Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'tricep-rope-pushdown', nameBn: 'ট্রাইসেপ পুশডাউন', nameEn: 'Tricep Pushdown', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 2,
        dayNameBn: 'দিন ২ - পুল (Pull)',
        dayNameEn: 'Day 2 - Pull',
        focusBn: 'ব্যাক ও বাইসেপস',
        focusEn: 'Back & Biceps',
        exercises: [
          { exerciseSlug: 'barbell-bent-over-row', nameBn: 'বারবেল রো', nameEn: 'Barbell Row', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseSlug: 'lat-pulldown', nameBn: 'ল্যাট পুলডাউন', nameEn: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'single-arm-dumbbell-row', nameBn: 'সিঙ্গেল আর্ম রো', nameEn: 'Single Arm Row', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseSlug: 'face-pulls', nameBn: 'ফেস পুল', nameEn: 'Face Pull', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'barbell-bicep-curl', nameBn: 'বারবেল কার্ল', nameEn: 'Barbell Curl', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 3,
        dayNameBn: 'দিন ৩ - লেগস (Legs)',
        dayNameEn: 'Day 3 - Legs',
        focusBn: 'কোয়াডস, হ্যামস্ট্রিং, কাফ',
        focusEn: 'Quads, Hamstrings, Calves',
        exercises: [
          { exerciseSlug: 'barbell-back-squat', nameBn: 'ব্যাক স্কোয়াট', nameEn: 'Back Squat', sets: 4, reps: '8', restSeconds: 120 },
          { exerciseSlug: 'romanian-deadlift', nameBn: 'রোমানিয়ান ডেডলিফট', nameEn: 'RDL', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'leg-press', nameBn: 'লেগ প্রেস', nameEn: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'standing-calf-raises', nameBn: 'কাফ রেইজ', nameEn: 'Calf Raise', sets: 4, reps: '15', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 4,
        dayNameBn: 'দিন ৪ - আপার বডি (Upper Body)',
        dayNameEn: 'Day 4 - Upper Body',
        focusBn: 'আপার মাসল ভলিউম',
        focusEn: 'Upper Muscle Volume',
        exercises: [
          { exerciseSlug: 'pull-ups', nameBn: 'পুল-আপ', nameEn: 'Pull-Up', sets: 3, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'parallel-bar-dips', nameBn: 'চেস্ট ডিপস', nameEn: 'Chest Dips', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseSlug: 'seated-cable-row', nameBn: 'সিটেড কেবল রো', nameEn: 'Cable Row', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'dumbbell-lateral-raise', nameBn: 'ল্যাটারাল রেইজ', nameEn: 'Lateral Raise', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'dumbbell-hammer-curl', nameBn: 'হ্যামার কার্ল', nameEn: 'Hammer Curl', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 5,
        dayNameBn: 'দিন ৫ - লোয়ার বডি ও কোর (Lower & Core)',
        dayNameEn: 'Day 5 - Lower & Core',
        focusBn: 'লেগ ভলিউম ও অ্যাবস',
        focusEn: 'Leg Volume & Abs',
        exercises: [
          { exerciseSlug: 'barbell-deadlift', nameBn: 'বারবেল ডেডলিফট', nameEn: 'Deadlift', sets: 3, reps: '5', restSeconds: 150 },
          { exerciseSlug: 'walking-lunges', nameBn: 'ওয়াকিং লাঞ্জেস', nameEn: 'Walking Lunges', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseSlug: 'hanging-leg-raise', nameBn: 'হ্যাংগিং লেগ রেইজ', nameEn: 'Leg Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'ab-wheel-rollout', nameBn: 'অ্যাব হুইল রোলআউট', nameEn: 'Ab Wheel', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
    ],
  },

  // 4. 6-Day Push-Pull-Legs Split (PPL x2)
  {
    slug: 'ppl-6',
    nameBn: '৬-দিনের পুশ-পুল-লেগস (PPL x2)',
    nameEn: '6-Day Push-Pull-Legs (PPL x2)',
    daysPerWeek: 6,
    splitType: 'ppl',
    level: 'advanced',
    descriptionBn:
      'অভিজ্ঞ অ্যাথলেটদের জন্য সর্বাধিক ভলিউম ও পেশি বৃদ্ধির ঐতিহ্যবাহী বডিবিল্ডিং প্ল্যান। প্রতি পেশি সপ্তাহে ২ বার কঠোরভাবে ট্রেন করা হয়।',
    descriptionEn:
      'Maximum volume split for dedicated lifters with optimal protein intake and recovery.',
    schedule: [
      {
        dayIndex: 1,
        dayNameBn: 'দিন ১ - পুশ A',
        dayNameEn: 'Day 1 - Push A',
        focusBn: 'চেস্ট ফোকাস',
        focusEn: 'Chest Focus',
        exercises: [
          { exerciseSlug: 'barbell-bench-press', nameBn: 'বেঞ্চ প্রেস', nameEn: 'Bench Press', sets: 4, reps: '6-8', restSeconds: 120 },
          { exerciseSlug: 'overhead-press-barbell', nameBn: 'ওভারহেড প্রেস', nameEn: 'OHP', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseSlug: 'incline-dumbbell-press', nameBn: 'ইনক্লাইন ডাম্বেল প্রেস', nameEn: 'Incline Press', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseSlug: 'dumbbell-lateral-raise', nameBn: 'ল্যাটারাল রেইজ', nameEn: 'Lateral Raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'skull-crushers', nameBn: 'স্কাল ক্রাশার', nameEn: 'Skull Crushers', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 2,
        dayNameBn: 'দিন ২ - পুল A',
        dayNameEn: 'Day 2 - Pull A',
        focusBn: 'ল্যাটস ও উইডথ',
        focusEn: 'Lats & Width',
        exercises: [
          { exerciseSlug: 'pull-ups', nameBn: 'পুল-আপ', nameEn: 'Pull-Up', sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'barbell-bent-over-row', nameBn: 'বারবেল রো', nameEn: 'Barbell Row', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseSlug: 'seated-cable-row', nameBn: 'সিটেড কেবল রো', nameEn: 'Cable Row', sets: 3, reps: '10-12', restSeconds: 60 },
          { exerciseSlug: 'face-pulls', nameBn: 'ফেস পুল', nameEn: 'Face Pull', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'barbell-bicep-curl', nameBn: 'বারবেল কার্ল', nameEn: 'Barbell Curl', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 3,
        dayNameBn: 'দিন ৩ - লেগস A',
        dayNameEn: 'Day 3 - Legs A',
        focusBn: 'কোয়াডস ও কাফ',
        focusEn: 'Quads & Calves',
        exercises: [
          { exerciseSlug: 'barbell-back-squat', nameBn: 'ব্যাক স্কোয়াট', nameEn: 'Squat', sets: 4, reps: '6-8', restSeconds: 150 },
          { exerciseSlug: 'leg-press', nameBn: 'লেগ প্রেস', nameEn: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'leg-extension', nameBn: 'লেগ এক্সটেনশন', nameEn: 'Leg Extension', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'standing-calf-raises', nameBn: 'কাফ রেইজ', nameEn: 'Calf Raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'hanging-leg-raise', nameBn: 'লেগ রেইজ', nameEn: 'Leg Raise', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 4,
        dayNameBn: 'দিন ৪ - পুশ B',
        dayNameEn: 'Day 4 - Push B',
        focusBn: 'শোল্ডার ও আপার পেক',
        focusEn: 'Delts & Upper Pec',
        exercises: [
          { exerciseSlug: 'incline-dumbbell-press', nameBn: 'ইনক্লাইন ডাম্বেল প্রেস', nameEn: 'Incline Press', sets: 4, reps: '8-10', restSeconds: 90 },
          { exerciseSlug: 'parallel-bar-dips', nameBn: 'চেস্ট ডিপস', nameEn: 'Chest Dips', sets: 3, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'cable-crossover', nameBn: 'কেবল ক্রসওভার', nameEn: 'Cable Crossover', sets: 3, reps: '12-15', restSeconds: 60 },
          { exerciseSlug: 'dumbbell-lateral-raise', nameBn: 'ল্যাটারাল রেইজ', nameEn: 'Lateral Raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'tricep-rope-pushdown', nameBn: 'রোপ পুশডাউন', nameEn: 'Rope Pushdown', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 5,
        dayNameBn: 'দিন ৫ - পুল B',
        dayNameEn: 'Day 5 - Pull B',
        focusBn: 'থিকনেস ও ট্র্যাপস',
        focusEn: 'Back Thickness & Traps',
        exercises: [
          { exerciseSlug: 'barbell-deadlift', nameBn: 'বারবেল ডেডলিফট', nameEn: 'Deadlift', sets: 3, reps: '5', restSeconds: 180 },
          { exerciseSlug: 'lat-pulldown', nameBn: 'ল্যাট পুলডাউন', nameEn: 'Lat Pulldown', sets: 4, reps: '10-12', restSeconds: 90 },
          { exerciseSlug: 'single-arm-dumbbell-row', nameBn: 'ডাম্বেল রো', nameEn: 'Dumbbell Row', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseSlug: 'dumbbell-hammer-curl', nameBn: 'হ্যামার কার্ল', nameEn: 'Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayIndex: 6,
        dayNameBn: 'দিন ৬ - লেগস B',
        dayNameEn: 'Day 6 - Legs B',
        focusBn: 'হ্যামস্ট্রিং ও গ্লুটস',
        focusEn: 'Hamstrings & Glutes',
        exercises: [
          { exerciseSlug: 'romanian-deadlift', nameBn: 'রোমানিয়ান ডেডলিফট', nameEn: 'RDL', sets: 4, reps: '8-10', restSeconds: 120 },
          { exerciseSlug: 'walking-lunges', nameBn: 'ওয়াকিং লাঞ্জেস', nameEn: 'Walking Lunges', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseSlug: 'leg-press', nameBn: 'লেগ প্রেস', nameEn: 'Leg Press', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseSlug: 'standing-calf-raises', nameBn: 'কাফ রেইজ', nameEn: 'Calf Raise', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseSlug: 'plank', nameBn: 'প্ল্যাঙ্ক', nameEn: 'Plank', sets: 3, reps: '60 sec', restSeconds: 60 },
        ],
      },
    ],
  },
];
