import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const OAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('OAuthPage useEffect 실행:', { isLoading, isAuthenticated });

    // AuthContext의 로딩 상태가 끝나면 로직을 실행합니다.
    if (!isLoading) {
      if (isAuthenticated) {
        // URL에서 redirect 파라미터 확인
        const urlParams = new URLSearchParams(location.search);
        const redirectUrl = urlParams.get('redirect');
        console.log('redirectUrl from URL params:', redirectUrl);

        if (redirectUrl) {
          // redirect URL이 있으면 해당 페이지로 이동
          console.log('리다이렉트할 URL:', redirectUrl);
          window.location.href = redirectUrl;
        } else {
          // redirect URL이 없으면 메인 페이지로 이동
          console.log('redirect URL이 없어서 메인 페이지로 이동');
          navigate('/');
        }
      } else {
        // 인증 실패 시, 에러 메시지와 함께 로그인 페이지로 이동합니다.
        console.log('인증 실패, 로그인 페이지로 이동');
        navigate('/login?error=auth_failed');
      }
    }
  }, [isLoading, isAuthenticated, navigate, location.search]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthPage;
