import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
  const [personalGoal, setPersonalGoal] = useState({
    type: 'WEIGHT_LOSS' as GoalType,
    targetValue: 0,
    currentWeight: 0,
  });

  // 카카오 SDK 초기화
  useEffect(() => {
    initKakao();
  }, []);
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
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 방지
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

    // 현재 체중이 체중 기록에서 자동으로 가져와진 경우가 아니라면 체중 기록 유도
    if (!getCurrentWeightInfo && !personalGoal.currentWeight) {
      toast.error('체중을 입력해주세요.');
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
      startingWeight:
        personalGoal.currentWeight || getCurrentWeightInfo?.currentWeight || 0,
    };

    updateUserGoalMutation.mutate(goalData);
    console.log('goalData', goalData);
  };

  const handleStartBattle = () => {
    if (!canStart || !roomDetail) return;

    setIsActionLoading(true);
    startBattleMutation();
  };

  // 초대 링크 생성
  const inviteUrl =
    room && roomDetail
      ? `${window.location.origin}${window.location.pathname}?roomId=${roomDetail.entryCode}&password=${room.password}`
      : '';

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

  return (
    <AnimatedContainer direction="fade" className="space-y-6">
      {/* 헤더 */}
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

                <Badge variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  개인별 목표 설정
                </Badge>

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
                  className="w-full"
                  onClick={() => {
                    const text = `방 코드: ${room.entryCode}\n비밀번호: ${room.password}`;
                    navigator.clipboard.writeText(text);
                    toast.success('방 코드와 비밀번호가 복사되었습니다!');
                  }}
                >
                  <Copy className="h-4 w-4" /> 입장 정보 복사
                </Button>
              </div>

              <Separator className="my-4" />

              {/* 초대 링크 섹션 */}
              <div className="space-y-4">
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
                    <div className="flex-1 p-1.5 bg-muted rounded-lg border text-sm font-mono break-all">
                      {inviteUrl}
                    </div>
                    <Button
                      variant="outline"
                      size="xl"
                      onClick={handleCopyInviteLink}
                      className=""
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
                      className="overflow-hidden rounded-lg transition-all w-full h-full duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-3 bg-yellow-400 hover:bg-yellow-500 px-6 py-3 rounded-lg transition-colors duration-200">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center p-1">
                          <img
                            src="/kakaotalk_sharing_btn_medium.png"
                            alt="카카오톡"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-white font-bold text-sm">
                          카카오톡으로 초대하기
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
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
                    className="flex items-start justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                        {participant.userNickname.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {participant.userNickname}
                          </span>
                          {index === 0 && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {participant.userNickname === user?.nickname && (
                            <Badge variant="secondary" className="text-xs">
                              나
                            </Badge>
                          )}
                          {/* {participant.rank && (
                            <Badge variant="outline" className="text-xs">
                              {participant.rank}순위
                            </Badge>
                          )} */}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                          <span>현재: {participant.currentWeight}kg</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getPersonalGoalIcon(participant.goalType)}
                          <p className="text-xs text-muted-foreground">
                            {getPersonalGoalText(participant)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {participant.goalType ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          목표설정
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          목표미설정
                        </Badge>
                      )}
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
                  <Target className="h-5 w-5" />내 목표
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
                      onClick={() => setShowGoalSetting(true)}
                      className="w-full"
                      size="sm"
                      variant="ghost"
                    >
                      그래도 목표 설정하기
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
                          <Label htmlFor="targetAmount">
                            목표{' '}
                            {personalGoal.type === 'WEIGHT_LOSS'
                              ? '감량'
                              : '증량'}{' '}
                            (kg)
                          </Label>
                          <Input
                            id="targetAmount"
                            type="number"
                            step="0.1"
                            placeholder="5.0"
                            value={personalGoal.targetValue || ''}
                            onChange={(e) =>
                              setPersonalGoal({
                                ...personalGoal,
                                targetValue: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSavePersonalGoal}
                          disabled={isActionLoading}
                          className="flex-1"
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
                  ) : (
                    // 체중 기록이 없는 경우 - 수동 입력 허용
                    <div className="space-y-4">
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
                        <Input
                          id="currentWeight"
                          type="number"
                          step="0.1"
                          placeholder="현재 체중을 입력하세요"
                          value={personalGoal.currentWeight || ''}
                          onChange={(e) =>
                            setPersonalGoal({
                              ...personalGoal,
                              currentWeight: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          체중 기록이 없어 수동으로 입력해주세요
                        </p>
                      </div>

                      {personalGoal.type !== 'MAINTAIN' && (
                        <div className="space-y-2">
                          <Label htmlFor="targetAmount">
                            목표{' '}
                            {personalGoal.type === 'WEIGHT_LOSS'
                              ? '감량'
                              : '증량'}{' '}
                            (kg)
                          </Label>
                          <Input
                            id="targetAmount"
                            type="number"
                            step="0.1"
                            placeholder="5.0"
                            value={personalGoal.targetValue || ''}
                            onChange={(e) =>
                              setPersonalGoal({
                                ...personalGoal,
                                targetValue: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSavePersonalGoal}
                          disabled={isActionLoading}
                          className="flex-1"
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
                    </div>
                  )}
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
                    disabled={!canStart || isActionLoading}
                    className="w-full"
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
                    방장({hostNickname})이 대결을 시작합니다
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default RoomLobby;
