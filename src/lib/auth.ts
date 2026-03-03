import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_CONFIG } from "./api/config";

const BASE_URL = API_CONFIG.baseURL;
// Backend access token lives 15 min — refresh at 14 min proactively
const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000;

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
    };
  }

  interface User {
    access_token: string;
    refresh_token: string;
    email: string;
    full_name: string;
    role: string;
    university_id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: string;
    university_id: string;
    full_name: string;
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
          return { ...token, ...refreshed, error: undefined };
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

  debug: false,
};
