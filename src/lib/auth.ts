import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { API_CONFIG } from "./api/config";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      email: string;
      full_name: string;
      role: string;
      university_id: string;
    }
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
    expiresAt: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "university-admin",
      name: "University Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.loginAdmin}`;

        try {
          const res = await axios.post(url, {
            email: credentials.email,
            password: credentials.password
          }, {
            headers: { "Content-Type": "application/json" }
          });

          return res.data;
        } catch (e: any) {
          console.error("Axios Error:", e.response?.data || e.message);
          return null;
        }
      }
    }),
    CredentialsProvider({
      id: "university-staff",
      name: "University Staff",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await axios.post(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.auth.loginStaff}`, {
            email: credentials.email,
            password: credentials.password
          }, {
            headers: { "Content-Type": "application/json" }
          });

          if (res.data?.access_token) {
            return res.data;
          }
          return null;
        } catch (e: any) {
          console.error(e.response?.data || e.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.refreshToken = user.refresh_token;
        token.role = user.role;
        token.university_id = user.university_id;
        token.full_name = user.full_name;
        // Optionally set expiration if backend provides it
        // token.expiresAt = Date.now() + expiresIn * 1000
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.role = token.role;
      session.user.university_id = token.university_id;
      session.user.full_name = token.full_name;
      return session;
    }
  },
  pages: {
    signIn: '/uz/login', // Adjust locale as needed or use middleware
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
};
