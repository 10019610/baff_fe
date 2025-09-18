import axios, { type AxiosInstance } from 'axios';

export const BASE_URL = import.meta.env.VITE_APP_API_URL;

// 주입받은 주소가 있으면 그것을 사용하고, 없으면 기존 환경 변수나 기본값을 사용
// export const BASE_URL = dynamicBaseUrl || import.meta.env.VITE_APP_API_URL;


axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';
const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config) => {
      // 로컬 스토리지에서 토큰을 가져옵니다.
      const accessToken = localStorage.getItem('userToken');

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
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
