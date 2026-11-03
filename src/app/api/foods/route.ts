import { NextRequest, NextResponse } from 'next/server';
import { foodService } from '@/server/services/food.service';
import { FoodSearchQuerySchema } from '@/server/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = FoodSearchQuerySchema.safeParse({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || undefined,
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 20,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await foodService.searchFoods(parsed.data);

    return NextResponse.json({
      success: true,
      data: result.foods,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('API /api/foods error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve food items' },
      { status: 500 }
    );
  }
}
