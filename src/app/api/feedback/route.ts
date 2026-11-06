import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { feedbackService } from '@/server/services/feedback.service';
import { enforceRateLimit } from '@/server/utils/rate-limiter';

const FeedbackInputSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'মতামত খালি রাখা যাবে না')
    .max(500, 'মতামত সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'),
  contact: z.string().trim().max(100, 'যোগাযোগের তথ্য সর্বোচ্চ ১০০ অক্ষরের হতে পারে').optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitError = enforceRateLimit(request, 'user-feedback-submit', {
    limit: 5,
    windowMs: 10 * 60 * 1000, // 5 per 10 minutes
  });
  if (rateLimitError) return rateLimitError;

  try {
    const body = await request.json();
    const parsed = FeedbackInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || 'অবৈধ ডেটা',
          issues: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id;

    const feedback = await feedbackService.createFeedback({
      message: parsed.data.message,
      contact: parsed.data.contact,
      userId,
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'মতামত সংরক্ষণ করা যায়নি' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'আপনার মতামতের জন্য ধন্যবাদ!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/feedback error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'মতামত পাঠাতে সমস্যা হয়েছে',
      },
      { status: 500 }
    );
  }
}
