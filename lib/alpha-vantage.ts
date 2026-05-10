import yahooFinanceModule from 'yahoo-finance2';

// historical() is mixed in dynamically so it doesn't appear on the declared type.
// Cast to a minimal interface covering only what we use.
type YF = {
  historical: (
    symbol: string,
    opts: { period1: Date; interval: string }
  ) => Promise<Array<{ date: Date; close: number }>>;
};
const yahooFinance = yahooFinanceModule as unknown as YF;

export interface StockCheckResult {
  symbol: string;
  currentPrice: number;
  sma150: number;
  isBelowSMA: boolean;
}

export async function checkStock(symbol: string): Promise<StockCheckResult> {
  // 220 calendar days comfortably covers 150 trading days
  const period1 = new Date();
  period1.setDate(period1.getDate() - 220);

  const quotes = await yahooFinance.historical(symbol, { period1, interval: '1d' });

  if (!quotes || quotes.length === 0) {
    throw new Error(`No data found for: ${symbol}`);
  }

  // historical() returns oldest-first; reverse so index 0 = most recent
  const closingPrices = quotes.map(q => q.close).reverse();

  if (closingPrices.length < 150) {
    throw new Error(
      `Not enough history for ${symbol} (need 150 trading days, got ${closingPrices.length})`
    );
  }

  const currentPrice = closingPrices[0];
  const sma150 = closingPrices.slice(0, 150).reduce((a, b) => a + b, 0) / 150;

  return { symbol, currentPrice, sma150, isBelowSMA: currentPrice < sma150 };
}
