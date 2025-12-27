import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { editUserNickname } from '../../services/api/User.api.ts';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Label } from '../ui/label.tsx';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/modal.tsx';

interface EditNameModalProps {
  isOpen: boolean;
  currentNickname?: string;
  userId?: number;
  onClose: () => void;
  onSuccess?: (newNickname: string) => void | Promise<void>;
}

export function EditNameModal({
  isOpen,
  currentNickname,
  userId,
  onClose,
  onSuccess,
}: EditNameModalProps) {
  const [nickname, setNickname] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: editUserNickname,
    onSuccess: async (variables) => {
      // 프로필 페이지의 쿼리 키와 일치하도록 수정
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: ['userId', userId.toString()],
        });
        // 기존 쿼리 키도 무효화 (다른 곳에서 사용할 수 있음)
        await queryClient.invalidateQueries({
          queryKey: ['userInfo', userId],
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['userInfo'] });
        await queryClient.invalidateQueries({ queryKey: ['userId'] });
      }

      // 부모 컴포넌트의 onSuccess 콜백 호출 (변경된 닉네임 전달)
      if (onSuccess) {
        await onSuccess(variables);
      }

      onClose();
    },
    onError: () => {
      setErrorMessage('닉네임 변경에 실패했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  useEffect(() => {
    if (isOpen) {
      setNickname(currentNickname || '');
      setErrorMessage('');
    }
  }, [isOpen, currentNickname]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = nickname.trim();

    if (!trimmedName) {
      setErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    if (trimmedName.length < 2) {
      setErrorMessage('닉네임은 2자 이상이어야 해요.');
      return;
    }

    if (trimmedName === (currentNickname || '').trim()) {
      onClose();
      return;
    }

    setErrorMessage('');
    mutate(trimmedName);
  };

  const isNameChanged = nickname.trim() !== (currentNickname || '').trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-white">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>닉네임 변경</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">새 닉네임</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                if (errorMessage) {
                  setErrorMessage('');
                }
              }}
              placeholder="2자 이상 입력해주세요"
              maxLength={20}
              autoFocus
            />
          </div>
          <p className="text-xs text-[#8B6570]">
            닉네임은 다른 사용자에게 표시되는 이름이에요. 공백을 제외하고 2~20자
            사이로 설정해주세요.
          </p>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
        </ModalContent>
        <div className="flex justify-end gap-2 px-6 pb-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={!isNameChanged || isPending}>
            {isPending ? '처리 중...' : '완료'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
