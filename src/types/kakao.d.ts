declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: KakaoShareParams) => void;
      };
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export interface KakaoShareParams {
  objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text';
  content: {
    title: string;
    // imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  itemContent?: {
    profileText: string;
    profileImageUrl: string;
    titleImageUrl: string;
    titleImageText: string;
    titleImageCategory: string;
  };
  social?: {
    likeCount: number;
    commentCount: number;
    sharedCount: number;
  };
  buttons: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

export {};
