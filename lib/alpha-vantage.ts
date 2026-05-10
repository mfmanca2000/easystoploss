const BASE_URL = 'https://www.alphavantage.co/query';

interface DailyEntry {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface StockCheckResult {
  symbol: string;
  currentPrice: number;
  sma150: number;
  isBelowSMA: boolean;
}

export async function checkStock(symbol: string): Promise<StockCheckResult> {
  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=full&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Alpha Vantage HTTP error: ${res.status}`);

  const data = await res.json();

  if (data['Error Message']) throw new Error(`Unknown symbol: ${symbol}`);
  if (data['Note'] || data['Information']) throw new Error('Alpha Vantage rate limit reached');

  const timeSeries: Record<string, DailyEntry> = data['Time Series (Daily)'];
  if (!timeSeries) throw new Error(`No time series data for: ${symbol}`);

  // Sort dates descending (most recent first) and extract closing prices
  const closingPrices = Object.entries(timeSeries)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, values]) => parseFloat(values['4. close']));

  if (closingPrices.length < 150) {
    throw new Error(`Not enough history for ${symbol} (need 150 days, got ${closingPrices.length})`);
  }

  const currentPrice = closingPrices[0];
  const sma150 = closingPrices.slice(0, 150).reduce((a, b) => a + b, 0) / 150;

  return {
    symbol,
    currentPrice,
    sma150,
    isBelowSMA: currentPrice < sma150,
  };
}
