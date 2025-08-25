import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const OAuthPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // AuthContext의 로딩 상태가 끝나면 로직을 실행합니다.
    if (!isLoading) {
      if (isAuthenticated) {
        // 인증 성공 시, 메인 페이지로 이동합니다.
        navigate('/');
      } else {
        // 인증 실패 시, 에러 메시지와 함께 로그인 페이지로 이동합니다.
        navigate('/login?error=auth_failed');
      }
    }
  }, [isLoading, isAuthenticated, navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthPage;