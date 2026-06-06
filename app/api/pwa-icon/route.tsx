import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sz = Math.min(512, Math.max(16, parseInt(searchParams.get('size') || '192', 10)))

  return new ImageResponse(
    <div
      style={{
        background: '#0F172A',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16%',
      }}
    >
      <svg viewBox="0 0 100 100" width="68%" height="68%" fill="none">
        {/* Chart line */}
        <polyline
          points="8,78 28,60 50,42 70,30 92,36"
          stroke="#22C55E"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stop-loss line */}
        <line x1="8" y1="60" x2="92" y2="60" stroke="#EF4444" strokeWidth="5.5" strokeLinecap="round" />
        {/* Intersection dot */}
        <circle cx="28" cy="60" r="4.5" fill="#EF4444" />
        {/* "SL" label on the right */}
        <text x="95" y="64" fontSize="12" fill="#EF4444" textAnchor="end" fontWeight="700" fontFamily="monospace">SL</text>
      </svg>
    </div>,
    { width: sz, height: sz }
  )
}
