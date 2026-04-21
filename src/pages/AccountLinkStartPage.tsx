import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { accountLinkApi } from '../services/api/AccountLink.api';

// S3 Phase 3 — 토스 계정 연결 시작 페이지.
// 비로그인 유저도 진입 가능. 로그인 상태에 따라 분기 UI 제공.
// 로그인 유저: 바로 issue-token → 딥링크 open.
// 비로그인 유저: "로그인하고 연결하기" → 로그인 후 returnTo로 복귀.

const TOSS_DEEP_LINK_BASE = 'intoss://changeup';

export default function AccountLinkStartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [isIssuing, setIsIssuing] = useState(false);

  const handleStart = async () => {
    if (!isAuthenticated) {
      // 로그인 후 이 페이지로 복귀
      navigate('/login?returnTo=' + encodeURIComponent('/account/link-toss'));
      return;
    }
    if (isIssuing) return;
    setIsIssuing(true);
    try {
      const { linkToken } = await accountLinkApi.issueToken();
      const deeplink = `${TOSS_DEEP_LINK_BASE}?action=link&token=${encodeURIComponent(linkToken)}`;
      window.location.href = deeplink;
    } catch (error) {
      const err = error as {
        response?: { data?: { reason?: string; message?: string } };
      };
      const reason = err?.response?.data?.reason;
      if (reason === 'ALREADY_LINKED') {
        toast.error('이미 토스 계정과 연결된 계정이에요');
      } else if (reason === 'USER_NOT_FOUND') {
        toast.error('계정 정보를 찾을 수 없어요. 다시 로그인해주세요');
      } else {
        toast.error('연결 토큰 발급에 실패했어요. 잠시 후 다시 시도해주세요');
      }
    } finally {
      setIsIssuing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">로딩 중…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">토스에서도 체인지업을 써보세요</h1>
        <p className="mt-2 text-sm text-gray-600">
          토스 미니앱에 기존 계정을 연결하면 그램, 체중 기록, 대결 이력을 그대로
          이어서 쓸 수 있어요.
        </p>
      </div>

      <ul className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
        <li>• 계정 연결은 **평생 1회만** 가능해요.</li>
        <li>• 연결 후에는 토스 미니앱에서도 같은 계정으로 이용돼요.</li>
        <li>• 닉네임은 기존 계정 기준으로 유지돼요.</li>
      </ul>

      <button
        type="button"
        onClick={handleStart}
        disabled={isIssuing}
        className="w-full rounded-xl bg-blue-600 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
      >
        {isAuthenticated
          ? isIssuing
            ? '연결 준비 중…'
            : '토스에서 연결하기'
          : '로그인하고 연결하기'}
      </button>

      {!isAuthenticated && (
        <p className="text-center text-xs text-gray-500">
          로그인한 계정이 &quot;기존 계정&quot;으로 유지돼요.
        </p>
      )}
    </div>
  );
}
