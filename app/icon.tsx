import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0F172A',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '22%',
      }}
    >
      <svg viewBox="0 0 100 100" width="78%" height="78%" fill="none">
        <polyline
          points="8,78 30,58 52,40 72,30 92,36"
          stroke="#22C55E"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="58" x2="92" y2="58" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>,
    { ...size }
  )
}
