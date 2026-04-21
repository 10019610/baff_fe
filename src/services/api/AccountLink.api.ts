import { api } from './Api';

// S3 Phase 3 — baff_fe 계정 통합 API.
// Primary(웹/앱 로그인 세션)가 issue-token을 호출해 linkToken 발급.
// 이 linkToken을 딥링크 `intoss://changeup?action=link&token=XYZ`에 실어 토스 미니앱으로 전달.

export interface IssueTokenResponse {
  linkToken: string;
  expiresIn: number;
}

export const accountLinkApi = {
  issueToken: async () => {
    const response = await api.post<IssueTokenResponse>(
      '/api/account/link/issue-token'
    );
    return response.data;
  },

  dismissBanner: async () => {
    await api.patch('/api/account/link/dismiss-banner');
  },
};
