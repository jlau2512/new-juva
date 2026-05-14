import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'JUVA — Premium Digital Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(120% 80% at 20% 0%, rgba(204,255,0,0.18) 0%, transparent 60%), #050505',
          color: '#fff',
          padding: '80px',
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: 8,
              color: '#ccff00',
            }}
          >
            JUVA
          </div>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: '#ccff00' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            We give birth to
          </div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, color: '#ccff00' }}>
            brands · sites · apps.
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: 24 }}>
          <span>Premium digital studio · Mauritius</span>
          <span>juva.design</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
