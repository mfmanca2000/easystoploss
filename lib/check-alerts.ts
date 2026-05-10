import { sql, initDb } from './db';
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
  await initDb();

  const stocks = await sql<{ symbol: string }[]>`SELECT symbol FROM watched_stocks ORDER BY symbol`;
  const results: CheckResult[] = [];

  for (const { symbol } of stocks) {
    try {
      const { currentPrice, sma150, isBelowSMA } = await checkStock(symbol);

      await sql`
        UPDATE watched_stocks
        SET current_price = ${currentPrice}, sma150 = ${sma150}, last_checked_at = NOW()
        WHERE symbol = ${symbol}
      `;

      if (!isBelowSMA) {
        results.push({ symbol, status: 'above_sma', currentPrice, sma150 });
        continue;
      }

      // Only send one alert per stock per day
      const today = new Date().toISOString().split('T')[0];
      const existing = await sql`
        SELECT id FROM alert_history WHERE symbol = ${symbol} AND triggered_at = ${today}
      `;

      if (existing.length > 0) {
        results.push({ symbol, status: 'below_sma_already_alerted', currentPrice, sma150 });
        continue;
      }

      await sendAlert(symbol, currentPrice, sma150);
      await sql`
        INSERT INTO alert_history (symbol, triggered_at, current_price, sma150)
        VALUES (${symbol}, ${today}, ${currentPrice}, ${sma150})
      `;
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
