import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api/Api.ts';
import type { User } from '../types/User.ts'; // User 타입 임포트

// 인증 컨텍스트의 상태를 정의합니다.
interface AuthContextType {
  user: User | null; // 현재 로그인된 사용자 정보
  isAuthenticated: boolean; // 로그인 여부
  isLoading: boolean; // 인증 상태 로딩 중 여부
  login: (userData: User) => void; // 로그인 시 사용자 정보 설정 함수
  logout: () => void; // 로그아웃 처리 함수
}

// 기본 인증 컨텍스트 값 (초기 상태)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트: 인증 상태를 관리하고 자식 컴포넌트에 제공합니다.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 로딩 상태는 true
  const baseUrl = import.meta.env.VITE_APP_API_URL;

  // 컴포넌트 마운트 시 사용자 인증 상태를 확인합니다.
  useEffect(() => {
    /**
     * 현재 로그인된 사용자 정보를 백엔드에서 가져오는 비동기 함수
     * JWT 쿠키를 통해 인증 상태를 확인하고 사용자 정보를 설정합니다.
     */
    const fetchUser = async () => {
      console.log('fetchUser', isAuthenticated);
      try {
        const response = await api.get<User>(`${baseUrl}/user/me`);
        console.log('[/user/me] API 실제 응답 데이터:', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
        console.log('isAuthenticated', isAuthenticated);
      } catch (error) {
        console.log(error);
        // 401 Unauthorized 등의 에러 발생 시 로그인되지 않은 상태로 처리
        setUser(null);
        setIsAuthenticated(false);
        // console.error('Failed to fetch user info:', error); // 개발 시 디버깅용
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    fetchUser();
  }, [baseUrl]); // 컴포넌트 마운트 시 한 번만 실행

  /**
   * 로그인 처리 함수
   * @param userData 로그인 성공 후 백엔드에서 받은 사용자 정보
   */
  const login = React.useCallback((userData: User) => {
    console.log('auth Context login', userData);
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  /**
   * 로그아웃 처리 함수
   * 로컬 스토리지에서 토큰을 제거하고, 사용자 상태를 초기화합니다.
   */
  const logout = React.useCallback(() => {
    // 로컬환경과 배포환경 구분하여 처리
    // if (process.env.NODE_ENV === 'development') {
    if (import.meta.env.VITE_APP_ENV === 'development') {
      document.cookie = 'accessToken=; path=/; max-age=0;';
    } else {
      document.cookie =
        'accessToken=; path=/; max-age=0; Secure; SameSite=None; Domain=onlymebe.onrender.com;';
    }

    // 백엔드에서 쿠키를 제거하는 API가 있다면 여기에 호출 로직 추가
    // 예: apiClient.post('/api/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  }, []);

  const value = React.useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout }),
    [user, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// AuthContext를 쉽게 사용할 수 있도록 커스텀 훅을 제공합니다.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
