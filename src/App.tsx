// App v2.1.0 - Fixed Layout architecture - Cache bust 20241221
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Router from './routes/Router';
import { HeightModalProvider } from './context/HeightModalContext';

const queryClient = new QueryClient();

const App = () => {
  const JAVASCRIPT_KET = import.meta.env.VITE_APP_JAVASCRIPT_KEY;
  console.log('JAVASCRIPT_KET', JAVASCRIPT_KET);

  // 카카오 SDK가 이미 초기화되지 않았을 때만 초기화
  if (
    typeof window !== 'undefined' &&
    window.Kakao &&
    !window.Kakao.isInitialized()
  ) {
    window.Kakao.init(JAVASCRIPT_KET);
  }
  return (
    // Tanstack Query Setting
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <HeightModalProvider>
            <Router />
          </HeightModalProvider>
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // 기본 토스트 스타일
              className: '',
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0a0a0a',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: 'var(--radius)',
                fontSize: '14px',
                fontWeight: '400',
                lineHeight: '1.5',
                maxWidth: '420px',
                padding: '12px 16px',
                boxShadow:
                  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                zIndex: 9999,
                backdropFilter: 'none',
                opacity: 1,
              },
              // 성공 토스트
              success: {
                iconTheme: {
                  primary: '#98FB98',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#ffffff',
                  color: '#0a0a0a',
                  border: '1px solid #98FB98',
                  zIndex: 9999,
                  opacity: 1,
                },
              },
              // 에러 토스트
              error: {
                iconTheme: {
                  primary: '#d4183d',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#ffffff',
                  color: '#0a0a0a',
                  border: '1px solid #d4183d',
                  zIndex: 9999,
                  opacity: 1,
                },
              },
              // 로딩 토스트
              loading: {
                iconTheme: {
                  primary: '#98FB98',
                  secondary: '#ffffff',
                },
                style: {
                  background: '#ffffff',
                  color: '#0a0a0a',
                  border: '1px solid #98FB98',
                  zIndex: 9999,
                  opacity: 1,
                },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
