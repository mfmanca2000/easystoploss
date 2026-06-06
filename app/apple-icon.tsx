import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
      <svg viewBox="0 0 100 100" width="72%" height="72%" fill="none">
        <polyline
          points="8,78 30,58 52,40 72,30 92,36"
          stroke="#22C55E"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="8" y1="58" x2="92" y2="58" stroke="#EF4444" strokeWidth="6" strokeLinecap="round" />
        <circle cx="52" cy="58" r="5" fill="#EF4444" />
      </svg>
    </div>,
    { ...size }
  )
}
