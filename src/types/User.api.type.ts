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
