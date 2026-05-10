import { NextResponse } from 'next/server';
import { getDb, ensureIndexes } from '@/lib/db';

export async function GET() {
  await ensureIndexes();
  const db = await getDb();
  const stocks = await db
    .collection('watched_stocks')
    .find({})
    .sort({ addedAt: -1 })
    .toArray();

  return NextResponse.json(
    stocks.map(s => ({ ...s, _id: s._id.toString() }))
  );
}

export async function POST(request: Request) {
  await ensureIndexes();
  const db = await getDb();
  const body = await request.json();
  const symbol = typeof body?.symbol === 'string' ? body.symbol.trim().toUpperCase() : null;

  if (!symbol || !/^[A-Z0-9.]{1,10}$/.test(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  try {
    const result = await db.collection('watched_stocks').insertOne({
      symbol,
      currentPrice: null,
      sma150: null,
      lastCheckedAt: null,
      addedAt: new Date(),
    });
    return NextResponse.json({ _id: result.insertedId.toString(), symbol }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: `${symbol} is already in your watchlist` }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add stock' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json();
  const symbol = typeof body?.symbol === 'string' ? body.symbol.trim().toUpperCase() : null;

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const db = await getDb();
  await db.collection('watched_stocks').deleteOne({ symbol });
  return NextResponse.json({ success: true });
}
