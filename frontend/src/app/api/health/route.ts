import { NextResponse } from 'next/server';
import { getAiConfigStatus } from '@/lib/ai.service';

export async function GET() {
  const ai = getAiConfigStatus();
  return NextResponse.json({
    success: true,
    data: {
      status: 'ok',
      database: 'memory',
      ai,
      timestamp: new Date().toISOString(),
    },
  });
}
