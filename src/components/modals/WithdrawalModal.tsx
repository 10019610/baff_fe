import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinnerForButton } from '../LoadingSpinnerForButton';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawalModal({ isOpen, onClose }: WithdrawalModalProps) {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const withdrawalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/withdrawal`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error('탈퇴 처리 중 오류가 발생했습니다.');
      }
      return response.json();
    },
    onSuccess: () => {
      navigate('/login');
    },
  });

  const handleWithdrawal = () => {
    if (!agreed) return;
    withdrawalMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>회원 탈퇴</DialogTitle>
          <DialogDescription className="text-destructive">
            회원 탈퇴 시 모든 데이터가 영구적으로 삭제됩니다
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-4">회원 탈퇴 시 다음 사항을 확인해 주세요:</p>
            <ul className="list-disc pl-4 space-y-2">
              <li>모든 개인정보 및 활동 기록이 즉시 삭제됩니다</li>
              <li>삭제된 데이터는 복구할 수 없습니다</li>
              <li>
                동일한 계정으로 재가입은 가능하나, 이전 데이터는 복구되지
                않습니다
              </li>
            </ul>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="agreement"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              위 내용을 모두 확인했으며, 회원 탈퇴에 동의합니다
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleWithdrawal}
            disabled={!agreed || withdrawalMutation.isPending}
          >
            {withdrawalMutation.isPending ? (
              <LoadingSpinnerForButton />
            ) : (
              '회원 탈퇴'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

