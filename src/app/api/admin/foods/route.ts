import { NextRequest, NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { adminService } from '@/server/services/admin.service';
import { enforceRateLimit, getClientIp } from '@/server/utils/rate-limiter';
import { z } from 'zod';

export const FoodSchema = z
  .object({
    nameBn: z.string().min(2).max(100),
    nameEn: z.string().min(2).max(100),
    aliases: z.array(z.string()).default([]),
    category: z.enum([
      'grains',
      'lentils',
      'fish',
      'poultry_meat',
      'eggs_dairy',
      'vegetables_bhorta',
      'fruits',
      'snacks_beverages',
    ]),
    image: z.string().optional(),
    per100g: z.object({
      kcal: z.number().min(0).max(1000),
      protein: z.number().min(0).max(100),
      carbs: z.number().min(0).max(100),
      fat: z.number().min(0).max(100),
      fiber: z.number().min(0).max(100).optional(),
      sodium: z.number().min(0).max(10000).optional(),
      potassium: z.number().min(0).max(10000).optional(),
      calcium: z.number().min(0).max(10000).optional(),
      iron: z.number().min(0).max(1000).optional(),
      zinc: z.number().min(0).max(1000).optional(),
    }),
    servings: z
      .array(
        z.object({
          labelBn: z.string().min(1),
          labelEn: z.string().min(1),
          grams: z.number().positive(),
        })
      )
      .min(1),
    source: z.string().default(''),
    verified: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // STRICT RULE: verified can be set true ONLY with source filled in!
      if (data.verified && (!data.source || !data.source.trim())) {
        return false;
      }
      return true;
    },
    {
      message: 'Source citation is required when verified flag is true',
      path: ['source'],
    }
  );

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'admin-food-create', {
    limit: 30,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const parsed = FoodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const food = await adminService.saveFood(authCheck.user, parsed.data, undefined, ip);

    return NextResponse.json({ success: true, data: food }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save food' },
      { status: 400 }
    );
  }
}
