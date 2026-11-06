import { NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { feedbackService } from '@/server/services/feedback.service';

export async function GET() {
  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const feedbacks = await feedbackService.listFeedbacks(100);
    return NextResponse.json({ success: true, data: feedbacks });
  } catch (error) {
    console.error('GET /api/admin/feedback error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'মতামত লোড করা যায়নি',
      },
      { status: 500 }
    );
  }
}
