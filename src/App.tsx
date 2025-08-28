// App v2.1.0 - Fixed Layout architecture - Cache bust 20241221
import { Skeleton } from './components/ui/skeleton';
import { Scale } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Router from './routes/Router';
// 로딩 스켈레톤 컴포넌트
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Scale className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// 앱 콘텐츠 컴포넌트
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // return <Layout />;
}

const queryClient = new QueryClient();

const App = () => {
  return (
    // Tanstack Query Setting
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Router />
          <AppContent />
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
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '14px',
                fontWeight: '400',
                lineHeight: '1.5',
                maxWidth: '420px',
                padding: '12px 16px',
                boxShadow:
                  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
              },
              // 성공 토스트
              success: {
                iconTheme: {
                  primary: '#98FB98',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid #98FB98',
                },
              },
              // 에러 토스트
              error: {
                iconTheme: {
                  primary: '#d4183d',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid #d4183d',
                },
              },
              // 로딩 토스트
              loading: {
                iconTheme: {
                  primary: '#98FB98',
                  secondary: '#ffffff',
                },
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid #98FB98',
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
