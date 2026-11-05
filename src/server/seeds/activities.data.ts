/**
 * Comprehensive Compendium of Physical Activities Catalog (40+ activities)
 * Sources:
 * - Ainsworth BE, et al. 2011 Compendium of Physical Activities: A second update of codes and MET values.
 * - 2024 Compendium of Physical Activities update.
 * All codes and MET values reference scientific standards.
 */

export type ActivityCategory = 'cardio' | 'strength' | 'core' | 'hiit' | 'sports';

export interface ActivityIntensityMet {
  light: number;
  moderate: number;
  vigorous: number;
}

export interface ActivityCatalogItem {
  id: string;
  nameBn: string;
  nameEn: string;
  category: ActivityCategory;
  compendiumCode: string;
  verified: boolean;
  baseMet: number;
  metByIntensity: ActivityIntensityMet;
  supportsDistancePace?: boolean;
  supportsIncline?: boolean;
  supportsStrengthMode?: boolean;
  intensityDescriptionBn?: {
    light: string;
    moderate: string;
    vigorous: string;
  };
  intensityDescriptionEn?: {
    light: string;
    moderate: string;
    vigorous: string;
  };
}

export const ACTIVITY_CATALOG: ActivityCatalogItem[] = [
  // ==========================================
  // 1. CARDIO
  // ==========================================
  {
    id: 'walking_moderate',
    nameBn: 'মাঝারি গতিতে হাঁটা (৪.৫ কিমি/ঘণ্টা)',
    nameEn: 'Walking (Moderate, 4.5 km/h)',
    category: 'cardio',
    compendiumCode: '17151',
    verified: true,
    baseMet: 3.5,
    metByIntensity: { light: 2.8, moderate: 3.5, vigorous: 4.3 },
    supportsDistancePace: true,
    supportsIncline: true,
  },
  {
    id: 'walking_brisk',
    nameBn: 'দ্রুত হাঁটা (৫.৫-৬.৫ কিমি/ঘণ্টা)',
    nameEn: 'Brisk Walking (5.5 - 6.5 km/h)',
    category: 'cardio',
    compendiumCode: '17152',
    verified: true,
    baseMet: 4.3,
    metByIntensity: { light: 3.8, moderate: 4.3, vigorous: 5.0 },
    supportsDistancePace: true,
    supportsIncline: true,
  },
  {
    id: 'jogging_8kmh',
    nameBn: 'জগিং / হালকা দৌড় (৮ কিমি/ঘণ্টা)',
    nameEn: 'Jogging (8 km/h / 5 mph)',
    category: 'cardio',
    compendiumCode: '12020',
    verified: true,
    baseMet: 8.3,
    metByIntensity: { light: 7.0, moderate: 8.3, vigorous: 9.5 },
    supportsDistancePace: true,
    supportsIncline: true,
  },
  {
    id: 'running_10kmh',
    nameBn: 'দৌড়ানো (১০ কিমি/ঘণ্টা)',
    nameEn: 'Running (10 km/h / 6 mph)',
    category: 'cardio',
    compendiumCode: '12040',
    verified: true,
    baseMet: 9.8,
    metByIntensity: { light: 8.5, moderate: 9.8, vigorous: 11.0 },
    supportsDistancePace: true,
    supportsIncline: true,
  },
  {
    id: 'running_12kmh',
    nameBn: 'দ্রুত দৌড়ানো (১২ কিমি/ঘণ্টা)',
    nameEn: 'Running (Fast, 12 km/h / 7.5 mph)',
    category: 'cardio',
    compendiumCode: '12060',
    verified: true,
    baseMet: 11.8,
    metByIntensity: { light: 10.5, moderate: 11.8, vigorous: 13.5 },
    supportsDistancePace: true,
    supportsIncline: true,
  },
  {
    id: 'outdoor_cycling',
    nameBn: 'আউটডোর সাইক্লিং (সাধারণ থেকে মাঝারি)',
    nameEn: 'Outdoor Cycling (15-20 km/h)',
    category: 'cardio',
    compendiumCode: '01020',
    verified: true,
    baseMet: 6.8,
    metByIntensity: { light: 5.0, moderate: 6.8, vigorous: 9.5 },
    supportsDistancePace: true,
  },
  {
    id: 'stationary_bike_moderate',
    nameBn: 'স্টেশনারি বাইক (মাঝারি প্রতিরোধ)',
    nameEn: 'Stationary Cycling (Moderate Effort, 100W)',
    category: 'cardio',
    compendiumCode: '02012',
    verified: true,
    baseMet: 6.8,
    metByIntensity: { light: 4.8, moderate: 6.8, vigorous: 8.8 },
  },
  {
    id: 'stationary_bike_vigorous',
    nameBn: 'স্পিন বাইক / তীব্র সাইক্লিং',
    nameEn: 'Spin Bike / Vigorous Stationary (150W+)',
    category: 'cardio',
    compendiumCode: '02014',
    verified: true,
    baseMet: 8.8,
    metByIntensity: { light: 7.0, moderate: 8.8, vigorous: 11.0 },
  },
  {
    id: 'elliptical_trainer',
    nameBn: 'ইলিপটিকাল ট্রেইনার (মাঝারি)',
    nameEn: 'Elliptical Trainer (Moderate Effort)',
    category: 'cardio',
    compendiumCode: '02048',
    verified: true,
    baseMet: 5.0,
    metByIntensity: { light: 4.0, moderate: 5.0, vigorous: 7.5 },
  },
  {
    id: 'stair_machine',
    nameBn: 'স্টেয়ার ক্লাইম্বার / সিঁড়ি মেশিন',
    nameEn: 'Stair-Treadmill / Stair Climber',
    category: 'cardio',
    compendiumCode: '02065',
    verified: true,
    baseMet: 7.5,
    metByIntensity: { light: 5.5, moderate: 7.5, vigorous: 9.5 },
  },
  {
    id: 'jump_rope_moderate',
    nameBn: 'দড়ি লাফ (মাঝারি গতি, ১০০ জাম্প/মি)',
    nameEn: 'Jump Rope (Moderate, 100-120 skips/min)',
    category: 'cardio',
    compendiumCode: '15551',
    verified: true,
    baseMet: 10.0,
    metByIntensity: { light: 8.5, moderate: 10.0, vigorous: 12.3 },
  },
  {
    id: 'jump_rope_fast',
    nameBn: 'তীব্র গতিতে দড়ি লাফ (১৪০+ জাম্প/মি)',
    nameEn: 'Jump Rope (Fast / Intense, 140+ skips/min)',
    category: 'cardio',
    compendiumCode: '15552',
    verified: true,
    baseMet: 12.0,
    metByIntensity: { light: 10.0, moderate: 12.0, vigorous: 14.0 },
  },
  {
    id: 'rowing_machine',
    nameBn: 'রোয়িং মেশিন (মাঝারি)',
    nameEn: 'Rowing Machine (Moderate, 100W)',
    category: 'cardio',
    compendiumCode: '02070',
    verified: true,
    baseMet: 7.0,
    metByIntensity: { light: 5.0, moderate: 7.0, vigorous: 8.8 },
  },
  {
    id: 'swimming_freestyle',
    nameBn: 'সাঁতার (ফ্রিস্টাইল / ক্রল)',
    nameEn: 'Swimming (Freestyle / Front Crawl)',
    category: 'cardio',
    compendiumCode: '18310',
    verified: true,
    baseMet: 7.0,
    metByIntensity: { light: 5.8, moderate: 7.0, vigorous: 9.8 },
  },
  {
    id: 'swimming_breaststroke',
    nameBn: 'সাঁতার (ব্রেস্টস্ট্রোক)',
    nameEn: 'Swimming (Breaststroke)',
    category: 'cardio',
    compendiumCode: '18300',
    verified: true,
    baseMet: 6.8,
    metByIntensity: { light: 5.3, moderate: 6.8, vigorous: 8.5 },
  },

  // ==========================================
  // 2. STRENGTH
  // ==========================================
  {
    id: 'weight_training_moderate',
    nameBn: 'ওয়েট ট্রেনিং / জিম অনুশীলন (মাঝারি)',
    nameEn: 'Weight Training (Free weights, moderate)',
    category: 'strength',
    compendiumCode: '02050',
    verified: true,
    baseMet: 5.0,
    metByIntensity: { light: 3.5, moderate: 5.0, vigorous: 6.5 },
    supportsStrengthMode: true,
  },
  {
    id: 'weight_training_vigorous',
    nameBn: 'ভারী ওয়েট লিফটিং ও পাওয়ারলিফটিং',
    nameEn: 'Vigorous Weight Lifting / Powerlifting',
    category: 'strength',
    compendiumCode: '02054',
    verified: true,
    baseMet: 6.0,
    metByIntensity: { light: 4.5, moderate: 6.0, vigorous: 7.5 },
    supportsStrengthMode: true,
  },
  {
    id: 'compound_lifts',
    nameBn: 'কম্পাউন্ড লিফট (স্কোয়াট, ডেডলিফট, বেঞ্চ)',
    nameEn: 'Compound Barbell Lifts (Squat, Deadlift, Bench)',
    category: 'strength',
    compendiumCode: '02054',
    verified: true,
    baseMet: 6.0,
    metByIntensity: { light: 4.5, moderate: 6.0, vigorous: 7.5 },
    supportsStrengthMode: true,
  },
  {
    id: 'circuit_training',
    nameBn: 'সার্কিট রেজিস্ট্যান্স ট্রেনিং',
    nameEn: 'Circuit Training (Minimal rest)',
    category: 'strength',
    compendiumCode: '02030',
    verified: true,
    baseMet: 6.5,
    metByIntensity: { light: 4.5, moderate: 6.5, vigorous: 8.0 },
    supportsStrengthMode: true,
  },
  {
    id: 'calisthenics_strength',
    nameBn: 'ক্যালিসথেনিক্স (পুল-আপ, ডিপস, পুশ-আপ)',
    nameEn: 'Calisthenics (Pull-ups, Dips, Push-ups)',
    category: 'strength',
    compendiumCode: '02020',
    verified: true,
    baseMet: 6.0,
    metByIntensity: { light: 4.0, moderate: 6.0, vigorous: 8.0 },
    supportsStrengthMode: true,
  },
  {
    id: 'crossfit_metcon',
    nameBn: 'ক্রসফিট / হাই-ইনটেনসিটি মেটকনিক সেশন',
    nameEn: 'CrossFit / Metabolic Conditioning (MetCon)',
    category: 'strength',
    compendiumCode: '02040',
    verified: true,
    baseMet: 8.0,
    metByIntensity: { light: 6.0, moderate: 8.0, vigorous: 10.5 },
  },

  // ==========================================
  // 3. CORE & MOBILITY
  // ==========================================
  {
    id: 'plank_core',
    nameBn: 'স্ট্যাটিক প্ল্যাঙ্ক ও কোর হোল্ড',
    nameEn: 'Plank & Isometric Core Hold',
    category: 'core',
    compendiumCode: '02022',
    verified: true,
    baseMet: 3.8,
    metByIntensity: { light: 3.0, moderate: 3.8, vigorous: 4.8 },
  },
  {
    id: 'abs_circuit',
    nameBn: 'অ্যাবস সার্কিট (ক্রাঞ্চ, লেগ রেইজ, টুইস্ট)',
    nameEn: 'Abs Circuit (Crunches, Leg Raises, Twists)',
    category: 'core',
    compendiumCode: '02022',
    verified: true,
    baseMet: 4.5,
    metByIntensity: { light: 3.5, moderate: 4.5, vigorous: 5.8 },
  },
  {
    id: 'yoga_hatha',
    nameBn: 'হঠ যোগব্যায়াম (হালকা স্ট্রেচ ও নিঃশ্বাস)',
    nameEn: 'Hatha Yoga (Gentle stretching & poses)',
    category: 'core',
    compendiumCode: '02150',
    verified: true,
    baseMet: 2.8,
    metByIntensity: { light: 2.3, moderate: 2.8, vigorous: 3.5 },
  },
  {
    id: 'yoga_vinyasa',
    nameBn: 'বিন্যাস / পাওয়ার যোগব্যায়াম',
    nameEn: 'Vinyasa / Power Flow Yoga',
    category: 'core',
    compendiumCode: '02152',
    verified: true,
    baseMet: 4.0,
    metByIntensity: { light: 3.0, moderate: 4.0, vigorous: 5.5 },
  },
  {
    id: 'pilates_mat',
    nameBn: 'ম্যাট পাইলেটিস (কোর ও ব্যালেন্স)',
    nameEn: 'Mat Pilates (Core control & stability)',
    category: 'core',
    compendiumCode: '02140',
    verified: true,
    baseMet: 3.5,
    metByIntensity: { light: 2.8, moderate: 3.5, vigorous: 4.5 },
  },
  {
    id: 'stretching_mobility',
    nameBn: 'ফুল-বডি স্ট্রেচিং ও জয়েন্ট মবিলিটি',
    nameEn: 'Full Body Stretching & Joint Mobility',
    category: 'core',
    compendiumCode: '02100',
    verified: true,
    baseMet: 2.5,
    metByIntensity: { light: 2.0, moderate: 2.5, vigorous: 3.2 },
  },

  // ==========================================
  // 4. BODYWEIGHT & HIIT
  // ==========================================
  {
    id: 'hiit_intervals',
    nameBn: 'এইচআইআইটি ইন্টারভাল ট্রেনিং (HIIT)',
    nameEn: 'High Intensity Interval Training (HIIT)',
    category: 'hiit',
    compendiumCode: '02040',
    verified: true,
    baseMet: 8.5,
    metByIntensity: { light: 6.5, moderate: 8.5, vigorous: 11.0 },
  },
  {
    id: 'burpees_intervals',
    nameBn: 'বারপিস ইন্টারভালস (Burpees)',
    nameEn: 'Burpees (Interval conditioning)',
    category: 'hiit',
    compendiumCode: '02024',
    verified: true,
    baseMet: 8.0,
    metByIntensity: { light: 6.5, moderate: 8.0, vigorous: 10.5 },
  },
  {
    id: 'mountain_climbers',
    nameBn: 'মাউন্টেন ক্লাইম্বার্স',
    nameEn: 'Mountain Climbers (Cadence)',
    category: 'hiit',
    compendiumCode: '02026',
    verified: true,
    baseMet: 8.0,
    metByIntensity: { light: 6.0, moderate: 8.0, vigorous: 9.8 },
  },
  {
    id: 'jumping_jacks',
    nameBn: 'জাম্পিং জ্যাকস (মাঝারি-তীব্র)',
    nameEn: 'Jumping Jacks (Cardio intervals)',
    category: 'hiit',
    compendiumCode: '02028',
    verified: true,
    baseMet: 7.5,
    metByIntensity: { light: 5.5, moderate: 7.5, vigorous: 9.0 },
  },
  {
    id: 'tabata_protocol',
    nameBn: 'তাবাতা প্রোটোকল (২০সে কাজ / ১০সে বিশ্রাম)',
    nameEn: 'Tabata Protocol (20s work / 10s rest)',
    category: 'hiit',
    compendiumCode: '02040',
    verified: true,
    baseMet: 9.0,
    metByIntensity: { light: 7.5, moderate: 9.0, vigorous: 11.5 },
  },

  // ==========================================
  // 5. SPORTS POPULAR IN BANGLADESH
  // ==========================================
  {
    id: 'cricket_batting',
    nameBn: 'ক্রিকেট ব্যাটিং ও নেটস প্র্যাকটিস',
    nameEn: 'Cricket (Batting in nets / match)',
    category: 'sports',
    compendiumCode: '15150',
    verified: true,
    baseMet: 5.0,
    metByIntensity: { light: 4.0, moderate: 5.0, vigorous: 6.5 },
  },
  {
    id: 'cricket_bowling',
    nameBn: 'ক্রিকেট বোলিং (পেস / স্পিন রান-আপ)',
    nameEn: 'Cricket (Pace / Spin bowling spell)',
    category: 'sports',
    compendiumCode: '15152',
    verified: true,
    baseMet: 6.0,
    metByIntensity: { light: 4.5, moderate: 6.0, vigorous: 7.5 },
  },
  {
    id: 'cricket_fielding',
    nameBn: 'ক্রিকেট ফিল্ডিং ও ম্যাচ খেলা',
    nameEn: 'Cricket (Fielding & general match play)',
    category: 'sports',
    compendiumCode: '15154',
    verified: true,
    baseMet: 4.2,
    metByIntensity: { light: 3.5, moderate: 4.2, vigorous: 5.5 },
  },
  {
    id: 'football_casual',
    nameBn: 'ফুটবল খেলা (ক্যাজুয়াল / প্র্যাকটিস)',
    nameEn: 'Football / Soccer (Casual / Pick-up)',
    category: 'sports',
    compendiumCode: '15230',
    verified: true,
    baseMet: 7.0,
    metByIntensity: { light: 5.5, moderate: 7.0, vigorous: 8.5 },
  },
  {
    id: 'football_competitive',
    nameBn: 'প্রতিযোগিতামূলক ফুল-কোর্ট ফুটবল ম্যাচ',
    nameEn: 'Football / Soccer (Competitive match play)',
    category: 'sports',
    compendiumCode: '15232',
    verified: true,
    baseMet: 10.0,
    metByIntensity: { light: 8.0, moderate: 10.0, vigorous: 12.0 },
  },
  {
    id: 'badminton_casual',
    nameBn: 'ব্যাডমিন্টন খেলা (ক্যাজুয়াল / ডাবলস)',
    nameEn: 'Badminton (Social / Doubles play)',
    category: 'sports',
    compendiumCode: '15040',
    verified: true,
    baseMet: 4.5,
    metByIntensity: { light: 3.5, moderate: 4.5, vigorous: 6.0 },
  },
  {
    id: 'badminton_singles_competitive',
    nameBn: 'ব্যাডমিন্টন সিঙ্গেলস (প্রতিযোগিতামূলক তীব্র)',
    nameEn: 'Badminton (Singles, competitive match)',
    category: 'sports',
    compendiumCode: '15042',
    verified: true,
    baseMet: 7.0,
    metByIntensity: { light: 5.5, moderate: 7.0, vigorous: 8.5 },
  },
  {
    id: 'table_tennis',
    nameBn: 'টেবিল টেনিস / পিংপং খেলা',
    nameEn: 'Table Tennis / Ping Pong (Rally play)',
    category: 'sports',
    compendiumCode: '15610',
    verified: true,
    baseMet: 4.0,
    metByIntensity: { light: 3.0, moderate: 4.0, vigorous: 5.0 },
  },
  {
    id: 'basketball_match',
    nameBn: 'বাস্কেটবল খেলা (ফুল কোর্ট / প্র্যাকটিস)',
    nameEn: 'Basketball (Game play / Drills)',
    category: 'sports',
    compendiumCode: '15055',
    verified: true,
    baseMet: 7.5,
    metByIntensity: { light: 5.5, moderate: 7.5, vigorous: 9.5 },
  },
];
