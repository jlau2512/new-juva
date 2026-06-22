import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/config';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const fraunces = Fraunces({
  subsets: ['latin'], variable: '--font-display', display: 'swap',
  weight: ['300', '400', '500', '600', '700'], style: ['normal', 'italic'],
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'], variable: '--font-label', display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Premium Digital Studio`, template: `%s · ${SITE.name}` },
  description: 'JUVA crafts fast, beautiful, conversion-focused websites and custom apps in Mauritius.',
  applicationName: SITE.name, authors: [{ name: SITE.name }],
  openGraph: { type: 'website', siteName: SITE.name, url: SITE.url },
  twitter: { card: 'summary_large_image' },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
};

export const viewport: Viewport = {
  themeColor: '#080807', width: 'device-width', initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
