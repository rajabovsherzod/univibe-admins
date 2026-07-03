import { NextAuthOptions, getServerSession, type Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { redirect } from "next/navigation";
import { API_CONFIG } from "./api/config";

const BASE_URL = API_CONFIG.baseURL;
// Backend access token lives 15 min — refresh at 14 min proactively
const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000;

// ── App-scoped cookies ──────────────────────────────────────────────────────
// Admin and student apps share the same host in dev (localhost:3000 vs :3002);
// cookies ignore the port, so the default `next-auth.session-token` name is
// shared between them and their tokens clobber/leak into each other. A distinct
// cookie name per app keeps the two sessions fully isolated.
const USE_SECURE_COOKIES = (process.env.NEXTAUTH_URL || "").startsWith("https://");
const COOKIE_PREFIX = "univibe-admin";
const securePrefix = USE_SECURE_COOKIES ? "__Secure-" : "";

// ── Type augmentation ──────────────────────────────────────────────────────

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user: {
      email: string;
      full_name: string;
      role: string;
      university_id: string;
      /** Granted permission codes (staff). Present in the session so the UI
       * can gate immediately with no fetch / no loading flicker. */
      permissions: string[];
    };
  }

  interface User {
    access_token: string;
    refresh_token: string;
    email: string;
    full_name: string;
    role: string;
    university_id: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    university_id: string;
    full_name: string;
    permissions: string[];
    expiresAt?: number;
    error?: string;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: number } | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/user/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access) return null;
    return {
      accessToken: data.access as string,
      expiresAt: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
    };
  } catch {
    return null;
  }
}

/** Fetch the current staff member's granted permission codes. Used to keep the
 * session's permissions in sync (on token refresh) without any UI flicker. */
async function fetchStaffPermissions(accessToken: string): Promise<string[] | null> {
  try {
    const res = await fetch(`${BASE_URL}${API_CONFIG.endpoints.staff.me}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data?.permissions) ? (data.permissions as string[]) : null;
  } catch {
    return null;
  }
}

// ── Auth options ────────────────────────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "university-admin",
      name: "University Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${BASE_URL}${API_CONFIG.endpoints.auth.loginAdmin}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return data?.access_token ? data : null;
        } catch {
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: "university-staff",
      name: "University Staff",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${BASE_URL}${API_CONFIG.endpoints.auth.loginStaff}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return data?.access_token ? data : null;
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in — set all fields + fresh expiry
      if (user) {
        return {
          ...token,
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          role: user.role,
          university_id: user.university_id,
          full_name: user.full_name,
          permissions: user.permissions ?? [],
          expiresAt: Date.now() + ACCESS_TOKEN_LIFETIME_MS,
          error: undefined,
        };
      }

      // Token still valid — return as-is
      if (token.expiresAt && Date.now() < token.expiresAt) {
        return token;
      }

      // Access token expired — attempt server-side refresh
      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token.refreshToken);
        if (refreshed) {
          // Re-sync staff permissions so grants/revocations take effect within
          // one refresh cycle — done here (background) so the UI never flickers.
          let permissions = token.permissions;
          if (token.role === "staff") {
            const fresh = await fetchStaffPermissions(refreshed.accessToken);
            if (fresh) permissions = fresh;
          }
          return { ...token, ...refreshed, permissions, error: undefined };
        }
      }

      // Refresh failed — mark session as expired
      return { ...token, error: "RefreshAccessTokenError" };
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      session.user.role = token.role;
      session.user.university_id = token.university_id;
      session.user.full_name = token.full_name;
      session.user.permissions = token.permissions ?? [];
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days — matches refresh token lifetime
  },

  useSecureCookies: USE_SECURE_COOKIES,
  cookies: {
    sessionToken: {
      name: `${securePrefix}${COOKIE_PREFIX}.session-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: USE_SECURE_COOKIES },
    },
    callbackUrl: {
      name: `${securePrefix}${COOKIE_PREFIX}.callback-url`,
      options: { sameSite: "lax", path: "/", secure: USE_SECURE_COOKIES },
    },
    csrfToken: {
      name: `${USE_SECURE_COOKIES ? "__Host-" : ""}${COOKIE_PREFIX}.csrf-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: USE_SECURE_COOKIES },
    },
  },

  debug: false,
};

/** Server-component guard: returns a session with a live access token, or
 * redirects to /login. A token refresh failure (e.g. a transient backend
 * blip) sets `session.error` while leaving the now-dead old access token in
 * place — checking only `accessToken` truthiness misses that case and lets
 * pages fetch with a dead token, which surfaces as an opaque 401 downstream. */
export async function requireSession(): Promise<Session & { accessToken: string }> {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken || session.error) {
    redirect("/login");
  }
  return session as Session & { accessToken: string };
}
