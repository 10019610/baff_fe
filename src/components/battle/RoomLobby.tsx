import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import ValidatedInput from '../weightTracker/ValidatedInput';
import { Label } from '../ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  ArrowLeft,
  Crown,
  Users,
  Calendar,
  Target,
  Clock,
  Settings,
  Play,
  CheckCircle,
  AlertCircle,
  Edit3,
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
  Loader2,
  Copy,
  Trash2,
  LogOut,
  AlertTriangle,
  FileWarning,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import AnimatedContainer from '../weightTracker/AnimatedContainer';
import { getBattleRoomDetails } from '../../services/api/battleRoom.api';
import type { GoalType } from '../../types/BattleRoom.detail.type';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api/Api';
import type { GetCurrentWeightInfoResponse } from '../../types/Goals.api.type';
import type { UpdateUserGoalRequest } from '../../types/BattleRoom.api.type';
import {
  initKakao,
  createRoomInviteShareData,
  shareToKakao,
} from '../../utils/kakaoShare';

// 기존 Room 인터페이스 (초기 데이터용)
interface InitialRoom {
  name: string;
  password: string;
  description: string;
  hostId: string;
  hostNickName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'ENDED';
  maxParticipant: number;
  currentParticipant: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  entryCode: string;
}

interface RoomLobbyProps {
  room: InitialRoom | null;
  onBack: () => void;
  onBattleStarted?: () => void;
}

