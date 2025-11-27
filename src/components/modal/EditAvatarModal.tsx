import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {
  editProfileImage,
  uploadProfileImage,
} from '../../services/api/User.api';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Label } from '../ui/label.tsx';
import { Modal, ModalContent } from '../ui/modal.tsx';
import { cn } from '../ui/utils.ts';

interface AvatarPreset {
  label: string;
  url: string;
}

const AVATAR_PRESETS: AvatarPreset[] = [
  {
    label: 'Regret',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Regret&backgroundColor=F0C3CB',
  },
  {
    label: 'Diary',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diary&backgroundColor=F0C3CB',
  },
  {
    label: 'Hope',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hope&backgroundColor=F0C3CB',
  },
  {
    label: 'Growth',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Growth&backgroundColor=F0C3CB',
  },
  {
    label: 'Reflection',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Reflection&backgroundColor=F0C3CB',
  },
  {
    label: 'Comfort',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Comfort&backgroundColor=F0C3CB',
  },
  {
    label: 'Past',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Past&backgroundColor=F0C3CB',
  },
  {
    label: 'Tomorrow',
    url: 'https://api.dicebear.com/7.x/personas/svg?seed=Tomorrow&backgroundColor=F0C3CB',
  },
  {
    label: 'Joyful',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Joyful&backgroundColor=F0C3CB',
  },
  {
    label: 'Sad',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sad&backgroundColor=F0C3CB',
  },
  {
    label: 'Sorrow',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sorrow&backgroundColor=F0C3CB',
  },
  {
    label: 'Lesson',
    url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Lesson&backgroundColor=F0C3CB',
  },
  {
    label: 'Wisdom',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Wisdom&backgroundColor=F0C3CB',
  },
  {
    label: 'Memo',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Memo&backgroundColor=F0C3CB',
  },
  {
    label: 'Record',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Record&backgroundColor=F0C3CB',
  },
  {
    label: 'Begin',
    url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Begin&backgroundColor=F0C3CB',
  },
  {
    label: 'User 1',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=User1&backgroundColor=F0C3CB',
  },
  {
    label: 'User 2',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=User2&backgroundColor=F0C3CB',
  },
  {
    label: 'User 3',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=User3&backgroundColor=F0C3CB',
  },
  {
    label: 'User 4',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=User4&backgroundColor=F0C3CB',
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object'
  ) {
    const response = error.response as { data?: unknown };
    const data = response?.data;

    if (typeof data === 'string' && data.trim().length > 0) {
      return data;
    }

    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

interface EditAvatarModalProps {
  isOpen: boolean;
  currentAvatarUrl?: string;
  onClose: () => void;
  onSuccess?: (avatarUrl: string) => void | Promise<void>;
}

export function EditAvatarModal({
  isOpen,
  currentAvatarUrl,
  onClose,
  onSuccess,
}: EditAvatarModalProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string>('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string>('');
  const avatarObjectUrlRef = useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { mutateAsync: uploadProfileImageAsync, isPending: isUploading } =
    useMutation({
      mutationFn: uploadProfileImage,
    });
  const { mutateAsync: editProfileImageAsync } = useMutation({
    mutationFn: editProfileImage,
  });

  const resetObjectUrl = useCallback(() => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatarUrl || '');
      setAvatarError('');
      setUploadedAvatarUrl('');
      resetObjectUrl();
    }

    return () => {
      resetObjectUrl();
      setUploadedAvatarUrl('');
    };
  }, [currentAvatarUrl, isOpen, resetObjectUrl]);

  const handleClose = () => {
    resetObjectUrl();
    setUploadedAvatarUrl('');
    onClose();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('이미지 파일만 업로드할 수 있어요.');
      toast.error('이미지 파일만 업로드할 수 있어요.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const message = '이미지는 최대 5MB까지 업로드할 수 있어요.';
      setAvatarError(message);
      toast.error(message);
      event.target.value = '';
      return;
    }

    setAvatarError('');
    resetObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;
    setSelectedAvatar(objectUrl);

    try {
      const uploadedUrl = await uploadProfileImageAsync(file);
      setUploadedAvatarUrl(uploadedUrl);
      toast.success('이미지가 업로드되었습니다.');
    } catch (error) {
      console.error(error);
      let message = getErrorMessage(error, '이미지 업로드에 실패했습니다.');
      if (
        isAxiosError(error) &&
        (error.response?.status === 413 || error.response?.status === 416)
      ) {
        message = '이미지는 최대 5MB까지 업로드할 수 있어요.';
      }
      setAvatarError(message);
      toast.error(message);
      resetObjectUrl();
      setSelectedAvatar(currentAvatarUrl || '');
      setUploadedAvatarUrl('');
      event.target.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatarError('');
    resetObjectUrl();
    setSelectedAvatar(url);
    setUploadedAvatarUrl('');
  };

  const isWaitingForUpload =
    selectedAvatar.startsWith('blob:') && !uploadedAvatarUrl;
  const effectiveAvatarUrl = uploadedAvatarUrl || selectedAvatar;
  const isAvatarChanged = effectiveAvatarUrl !== (currentAvatarUrl || '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!effectiveAvatarUrl) {
      setAvatarError('프로필 이미지를 선택해주세요.');
      return;
    }

    if (isWaitingForUpload) {
      setAvatarError('이미지 업로드가 완료될 때까지 기다려주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setAvatarError('');

      await editProfileImageAsync(effectiveAvatarUrl);
      toast.success('프로필 이미지가 변경되었어요.');

      if (onSuccess) {
        await onSuccess(effectiveAvatarUrl);
      }

      handleClose();
    } catch (error) {
      console.error(error);
      let message = getErrorMessage(
        error,
        '프로필 이미지 변경에 실패했어요. 잠시 후 다시 시도해주세요.'
      );
      if (
        isAxiosError(error) &&
        (error.response?.status === 413 || error.response?.status === 416)
      ) {
        message = '이미지는 최대 5MB까지 업로드할 수 있어요.';
      }
      setAvatarError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    !isAvatarChanged ||
    isSubmitting ||
    isUploading ||
    effectiveAvatarUrl === '' ||
    isWaitingForUpload;

  const isCurrentProfile = useMemo(
    () => (url: string) => url === (currentAvatarUrl || ''),
    [currentAvatarUrl]
  );

  const isSelectedPreset = useMemo(
    () => (url: string) => url === selectedAvatar,
    [selectedAvatar]
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="bg-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-3 px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#9B5266]">
                프로필 이미지 변경
              </h2>
              <p className="mt-1 text-sm text-[#8B6570]">
                새로운 분위기의 아바타를 골라보거나 직접 업로드할 수 있어요.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-[#9B5266] hover:bg-[#FCE9ED]"
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? '처리 중...' : '완료'}
              </Button>
            </div>
          </div>
        </div>

        <ModalContent className="space-y-6 border-t border-[#F0C3CB]/40 bg-[#FFF9FA]">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#F0C3CB]/40 bg-white p-6 shadow-sm">
              <div className="relative flex flex-col items-center gap-4">
                <div className="size-28 rounded-full border-4 border-[#F0C3CB]/50 bg-[#FFF0F2] p-1 shadow-inner">
                  <div className="size-full overflow-hidden rounded-full bg-white shadow-sm">
                    {selectedAvatar ? (
                      <img
                        src={selectedAvatar}
                        alt="선택한 프로필 이미지"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm text-[#B06B7C]">
                        이미지를 선택해주세요
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-full bg-[#FCE9ED] px-4 py-1 text-xs text-[#9B5266]">
                  미리보기
                </div>
              </div>
              <p className="text-center text-xs text-[#8B6570]">
                1MB 이하의 PNG, JPG 파일을 권장해요. (최대 5MB)
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-[#F0C3CB]/60 bg-white/80 p-5 shadow-sm transition hover:border-[#E7A4B5]">
                <Label
                  htmlFor="avatar-file"
                  className="flex items-center justify-between text-sm text-[#9B5266]"
                >
                  이미지 업로드
                  <span className="text-xs text-[#C28A9A]">
                    5MB 이하, 이미지 파일만 가능
                  </span>
                </Label>
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  className="mt-3 cursor-pointer text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#F0C3CB] file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#E29CAB]"
                  onChange={handleFileChange}
                />
                <p className="mt-2 text-xs text-[#8B6570]">
                  밝고 따뜻한 감성의 프로필을 원한다면 배경색이 연한 이미지를
                  추천해요.
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-[#F0C3CB]/40 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-[#9B5266]">
                    추천 아바타
                  </h3>
                  <span className="text-xs text-[#C28A9A]">
                    클릭해서 빠르게 적용할 수 있어요
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto pr-1">
                  <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                    {AVATAR_PRESETS.map((item) => {
                      const selected = isSelectedPreset(item.url);
                      const current = isCurrentProfile(item.url);

                      return (
                        <button
                          key={item.url}
                          type="button"
                          aria-label={`${item.label} 아바타 선택`}
                          onClick={() => handleSelectPreset(item.url)}
                          className={cn(
                            'relative aspect-square w-full overflow-hidden rounded-full border-2 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9B5266]/40',
                            'flex items-center justify-center bg-linear-to-br from-[#FFF2F4] to-[#FFE3EA]',
                            selected
                              ? 'border-[#9B5266] shadow-lg ring-4 ring-[#F0C3CB]/70'
                              : current
                                ? 'border-[#F0C3CB]/80'
                                : 'border-transparent hover:border-[#F0C3CB]/70 hover:ring-2 hover:ring-[#F0C3CB]/40'
                          )}
                        >
                          <img
                            src={item.url}
                            alt=""
                            className="size-full object-cover"
                          />
                          {selected && (
                            <span
                              className="absolute top-2 right-2 rounded-full bg-[#9B5266] px-2 py-0.5 text-[10px] text-white"
                              aria-hidden="true"
                            >
                              선택됨
                            </span>
                          )}
                          {current && !selected && (
                            <span
                              className="absolute top-2 right-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] text-[#9B5266]"
                              aria-hidden="true"
                            >
                              현재
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {avatarError && (
            <p className="rounded-md border border-[#F7A9B9]/40 bg-[#FFF1F4] px-4 py-2 text-sm text-[#B4556A]">
              {avatarError}
            </p>
          )}
        </ModalContent>
      </form>
    </Modal>
  );
}
