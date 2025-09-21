import type { KakaoShareParams } from '../types/kakao';
import toast from 'react-hot-toast';

// 카카오 SDK 초기화
export const initKakao = () => {
  if (
    typeof window !== 'undefined' &&
    window.Kakao &&
    !window.Kakao.isInitialized()
  ) {
    // 환경변수에서 카카오 앱 키를 가져오거나 하드코딩
    // const appKey = import.meta.env.VITE_KAKAO_APP_KEY || 'YOUR_KAKAO_APP_KEY';
    // window.Kakao.init(appKey);
  }
};

// 방 초대용 카카오 공유 데이터 생성
export const createRoomInviteShareData = (
  roomName: string,
  inviteUrl: string
): KakaoShareParams => {
  const logoUrl =
    'https://drive.google.com/uc?export=view&id=1595vLClyySpRXW_uEUjfxk_iUlafkshr';

  return {
    objectType: 'feed',
    content: {
      title: `🏃건강한 변화의 시작!`,
      // imageUrl: logoUrl,
      link: {
        mobileWebUrl: inviteUrl,
        webUrl: inviteUrl,
      },
    },
    itemContent: {
      profileText: 'ChangeUp',
      profileImageUrl: logoUrl,
      titleImageUrl: logoUrl,
      titleImageText: roomName,
      titleImageCategory: '대결신청!',
    },
    social: {
      likeCount: 0,
      commentCount: 0,
      sharedCount: 0,
    },
    buttons: [
      {
        title: '대결 참가하기',
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
    }
  } else {
    toast.error('관리자에게 문의해주세요.');
  }
};
