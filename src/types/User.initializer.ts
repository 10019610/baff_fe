import type { GetUserInfoResponse, GetUserListResponse } from './User.api.type.ts';

/**
 * 유저 관련 초기화 모음
 */
export const userInitializer = {
  INITIAL_GET_USER_LIST: [
    {
      userId: '',
      nickname: '',
      email: '',
      userProfileUrl: '',
      regDateTime: '',
      role: '',
      status: '',
    },
  ] as GetUserListResponse[],
  /**
   * 유저 상세정보 초기화
   */
  INITIAL_GET_USER_INFO: {
    userId: '',
    nickname: '',
    email: '',
    userProfileUrl: '',
    regDateTime: '',
    provider: 'changeUp',
  } as GetUserInfoResponse,
};
