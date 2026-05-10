import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';

export const config = {
  matcher: ['/((?!_next|api|favicon|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)'],
};

function pickLocale(req: NextRequest): string {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) return cookie;
  const accept = req.headers.get('accept-language')?.toLowerCase() ?? '';
  if (accept.startsWith('fr') || accept.includes(',fr')) return 'fr';
  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return NextResponse.next();
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}
