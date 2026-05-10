import { NextResponse } from 'next/server';
import { sql, initDb } from '@/lib/db';

export async function GET() {
  await initDb();
  const stocks = await sql`SELECT * FROM watched_stocks ORDER BY added_at DESC`;
  return NextResponse.json(stocks);
}

export async function POST(request: Request) {
  await initDb();
  const body = await request.json();
  const symbol = typeof body?.symbol === 'string' ? body.symbol.trim().toUpperCase() : null;

  if (!symbol || !/^[A-Z0-9.]{1,10}$/.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO watched_stocks (symbol)
    VALUES (${symbol})
    ON CONFLICT (symbol) DO NOTHING
    RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: `${symbol} is already in your watchlist` }, { status: 409 });
  }

  return NextResponse.json(result[0], { status: 201 });
}

export async function DELETE(request: Request) {
  await initDb();
  const body = await request.json();
  const symbol = typeof body?.symbol === 'string' ? body.symbol.trim().toUpperCase() : null;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  await sql`DELETE FROM watched_stocks WHERE symbol = ${symbol}`;
  return NextResponse.json({ success: true });
}
