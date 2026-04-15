import { encode, getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

import { API_CONFIG } from "@/lib/api/config";

// Must match auth.ts
const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000;

/**
 * POST /api/auth/refresh
 *
 * expiresAt tekshirmasdan to'g'ridan-to'g'ri backend'ga refresh so'rovi yuboradi,
 * yangi access token oladi va JWT cookie'ni yangilaydi.
 *
 * api-client.ts dagi 401 interceptor shu endpoint'ni ishlatadi.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const token = await getToken({ req: request, secret });

  if (!token?.refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_CONFIG.baseURL}/api/v1/user/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    }

    const data = await res.json();
    if (!data?.access) {
      return NextResponse.json({ error: "Invalid refresh response" }, { status: 401 });
    }

    const newAccessToken = data.access as string;

    // Yangilangan JWT token obyekti
    const updatedToken = {
      ...token,
      accessToken: newAccessToken,
      expiresAt: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
      error: undefined,
    };

    // JWT cookie nomini aniqlash (prod'da secure prefix bo'ladi)
    const isSecure = process.env.NODE_ENV === "production";
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    // Yangi JWT'ni encode qilish
    const encodedToken = await encode({
      token: updatedToken,
      secret,
      maxAge: 10 * 24 * 60 * 60, // 10 kun — auth.ts dagi session.maxAge bilan bir xil
    });

    const response = NextResponse.json({ access: newAccessToken });
    response.cookies.set(cookieName, encodedToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
