export type AdminRole = "superadmin" | "admin";
export type AdminStatus = "active" | "invited";

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