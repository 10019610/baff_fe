import axios, { type AxiosInstance } from 'axios';

/**
 * 현재 환경에 맞는 백엔드 API의 기본 URL을 반환합니다.
 */
const getBaseUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isReactNative = urlParams.get('isReactNativeApp') === 'true';

  if (isReactNative) {
    // React Native 웹뷰 환경 (Android 에뮬레이터 기준)
    return 'http://10.0.2.2:8080';
  }

  // 일반 웹 브라우저 환경 (로컬 개발 또는 Vercel 배포)
  return import.meta.env.VITE_APP_API_URL || 'http://localhost:8080';
};

/**
 * 모든 API 요청에 사용될 기본 Axios 인스턴스
 */
export const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(), // /api 경로를 여기서 추가하지 않습니다.
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 요청 인터셉터: 모든 요청에 인증 토큰을 추가합니다.
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('userToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터: 401 에러 발생 시 처리를 위함
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 필요 시 토큰 갱신 또는 로그아웃 처리 로직 추가
    }
    return Promise.reject(error);
  },
);