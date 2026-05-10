import { NextResponse } from 'next/server';
import { runAlertCheck } from '@/lib/check-alerts';

export async function POST() {
  const results = await runAlertCheck();
  return NextResponse.json({ results });
}
