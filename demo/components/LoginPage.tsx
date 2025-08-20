import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Scale, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';

// Kakao와 Google 로고 SVG 컴포넌트
const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 2C14.9 2 19 5.5 19 9.8c0 2.7-1.4 5.1-3.6 6.7l1.3 4.8c.1.4-.3.8-.7.6L11.4 19c-.5.1-.9.1-1.4.1-4.9 0-9-3.5-9-7.8S5.1 2 10 2z"
      fill="currentColor"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<'google' | 'kakao' | null>(null);

  const handleLogin = async (provider: 'google' | 'kakao') => {
    try {
      setIsLoading(provider);
      await login(provider);
    } catch (error) {
      console.error('Login error:', error);
      alert(`${provider === 'google' ? '구글' : '카카오'} 로그인에 실패했습니다. 다시 시도해주세요.`);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-blue-950 dark:via-background dark:to-green-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Scale className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">체중 관리 앱</h1>
          <p className="text-muted-foreground text-lg">
            건강한 변화의 시작
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle>로그인</CardTitle>
            <CardDescription className="text-base">
              소셜 계정으로 간편하게 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login */}
            <Button
              onClick={() => handleLogin('google')}
              disabled={isLoading !== null}
              variant="outline"
              size="lg"
              className="w-full h-12 text-base gap-3 hover:bg-muted/50 border-2"
            >
              {isLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Google로 계속하기
            </Button>

            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-3 text-sm text-muted-foreground">또는</span>
              </div>
            </div>

            {/* Kakao Login */}
            <Button
              onClick={() => handleLogin('kakao')}
              disabled={isLoading !== null}
              size="lg"
              className="w-full h-12 text-base gap-3 bg-[#FEE500] hover:bg-[#FCDD00] text-black border-2 border-[#FEE500] hover:border-[#FCDD00]"
            >
              {isLoading === 'kakao' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <KakaoIcon />
              )}
              카카오로 계속하기
            </Button>

            {/* Info */}
            <div className="pt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                계속 진행하면 서비스 약관에 동의하는 것으로 간주됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm text-muted-foreground">체중 기록</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Scale className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-muted-foreground">목표 설정</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
              <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm text-muted-foreground">친구 대결</p>
          </div>
        </div>

        {/* Mock Notice */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            🔧 개발 모드: 실제 소셜 로그인 연동 준비중입니다
          </p>
        </div>
      </div>
    </div>
  );
}