const RoomLobby = ({ room, onBack, onBattleStarted }: RoomLobbyProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showGoalSetting, setShowGoalSetting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [personalGoal, setPersonalGoal] = useState({
    type: 'WEIGHT_LOSS' as GoalType,
    targetValue: 0,
  });

  // 카카오 SDK 초기화
  useEffect(() => {
    initKakao();
  }, []);

  // 툴팁 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTooltip && !target.closest('.tooltip-container')) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTooltip]);
  // 현재 체중 조회

  const { data: getCurrentWeightInfo } = useQuery<GetCurrentWeightInfoResponse>(
    {
      queryKey: ['currentWeight'],
      initialData: { currentWeight: 0 },
      queryFn: () => {
        return api.get('/weight/getCurrentWeight').then((res) => {
          // setRecordWeightParam((prevState) => ({
          //   ...prevState,
          //   startWeight: getCurrentWeightInfo.currentWeight,
          // }));
          return res.data;
        });
      },
    }
  );

  // 개인 목표 설정 mutation
  const updateUserGoalMutation = useMutation({
    mutationFn: (param: UpdateUserGoalRequest) =>
      api.post(`/battle/${room?.entryCode}/battleGoalSetting`, param),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['battleRoomDetail', room?.entryCode],
      });
      toast.success('개인 목표가 설정되었습니다!');
      setShowGoalSetting(false);
    },
    onError: () => {
      toast.error('목표 설정 중 오류가 발생했습니다');
    },
    onSettled: () => {
      setIsActionLoading(false);
    },
  });

  // 대결 시작 mutation
  const { mutate: startBattleMutation } = useMutation({
    mutationFn: () => api.post(`/battle/${room?.entryCode}/battleStart`),
    onSuccess: () => {
      toast.success('대결이 시작되었습니다!');
      onBattleStarted?.();
    },
    onError: () => {
      toast.error('대결 시작 중 오류가 발생했습니다');
    },
    onSettled: () => {
      setIsActionLoading(false);
    },
  });

  // 방 상세 정보 조회
  const {
    data: roomDetail,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['battleRoomDetail', room?.entryCode],
    queryFn: () => {
      if (!room?.entryCode) {
        throw new Error('방 코드가 없습니다');
      }
      return getBattleRoomDetails(room.entryCode);
    },
    enabled: !!room?.entryCode,
    retry: 1,
    staleTime: 0, // 즉시 stale 상태로 만들어 항상 최신 데이터 요청
    refetchOnWindowFocus: true, // 윈도우 포커스 시 재요청
  });

  if (!room) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">방 정보를 불러올 수 없습니다.</p>
          <Button onClick={onBack} className="mt-4">
            돌아가기
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <AnimatedContainer direction="fade" className="space-y-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h1 className="flex items-center gap-2">{room.name}</h1>
            <p className="text-muted-foreground">방 대기실</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              방 정보를 불러오는데 실패했습니다.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : '알 수 없는 오류가 발생했습니다'}
            </p>
            <Button onClick={onBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </AnimatedContainer>
    );
  }

  if (isLoading || !roomDetail) {
    return (
      <AnimatedContainer direction="fade" className="space-y-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h1 className="flex items-center gap-2">{room.name}</h1>
            <p className="text-muted-foreground">방 대기실</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">방 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </AnimatedContainer>
    );
  }

  // 단순 계산 값들
  const currentUserParticipant = roomDetail?.participants.find(
    (p) => p.userId === Number(user?.id)
  );

  // 현재 사용자가 방장인지 확인 (User.id는 string, hostId는 number이므로 변환 필요)
  const isCurrentUserHost =
    user && roomDetail ? Number(user.id) === roomDetail.hostId : false;

  // 방장 닉네임 찾기 (hostId와 userId 비교)
  const hostNickname =
    roomDetail?.participants.find((p) => p.userId === roomDetail.hostId)
      ?.userNickname || 'Unknown';

  const userHasGoal =
    currentUserParticipant?.goalType &&
    currentUserParticipant?.targetValue !== null &&
    currentUserParticipant?.targetValue !== undefined;

  const allParticipantsHaveGoal =
    roomDetail?.participants.every(
      (p) => p.goalType && p.targetValue !== null && p.targetValue !== undefined
    ) ?? false;

  const canStart =
    allParticipantsHaveGoal && (roomDetail?.participants.length ?? 0) >= 2;

  const handleSavePersonalGoal = async () => {
    if (!user || !roomDetail) return;

    // 체중 기록이 없으면 에러
    if (!getCurrentWeightInfo) {
      toast.error(
        '체중 기록이 필요합니다. 체중 추적 페이지에서 먼저 체중을 기록해주세요.'
      );
      return;
    }

    if (personalGoal.type !== 'MAINTAIN' && personalGoal.targetValue <= 0) {
      toast.error('목표량을 올바르게 입력해주세요');
      return;
    }

    setIsActionLoading(true);

    // mutation 실행
    const goalData: UpdateUserGoalRequest = {
      goalType: personalGoal.type,
      targetValue: personalGoal.targetValue,
      startingWeight: getCurrentWeightInfo.currentWeight,
    };

    updateUserGoalMutation.mutate(goalData);
  };

  const handleStartBattle = () => {
    if (!canStart || !roomDetail) return;

    setIsActionLoading(true);
    startBattleMutation();
  };

  // 초대 링크 생성
  const inviteUrl = `${import.meta.env.VITE_APP_DOMAIN}/invite?roomId=${room.entryCode}&password=${room.password}`;

  const handleCopyInviteLink = () => {
    if (!room || !roomDetail) return;

    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => {
        toast.success('초대 링크가 복사되었습니다!');
      })
      .catch(() => {
        toast.error('링크 복사에 실패했습니다');
      });
  };

  // 카카오톡 공유 함수
  const handleKakaoShare = () => {
    if (!room || !roomDetail) return;

    const shareData = createRoomInviteShareData(room.name, inviteUrl);

    shareToKakao(shareData);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getPersonalGoalText = (participant: {
    goalType?: GoalType | null;
    targetValue?: number | null;
    startingWeight?: number | null;
  }) => {
    if (
      !participant.goalType ||
      participant.targetValue === null ||
      participant.targetValue === undefined
    )
      return '목표 미설정';

    const typeText =
      participant.goalType === 'WEIGHT_LOSS'
        ? '감량'
        : participant.goalType === 'WEIGHT_GAIN'
          ? '증량'
          : '유지';

    if (participant.goalType === 'MAINTAIN') {
      return `${participant.startingWeight ?? '미설정'}kg 유지`;
    }

    const startWeight = participant.startingWeight ?? 0;
    const targetWeight =
      participant.goalType === 'WEIGHT_LOSS'
        ? startWeight - participant.targetValue
        : startWeight + participant.targetValue;

    return `${participant.targetValue}kg ${typeText} (${participant.startingWeight ?? '미설정'}kg → ${targetWeight}kg)`;
  };

  const getPersonalGoalIcon = (goalType?: GoalType | null) => {
    switch (goalType) {
      case 'WEIGHT_LOSS':
        return <TrendingDown className="h-3 w-3" />;
      case 'WEIGHT_GAIN':
        return <TrendingUp className="h-3 w-3" />;
      case 'MAINTAIN':
        return <Minus className="h-3 w-3" />;
      default:
        return <Target className="h-3 w-3" />;
    }
  };

  const handleDeleteRoomClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRoomCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  // 방장 - 방 삭제 컨펌 핸들러러
  const handleDeleteRoomConfirm = async () => {
    if (!user || !room.entryCode) return;

    setIsActionLoading(true);
    try {
      await api.post(`/battle/${room.entryCode}/deleteRoom`);
      toast.success('방이 삭제되었습니다.');
      onBack();
    } catch (error) {
      console.error('Failed to delete room:', error);
      toast.error('방 삭제에 실패했습니다.');
    } finally {
      setIsActionLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLeaveRoomConfirm = async () => {
    if (!user || !room.entryCode) return;
    try {
      await api.post(`/battle/${room.entryCode}/leaveRoomByParticipant`);
      toast.success('방에서 나왔습니다.');
      onBack();
    } catch (error) {
      console.error('Failed to leave room:', error);
      toast.error('방 나가기 중 오류가 발생했습니다.');
    } finally {
      setIsActionLoading(false);
      setIsLeaveDialogOpen(false);
    }
  };

  const handleLeaveRoomCancel = () => {
    setIsLeaveDialogOpen(false);
  };

  const handleLeaveRoomClick = () => {
    setIsLeaveDialogOpen(true);
  };

  return (
    <AnimatedContainer direction="fade" className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </motion.button>
        <div className="flex-1">
          <h1 className="flex items-center gap-2">{roomDetail.name}</h1>
          <p className="text-muted-foreground">방 대기실</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 방 정보 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />방 정보
                </div>
                <Badge
                  variant={
                    roomDetail.status === 'WAITING' ? 'outline' : 'default'
                  }
                >
                  {roomDetail.status === 'WAITING'
                    ? '대기 중'
                    : roomDetail.status === 'IN_PROGRESS'
                      ? '진행 중'
                      : roomDetail.status === 'ENDED'
                        ? '완료'
                        : '취소'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {roomDetail.description && (
                <p className="text-muted-foreground">
                  {roomDetail.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {roomDetail.currentParticipants}/{roomDetail.maxParticipants}
                  명
                </Badge>

                <div className="relative group tooltip-container">
                  <Badge
                    variant="outline"
                    className="cursor-help select-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(!showTooltip);
                    }}
                  >
                    <Target className="h-3 w-3 mr-1" />
                    개인별 목표 설정
                  </Badge>
                  <div
                    className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 ${
                      showTooltip
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    각 참가자가 개별적으로 체중 감량/증량/유지 목표를 설정합니다
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>

                {roomDetail.endDate && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {getDaysRemaining(roomDetail.endDate)}일 남음
                  </Badge>
                )}

                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {roomDetail.durationDays}일간
                </Badge>
              </div>
              {/* 방 입장 정보 */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      입장 코드
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded border">
                      <code className="font-mono text-sm flex-1">
                        {room.entryCode}
                      </code>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      비밀번호
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded border">
                      <code className="font-mono text-sm flex-1">
                        {room.password}
                      </code>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer"
                  onClick={() => {
                    const text = `방 코드: ${room.entryCode}\n비밀번호: ${room.password}`;
                    navigator.clipboard.writeText(text);
                    toast.success('방 코드와 비밀번호가 복사되었습니다!');
                  }}
                >
                  <Copy className="h-4 w-4" /> 입장 정보 복사
                </Button>
              </div>

              {/* 초대 링크 섹션 - 방장만 표시 */}
              {isCurrentUserHost && (
                <div className="space-y-4">
                  <Separator className="my-4" />
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">친구 초대</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    링크를 공유하여 친구들을 초대해보세요
                  </p>

                  {/* 초대 링크 복사 */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      초대 링크
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 p-1.5 bg-muted truncate rounded-lg border text-sm font-mono break-all">
                        {inviteUrl}
                      </div>
                      <Button
                        variant="outline"
                        size="xl"
                        onClick={handleCopyInviteLink}
                        className="cursor-pointer"
                      >
                        <Copy className="sm:mr-2" />
                        <span className="hidden sm:inline text-sm">복사</span>
                      </Button>
                    </div>
                  </div>

                  {/* 카카오톡 공유 */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      카카오톡으로 공유
                    </Label>
                    <div className="flex justify-center">
                      <button
                        onClick={handleKakaoShare}
                        className="cursor-pointer overflow-hidden rounded-lg transition-all w-full h-full duration-200 hover:scale-105 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-yellow-500 px-6 py-3 rounded-lg transition-colors duration-200">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center p-1">
                            <img
                              src="/kakaotalk_sharing_btn_medium.png"
                              alt="카카오톡"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <span className="text-[#191919] font-bold text-sm mr-8">
                            카카오톡으로 초대하기
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 참가자 목록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                참가자 ({roomDetail.currentParticipants}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roomDetail.participants.map((participant, index) => (
                  <div
                    key={participant.userNickname}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg border"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {participant.userNickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-medium truncate max-w-[120px] sm:max-w-none">
                              {participant.userNickname}
                            </span>
                            {index === 0 && (
                              <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            )}
                            {participant.userNickname === user?.nickname && (
                              <Badge
                                variant="secondary"
                                className="text-xs flex-shrink-0"
                              >
                                나
                              </Badge>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {participant.goalType ? (
                              <Badge
                                variant="default"
                                className="bg-green-600 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                목표설정
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                목표미설정
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-2">
                          <span>현재: {participant.currentWeight}kg</span>
                        </div>
                        <div className="flex items-start gap-1">
                          <div className="flex-shrink-0 mt-0.5">
                            {getPersonalGoalIcon(participant.goalType)}
                          </div>
                          <p className="text-xs text-muted-foreground break-words">
                            {getPersonalGoalText(participant)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 개인 목표 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  대결 목표 설정
                </div>
                {userHasGoal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGoalSetting(true)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userHasGoal && !showGoalSetting ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {currentUserParticipant?.goalType &&
                      getPersonalGoalIcon(currentUserParticipant.goalType)}
                    <p className="text-sm">
                      {getPersonalGoalText(currentUserParticipant || {})}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGoalSetting(true)}
                    className="w-full"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    목표 수정
                  </Button>
                </div>
              ) : !userHasGoal && !showGoalSetting && !getCurrentWeightInfo ? (
                // 체중 기록이 없어서 목표 설정을 할 수 없는 경우
                <div className="space-y-4">
                  <Alert>
                    <Scale className="h-4 w-4" />
                    <AlertDescription>
                      개인 목표를 설정하려면 먼저 체중 기록이 필요합니다.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      체중 추적 페이지에서 현재 체중을 기록한 후 목표를 설정할
                      수 있습니다.
                    </p>

                    <Button
                      onClick={() => {
                        // 체중 추적 페이지로 이동
                        window.location.href = '/weight-tracker';
                      }}
                      className="w-full"
                      size="sm"
                    >
                      <Scale className="h-4 w-4 mr-2" />
                      체중 기록하러 가기
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 체중 기록 상태 확인 */}
                  {getCurrentWeightInfo ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="goalType">목표 유형</Label>
                        <Select
                          value={personalGoal.type}
                          onValueChange={(value: GoalType) =>
                            setPersonalGoal({
                              ...personalGoal,
                              type: value,
                              targetValue:
                                value === 'MAINTAIN'
                                  ? 0
                                  : personalGoal.targetValue,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="WEIGHT_LOSS">
                              체중 감량
                            </SelectItem>
                            <SelectItem value="WEIGHT_GAIN">
                              체중 증가
                            </SelectItem>
                            <SelectItem value="MAINTAIN">체중 유지</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentWeight">현재 체중 (kg)</Label>
                        <div className="relative">
                          <Input
                            id="currentWeight"
                            type="number"
                            step="0.1"
                            value={getCurrentWeightInfo.currentWeight}
                            disabled
                            className="bg-muted"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Scale className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          체중 기록에서 자동으로 가져온 최신 체중입니다
                        </p>
                      </div>

                      {personalGoal.type !== 'MAINTAIN' && (
                        <div className="space-y-2">
                          {/* <Label htmlFor="targetAmount">
                            목표{' '}
                            {personalGoal.type === 'WEIGHT_LOSS'
                              ? '감량'
                              : '증량'}{' '}
                            (kg)
                          </Label> */}
                          <ValidatedInput
                            id="targetAmount"
                            label={`목표 ${personalGoal.type === 'WEIGHT_LOSS' ? '감량' : '증량'} (kg)`}
                            type="number"
                            value={personalGoal.targetValue || ''}
                            onChange={(value) => {
                              setPersonalGoal({
                                ...personalGoal,
                                targetValue: value === '' ? 0 : Number(value),
                              });
                            }}
                            decimalPlaces={1}
                            maxNumber={99.9}
                            validationRules={{
                              required: false,
                              custom: (value: string | number) => {
                                // if (
                                //   // value === '' ||
                                //   value === null ||
                                //   value === undefined
                                // ) {
                                //   return null;
                                // }
                                const num = Number(value);
                                if (isNaN(num)) {
                                  return '올바른 숫자를 입력해주세요';
                                }
                                if (num > 99.9) {
                                  return '0에서 99.9 사이의 값을 입력해주세요';
                                }
                                if (
                                  num % 0.1 !== 0 &&
                                  String(value).split('.')[1]?.length > 1
                                ) {
                                  return '소수점 첫째 자리까지만 입력 가능합니다';
                                }
                                return null;
                              },
                            }}
                            placeholder="예: 65.5"
                            validateOnChange={false}
                            maxLength={5}
                            className="h-12"
                          />
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileWarning className="h-3 w-3 text-yellow-500" />
                            본인 체중 이하로만 설정할 수 있습니다
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSavePersonalGoal}
                          disabled={isActionLoading}
                          className="flex-1 cursor-pointer"
                        >
                          {isActionLoading ? '저장 중...' : '목표 저장'}
                        </Button>
                        {userHasGoal && (
                          <Button
                            variant="outline"
                            onClick={() => setShowGoalSetting(false)}
                          >
                            취소
                          </Button>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 대결 준비 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                대결 준비 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 목표 설정 진행률 */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  목표 설정 완료:{' '}
                  <span className="font-semibold">
                    {
                      roomDetail.participants.filter(
                        (p) => p.goalType && p.targetValue !== undefined
                      ).length
                    }
                    /{roomDetail.participants.length}명
                  </span>
                </p>
                <div className="w-full bg-muted rounded-full h-3 mb-4">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(roomDetail.participants.filter((p) => p.goalType && p.targetValue !== undefined).length / roomDetail.participants.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 상태별 알림 */}
              {canStart ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    모든 참가자가 목표를 설정했습니다!{' '}
                    {isCurrentUserHost
                      ? '대결을 시작할 수 있습니다.'
                      : '방장이 대결을 시작하기를 기다리고 있습니다.'}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {roomDetail.participants.length < 2
                      ? '최소 2명의 참가자가 필요합니다'
                      : '모든 참가자의 목표 설정이 필요합니다'}
                  </AlertDescription>
                </Alert>
              )}

              {/* 방장만 대결 시작 버튼 표시 */}
              {isCurrentUserHost && (
                <motion.div
                  whileHover={{ scale: canStart ? 1.02 : 1 }}
                  whileTap={{ scale: canStart ? 0.98 : 1 }}
                >
                  <Button
                    onClick={handleStartBattle}
                    disabled={
                      !canStart ||
                      isActionLoading ||
                      roomDetail.status === 'IN_PROGRESS'
                    }
                    className="w-full cursor-pointer"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isActionLoading ? '시작 중...' : '대결 시작하기'}
                  </Button>
                </motion.div>
              )}

              {/* 방장이 아닌 경우 안내 메시지 */}
              {!isCurrentUserHost && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    <Crown className="h-4 w-4 inline mr-1" />
                    방장({hostNickname})님이 대결을 시작합니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* 방 나가기 */}
          {!isCurrentUserHost && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" />방 나가기
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  재입장시 초대 링크나 입장 코드가 필요합니다.
                </p>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleLeaveRoomClick}
                    disabled={isLoading}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    방에서 나가기
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          )}

          {/* 방 삭제 (방장 전용) */}
          {isCurrentUserHost && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />방 삭제
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    방을 삭제하면 모든 참가자가 방에서 나가게 되며, 복구할 수
                    없습니다.
                  </AlertDescription>
                </Alert>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleDeleteRoomClick}
                    disabled={isActionLoading}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />방 삭제하기
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 방 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <AlertDialogTitle className="text-left">
                  방을 삭제하시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-left">
                  방을 삭제하면 모든 참가자가 방에서 나가게 되며, 복구할 수
                  없습니다.
                  <br />
                  정말로 삭제하시겠습니까?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={handleDeleteRoomCancel}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoomConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={isActionLoading}
            >
              {isActionLoading ? '삭제 중...' : '삭제하기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 방 나가기 확인 다이얼로그 */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-left">
                <AlertDialogTitle className="text-left">
                  방을 나가시겠습니까?
                </AlertDialogTitle>
                <AlertDialogDescription className="mt-1 text-left">
                  다시 입장하려면 초대 링크나 입장 코드가 필요합니다.
                  <br />
                  정말로 나가시겠습니까?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer"
              onClick={handleLeaveRoomCancel}
            >
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveRoomConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              disabled={isActionLoading}
            >
              {isActionLoading ? '나가기 중...' : '나가기'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatedContainer>
  );
};

export default RoomLobby;
