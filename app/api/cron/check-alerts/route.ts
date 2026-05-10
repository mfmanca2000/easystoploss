import { NextResponse } from 'next/server';
import { runAlertCheck } from '@/lib/check-alerts';

// Called daily by Vercel Cron at 22:00 UTC (weekdays only)
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = await runAlertCheck();
  return NextResponse.json({ results });
}
