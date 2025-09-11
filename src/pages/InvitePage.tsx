import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BattleMode from '../components/battle/BattleMode';

const InvitePage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  // 초대링크 인증 관련 구현페이지 - privateRoute 밖에서 처리함

  useEffect(() => {
    // 로딩이 완료된 후에만 처리
    if (!isLoading) {
      const urlParams = new URLSearchParams(window.location.search);
      const roomId = urlParams.get('roomId');
      const password = urlParams.get('password');

      console.log('InvitePage: URL 파라미터 확인:', {
        roomId,
        password,
        isAuthenticated,
      });

      // 초대 링크이고 로그인되지 않은 경우
      if (roomId && password && !isAuthenticated) {
        console.log(
          'InvitePage: 초대 링크, 비로그인 상태 - sessionStorage에 저장'
        );
        const currentUrl = window.location.href;
        sessionStorage.setItem('pendingInviteUrl', currentUrl);
        console.log(
          'InvitePage: sessionStorage 저장 완료:',
          sessionStorage.getItem('pendingInviteUrl')
        );
        window.location.href = '/login';
        return;
      }
    }
  }, [isAuthenticated, isLoading]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 로그인된 사용자는 BattleMode 렌더링
  if (isAuthenticated) {
    return (
      <div className="battle-page">
        <BattleMode />
      </div>
    );
  }

  // 비로그인 사용자는 초대 링크 처리 중이므로 로딩 표시
  return <div>초대 링크 처리 중...</div>;
};

export default InvitePage;
