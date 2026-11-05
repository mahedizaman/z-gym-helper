import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { adminService } from '@/server/services/admin.service';
import { foodService } from '@/server/services/food.service';
import { FoodModel } from '@/server/models/food.model';
import { connectToDatabase } from '@/server/db';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';
import { CsvFoodRowSchema } from '@/server/utils/csv-parser';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const BulkImportRequestSchema = z.object({
  foods: z.array(CsvFoodRowSchema).min(1).max(2000),
  mode: z.enum(['skip', 'update']).default('skip'),
  markVerified: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'admin-foods-import', {
    limit: 15,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const parsed = BulkImportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          message: parsed.error.issues[0]?.message || 'Invalid food data submitted',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const { foods, mode, markVerified } = parsed.data;
    await connectToDatabase();

    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of foods) {
      const isVerified = Boolean(markVerified && item.source && item.source.trim().length > 0);

      const existing = await FoodModel.findOne({
        $or: [
          { nameEn: { $regex: new RegExp(`^${item.nameEn.trim()}$`, 'i') } },
          { nameBn: item.nameBn.trim() },
        ],
      });

      const foodDocument = {
        nameBn: item.nameBn.trim(),
        nameEn: item.nameEn.trim(),
        aliases: item.aliases || [],
        category: item.category,
        image: item.imagePath?.trim() || undefined,
        per100g: {
          kcal: item.kcal,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          fiber: item.fiber || 0,
          potassium: item.potassium || 0,
          zinc: item.zinc || 0,
          iron: item.iron || 0,
          calcium: item.calcium || 0,
          sodium: item.sodium || 0,
        },
        servings: [
          {
            labelBn: item.servingLabelBn || '১ পরিবেশন',
            labelEn: item.servingLabelEn || '1 serving',
            grams: item.servingGrams || 100,
          },
        ],
        source: item.source?.trim() || '',
        verified: isVerified,
      };

      if (existing) {
        if (mode === 'update') {
          await FoodModel.findByIdAndUpdate(existing._id, { $set: foodDocument });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await FoodModel.create(foodDocument);
        inserted++;
      }
    }

    // Invalidate food service in-memory cache and revalidate client static pages
    foodService.invalidateCache();
    try {
      revalidatePath('/foods');
      revalidatePath('/calculator');
      revalidatePath('/api/foods');
    } catch {
      // Revalidation may be no-op during non-edge invocation
    }

    const ip = getClientIp(request);
    await adminService.logAudit(
      authCheck.user.id,
      authCheck.user.email,
      'FOOD_BULK_IMPORT',
      {
        totalSubmitted: foods.length,
        inserted,
        updated,
        skipped,
        mode,
        markVerified,
      },
      undefined,
      ip
    );

    return NextResponse.json({
      success: true,
      total: foods.length,
      inserted,
      updated,
      skipped,
      message: `Import complete: ${inserted} added, ${updated} updated, ${skipped} skipped.`,
    });
  } catch (error) {
    console.error('[Admin Food Import Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import foods',
      },
      { status: 500 }
    );
  }
}
