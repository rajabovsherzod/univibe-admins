import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;


  // Detect social media crawlers
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = /TelegramBot|WhatsApp|Twitterbot|facebookexternalhit|LinkedInBot/i.test(userAgent);

  // Define public paths that don't require authentication
  const isPublicPath = pathname === '/login' || pathname === '/forgot-password' || pathname.startsWith('/og') || isBot;

  // Check for valid session token
  const token = await getToken({
    req: request,
    secret,
    // secureCookie: process.env.NODE_ENV === 'production' // Optional sanity check
  });

  const isAuthenticated = !!token;


  // 1. Redirect unauthenticated users to login page (if trying to access protected route)
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated users away from login page to dashboard
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Allow request to proceed
  return NextResponse.next();
}

// Configure paths that trigger the proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svgs, etc. if needed)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};
