import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.tsx';
import { Button } from '../ui/button.tsx';
import { Separator } from '../ui/separator.tsx';
import { Loader2 } from 'lucide-react';
import { GoogleIcon, KakaoIcon } from '../ui/icons.tsx';
import { useAuth } from '../../context/AuthContext.tsx';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const detectKakaoBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  return navigator.userAgent.includes('KAKAOTALK');
};

const LoginModal = ({ open, onOpenChange, onSuccess }: LoginModalProps) => {
  const { isLoading, isAuthenticated, loginForGoogleApp } = useAuth();
  const [isKakaoBrowser, setIsKakaoBrowser] = useState(false);
  const [loginLoading, setLoginLoading] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_GOOGLE_URL;

  useEffect(() => {
    if (!open) return;
    setIsKakaoBrowser(detectKakaoBrowser());
  }, [open]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && open) {
      onSuccess?.();
      onOpenChange(false);
      setLoginLoading(null);
    }
  }, [isAuthenticated, isLoading, onOpenChange, onSuccess, open]);

  const onSignInHandler = (provider: 'google' | 'kakao') => {
    setLoginLoading(provider);
    if (window.ReactNativeWebView) {
      if (provider === 'google') {
        loginForGoogleApp();
      } else {
        window.location.href = `${baseUrl}/oauth2/authorization/kakao`;
      }
    } else {
      if (provider === 'kakao') {
        window.location.href = `${baseUrl}/oauth2/authorization/kakao`;
      } else if (provider === 'google') {
        window.location.href = `${baseUrl}/oauth2/authorization/google`;
      }
    }
  };

  const resetStateAndClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setLoginLoading(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={resetStateAndClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
          <DialogHeader className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <img
                  src="/ChangeUp_logo.png"
                  alt="logo"
                  width={64}
                  height={64}
                />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold">로그인</DialogTitle>
            <DialogDescription className="text-base">
              로그인 후 서비스를 이용할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            {isKakaoBrowser ? (
              <Button
                size="lg"
                onClick={() => onSignInHandler('kakao')}
                disabled={loginLoading !== null}
                className="w-full h-12 text-base gap-3 bg-[#FEE500] hover:bg-[#FCDD00] text-black border-2 border-[#FEE500] hover:border-[#FCDD00] disabled:opacity-70"
              >
                {loginLoading === 'kakao' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <KakaoIcon />
                    카카오로 계속하기
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onSignInHandler('google')}
                  disabled={loginLoading !== null}
                  className="w-full h-12 text-base gap-3 hover:bg-muted/50 border-2"
                >
                  {loginLoading === 'google' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      Google로 계속하기
                    </>
                  )}
                </Button>
                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-gradient-to-br from-blue-50 via-white to-green-50 px-2 text-sm">
                      또는
                    </span>
                  </div>
                </div>
                <Button
                  size="lg"
                  onClick={() => onSignInHandler('kakao')}
                  disabled={loginLoading !== null}
                  className="w-full h-12 text-base gap-3 bg-[#FEE500] hover:bg-[#FCDD00] text-black border-2 border-[#FEE500] hover:border-[#FCDD00] disabled:opacity-70"
                >
                  {loginLoading === 'kakao' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    <>
                      <KakaoIcon />
                      카카오로 계속하기
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            소셜 계정으로 간편하게 시작하세요
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
