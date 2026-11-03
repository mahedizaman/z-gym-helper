import { NextResponse } from 'next/server';

export async function GET() {
  const publisherId = process.env.ADSENSE_PUBLISHER_ID?.trim();

  let body = '# Google AdSense ads.txt - Z-Gym Helper\n';

  if (publisherId) {
    // Standard Google AdSense authorized digital sellers line
    body += `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
  } else {
    body += '# ADSENSE_PUBLISHER_ID is not currently configured in server environment.\n';
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
    },
  });
}
