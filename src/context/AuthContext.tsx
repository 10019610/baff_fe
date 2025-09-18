import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { api } from '../services/api/Api.ts';
import type { User } from '../types/User.ts'; // User 타입 임포트
import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom'; // Import useNavigate

// 인증 컨텍스트의 상태를 정의합니다.
interface AuthContextType {
  user: User | null; // 현재 로그인된 사용자 정보
  isAuthenticated: boolean; // 로그인 여부
  isLoading: boolean; // 인증 상태 로딩 중 여부
  login: (userData: User) => void; // 로그인 시 사용자 정보 설정 함수
  loginForGoogleApp: () => void;
  logout: () => void; // 로그아웃 처리 함수
  getToken: () => string | null;
  setToken: (token: string) => void;
}

// 기본 인증 컨텍스트 값 (초기 상태)
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const navigate = useNavigate();

// AuthProvider 컴포넌트: 인증 상태를 관리하고 자식 컴포넌트에 제공합니다.
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
                                                                  children,
                                                                }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 초기 로딩 상태는 true

  const baseUrl = import.meta.env.VITE_APP_API_URL;

  const getToken = React.useCallback((): string | null => {
    // 쿠키에서 토큰 읽기
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];
    return token || null;
  }, []);

  const setToken = React.useCallback((token: string) => {
    // 환경에 따라 쿠키 설정
    if (import.meta.env.VITE_APP_ENV === 'development') {
      document.cookie = `accessToken=${token}; path=/; max-age=604800;`; // 7일
    } else {
      document.cookie = `accessToken=${token}; path=/; max-age=604800; Secure; SameSite=None; Domain=onlymebe.onrender.com;`;
    }
  }, []);

  // Call the custom hook to listen for messages from React Native WebView
  // useReactNativeWebViewMessage({ login: React.useCallback((userData: User) => {
  //   setUser(userData);
  //   setIsAuthenticated(true);
  // }, []), logout: React.useCallback(() => {
  //   setUser(null);
  //   setIsAuthenticated(false);
  //   // window.location.href = '/'; // This will be handled by the hook's navigate
  // }, []), navigate });

  // 컴포넌트 마운트 시 사용자 인증 상태를 확인합니다.
  useEffect(() => {
    /**
     * 현재 로그인된 사용자 정보를 백엔드에서 가져오는 비동기 함수
     * JWT 쿠키를 통해 인증 상태를 확인하고 사용자 정보를 설정합니다.
     */
    const fetchUser = async () => {
      try {
        // 🔥 수정: 토큰 확인 후 사용자 정보 가져오기
        const token = getToken();
        if (!token) {
          console.log('AuthProvider: 토큰이 없음');
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log('AuthProvider: 토큰으로 사용자 정보 조회 중...');
        const response = await api.get<User>(`${baseUrl}/user/me`);
        console.log('AuthProvider: 사용자 정보 조회 성공', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
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

  useEffect(() => {
    const handleWebViewMessage = (event: MessageEvent) => {
      console.log(event);
      if (event.data && event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        console.log('GOOGLE_LOGIN_SUCCESS');
        // 🔥 토큰 저장 (가장 중요!)
        if (event.data.accessToken) {
          console.log('AuthProvider: 토큰 저장 중...');
          setToken(event.data.accessToken);
        } else {
          console.warn('AuthProvider: 토큰이 없습니다!');
        }
        const userData = event.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('구글 로그인 성공!');

        if (event.data.redirectTo) {
          setTimeout(() => {
            window.location.href = event.data.redirectTo;
          }, 100); // 토큰 설정 완료를 기다림
        }
        // window.location.href = 'https://baff-fe.vercel.app/';
        // 페이지 이동 처리
        // navigate('/');
        // if (event.data.redirectTo) {
        //   console.log('event.data.redirectTo', event.data.redirectTo);
        //   // window.location.href = 'https://baff-fe.vercel.app/';
        //
        // }
      } else if (event.data && event.data.type === 'GOOGLE_LOGIN_ERROR') {
        console.log('AuthProvider: 구글 로그인 에러 처리');
        toast.error(event.data.message || '구글 로그인 실패');

        if (event.data.details) {
          console.error('로그인 에러 세부사항:', event.data.details);
        }
      }
    };

    window.addEventListener('message', handleWebViewMessage);

    return () => {
      window.removeEventListener('message', handleWebViewMessage);
    };
  }, []);


  /**
   * 로그인 처리 함수
   * @param userData 로그인 성공 후 백엔드에서 받은 사용자 정보
   */
  const login = React.useCallback((userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const loginForGoogleApp = () => {
    console.log('in AuthContext and Google, App');
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'REQUEST_GOOGLE_LOGIN',
      }));
    } else {
      toast.error('예기치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.');
    }
  };

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
    () => ({ user, isAuthenticated, isLoading, login, logout, loginForGoogleApp, getToken, setToken }),
    [user, isAuthenticated, isLoading, login, logout, loginForGoogleApp, getToken, setToken],
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
