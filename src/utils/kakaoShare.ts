import type { KakaoShareParams } from '../types/kakao';

// 카카오 SDK 초기화
export const initKakao = () => {
  if (
    typeof window !== 'undefined' &&
    window.Kakao &&
    !window.Kakao.isInitialized()
  ) {
    // 환경변수에서 카카오 앱 키를 가져오거나 하드코딩
    const appKey = import.meta.env.VITE_KAKAO_APP_KEY || 'YOUR_KAKAO_APP_KEY';
    window.Kakao.init(appKey);
  }
};

// 방 초대용 카카오 공유 데이터 생성
export const createRoomInviteShareData = (
  roomName: string,
  inviteUrl: string
): KakaoShareParams => {
  // 카카오톡 공유용 이미지 URL (외부에서 접근 가능한 URL 필요)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const logoUrl = `${baseUrl}/ChangeUp_logo.png`;

  return {
    objectType: 'feed',
    content: {
      title: `🏃‍♂️ ${roomName} - 체중감량 대결방에 초대합니다!`,
      imageUrl: logoUrl,
      link: {
        mobileWebUrl: inviteUrl,
        webUrl: inviteUrl,
      },
    },
    itemContent: {
      // profileText: 'ChangeUp',
      // profileImageUrl: logoUrl,
      titleImageUrl: logoUrl,
      titleImageText: roomName,
      titleImageCategory: '체중감량 대결',
    },
    social: {
      likeCount: 0,
      commentCount: 0,
      sharedCount: 0,
    },
    buttons: [
      {
        title: '방 참여하기',
        link: {
          mobileWebUrl: inviteUrl,
          webUrl: inviteUrl,
        },
      },
    ],
  };
};

// 카카오 공유 실행
export const shareToKakao = (shareData: KakaoShareParams) => {
  if (typeof window !== 'undefined' && window.Kakao) {
    try {
      window.Kakao.Share.sendDefault(shareData);
    } catch (error) {
      console.error('카카오 공유 실패:', error);
      alert('카카오톡 공유에 실패했습니다. 다시 시도해주세요.');
    }
  } else {
    alert('카카오톡이 설치되어 있지 않습니다.');
  }
};
