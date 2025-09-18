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

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  loginForGoogleApp: () => void;
  logout: () => void;
  getToken: () => string | null;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
                                                                  children,
                                                                }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getToken = React.useCallback((): string | null => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];
    return token || null;
  }, []);

  const setToken = React.useCallback((token: string) => {
    if (import.meta.env.VITE_APP_ENV === 'development') {
      document.cookie = `accessToken=${token}; path=/; max-age=604800;`;
    } else {
      // Production: Remove the incorrect Domain attribute
      document.cookie = `accessToken=${token}; path=/; max-age=604800; Secure; SameSite=None;`;
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (!token) {
          // On initial load, if there's no token, we just stop loading.
          // The user is not authenticated yet.
          setIsLoading(false);
          // return;
        }

        console.log('AuthProvider: Attempting to fetch user with token...');
        const response = await api.get<User>('/user/me'); // Correct path
        console.log('AuthProvider: Fetched user info successfully', response.data);
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.log('Failed to fetch user, likely no valid token yet:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [getToken]);

  useEffect(() => {
    const handleWebViewMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_LOGIN_SUCCESS') {
        console.log('GOOGLE_LOGIN_SUCCESS message received from RN');
        if (event.data.accessToken) {
          console.log('AuthProvider: Setting token from RN...');
          setToken(event.data.accessToken);
        } else {
          console.warn('AuthProvider: No accessToken received from RN!');
        }
        const userData = event.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        toast.success('구글 로그인 성공!');

        if (event.data.redirectTo) {
          setTimeout(() => {
            window.location.href = event.data.redirectTo;
          }, 100);
        }
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
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'REQUEST_GOOGLE_LOGIN',
      }));
    } else {
      toast.error('예기치 못한 에러가 발생했습니다. 관리자에게 문의해주세요.');
    }
  };

  const logout = React.useCallback(() => {
    if (import.meta.env.VITE_APP_ENV === 'development') {
      document.cookie = 'accessToken=; path=/; max-age=0;';
    } else {
      document.cookie = 'accessToken=; path=/; max-age=0; Secure; SameSite=None;';
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
