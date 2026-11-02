import { NextRequest, NextResponse } from 'next/server';
import { planService } from '@/server/services/plan.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const plan = await planService.getPlanBySlug(slug);

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Workout plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error: unknown) {
    console.error('API /api/plans/[slug] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve workout plan' },
      { status: 500 }
    );
  }
}
