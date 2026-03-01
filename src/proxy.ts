import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect social media crawlers — let them through without auth
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /TelegramBot|WhatsApp|Twitterbot|facebookexternalhit|LinkedInBot/i.test(userAgent);

  // Public paths that don't require authentication
  const isPublicPath =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/og') ||
    isBot;

  // Decode JWT token from cookie
  const token = await getToken({ req: request, secret });
  const isAuthenticated = !!token;

  // 1. Unauthenticated → redirect to login
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Wrong role (not university_admin or staff) → redirect to login
  if (isAuthenticated && !isPublicPath) {
    const role = token?.role as string | undefined;
    if (role && role !== 'university_admin' && role !== 'staff') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Authenticated user on login/forgot-password → redirect to dashboard
  if (isAuthenticated && isPublicPath && !isBot) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
