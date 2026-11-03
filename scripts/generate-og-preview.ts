import fs from 'node:fs';
import path from 'node:path';
import { GET } from '../src/app/api/og/progress/route';
import { NextRequest } from 'next/server';

async function main() {
  const url = new URL(
    'http://localhost:3000/api/og/progress?nickname=তানভীর&streak=28&workouts=42&monthChange=-2.8%25&showWeight=true&weight=74.5&lang=bn'
  );
  const req = new NextRequest(url);
  const response = await GET(req);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const outputPath = path.join(process.cwd(), 'public', 'progress-card-bangla-preview.png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated preview at ${outputPath}, size: ${buffer.length} bytes`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
