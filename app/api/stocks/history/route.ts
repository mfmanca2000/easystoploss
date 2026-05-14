import { NextRequest, NextResponse } from 'next/server';

type Interval = 'week' | 'month' | '6months';

const CALENDAR_DAYS: Record<Interval, number> = {
  week: 7,
  month: 30,
  '6months': 180,
};

// 450 calendar days covers 6-month display + 150 trading days for SMA window
const FETCH_CALENDAR_DAYS = 450;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const interval = (searchParams.get('interval') ?? 'month') as Interval;

  if (!symbol) {
    return NextResponse.json({ error: 'symbol required' }, { status: 400 });
  }
  if (!CALENDAR_DAYS[interval]) {
    return NextResponse.json({ error: 'invalid interval' }, { status: 400 });
  }

  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - FETCH_CALENDAR_DAYS * 24 * 60 * 60;

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&period1=${period1}&period2=${period2}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Yahoo Finance error: ${res.status}` }, { status: 502 });
  }

  const json = await res.json();
  const result = json?.chart?.result?.[0];

  if (!result) {
    const err = json?.chart?.error?.description ?? 'No data returned';
    return NextResponse.json({ error: err }, { status: 400 });
  }

  const timestamps: number[] = result.timestamp ?? [];
  const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? [];

  // Build sorted ascending list of valid (date, price) pairs
  const points: { date: string; price: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    if (closes[i] != null) {
      const date = new Date(timestamps[i] * 1000).toISOString().slice(0, 10);
      points.push({ date, price: closes[i] as number });
    }
  }

  // Cutoff date for display window
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - CALENDAR_DAYS[interval]);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const chartData: { date: string; price: number; sma150: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    if (points[i].date < cutoffStr) continue;
    if (i < 149) continue; // not enough prior data for a 150-day window

    const slice = points.slice(i - 149, i + 1);
    const sma150 = slice.reduce((sum, p) => sum + p.price, 0) / 150;

    chartData.push({
      date: points[i].date,
      price: Math.round(points[i].price * 100) / 100,
      sma150: Math.round(sma150 * 100) / 100,
    });
  }

  if (chartData.length === 0) {
    return NextResponse.json({ error: 'Not enough historical data' }, { status: 400 });
  }

  return NextResponse.json({ data: chartData });
}
