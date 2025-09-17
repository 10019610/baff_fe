import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import PageLoader from '../components/ui/page-loader';

const OAuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('OAuthPage useEffect 실행:', { isLoading, isAuthenticated });

    // AuthContext의 로딩 상태가 끝나면 로직을 실행합니다.
    if (!isLoading) {
      console.log('Check isAuthenticated', isAuthenticated);
      if (isAuthenticated) {
        // sessionStorage에서 초대 URL 확인
        const pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');

        if (pendingInviteUrl) {
          // 초대 URL이 있으면 해당 페이지로 이동
          sessionStorage.removeItem('pendingInviteUrl'); // 사용 후 삭제
          window.location.href = pendingInviteUrl;
        } else {
          // 초대 URL이 없으면 메인 페이지로 이동
          navigate('/');
        }
      } else {
        // 인증 실패 시, 에러 메시지와 함께 로그인 페이지로 이동합니다.
        console.log('인증 실패, 로그인 페이지로 이동');
        navigate('/login?error=auth_failed');
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return <PageLoader message="로그인 처리 중..." />;
};

export default OAuthPage;
