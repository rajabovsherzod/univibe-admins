// lib/api/types.ts

// --- COMMON TYPES ---

export type ISO8601Date = string;
export type UUID = string;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  code?: string;
  [key: string]: unknown;
}

// --- AUTH TYPES ---

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  refresh_token: string;
  access_token: string;
  email: string;
  full_name: string;
  role: string; // 'university_admin' | 'staff' etc.
  university_id: UUID;
}

// --- UNIVERSITY STRUCTURE ---

export interface University {
  public_id: UUID;
  name: string;
  logo?: string; // Mentioned in description
  is_active: boolean; // Implied by 'active universities'
  created_at?: ISO8601Date;
  updated_at?: ISO8601Date;
}

export interface Faculty {
  public_id: UUID;
  name: string;
  university_public_id: UUID;
  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

export interface DegreeLevel {
  public_id: UUID;
  name: string;
  university_public_id: UUID;
  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

export interface YearLevel {
  public_id: UUID;
  name: string;
  university_public_id: UUID;
  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

// --- STAFF & ROLES ---

export interface JobPosition {
  public_id: UUID;
  name: string;
  university_public_id: UUID;
  description?: string;
  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

export interface UniversityStaff {
  public_id: UUID;
  user_public_id: UUID;
  first_name: string;
  last_name: string;
  role: 'university_admin' | 'staff';
  job_position?: JobPosition;
  email: string;
  is_active: boolean;
  created_at: ISO8601Date;
}

export interface StaffListResponseItem {
  full_name: string;
  user_public_id: UUID;
  profile_photo_url: string | null;
  job_position: string | null;
  job_position_public_id: UUID | null;
  email: string;
}

// --- STUDENT ---

export type StudentStatus = 'approved' | 'rejected' | 'waited';

export interface Student {
  // User fields
  user_public_id: UUID;
  email: string;
  name: string;
  surname: string;
  middle_name?: string;
  full_name?: string; // Derived
  profile_photo_url?: string;

  // Student Profile fields
  date_of_birth?: string; // YYYY-MM-DD
  contact_phone_number?: string;
  university_student_id?: string;

  // Relations (Expanded or just names depending on endpoint)
  faculty_public_id?: UUID;
  faculty_name?: string;
  degree_level_public_id?: UUID;
  degree_level_name?: string;
  year_level_public_id?: UUID;
  year_level_name?: string;

  status: StudentStatus;

  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

export interface StudentStatusUpdatePayload {
  status: 'approved' | 'rejected';
}

export interface WaitedStudentsCountResponse {
  count: number; // or if it returns just a number/object, adjust based on API. Docs say "Returns the total number..." usually { count: 123 } or just 123.
  // Based on your example schema it showed additionalProps, but logic dictates a count.
  // I will assume it returns an object with a count property or similar. 
  // If it returns raw number, we can type it as number in the API call return type.
}

// --- COINS SYSTEM ---

export type CoinRuleStatus = 'ACTIVE' | 'ARCHIVED';

export interface CoinRule {
  public_id: UUID;
  name: string;
  description: string;
  coin_amount: number;
  status: CoinRuleStatus;
  usage_count: number;

  // Relations
  university_public_id: UUID;
  university_name: string;

  created_by_public_id: UUID;
  created_by_name: string;

  // This field comes as a string representation in GET list/detail in your example
  // but might be an array of IDs in POST/UPDATE.
  // We use the GET representation here.
  allowed_job_positions: string;

  first_used_at: ISO8601Date | null;
  created_at: ISO8601Date;
  updated_at: ISO8601Date;
}

export interface CoinRuleCreatePayload {
  name: string;
  description: string;
  coin_amount: number;
  status?: CoinRuleStatus;
  allowed_job_position_public_ids: UUID[];
}

export interface CoinRuleUpdatePayload {
  name?: string;
  description?: string;
  // coin_amount cannot be edited after first use
  allowed_job_position_public_ids?: UUID[];
}

export interface CoinTransaction {
  public_id: UUID;
  transaction_public_id: UUID; // Applies to list response
  amount: number;
  transaction_type: 'ISSUANCE' | 'SPEND' | 'DEDUCTION'; // Add other types if known

  // Student
  student_public_id: UUID;
  student_name: string;

  // Staff / Sender
  staff_member_public_id: UUID;
  staff_member_name: string;

  // Rule
  coin_rule_public_id?: UUID;
  coin_rule_name?: string;

  comment?: string;

  // Deletion info
  is_deleted?: boolean;
  deleted_at?: ISO8601Date;
  deleted_by_name?: string;
  deleted_by_public_id?: UUID;
  deletion_reason?: string;

  created_at: ISO8601Date;
  created_at_date?: string; // YYYY-MM-DD
}

export interface CoinIssuePayload {
  student_public_id: UUID;
  coin_rule_public_id: UUID;
  comment?: string;
}

export interface TransactionDeletePayload {
  deletion_reason: string;
}

// --- OTP & RECOVERY (Mainly for Students but definitions kept for reference) ---

export interface OtpSendPayload {
  email: string;
}

export interface OtpVerifyPayload {
  email: string;
  code: string;
  name?: string;
  surname?: string;
  university?: UUID;
}

export interface OtpResponse {
  message: string;
  expires_in_minutes?: number;
  // Verify response
  user_id?: number;
  email?: string;
  full_name?: string;
  access?: string;
  refresh?: string;
}
