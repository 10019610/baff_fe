import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/User';

/**
 * 로그인 페이지
 * @description
 *
 * @author hjkim
 * @constructor
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTempLogin = () => {
    // 1. 테스트용 임시 사용자 정보를 생성합니다.
    const tempUser: User = {
      id: 'temp-user-id-123',
      email: 'test@example.com',
      nickname: '테스트유저',
      profileImage: 'https://via.placeholder.com/150', // 임시 프로필 이미지
      role: 'USER',
    };

    // 2. AuthContext의 login 함수를 호출하여 로그인 상태로 변경합니다.
    login(tempUser);

    // 3. 로그인 후 메인 페이지로 이동합니다.
    navigate('/');
  };

  return (
    <div>
      <h1>Login Page</h1>
      <p>소셜 로그인 기능이 추가될 예정입니다.</p>
      <button type="button" onClick={handleTempLogin}>
        임시 로그인 (개발용)
      </button>
    </div>
  );
};

export default LoginPage;