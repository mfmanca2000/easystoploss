import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = [
  '/login', '/api/login', '/api/logout', '/api/cron',
  '/manifest.webmanifest', '/icon', '/apple-icon', '/sw.js',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = request.cookies.get('session')?.value;
  const secret = process.env.AUTH_SECRET;

  if (!session || !secret || session !== secret) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
