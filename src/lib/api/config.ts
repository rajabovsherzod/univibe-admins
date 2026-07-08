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
      me: '/api/v1/university-staff/me/',
      list: '/api/v1/university-staff/list/',
      create: '/api/v1/university-staff/create/',
      delete: (id: string) => `/api/v1/university-staff/delete/${id}/`,
      updateProfile: (id: string) => `/api/v1/university-staff/profile/${id}/`, // PUT

      // Job Positions
      jobPositions: '/api/v1/university-staff/job-positions/',
      jobPositionDetail: (id: string) => `/api/v1/university-staff/job-positions/${id}/`, // Retrieve
      jobPositionDelete: (id: string) => `/api/v1/university-staff/job-positions/${id}/delete/`,
      jobPositionUpdate: (id: string) => `/api/v1/university-staff/job-positions/${id}/update/`,
      jobPositionCreate: '/api/v1/university-staff/job-positions/create/',
    },

    // RBAC – Permission catalog
    rbac: {
      catalog: '/api/v1/rbac/catalog/',
    },

    // Student Management (Admin View)
    students: {
      list: '/api/v1/student/students/',
      detail: (id: string) => `/api/v1/student/students/${id}/`,
      updateStatus: (id: string) => `/api/v1/student/students/${id}/status/`,
      updateProfile: (id: string) => `/api/v1/student/students/${id}/`, // PUT
      delete: (id: string) => `/api/v1/student/students/${id}/`, // DELETE
      waitedCount: '/api/v1/student/waited/',
      archive: (id: string) => `/api/v1/student/students/${id}/archive/`,
      unarchive: (id: string) => `/api/v1/student/students/${id}/unarchive/`,
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
      ruleHistory: (id: string) => `/api/v1/coins/rules/${id}/history/`,

      // Transactions
      transactions: '/api/v1/coins/transactions/',
      transactionIssue: '/api/v1/coins/transactions/issue/',
      transactionDelete: (id: string) => `/api/v1/coins/transactions/${id}/delete/`,

      // Admin 
      deletionAudits: '/api/v1/coins/admin/deletion-audits/',
      deletionAuditDetail: (id: string) => `/api/v1/coins/admin/deletion-audits/${id}/`,
      auditTransactions: '/api/v1/coins/admin/transactions/audit/',
      leaderboard: '/api/v1/coins/leaderboard/',

      // QR-based bulk issuance
      ruleQrToken: (id: string) => `/api/v1/coins/rules/${id}/qr-token/`,
      qrRequests: '/api/v1/coins/qr-requests/',
      qrRequestApprove: (id: string) => `/api/v1/coins/qr-requests/${id}/approve/`,
      qrRequestReject: (id: string) => `/api/v1/coins/qr-requests/${id}/reject/`,
      activityStats: '/api/v1/coins/admin/statistics/activity/',
      statistics: '/api/v1/coins/admin/statistics/',
    },

    // Market – Products
    market: {
      products: '/api/v1/market/products/',
      productCreate: '/api/v1/market/products/create/',
      productUpdate: (id: string) => `/api/v1/market/products/${id}/update/`,
      productArchive: (id: string) => `/api/v1/market/products/${id}/archive/`,
      productStock: (id: string) => `/api/v1/market/products/${id}/stock/`,
      auditRedemptions: '/api/v1/market/admin/redemptions/audit/',

      // Orders
      ordersList: '/api/v1/market/orders/',
      orderDetail: (id: string) => `/api/v1/market/orders/${id}/`,
      orderStatus: (id: string) => `/api/v1/market/orders/${id}/status/`,
    },

    // Banners Management
    banners: {
      // Dashboard (read-only for all authenticated users)
      dashboard: '/api/v1/banners/dashboard/',
      
      // Management endpoints (university_admin only)
      manage: {
        list: '/api/v1/banners/manage/',
        create: '/api/v1/banners/manage/create/',
        detail: (publicId: string) => `/api/v1/banners/manage/${publicId}/`,
        update: (publicId: string) => `/api/v1/banners/manage/${publicId}/`,
        delete: (publicId: string) => `/api/v1/banners/manage/${publicId}/`,
        changeStatus: (publicId: string) => `/api/v1/banners/manage/${publicId}/status/`,
      },
    },

    // Clubs Management (Admin)
    clubs: {
      admin: {
        list: '/api/v1/admin/clubs/',
        create: '/api/v1/admin/clubs/',
        detail: (id: string) => `/api/v1/admin/clubs/${id}/`,
        status: (id: string) => `/api/v1/admin/clubs/${id}/status/`,
        owner: (id: string) => `/api/v1/admin/clubs/${id}/owner/`,
      }
    },
    
    // Events Management (Admin)
    events: {
      admin: {
        list: '/api/v1/university-admin/events/',
        create: '/api/v1/university-admin/events/',
        detail: (id: string) => `/api/v1/university-admin/events/${id}/`,
        changeStatus: (id: string) => `/api/v1/university-admin/events/${id}/change-status/`,
        approve: (id: string) => `/api/v1/university-admin/events/${id}/approve/`,
        reject: (id: string) => `/api/v1/university-admin/events/${id}/reject/`,
        addCollaborator: (id: string) => `/api/v1/university-admin/events/${id}/add-collaborator/`,
        removeCollaborator: (id: string, collabId: string) => `/api/v1/university-admin/events/${id}/remove-collaborator/${collabId}/`,
        participants: (id: string) => `/api/v1/university-admin/events/${id}/participants/`,
        attendance: (id: string, studentId: string) => `/api/v1/university-admin/events/${id}/attendance/${studentId}/`,
        scanQr: (id: string) => `/api/v1/university-admin/events/${id}/scan-qr/`,
      }
    },
  },
} as const;

export type ApiEndpoints = typeof API_CONFIG.endpoints;
