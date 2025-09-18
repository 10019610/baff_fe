import { useAuth } from '../../context/AuthContext';

const TokenDebug = () => {
  const { getToken, isAuthenticated, user } = useAuth();

  const checkCurrentToken = () => {
    const token = getToken();
    console.log('현재 토큰:', token);
    console.log('인증 상태:', isAuthenticated);
    console.log('사용자 정보:', user);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded shadow text-xs">
      <h4 className="font-bold mb-2">토큰 디버그</h4>
      <button
        onClick={checkCurrentToken}
        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
      >
        토큰 확인
      </button>
      <div className="mt-2">
        <div>인증: {isAuthenticated ? '✅' : '❌'}</div>
        <div>사용자: {user ? '✅' : '❌'}</div>
        <div>토큰: {getToken() ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default TokenDebug;
