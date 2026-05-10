'use client';

import { useState, useEffect, useCallback } from 'react';

interface Stock {
  _id: string;
  symbol: string;
  currentPrice: number | null;
  sma150: number | null;
  lastCheckedAt: string | null;
  addedAt: string;
}

interface CheckResult {
  symbol: string;
  status: 'alert_sent' | 'above_sma' | 'below_sma_already_alerted' | 'error';
  currentPrice?: number;
  sma150?: number;
  error?: string;
}

const STATUS_LABEL: Record<CheckResult['status'], string> = {
  alert_sent: '⚠ Alert sent',
  above_sma: '✓ Above SMA150',
  below_sma_already_alerted: '⚠ Below SMA150 (alert already sent today)',
  error: '✗ Error',
};

const STATUS_COLOR: Record<CheckResult['status'], string> = {
  alert_sent: 'text-red-600',
  above_sma: 'text-green-600',
  below_sma_already_alerted: 'text-orange-500',
  error: 'text-gray-400',
};

export default function Home() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [checkResults, setCheckResults] = useState<CheckResult[] | null>(null);

  const fetchStocks = useCallback(async () => {
    const res = await fetch('/api/stocks');
    setStocks(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setAdding(true);
    setAddError(null);

    const res = await fetch('/api/stocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol }),
    });

    if (res.ok) {
      setSymbol('');
      await fetchStocks();
    } else {
      const data = await res.json();
      setAddError(data.error || 'Failed to add stock');
    }
    setAdding(false);
  };

  const removeStock = async (sym: string) => {
    await fetch('/api/stocks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: sym }),
    });
    await fetchStocks();
  };

  const testNotification = async () => {
    setTestingNotification(true);
    await fetch('/api/test-notification', { method: 'POST' });
    setTestingNotification(false);
  };

  const runCheck = async () => {
    setChecking(true);
    setCheckResults(null);
    const res = await fetch('/api/run-check', { method: 'POST' });
    const data = await res.json();
    setCheckResults(data.results);
    await fetchStocks();
    setChecking(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">EasyStopLoss</h1>
          <p className="text-gray-500 mt-1">Email alerts when a stock drops below its 150-day moving average</p>
        </div>

        {/* Add Stock */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Add stock to watchlist</h2>
          <form onSubmit={addStock} className="flex gap-3">
            <input
              type="text"
              value={symbol}
              onChange={e => { setSymbol(e.target.value.toUpperCase()); setAddError(null); }}
              placeholder="e.g. AAPL"
              maxLength={10}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={adding || !symbol.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>
          {addError && <p className="text-red-500 text-sm mt-2">{addError}</p>}
        </div>

        {/* Watchlist */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Watchlist</h2>
            <div className="flex gap-2">
              <button
                onClick={testNotification}
                disabled={testingNotification}
                className="text-sm bg-blue-100 hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 px-4 py-2 rounded-xl font-medium transition-colors"
              >
                {testingNotification ? 'Sending…' : 'Test notification'}
              </button>
              <button
                onClick={runCheck}
                disabled={checking || stocks.length === 0}
                className="text-sm bg-gray-900 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium transition-colors"
              >
                {checking ? 'Checking…' : 'Run check now'}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm">Loading…</p>
          ) : stocks.length === 0 ? (
            <p className="text-gray-400 text-sm">No stocks yet — add one above.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {stocks.map(stock => {
                const price = stock.currentPrice;
                const sma = stock.sma150;
                const isBelow = price !== null && sma !== null && price < sma;
                const isAbove = price !== null && sma !== null && price >= sma;

                return (
                  <li key={stock._id} className="py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-gray-900">{stock.symbol}</span>
                        {isBelow && (
                          <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-medium">
                            Below SMA150
                          </span>
                        )}
                        {isAbove && (
                          <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                            Above SMA150
                          </span>
                        )}
                        {price === null && (
                          <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                            Not checked yet
                          </span>
                        )}
                      </div>
                      {price !== null && sma !== null && (
                        <p className="text-xs text-gray-500 mt-1">
                          Price: <span className="font-medium text-gray-700">${price.toFixed(2)}</span>
                          {' · '}
                          SMA150: <span className="font-medium text-gray-700">${sma.toFixed(2)}</span>
                          {stock.lastCheckedAt && (
                            <> · checked {new Date(stock.lastCheckedAt).toLocaleDateString()}</>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeStock(stock.symbol)}
                      className="shrink-0 text-xs text-gray-400 hover:text-red-500 transition-colors pt-0.5"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Check results */}
        {checkResults && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Last check results</h2>
            <ul className="space-y-2">
              {checkResults.map((r, i) => (
                <li key={i} className="flex items-baseline gap-3 text-sm">
                  <span className="font-mono font-bold text-gray-900 w-16 shrink-0">{r.symbol}</span>
                  <span className={STATUS_COLOR[r.status]}>
                    {r.status === 'error'
                      ? `✗ ${r.error}`
                      : STATUS_LABEL[r.status]}
                  </span>
                  {r.currentPrice !== undefined && (
                    <span className="text-gray-400 ml-auto tabular-nums">
                      ${r.currentPrice.toFixed(2)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Cron runs weekdays at 22:00 UTC · powered by Yahoo Finance
        </p>
      </div>
    </main>
  );
}
