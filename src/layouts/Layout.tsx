import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // useNavigate 추가
import { motion } from 'motion/react';
import Header from '../components/header/Header';
import Navbar from './Navbar.tsx';
import Footer from '../components/footer/Footer.tsx';
import { useHeightModal } from '../context/HeightModalContext';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // useAuth 추가
import type { User } from '../types/User'; // User 타입 추가
import { ArrowUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUserFlagForPopUp } from '../services/api/User.api.ts';
import type { UserFlag } from '../types/User.api.type.ts';
import { EditProfileNotificationModal } from '../components/modal/EditProfileNotificationModal.tsx';

// 커스텀 로깅 함수
const customLog = (message: string, ...args: unknown[]) => {
  const logMessage = `[Web Custom Log] ${message}`;
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'CUSTOM_LOG',
        payload: { message: logMessage, args: args },
      })
    );
  } else {
    console.log(logMessage, ...args); // RN 환경이 아니면 일반 console.log 사용
  }
};

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate(); // useNavigate 훅 사용
  const { login, isAuthenticated, user } = useAuth(); // useAuth 훅 사용
  const { isHeightModalOpen } = useHeightModal();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    customLog('[웹] Layout useEffect 시작'); // <-- 이 로그 추가
    // 앱 환경 확인
    const params = new URLSearchParams(window.location.search);
    const isApp = params.has('isReactNativeApp');

    customLog('[웹] 앱 환경 여부:', isApp);

    // 앱 환경이 아니면 메시지 리스너를 등록하지 않습니다。
    if (!isApp) {
      customLog('[웹] 앱 환경이 아니므로 메시지 리스너를 등록하지 않습니다.');
      return;
    }

    customLog('[웹] ReactNativeWebView 객체:', window.ReactNativeWebView);
    // 웹 앱 로드 시 React Native 앱으로 초기 메시지 전송 (선택 사항)
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'WEB_LOADED', message: '웹 앱 로드 완료' })
      );
    }

    const handleMessage = (event: MessageEvent) => {
      customLog('[웹] handleMessage 함수 시작');
      customLog('[웹] 메시지 이벤트 받음:', event);
      customLog('[웹] event.origin:', event.origin);
      customLog('[웹] event.source:', event.source);

      let message;
      try {
        // event.data가 문자열이 아니거나 유효한 JSON이 아니면 파싱하지 않습니다。
        if (
          typeof event.data !== 'string' ||
          !event.data.startsWith('{') ||
          !event.data.endsWith('}')
        ) {
          customLog(
            '[웹] 유효하지 않은 JSON 형식의 메시지 수신 (개발자 도구 메시지일 수 있음):',
            event.data
          );
          return; // 유효하지 않은 메시지는 무시
        }
        message = JSON.parse(event.data);
        customLog('[웹] 파싱된 메시지:', message);
      } catch (e) {
        customLog('[웹] 메시지 파싱 오류:', e);
        customLog('[웹] 파싱 실패한 event.data:', event.data);
        return;
      }

      if (message.type === 'LOGIN_SUCCESS') {
        if (message.token) {
          localStorage.setItem('userToken', message.token);
          if (message.user) {
            // User 타입 단언
            login(message.user as User); // useAuth의 login 함수 호출
          }
          customLog('[Web Hook] 로그인 성공, 토큰 저장 및 /home으로 리디렉션');
          navigate('/home'); // 로그인 후 홈으로 이동
        }
      } else if (message.type === 'LOGOUT_SUCCESS') {
        localStorage.removeItem('userToken');
        // TODO: useAuth의 logout 함수 호출
        // logout(); // Uncomment this if logout is accessible
        customLog('[Web Hook] 로그아웃 성공, 토큰 삭제 및 /로 리디렉션');
        navigate('/'); // 로그아웃 후 홈으로 이동
      } else if (message.type === 'PING') {
        customLog('[웹] 앱으로부터 PING 메시지 수신. PONG으로 응답합니다.');
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'PONG' })
          ); // PONG으로 수정
        } else {
          customLog('[웹] ReactNativeWebView 객체를 찾을 수 없음');
        }
      } else if (message.type === 'PINGㅇㅇㅇ') {
        // injectJavaScript에서 보낸 메시지 처리
        customLog('여기입니다: PINGㅇㅇㅇ 메시지 처리 시작');
        customLog(
          '[웹] injectJavaScript로부터 PINGㅇㅇㅇ 메시지 수신:',
          message.payload
        );
      } else {
        customLog('[웹] 알 수 없는 타입의 메시지 수신:', message.type, message);
      }
    };
    window.addEventListener('message', handleMessage);
    customLog('[웹] window.addEventListener("message") 등록 완료');

    return () => {
      customLog('[웹] window.removeEventListener("message") 제거');
      window.removeEventListener('message', handleMessage);
    };
  }, [login, navigate]); // login과 navigate를 의존성 배열에 추가

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 스크롤 투 탑 함수
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지 전환 애니메이션
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: 'anticipate' as const,
    duration: 0.4,
  };

  const { data } = useQuery<UserFlag[]>({
    queryKey: ['userFlag'],
    queryFn: () => getUserFlagForPopUp(),
    enabled: isAuthenticated, // 인증된 경우에만 쿼리 실행
  });

  // 프로필 수정 모달 표시 조건 확인
  useEffect(() => {
    // data가 아직 로딩 중이면 기다림
    if (!isAuthenticated || data === undefined) {
      return;
    }

    // flagKey가 '202512_EDIT_PROFILE'인지 확인
    const hasFlag = data.some((flag) => {
      return flag.flagKey === '202512_EDIT_PROFILE';
    });

    // 플래그가 없고, user.id가 76 미만일 때만 모달 표시
    if (!hasFlag && user?.id && Number(user.id) < 76) {
      setShowProfileModal(true);
    } else {
      setShowProfileModal(false);
    }
  }, [isAuthenticated, data, user]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 pb-4 md:pb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Content with Animation */}
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Outlet />
              {/* 프로필 수정 안내 모달 */}
              <EditProfileNotificationModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                userId={user?.userId || data?.[0]?.userId}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      {/* navbar - 키 입력 모달이 열려있을 때는 숨김 */}
      {!isHeightModalOpen && <Navbar />}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-20 right-6 z-50 bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
          aria-label="맨 위로 스크롤"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  );
};

export default Layout;
