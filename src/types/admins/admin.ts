export type AdminRole = "superadmin" | "admin";
export type AdminStatus = "active" | "invited" | "blocked";

export type AdminRow = {
  id: number;
  fullName: string;
  email: string;
  department: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin?: string | null;
  createdAt: string;
};

/** Raw API response type (snake_case) */
export type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  status: string;
  last_login_at?: string | null;
  created_at: string;
};