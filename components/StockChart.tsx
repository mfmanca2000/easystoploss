'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Interval = 'week' | 'month' | '6months';

interface DataPoint {
  date: string;
  price: number;
  sma150: number;
}

const INTERVALS: { key: Interval; label: string }[] = [
  { key: 'week', label: '1W' },
  { key: 'month', label: '1M' },
  { key: '6months', label: '6M' },
];

function formatDateTick(dateStr: string, interval: Interval): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  if (interval === 'week') {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatDateTooltip(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z');
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function StockChart({ symbol }: { symbol: string }) {
  const [interval, setIntervalState] = useState<Interval>('month');
  const [data, setData] = useState<DataPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    fetch(`/api/stocks/history?symbol=${encodeURIComponent(symbol)}&interval=${interval}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol, interval]);

  const yDomain: [number | string, number | string] = data
    ? (() => {
        const vals = data.flatMap(d => [d.price, d.sma150]);
        const min = Math.min(...vals);
        const max = Math.max(...vals);
        const pad = (max - min) * 0.08 || max * 0.02;
        return [
          Math.floor((min - pad) * 10) / 10,
          Math.ceil((max + pad) * 10) / 10,
        ];
      })()
    : ['auto', 'auto'];

  const xTickInterval = data ? Math.max(0, Math.floor(data.length / 5) - 1) : 'preserveStartEnd';

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex gap-1 mb-3">
        {INTERVALS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setIntervalState(key)}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
              interval === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          Loading chart…
        </div>
      )}

      {error && !loading && (
        <div className="h-48 flex items-center justify-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {data && !loading && (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickFormatter={v => formatDateTick(v, interval)}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval={xTickInterval}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${Number(v).toFixed(0)}`}
              width={48}
            />
            <Tooltip
              formatter={(value, name) => [
                `$${Number(value).toFixed(2)}`,
                name === 'price' ? 'Price' : 'SMA 150',
              ]}
              labelFormatter={label => formatDateTooltip(label as string)}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                padding: '6px 10px',
              }}
            />
            <Legend
              formatter={value => (value === 'price' ? 'Price' : 'SMA 150')}
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="sma150"
              stroke="#f97316"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 3"
              activeDot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
