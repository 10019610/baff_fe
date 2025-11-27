import axios, { type AxiosInstance } from 'axios';

export const BASE_URL = import.meta.env.VITE_APP_API_URL;

// 환경 정보 로깅 (개발 환경에서만)
// if (import.meta.env.VITE_APP_DEBUG === 'true') {
//   console.log('🌍 Environment:', import.meta.env.VITE_APP_ENV);
//   console.log('🔗 API URL:', BASE_URL);
// }

axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      // [수정] 쿠키에서 토큰 읽기
      const accessToken = getCookie('accessToken');

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        console.log(
          'API Request Interceptor: No accessToken found in cookies.'
        );
      }
      config.withCredentials = true;

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        console.error(
          'API Response Interceptor: Authentication failed (401). Clearing token and redirecting to login.'
        );
        // 토큰 삭제 (쿠키에서 삭제)
        document.cookie =
          'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  setupInterceptors(instance);
  return instance;
};

export const api = createAxiosInstance();
