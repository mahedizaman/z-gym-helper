import { NextResponse } from 'next/server';
import { requireServerAdmin } from '@/server/utils/admin-guard';
import { FOOD_CSV_TEMPLATE } from '@/server/utils/csv-parser';

export async function GET() {
  const authCheck = await requireServerAdmin();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  // Prepend UTF-8 BOM so Excel opens Bangla characters correctly
  const csvWithBom = '\uFEFF' + FOOD_CSV_TEMPLATE;

  return new NextResponse(csvWithBom, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="zgym_foods_template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
