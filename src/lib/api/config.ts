// lib/api/config.ts

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://test.univibe.uz',
  endpoints: {
    // Auth - Admin & Staff
    auth: {
      loginAdmin: '/api/v1/university-admin/auth/login/',
      loginStaff: '/api/v1/university-staff/login/',
    },

    // University Structure
    university: {
      list: '/api/v1/university/',

      // Faculties
      faculties: '/api/v1/university/faculties/',
      facultyDetail: (id: string) => `/api/v1/university/faculties/${id}/`, // Retrieve
      facultyDelete: (id: string) => `/api/v1/university/faculties/${id}/delete/`,
      facultyUpdate: (id: string) => `/api/v1/university/faculties/${id}/update/`,
      facultyCreate: '/api/v1/university/faculties/create/',

      // Degree Levels
      degreeLevels: '/api/v1/university/degree-levels/',
      degreeLevelDetail: (id: string) => `/api/v1/university/degree-levels/${id}/`, // Retrieve
      degreeLevelDelete: (id: string) => `/api/v1/university/degree-levels/${id}/delete/`,
      degreeLevelUpdate: (id: string) => `/api/v1/university/degree-levels/${id}/update/`,
      degreeLevelCreate: '/api/v1/university/degree-levels/create/',

      // Year Levels
      yearLevels: '/api/v1/university/year-levels/',
      yearLevelDetail: (id: string) => `/api/v1/university/year-levels/${id}/`, // Retrieve
      yearLevelDelete: (id: string) => `/api/v1/university/year-levels/${id}/delete/`,
      yearLevelUpdate: (id: string) => `/api/v1/university/year-levels/${id}/update/`,
      yearLevelCreate: '/api/v1/university/year-levels/create/',
    },

    // Staff Management
    staff: {
      list: '/api/v1/university-staff/list/',
      create: '/api/v1/university-staff/create/',
      delete: (id: string) => `/api/v1/university-staff/delete/${id}/`,

      // Job Positions
      jobPositions: '/api/v1/university-staff/job-positions/',
      jobPositionDetail: (id: string) => `/api/v1/university-staff/job-positions/${id}/`, // Retrieve
      jobPositionDelete: (id: string) => `/api/v1/university-staff/job-positions/${id}/delete/`,
      jobPositionUpdate: (id: string) => `/api/v1/university-staff/job-positions/${id}/update/`,
      jobPositionCreate: '/api/v1/university-staff/job-positions/create/',
    },

    // Student Management (Admin View)
    students: {
      list: '/api/v1/student/students/',
      detail: (id: string) => `/api/v1/student/students/${id}/`,
      updateStatus: (id: string) => `/api/v1/student/students/${id}/status/`,
      waitedCount: '/api/v1/student/waited/',
    },

    // Coins System
    coins: {
      // Rules
      rules: '/api/v1/coins/rules/',
      ruleDetail: (id: string) => `/api/v1/coins/rules/${id}/`, // Retrieve
      ruleCreate: '/api/v1/coins/rules/create/',
      ruleUpdate: (id: string) => `/api/v1/coins/rules/${id}/update/`,
      ruleActivate: (id: string) => `/api/v1/coins/rules/${id}/activate/`,
      ruleArchive: (id: string) => `/api/v1/coins/rules/${id}/archive/`,

      // Transactions
      transactions: '/api/v1/coins/transactions/',
      transactionIssue: '/api/v1/coins/transactions/issue/',
      transactionDelete: (id: string) => `/api/v1/coins/transactions/${id}/delete/`,

      // Admin 
      deletionAudits: '/api/v1/coins/admin/deletion-audits/',
      deletionAuditDetail: (id: string) => `/api/v1/coins/admin/deletion-audits/${id}/`,
      auditTransactions: '/api/v1/coins/admin/transactions/audit/',
    },

    // Market – Products
    market: {
      products: '/api/v1/market/products/',
      productCreate: '/api/v1/market/products/create/',
      productArchive: (id: string) => `/api/v1/market/products/${id}/archive/`,
      productStock: (id: string) => `/api/v1/market/products/${id}/stock/`,
    },
  },
} as const;

export type ApiEndpoints = typeof API_CONFIG.endpoints;
