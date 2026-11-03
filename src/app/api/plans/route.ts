import { NextRequest, NextResponse } from 'next/server';
import { planService } from '@/server/services/plan.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days') ? Number(searchParams.get('days')) : undefined;
    const level = searchParams.get('level') || undefined;

    const plans = await planService.getPlans({ days, level });

    return NextResponse.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error: unknown) {
    if ((error as { digest?: string })?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('API /api/plans error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve plans' },
      { status: 500 }
    );
  }
}
