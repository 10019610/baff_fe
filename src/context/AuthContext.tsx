import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react';
import { api } from '../services/api/Api.ts';
import type { User } from '../types/User.ts'; // User 타입 임포트
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  loginForGoogleApp: () => void;
  logout: () => void;
  getToken: () => string | null;
  setToken: (token: string) => void;
  updateUserProfileImage: (imageUrl: string) => void;
  updateUserNickname: (nickname: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getToken = React.useCallback((): string | null => {
    // [수정] 쿠키에서 토큰 읽기
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];
    return token || null;
  }, []);

  const setToken = React.useCallback((token: string) => {
    // [수정] 쿠키에 토큰 저장
    if (import.meta.env.VITE_APP_ENV === 'development') {
      document.cookie = `accessToken=${token}; path=/; max-age=604800;`;
    } else {
      document.cookie = `accessToken=${token}; path=/; max-age=604800; Secure; SameSite=None;`;
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      // 토큰 존재 여부를 미리 체크하여 로딩 상태를 바꾸는 로직을 제거합니다.
      // 토큰이 없으면 api.get 요청이 실패할 것이고, catch 블록에서 처리됩니다.
      try {
        const response = await api.get<User>('/user/me');

        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Failed to fetch user, likely no valid token yet:', error);
        setUser(null);
        setIsAuthenticated(false);
        // 만약 토큰이 유효하지 않다면 쿠키를 지워주는 것이 좋습니다.
        if (import.meta.env.VITE_APP_ENV === 'development') {
          document.cookie = 'accessToken=; path=/; max-age=0;';
        } else {
          document.cookie =
            'accessToken=; path=/; max-age=0; Secure; SameSite=None;';
        }
      } finally {
        // 인증 절차가 성공하든 실패하든, 항상 마지막에 로딩 상태를 false로 변경합니다.
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [getToken]);

  useEffect(() => {
    const handleWebViewMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        console.log('GOOGLE_LOGIN_SUCCESS message received from RN');
        if (event.data.accessToken) {
          console.log('AuthProvider: Setting token from RN...');
          setToken(event.data.accessToken);
        } else {
          console.warn('AuthProvider: No accessToken received from RN!');
        }

        // 유저ID 조회 후 SocialID 수정
        const response = await api.get<User>('/user/me');

        // const userData = event.data.user;

        // setUser(userData);
        setUser(response.data);
        setIsAuthenticated(true);
        toast.success('구글 로그인 성공!');

        // if (event.data.redirectTo) {
        //   setTimeout(() => {
        //     window.location.href = event.data.redirectTo;
        //   }, 100);
        // }
      } else if (event.data && event.data.type === 'GOOGLE_LOGIN_ERROR') {
        console.log('AuthProvider: GOOGLE_LOGIN_ERROR received from RN');
        toast.error(event.data.message || '구글 로그인 실패');

        if (event.data.details) {
          console.error('Login error details:', event.data.details);
        }
      }
    };

    window.addEventListener('message', handleWebViewMessage);

    return () => {
      window.removeEventListener('message', handleWebViewMessage);
    };
  }, [setToken]);

  const login = React.useCallback((userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const loginForGoogleApp = () => {
    console.log('in AuthContext, requesting login from RN app');
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'REQUEST_GOOGLE_LOGIN',
        })
      );
    } else {
      toast.error('예기치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.');
    }
  };

  const logout = React.useCallback(async () => {
    console.log('Logout: Function started.');
    try {
      // 백엔드에 로그아웃 API 호출 (HttpOnly 쿠키 삭제 요청)
      // 백엔드 엔드포인트는 '/logout' 입니다.
      console.log('Logout: Calling API...');
      const response = await api.post('/user/logout');
      console.log('Logout: API call completed successfully:', response.status);
    } catch (error) {
      console.error('Logout API call failed', error);
      // 에러가 발생하더라도 프론트엔드 상태는 초기화하고 리디렉션합니다.
    } finally {
      toast.error('로그아웃 되었습니다.');
      console.log('Logout: Finally block entered.');
      // [수정] 쿠키에서 토큰 삭제
      console.log('Logout: Attempting to remove accessToken from cookie');
      document.cookie = 'accessToken=; path=/; max-age=0;';

      // 앱에 로그아웃 전달하여 앱의 로그아웃 처리(앱인 경우만)
      if (window.ReactNativeWebView) {
        console.log('Logout: 웹뷰 환경 감지. RN으로 로그아웃 메시지 전송.');
        const message = { type: 'REQUEST_GOOGLE_LOGOUT' };
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }

      // API 호출 성공/실패 여부와 관계없이 프론트엔드 상태를 초기화하고 페이지를 이동합니다.
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
      console.log('Logout: Redirection line commented out.');
    }
  }, []);

  const updateUserProfileImage = useCallback((imageUrl: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        profileImage: imageUrl,
      };
    });
  }, []);

  const updateUserNickname = useCallback((nickname: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        nickname: nickname,
      };
    });
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      loginForGoogleApp,
      getToken,
      setToken,
      updateUserProfileImage,
      updateUserNickname,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      loginForGoogleApp,
      getToken,
      setToken,
      updateUserProfileImage,
      updateUserNickname,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
