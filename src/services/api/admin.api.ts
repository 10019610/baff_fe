import { api } from './Api';

const BASE = '/admin/dashboard';

export const adminApi = {
  // 대시보드 개요
  getStats: () => api.get(`${BASE}/stats`),
  getUserGrowth: (period = 'DAILY') => api.get(`${BASE}/user-growth`, { params: { period } }),
  getWeightTrend: (period = 'DAILY') => api.get(`${BASE}/weight-trend`, { params: { period } }),
  getPlatformDistribution: () => api.get(`${BASE}/platform-distribution`),
  getRecentActivities: () => api.get(`${BASE}/recent-activities`),

  // 사용자 관리
  getUsers: (params: { status?: string; search?: string; page?: number; size?: number }) =>
    api.get(`${BASE}/users`, { params }),
  getUserDetail: (userId: number) => api.get(`${BASE}/users/${userId}/detail`),
  updateUserRole: (userId: number, role: string) => api.put(`${BASE}/users/${userId}/role`, { role }),
  updateUserStatus: (userId: number, status: string) => api.put(`${BASE}/users/${userId}/status`, { status }),

  // 문의 관리
  getInquiries: (params: { status?: string; type?: string; search?: string; page?: number; size?: number }) =>
    api.get(`${BASE}/inquiries`, { params }),
  getInquiryDetail: (id: number) => api.get(`${BASE}/inquiries/${id}`),
  replyToInquiry: (id: number, content: string) => api.post(`${BASE}/inquiries/${id}/reply`, { content }),
  updateInquiryStatus: (id: number, status: string) => api.put(`${BASE}/inquiries/${id}/status`, { status }),

  // 배틀 관리
  getBattles: (params: { status?: string; page?: number; size?: number }) =>
    api.get(`${BASE}/battles`, { params }),

  // 리뷰 관리
  getReviews: (params: { search?: string; page?: number; size?: number }) =>
    api.get(`${BASE}/reviews`, { params }),
  updateReviewVisibility: (id: number, isPublic: boolean) => api.put(`${BASE}/reviews/${id}/visibility`, { isPublic }),
  deleteReview: (id: number) => api.delete(`${BASE}/reviews/${id}`),

  // 리워드/조각 경제
  getRewardSummary: () => api.get(`${BASE}/rewards/summary`),
  getRewardConfigs: (params?: { page?: number; size?: number }) =>
    api.get(`${BASE}/rewards/configs`, { params }),
  getRewardExchanges: (params?: { page?: number; size?: number }) =>
    api.get(`${BASE}/rewards/exchanges`, { params }),

  // 내역 관리
  getLoginHistories: (params: { page?: number; size?: number; userId?: number }) =>
    api.get(`${BASE}/history/logins`, { params }),
  getWeightHistories: (params: { page?: number; size?: number; userId?: number }) =>
    api.get(`${BASE}/history/weights`, { params }),
  getRewardHistories: (params: { type?: string; page?: number; size?: number }) =>
    api.get(`${BASE}/history/rewards`, { params }),
  getAttendanceHistories: (params: { page?: number; size?: number }) =>
    api.get(`${BASE}/history/attendances`, { params }),

  // 공지사항
  getNotices: () => api.get(`${BASE}/notices`),
  createNotice: (title: string, content: string) => api.post(`${BASE}/notices`, { title, content }),
  updateNotice: (id: number, data: { title?: string; content?: string; isActive?: boolean }) =>
    api.put(`${BASE}/notices/${id}`, data),
  deleteNotice: (id: number) => api.delete(`${BASE}/notices/${id}`),
};
