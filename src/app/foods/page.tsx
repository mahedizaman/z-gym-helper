'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/language-context';
import { BANGLADESHI_FOODS_DATA } from '@/server/seeds/foods.data';
import { FoodCard } from '@/components/foods/food-card';
import {
  Search,
  Utensils,
  ArrowUpDown,
  Info,
  Calculator,
  X,
} from 'lucide-react';
import Link from 'next/link';

type SortOption =
  | 'default'
  | 'protein-desc'
  | 'kcal-asc'
  | 'kcal-desc'
  | 'carbs-asc'
  | 'fiber-desc';

export default function FoodsPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  const categories = [
    { id: 'all', labelBn: 'সব খাবার', labelEn: 'All Foods' },
    { id: 'grains', labelBn: 'ভাত ও শস্য', labelEn: 'Grains & Rice' },
    { id: 'fish', labelBn: 'মাছ ও জলজ', labelEn: 'Fish & Seafood' },
    { id: 'poultry_meat', labelBn: 'মাংস ও ডিম', labelEn: 'Meat & Poultry' },
    { id: 'lentils', labelBn: 'ডাল ও বীজ', labelEn: 'Lentils & Dal' },
    { id: 'vegetables_bhorta', labelBn: 'শাকসবজি ও ভর্তা', labelEn: 'Vegetables & Bhorta' },
    { id: 'eggs_dairy', labelBn: 'দুধ ও মিষ্টি', labelEn: 'Dairy & Sweets' },
    { id: 'fruits', labelBn: 'ফলমূল', labelEn: 'Fruits' },
    { id: 'snacks_beverages', labelBn: 'নাস্তা ও বাদাম', labelEn: 'Snacks & Nuts' },
  ];

  // Client-side filtering & fuzzy match
  const filteredFoods = useMemo(() => {
    let result = [...BANGLADESHI_FOODS_DATA];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Search query filter (matches nameBn, nameEn, aliases)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.nameBn.includes(q) ||
          item.nameEn.toLowerCase().includes(q) ||
          item.aliases.some((a) => a.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case 'protein-desc':
        result.sort((a, b) => b.per100g.protein - a.per100g.protein);
        break;
      case 'kcal-asc':
        result.sort((a, b) => a.per100g.kcal - b.per100g.kcal);
        break;
      case 'kcal-desc':
        result.sort((a, b) => b.per100g.kcal - a.per100g.kcal);
        break;
      case 'carbs-asc':
        result.sort((a, b) => a.per100g.carbs - b.per100g.carbs);
        break;
      case 'fiber-desc':
        result.sort((a, b) => (b.per100g.fiber || 0) - (a.per100g.fiber || 0));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const displayedFoods = filteredFoods.slice(0, visibleCount);

  return (
    <div className="min-h-screen py-10 md:py-16 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-soft border border-lime-brand/30 text-ink-base text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              <Utensils className="w-3.5 h-3.5" />
              <span>
                {t(
                  `৩০০+ দেশি খাবার পুষ্টি ডেটাবেজ (${BANGLADESHI_FOODS_DATA.length}টি খাদ্য)`,
                  `300+ Bangladeshi Food Catalog (${BANGLADESHI_FOODS_DATA.length} Items)`
                )}
              </span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-foreground">
              {t('খাদ্যের পুষ্টিমান ও ক্যালোরি লাইব্রেরি', 'BANGLADESHI FOOD & NUTRITION DATABASE')}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t(
                'ভাত, ডাল, মাছ, মাংস, দেশি ভর্তা ও নাস্তার নির্ভরযোগ্য ক্যালোরি, প্রোটিন, কার্বস ও ফ্যাটের পরিমাপ। যে কোনো খাবার আপনার আজকের মিলে যোগ করুন সম্পূর্ণ ফ্রিতে।',
                'Comprehensive nutritional values for Bangladeshi staples, curries, bhortas, and snacks. Recalculate portions and log items to your daily plan instantly.'
              )}
            </p>
          </div>

          {/* Quick link to Meal Calculator */}
          <div className="flex items-center gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-lime-brand hover:bg-lime-brand/90 text-ink-base text-xs font-black uppercase font-display tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
            >
              <Calculator className="w-4 h-4 stroke-[2.5]" />
              <span>{t('মিল ক্যালকুলেটরে যান', 'Open Meal Calculator')}</span>
            </Link>
          </div>
        </div>

        {/* Scientific Transparency & Disclaimer Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-secondary/50 border border-border text-xs text-muted-foreground flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">
              {t('পুষ্টিমান যাচাইকরণ বিজ্ঞপ্তি:', 'Nutrition Verification Notice:')}
            </strong>{' '}
            {t(
              'এই ডেটাবেজের মানসমূহ প্রমিত দেশীয় রান্নার রেসিপি ও উন্মুক্ত বৈজ্ঞানিক খাদ্য টেবিলের অনুমানের ভিত্তিতে প্রস্তুত। শতভাগ নিশ্চিত ফলাফলের জন্য ডেটাবেজটি বিশেষজ্ঞদের দ্বারা যাচাই প্রক্রিয়াধীন রয়েছে।',
              'All values represent standardized culinary recipe and open food composition estimates. Formal human verification by clinical nutritionists is actively ongoing.'
            )}
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(24);
              }}
              placeholder={t(
                'খাবার খুঁজুন (যেমন: সিদ্ধ ভাত, মসুর ডাল, ইলিশ মাছ, ডিম)...',
                'Search food in Bangla or English (e.g. bhat, dal, ilish, egg)...'
              )}
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-secondary/60 border border-border text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold uppercase text-muted-foreground">
              {t('বাছাই:', 'Sort:')}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3.5 py-2.5 rounded-xl bg-secondary/80 border border-border text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-lime-brand"
              aria-label="Sort food list"
            >
              <option value="default">{t('ডিফল্ট ক্রম', 'Default Order')}</option>
              <option value="protein-desc">{t('সর্বোচ্চ প্রোটিন', 'Highest Protein')}</option>
              <option value="kcal-asc">{t('সর্বনিম্ন ক্যালোরি', 'Lowest Calories')}</option>
              <option value="kcal-desc">{t('সর্বোচ্চ ক্যালোরি', 'Highest Calories')}</option>
              <option value="carbs-asc">{t('কম কার্বস', 'Low Carbohydrates')}</option>
              <option value="fiber-desc">{t('উচ্চ আঁশ (ফাইবার)', 'High Dietary Fiber')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Horizontally Scrollable) */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setVisibleCount(24);
                }}
                className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase font-display tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-lime-brand text-ink-base shadow-sm scale-105'
                    : 'bg-secondary/70 hover:bg-secondary text-muted-foreground hover:text-foreground border border-border/60'
                }`}
              >
                {t(cat.labelBn, cat.labelEn)}
              </button>
            );
          })}
        </div>

        {/* Results Count Summary */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground font-semibold">
          <span>
            {t(
              `মোট ${filteredFoods.length}টি খাবারের মধ্যে ${displayedFoods.length}টি প্রদর্শিত`,
              `Showing ${displayedFoods.length} of ${filteredFoods.length} foods`
            )}
          </span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-tomato-brand hover:underline font-bold"
            >
              {t('ফিল্টার মুছুন', 'Reset filters')}
            </button>
          )}
        </div>

        {/* Food Cards Grid */}
        {displayedFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {displayedFoods.map((food) => (
              <FoodCard key={food.nameEn} food={food} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center rounded-3xl bg-secondary/30 border border-dashed border-border mt-8">
            <Utensils className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-display font-extrabold text-xl uppercase text-foreground">
              {t('কোনো খাবার খুঁজে পাওয়া যায়নি', 'No foods found matching query')}
            </h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              {t(
                'বানান সঠিক কিনা যাচাই করুন অথবা অন্য ক্যাটাগরি বেছে নিন।',
                'Check your spelling or reset category filters to view the full database.'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 px-5 py-2.5 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border"
            >
              {t('সব খাবার দেখুন', 'View All Foods')}
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredFoods.length && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="px-8 py-3.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-extrabold uppercase font-display tracking-wider transition-all duration-200 active:scale-95 shadow-sm"
            >
              {t(
                `আরও ২৪টি খাবার দেখুন (${filteredFoods.length - visibleCount}টি বাকি)`,
                `Load More (+24 Foods) — ${filteredFoods.length - visibleCount} Remaining`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
