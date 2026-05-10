export interface StockCheckResult {
  symbol: string;
  currentPrice: number;
  sma150: number;
  isBelowSMA: boolean;
}

export async function checkStock(symbol: string): Promise<StockCheckResult> {
  // 220 calendar days comfortably covers 150 trading days
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - 220 * 24 * 60 * 60;

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1d&period1=${period1}&period2=${period2}`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Yahoo Finance HTTP error: ${res.status}`);

  const data = await res.json();
  const result = data?.chart?.result?.[0];

  if (!result) {
    const err = data?.chart?.error?.description ?? 'No data returned';
    throw new Error(`Yahoo Finance: ${err}`);
  }

  // Filter nulls (holidays/missing), then reverse so index 0 = most recent
  const closes: number[] = (result.indicators.quote[0].close as (number | null)[])
    .filter((c): c is number => c !== null)
    .reverse();

  if (closes.length < 150) {
    throw new Error(`Not enough history for ${symbol} (need 150 trading days, got ${closes.length})`);
  }

  const currentPrice = closes[0];
  const sma150 = closes.slice(0, 150).reduce((a, b) => a + b, 0) / 150;

  return { symbol, currentPrice, sma150, isBelowSMA: currentPrice < sma150 };
}
