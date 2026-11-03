import { NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { adminService } from '@/server/services/admin.service';

export async function GET() {
  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const metrics = await adminService.getMetrics();
    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to compute admin metrics' },
      { status: 500 }
    );
  }
}
