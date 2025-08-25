import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/User';
import { GoogleIcon, KakaoIcon } from '../components/ui/icons.tsx';
import { Scale } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Button } from '../components/ui/button.tsx';
import { Separator } from '../components/ui/separator.tsx';

/**
 * 로그인 페이지
 * @description
 *
 * @author hjkim
 * @constructor
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTempLogin = () => {
    // 1. 테스트용 임시 사용자 정보를 생성합니다.
    const tempUser: User = {
      id: 'temp-user-id-123',
      email: 'test@example.com',
      nickname: '테스트유저',
      profileImage: 'https://via.placeholder.com/150', // 임시 프로필 이미지
      role: 'USER',
    };

    // 2. AuthContext의 login 함수를 호출하여 로그인 상태로 변경합니다.
    login(tempUser);

    // 3. 로그인 후 메인 페이지로 이동합니다.
    navigate('/');
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Scale className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Baff</h1>
          <p className="text-muted-foreground text-lg">건강한 변화의 시작</p>
        </div>
        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle>로그인</CardTitle>
            <CardDescription className="text-base">소셜 계정으로 간편하게 시작하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Login */}
            <Button variant="outline" size="lg" className="w-full h-12 text-base gap-3 hover:bg-muted/50 border-2">
              <GoogleIcon />
              Google로 계속하기
            </Button>
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span>또는</span>
              </div>
            </div>
            {/* Kakao Login */}
            <Button size="lg"
                    className="w-full h-12 text-base gap-3 bg-[#FEE500] hover:bg-[#FCDD00] text-black border-2 border-[#FEE500] hover:border-[#FCDD00]">
              <KakaoIcon />
              카카오로 계속하기
            </Button>
            <div className="relative">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span>또는</span>
              </div>
            </div>
            <Button className="w-full h-12 text-base" onClick={handleTempLogin}>
              임시 로그인 (개발용)
            </Button>
            {/* Info */}
            <div className="pt-4 text-center space-y-2">
              <p className="text-sm text-muted-foreground">계속 진행하면 서비스 약관에 동의하는 것으로 간주됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
