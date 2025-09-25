export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImage: string;
  role: string;
  height?: number; // 키 (cm 단위)
  provider: string;
}
