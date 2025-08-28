/**
 * 유저 리스트 조회 반환 타입
 */
export interface GetUserListResponse {
  userId: string;
  nickname: string;
  email: string;
  userProfileUrl: string;
  regDateTime: string;
  role: string;
  status: string;
}

/**
 * 유저 정보 조회 반환 타입
 */
export interface GetUserInfoResponse {
  userId: string;
  nickname: string;
  email: string;
  userProfileUrl: string;
  regDateTime: string;
  provider: string;
  // role: string;
  // status: string;
}
