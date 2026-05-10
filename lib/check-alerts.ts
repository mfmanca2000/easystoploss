import { getDb, ensureIndexes } from './db';
import { checkStock } from './alpha-vantage';
import { sendAlert } from './email';

export interface CheckResult {
  symbol: string;
  status: 'alert_sent' | 'above_sma' | 'below_sma_already_alerted' | 'error';
  currentPrice?: number;
  sma150?: number;
  error?: string;
}

export async function runAlertCheck(): Promise<CheckResult[]> {
  await ensureIndexes();
  const db = await getDb();

  const stocks = await db
    .collection<{ symbol: string }>('watched_stocks')
    .find({}, { projection: { symbol: 1 } })
    .sort({ symbol: 1 })
    .toArray();

  const results: CheckResult[] = [];

  for (const { symbol } of stocks) {
    try {
      const { currentPrice, sma150, isBelowSMA } = await checkStock(symbol);

      await db.collection('watched_stocks').updateOne(
        { symbol },
        { $set: { currentPrice, sma150, lastCheckedAt: new Date() } }
      );

      if (!isBelowSMA) {
        results.push({ symbol, status: 'above_sma', currentPrice, sma150 });
        continue;
      }

      // Only send one alert per stock per calendar day
      const today = new Date().toISOString().split('T')[0];
      const existing = await db
        .collection('alert_history')
        .findOne({ symbol, triggeredAt: today });

      if (existing) {
        results.push({ symbol, status: 'below_sma_already_alerted', currentPrice, sma150 });
        continue;
      }

      await sendAlert(symbol, currentPrice, sma150);
      await db
        .collection('alert_history')
        .insertOne({ symbol, triggeredAt: today, currentPrice, sma150 });

      results.push({ symbol, status: 'alert_sent', currentPrice, sma150 });

    } catch (err) {
      results.push({
        symbol,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return results;
}
