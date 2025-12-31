import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card.tsx';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../components/ui/avatar.tsx';
import { Calendar, Camera, Edit2, Shield, LogIn, MessageSquare, Mail } from 'lucide-react';
import { Badge } from '../components/ui/badge.tsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api/Api.ts';
import { userInitializer } from '../types/User.initializer.ts';
import { formatDate } from '../utils/DateUtil.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EditAvatarModal } from '../components/modal/EditAvatarModal.tsx';
import { EditNameModal } from '../components/modal/EditNameModal.tsx';
import { Button } from '../components/ui/button.tsx';

/**
 * 유저 프로필 페이지
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const ProfilePage = () => {
  /**
   * state
   */
  const [showEditAvatarDialog, setShowEditAvatarDialog] =
    useState<boolean>(false);
  const [showEditNameDialog, setShowEditNameDialog] = useState<boolean>(false);
  /**
   * Hooks
   */
  /* User Id */
  const { userId } = useParams();
  const { user, updateUserProfileImage, updateUserNickname } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleOpenEditAvatar = () => {
    setShowEditAvatarDialog(true);
  };

  const handleCloseEditAvatar = () => {
    setShowEditAvatarDialog(false);
  };

  const handleAvatarUpdateSuccess = async (newImageUrl: string) => {
    updateUserProfileImage(newImageUrl);
    // 프로필 페이지의 쿼리 키와 일치하도록 수정
    await queryClient.invalidateQueries({
      queryKey: ['userId', userId],
    });
  };

  const handleOpenEditName = () => {
    setShowEditNameDialog(true);
  };

  const handleCloseEditName = () => {
    setShowEditNameDialog(false);
  };

  const handleNameUpdateSuccess = async (newNickname: string) => {
    // AuthContext의 user 정보 업데이트
    updateUserNickname(newNickname);
    // 닉네임 변경 후 프로필 페이지 쿼리 무효화
    await queryClient.invalidateQueries({
      queryKey: ['userId', userId],
    });
  };

  // 권한 검증: 현재 로그인한 사용자만 자신의 프로필에 접근 가능
  useEffect(() => {
    if (user && userId && user.id.toString() !== userId) {
      toast.error('자신의 프로필만 접근할 수 있습니다.');
    }
  }, [user, userId]);

  if (!user || !userId || user.id.toString() !== userId) {
    return <Navigate to="/" replace />;
  }

  /**
   * APIs
   */
  /* 유저 정보 조회 api */
  const { data: userInfo } = useQuery({
    queryKey: ['userId', userId],
    initialData: userInitializer.INITIAL_GET_USER_INFO,
    queryFn: () =>
      api.get(`/user/getUserInfo/${userId}`).then((res) => {
        return res.data;
      }),
  });
  const getProviderInfo = () => {
    if (userInfo.provider === 'google') {
      return {
        name: 'Google',
        color: 'bg-blue-500',
        textColor: 'text-white',
      };
    }
    if (userInfo.provider === 'kakao') {
      return {
        name: 'Kakao',
        color: 'bg-[#FEE500]',
        textColor: 'text-black',
      };
    }
    if (userInfo.provider === 'toss') {
      return {
        name: 'TOSS',
        color: 'bg-[#0064FF]',
        textColor: 'text-white',
      };
    }
    return {
      name: 'ChangeUp',
      color: 'bg-gray-500',
      textColor: 'text-white',
    };
  };
  const getActivityDays = () => {
    const today = new Date();
    const regDate = new Date(userInfo.regDateTime);
    const diffTime = Math.abs(today.getTime() - regDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return '좋은 아침이에요';
    } else if (hour >= 12 && hour < 18) {
      return '좋은 오후에요';
    } else if (hour >= 18 && hour < 22) {
      return '좋은 저녁이에요';
    } else {
      return '편안한 밤 되세요';
    }
  };
  const providerInfo = getProviderInfo();

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4">
      <Card>
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* 프로필 사진 */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-28 w-28 border border-gray">
                <AvatarImage
                  src={userInfo.userProfileUrl}
                  alt={userInfo.nickname}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userInfo.nickname?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                onClick={handleOpenEditAvatar}
                className="absolute -bottom-1 -right-1 size-8 rounded-full bg-[#F0C3CB] hover:bg-[#E8B3BD] shadow-lg border border-gray"
                aria-label="프로필 사진 변경"
              >
                <Camera className="size-4 text-white" />
              </Button>
            </div>

            {/* 사용자 정보 */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-4">
                <p className="text-muted-foreground text-sm mb-1.5">
                  {getGreeting()}, {userInfo.nickname}님
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9B5266] to-[#B06B7C] bg-clip-text text-transparent">
                    {userInfo.nickname}
                  </h1>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleOpenEditName}
                    className="size-8 text-[#B06B7C] hover:text-[#9B5266] hover:bg-[#F0C3CB]/20 transition-all"
                    aria-label="닉네임 수정"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  {userInfo.email}
                </p>
              </div>

              {/* 정보 목록 */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">가입일:</span>
                  <span className="font-medium">
                    {formatDate(userInfo.regDateTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">활동:</span>
                  <span className="font-medium">{getActivityDays()}일째</span>
                </div>
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">로그인:</span>
                  <Badge
                    variant="outline"
                    className={`${providerInfo.color} ${providerInfo.textColor} border-0 text-xs`}
                  >
                    {providerInfo.name}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문의하기 섹션 */}
      <Card className="border border-border hover:shadow-md transition-all duration-200">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">
                  문의 및 피드백
                </h3>
                <p className="text-sm text-muted-foreground">
                  궁금한 점이나 개선사항을 자유롭게 문의해주세요
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/inquiry')}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 font-medium"
              size="default"
            >
              <Mail className="h-4 w-4 mr-2" />
              문의하기
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditAvatarModal
        isOpen={showEditAvatarDialog}
        currentAvatarUrl={userInfo?.userProfileUrl || ''}
        onClose={handleCloseEditAvatar}
        onSuccess={handleAvatarUpdateSuccess}
      />

      <EditNameModal
        isOpen={showEditNameDialog}
        currentNickname={userInfo?.nickname || user?.nickname || ''}
        userId={user?.userId ? Number(user.userId) : undefined}
        onClose={handleCloseEditName}
        onSuccess={handleNameUpdateSuccess}
      />
    </div>
  );
};

export default ProfilePage;
