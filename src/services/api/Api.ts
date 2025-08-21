import axios, { type AxiosInstance } from 'axios';

export const BASE_URL = import.meta.env.VITE_APP_API_URL;

// 환경 정보 로깅 (개발 환경에서만)
if (import.meta.env.VITE_APP_DEBUG === 'true') {
  console.log('🌍 Environment:', import.meta.env.VITE_APP_ENV);
  console.log('🔗 API URL:', BASE_URL);
}

axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';
const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      // console.log('API 호출:', config.url);

      const accessToken = '11';

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        config.withCredentials = true;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // 인증 실패 시 로그아웃 처리
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
