import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api/Api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function WithdrawalPage() {
  const [agreements, setAgreements] = useState({
    deleteUnderstand: false,
    noRefund: false,
  });
  const navigate = useNavigate();
  const { logout } = useAuth();

  const withdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/user/withdrawal');
      return response.data;
    },
    onSuccess: () => {
      toast.success('탈퇴가 완료되었습니다.');
      logout();
      navigate('/login');
    },
  });

  const handleWithdrawal = () => {
    withdrawalMutation.mutate();
  };

  return (
    <div className="flex justify-center items-center p-5 bg-background">
      <div className="max-w-[600px] w-full p-8 rounded-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
          회원 탈퇴
        </h1>

        <div className="bg-destructive/10 rounded-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-destructive mb-3 flex items-center gap-2">
            ⚠️ 탈퇴 전 꼭 확인해주세요
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            • 탈퇴 시 회원님의 모든 정보가 즉시 삭제되며, 복구가 불가능합니다.
            <br />• 진행 중인 배틀이 있다면 모두 종료되며, 참여 기록도
            삭제됩니다.
            {/* <br />• 보유하신 포인트와 아이템은 모두 소멸되며, 환불되지 않습니다. */}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="deleteUnderstand"
              checked={agreements.deleteUnderstand}
              onChange={(e) =>
                setAgreements((prev) => ({
                  ...prev,
                  deleteUnderstand: e.target.checked,
                }))
              }
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="deleteUnderstand"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              회원 탈퇴 시 모든 정보가 삭제되는 것을 이해했습니다.
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="noRefund"
              checked={agreements.noRefund}
              onChange={(e) =>
                setAgreements((prev) => ({
                  ...prev,
                  noRefund: e.target.checked,
                }))
              }
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="noRefund"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              보유 포인트 및 아이템이 환불되지 않는 것에 동의합니다.
            </label>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleWithdrawal}
            disabled={
              withdrawalMutation.isPending ||
              !agreements.deleteUnderstand ||
              !agreements.noRefund
            }
            className="px-6 py-2.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawalMutation.isPending ? '탈퇴 처리중...' : '탈퇴하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
