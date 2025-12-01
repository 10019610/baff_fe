export interface User {
  id: string; // socialId (구글/카카오 고유 ID)
  userId?: number; // 백엔드 DB의 userId (숫자)
  email: string;
  nickname: string;
  profileImage: string;
  role: string;
  height?: number; // 키 (cm 단위)
  provider: string;
  regDateTime: string;
}
