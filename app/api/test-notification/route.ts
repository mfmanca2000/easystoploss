import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/push-notification';

export async function POST() {
  await sendPushNotification('TEST', 182.50, 195.30);
  return NextResponse.json({ ok: true });
}
