import { NextRequest, NextResponse } from 'next/server';
import { exerciseService } from '@/server/services/exercise.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const muscle = searchParams.get('muscle') || undefined;
    const equipment = searchParams.get('equipment') || undefined;
    const level = searchParams.get('level') || undefined;
    const search = searchParams.get('search') || undefined;

    const exercises = await exerciseService.getExercises({
      muscle,
      equipment,
      level,
      search,
    });

    return NextResponse.json({
      success: true,
      count: exercises.length,
      data: exercises,
    });
  } catch (error: unknown) {
    console.error('API /api/exercises error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve exercises' },
      { status: 500 }
    );
  }
}
