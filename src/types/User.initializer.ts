import type { GetUserListResponse } from './User.api.type.ts';

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
};
