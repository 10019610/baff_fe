import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate here to infer its type
import type { User } from '../types/User'; // Corrected import for User type

interface WebViewMessage {
  type: 'LOGIN_SUCCESS' | 'LOGOUT_SUCCESS' | string;
  token?: string;
  user?: User; // Assuming user data might be sent with LOGIN_SUCCESS
  // Add other potential message properties here
}

interface UseReactNativeWebViewMessageProps {
  login: (userData: User) => void;
  logout: () => void;
  navigate: ReturnType<typeof useNavigate>; // Correctly infer the type of navigate
}

export const useReactNativeWebViewMessage = ({
                                               login,
                                               logout,
                                               navigate,
                                             }: UseReactNativeWebViewMessageProps) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Ensure the message is from a trusted source if possible
      // For ReactNativeWebView, event.origin might be 'null' or the webview's URL
      // You might want to add more robust origin checking in a production environment
      console.log('event', event);
      try {
        // event.data is already the parsed object from React Native WebView
        // const message: WebViewMessage = event.data;
        const message: WebViewMessage = JSON.parse(event.data);
        console.log('use message', message);
        if (typeof event.data !== 'string' || !event.data.startsWith('{') || !event.data.endsWith('}')) {
          console.log('[Web Hook] React Native로부터 메시지 받음:', message);
          console.warn('[웹] 유효하지 않은 JSON 형식의 메시지 수신 (개발자 도구 메시지일 수 있음):', event.data);
          return;
        }

        if (message.type === 'LOGIN_SUCCESS') {
          if (message.token) {
            localStorage.setItem('userToken', message.token);
            if (message.user) {
              login(message.user); // Update AuthContext with user data
            }
            console.log('[Web Hook] 로그인 성공, 토큰 저장 및 /home으로 리디렉션');
            navigate('/home');
          }
        } else if (message.type === 'LOGOUT_SUCCESS') {
          localStorage.removeItem('userToken');
          logout(); // Clear AuthContext user data
          console.log('[Web Hook] 로그아웃 성공, 토큰 삭제 및 /로 리디렉션');
          navigate('/');
        } else {
          alert('HHHHH');
        }
      } catch (e) {
        // console.error('[Web Hook] 메시지 처리 오류:', e);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate, login, logout]);
};
