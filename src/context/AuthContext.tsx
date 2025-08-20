import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  provider: 'google' | 'kakao';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (provider: 'google' | 'kakao') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // 퍼블리싱 확인용 Mock 사용자 (개발 중에만 사용)
  const [user, setUser] = useState<User | null>({
    id: 'mock_user_123',
    email: 'test@example.com',
    name: '테스트 유저',
    profileImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    provider: 'google',
    createdAt: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);

  // 페이지 로드 시 저장된 사용자 정보 확인
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Mock 소셜 로그인 함수
  const login = async (provider: 'google' | 'kakao') => {
    setIsLoading(true);

    try {
      // 실제 환경에서는 여기서 OAuth 플로우를 시작합니다
      // window.location.href = `${API_URL}/auth/${provider}`;

      // Mock 로그인 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 로딩 시뮬레이션

      // Mock 사용자 데이터
      const mockUsers = {
        google: {
          id: 'google_user_123',
          email: 'user@gmail.com',
          name: '김체중',
          profileImage:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
          provider: 'google' as const,
          createdAt: new Date().toISOString(),
        },
        kakao: {
          id: 'kakao_user_456',
          email: 'user@kakao.com',
          name: '이다이어트',
          profileImage:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
          provider: 'kakao' as const,
          createdAt: new Date().toISOString(),
        },
      };

      const userData = mockUsers[provider];

      // 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      // 기존 localStorage 데이터를 현재 사용자에게 연결
      // 실제 환경에서는 서버에서 사용자별 데이터를 관리합니다
      const existingData = {
        weightEntries: localStorage.getItem('weightEntries'),
        goals: localStorage.getItem('goals'),
        battleRequests: localStorage.getItem('battleRequests'),
        weightBattles: localStorage.getItem('weightBattles'),
      };

      // 사용자별 데이터 키로 저장
      Object.entries(existingData).forEach(([key, data]) => {
        if (data) {
          localStorage.setItem(`${key}_${userData.id}`, data);
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 사용자 정보 제거
    localStorage.removeItem('user');
    setUser(null);

    // 실제 환경에서는 서버에 로그아웃 요청을 보냅니다
    // fetch('/api/auth/logout', { method: 'POST' });
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
