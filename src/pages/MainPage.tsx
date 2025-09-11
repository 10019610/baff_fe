import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const MainPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // 로그인 상태가 확인된 후 sessionStorage 확인
    if (!isLoading && isAuthenticated) {
      const pendingInviteUrl = sessionStorage.getItem('pendingInviteUrl');
      console.log('MainPage: sessionStorage 확인:', pendingInviteUrl);

      if (pendingInviteUrl) {
        console.log('MainPage: 초대 URL로 리다이렉트:', pendingInviteUrl);
        sessionStorage.removeItem('pendingInviteUrl'); // 사용 후 삭제
        window.location.href = pendingInviteUrl;
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="p-8 bg-background text-foreground">
      <h1 className="text-2xl font-bold">MainPage</h1>
    </div>
  );
};

export default MainPage;
