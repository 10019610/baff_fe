import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { X, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { insertUserFlag } from '../../services/api/User.api';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

interface EditProfileNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

export function EditProfileNotificationModal({
  isOpen,
  onClose,
  userId,
}: EditProfileNotificationModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate: setDontShowAgain, isPending: isSettingFlag } = useMutation({
    mutationFn: () => insertUserFlag('202512_EDIT_PROFILE'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userFlag'] });
      onClose();
    },
  });

  const handleDontShowAgain = () => {
    setDontShowAgain();
  };

  const handleEditProfile = () => {
    onClose();
    if (userId) {
      navigate(`/user/profile/${userId}`);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors z-10"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Current Profile Display */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 border-2 border-muted">
                <AvatarImage src={user.profileImage} alt={user.nickname} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.nickname?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">현재 프로필</p>
              <p className="text-lg font-semibold">{user.nickname}</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-center text-foreground leading-relaxed">
              현재 닉네임과 프로필이에요.
              <br />
              <span className="font-semibold text-foreground">
                나만의 닉네임과 프로필 사진
              </span>
              으로 변경해보세요!
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <Button
              type="button"
              onClick={handleEditProfile}
              className="w-full"
              size="lg"
            >
              프로필 수정하기
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDontShowAgain}
              disabled={isSettingFlag}
              className="w-full text-xs text-muted-foreground hover:text-foreground h-9"
            >
              {isSettingFlag ? '처리 중...' : '다시 보지 않기'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
