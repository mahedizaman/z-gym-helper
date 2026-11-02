import { NextRequest, NextResponse } from 'next/server';
import { exerciseService } from '@/server/services/exercise.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const exercise = await exerciseService.getExerciseBySlug(slug);

    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: exercise,
    });
  } catch (error: unknown) {
    console.error('API /api/exercises/[slug] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve exercise detail' },
      { status: 500 }
    );
  }
}
