import type { AdminUser } from "@/types/admins/admin";

export const adminsMock: AdminUser[] = [
  {
    id: 1,
    full_name: "Sherzod Rajabov",
    email: "sherzod@univibe.uz",
    role: "superadmin",
    status: "active",
    last_login_at: "2026-02-01T09:10:00Z",
    created_at: "2025-12-10T12:00:00Z",
  },
  {
    id: 2,
    full_name: "Aziza Karimova",
    email: "aziza@univibe.uz",
    role: "admin",
    status: "active",
    last_login_at: "2026-01-31T18:22:00Z",
    created_at: "2026-01-10T08:10:00Z",
  },
  {
    id: 3,
    full_name: "Javohir Abdullayev",
    email: "javohir@univibe.uz",
    role: "admin",
    status: "invited",
    created_at: "2026-01-28T11:15:00Z",
  },
  {
    id: 4,
    full_name: "Malika Islomova",
    email: "malika@univibe.uz",
    role: "admin",
    status: "blocked",
    last_login_at: "2026-01-12T16:05:00Z",
    created_at: "2025-11-20T09:00:00Z",
  },
];
