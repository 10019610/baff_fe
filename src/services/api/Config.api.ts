import { api } from './Api';

// S6-2 — 기능별 접근 제어 설정 (나만그래 패턴).
// 앱 시작 시 한번 조회 → React Query 5분 캐싱.

export interface FeatureAccessItem {
  enabled: boolean;
  loginRequired: boolean;
  description: string | null;
}

export type FeatureAccessConfig = Record<string, FeatureAccessItem>;

export const configApi = {
  getFeatureAccess: async () => {
    const response = await api.get<FeatureAccessConfig>(
      '/config/feature-access'
    );
    return response.data;
  },
};
