import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
// Must match the app-scoped cookie name set in src/lib/auth.ts. getToken()
// defaults to `next-auth.session-token`; with our renamed cookie it would never
// find the token, bounce to /login, and loop against the client redirect.
const USE_SECURE_COOKIES = (process.env.NEXTAUTH_URL || "").startsWith("https://");
const COOKIE_NAME = `${USE_SECURE_COOKIES ? "__Secure-" : ""}univibe-admin.session-token`;

export async function middleware(request: NextRequest) {
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
  const token = await getToken({ req: request, secret, cookieName: COOKIE_NAME, secureCookie: USE_SECURE_COOKIES });
  const isAuthenticated = !!token && token.error !== "RefreshAccessTokenError";

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
    const isTokenExpired = token.expiresAt && Date.now() > (token.expiresAt as number);
    if (!isTokenExpired) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - Next.js internals (_next/static, _next/image, _next/data)
     * - Static files (images, fonts, manifests, etc.)
     */
    '/((?!api|_next/static|_next/image|_next/data|favicon.ico|manifest.json|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$).*)',
  ],
};
