import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeightInputModal from '../components/modals/HeightInputModal';
import { useState, useEffect } from 'react';
import { useHeightModal } from '../context/HeightModalContext';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading, user, login } = useAuth();
  const { setIsHeightModalOpen } = useHeightModal();
  const [showHeightModal, setShowHeightModal] = useState(false);

  // 사용자가 로그인되고 키 정보가 없을 때 모달 표시
  useEffect(() => {
    if (isAuthenticated && user && !user.height) {
      setShowHeightModal(true);
      setIsHeightModalOpen(true);
    } else {
      setShowHeightModal(false);
      setIsHeightModalOpen(false);
    }
  }, [isAuthenticated, user, setIsHeightModalOpen]);

  // 1. AuthContext가 사용자 정보를 로딩하는 중일 때 (가장 중요!)
  if (isLoading) {
    // 로딩이 끝날 때까지 아무것도 하지 않고 기다리거나, 로딩 스피너를 보여줍니다.
    // 이 '기다림'이 API 요청이 완료될 시간을 벌어주어 경쟁 상태를 해결합니다.
    return <div>Loading...</div>;
  }

  // 2. 로딩이 끝난 후, 확정된 isAuthenticated 값으로 판단합니다.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 키 정보 저장 핸들러
  const handleHeightSaved = (height: number) => {
    if (user) {
      // 현재 사용자 정보를 업데이트
      login({ ...user, height });
    }
    setShowHeightModal(false);
    setIsHeightModalOpen(false);
  };

  return (
    <>
      <Outlet />
      <HeightInputModal
        isOpen={showHeightModal}
        onClose={() => {}} // 필수 입력이므로 닫기 불가
        onHeightSaved={handleHeightSaved}
      />
    </>
  );
};

export default PrivateRoute;
