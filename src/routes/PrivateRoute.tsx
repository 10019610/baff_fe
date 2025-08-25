import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 1. AuthContext가 사용자 정보를 로딩하는 중일 때 (가장 중요!)
  if (isLoading) {
    // 로딩이 끝날 때까지 아무것도 하지 않고 기다리거나, 로딩 스피너를 보여줍니다.
    // 이 '기다림'이 API 요청이 완료될 시간을 벌어주어 경쟁 상태를 해결합니다.
    return <div>Loading...</div>;
  }

  // 2. 로딩이 끝난 후, 확정된 isAuthenticated 값으로 판단합니다.
  //    - true이면, 자식 페이지(Outlet)를 보여줍니다.
  //    - false이면, 로그인 페이지로 리다이렉트합니다.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;