import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card.tsx';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Plus,
  Scale,
  Target,
  Trash2,
} from 'lucide-react';

import { Button } from './ui/button.tsx';
import type { Goal, PresetDurationType } from '../types/Goals.type.ts';
import type {
  GetGoalListResponse,
  RecordGoalsRequest,
} from '../types/Goals.api.type.ts';
import { formatDate } from '../utils/DateUtil.ts';
import { Badge } from './ui/badge.tsx';
import { Progress } from './ui/progress.tsx';
import AnimatedContainer from './weightTracker/AnimatedContainer.tsx';
import { useState } from 'react';
import GoalsCreate from './GoalsCreate.tsx';
import { useAuth } from '../context/AuthContext';
import LoginModal from './auth/LoginModal.tsx';
import toast from 'react-hot-toast';
import GoalDetailDrawer from './goals/GoalDetailDrawer.tsx';

interface GoalSettingProps {
  onClickRecord: () => void;
  presetDuration: PresetDurationType[];
  onChangeParam: (
    key: keyof RecordGoalsRequest,
    value: string | number
  ) => void;
  param: RecordGoalsRequest;
  currentWeight: number;
  goalList: GetGoalListResponse[];
  handleGetDaysRemaining: (startDate: string, endDate: string) => number;
  handleDeleteGoalModal: (goalId: string) => void;
  isPending: boolean;
  isGoalCreationDisabled?: boolean;
}

/**
 * 체중 목표 설정 관련 컴포넌트
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const GoalSetting = ({
  onClickRecord,
  presetDuration,
  onChangeParam,
  param,
  currentWeight,
  goalList,
  handleGetDaysRemaining,
  handleDeleteGoalModal,
  isPending,
  isGoalCreationDisabled = false,
}: GoalSettingProps) => {
  /**
   * States
   */
  /* 목표 설정 생성 컴포넌트 상태 */
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  /* 상세를 연 목표 (M-023) */
  const [detailGoal, setDetailGoal] = useState<GetGoalListResponse | null>(
    null
  );
  const { isAuthenticated } = useAuth();
  /**
   * UI
   */

  /**
   * Handlers
   */
  /* 목표 만들기 폼 열기 handler — 만들기 카드 · 상세의 「새 목표 설정하기」 공용 */
  const handleOpenCreateGoal = () => {
    if (isGoalCreationDisabled) {
      toast.error('현재 체중을 먼저 입력해주세요.');
      return;
    }
    // currentWeight가 0이거나 undefined인 경우 추가 체크
    if (!currentWeight || currentWeight === 0) {
      toast.error('현재 체중을 먼저 입력해주세요.');
      return;
    }
    if (isAuthenticated) {
      setShowCreateGoal(true);
    } else {
      setLoginOpen(true);
    }
  };

  /* 설정목표 카드 만료여부 배지 제어 handler */
  const getStatusBadge = (isExpired: boolean, goal: Goal) => {
    const progress = calculateProgress(goal);
    if (isExpired) {
      if (progress < 100) {
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            실패
          </Badge>
        );
      } else if (progress === 100) {
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            완료
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            테스트
          </Badge>
        );
      }
    } else {
      return <Badge variant="secondary">진행중</Badge>;
    }
  };
  /* 진행률 계산 handler */
  const calculateProgress = (goal: Goal) => {
    if (!goal.currentWeight) return 0;
    const totalChange = goal.targetWeight - goal.startWeight;
    const currentChange = goal.currentWeight - goal.startWeight;

    if (totalChange === 0) return 100;

    const progress = (currentChange / totalChange) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  /* 일일 권장 감량량 계산 handler */
  const calculateDailyWeightLoss = (goal: Goal) => {
    const daysRemaining = handleGetDaysRemaining(
      String(new Date()),
      goal.endDate
    );
    if (daysRemaining <= 0 || !goal.currentWeight) return null;

    const weightDifference = goal.currentWeight - goal.targetWeight;
    const dailyLoss = weightDifference / daysRemaining;

    return {
      dailyLoss: Math.abs(dailyLoss),
      isGain: weightDifference < 0,
      status:
        Math.abs(dailyLoss) <= 0.3
          ? 'healthy'
          : Math.abs(dailyLoss) <= 0.5
            ? 'moderate'
            : 'aggressive',
    };
  };
  /* 일일 권장 감량량 상태에 따른 색상 및 메시지 handler */
  const getDailyLossStatus = (status: string, isGain: boolean) => {
    if (isGain) {
      switch (status) {
        case 'healthy':
          return { color: 'text-green-600', message: '건강한 증량 속도' };
        case 'moderate':
          return { color: 'text-yellow-600', message: '적당한 증량 속도' };
        default:
          return { color: 'text-red-600', message: '빠른 증량 속도' };
      }
    } else {
      switch (status) {
        case 'healthy':
          return { color: 'text-green-600', message: '건강한 감량 속도' };
        case 'moderate':
          return { color: 'text-yellow-600', message: '적당한 감량 속도' };
        default:
          return { color: 'text-red-600', message: '빠른 감량 속도' };
      }
    }
  };
  const [loginOpen, setLoginOpen] = useState(false);

  if (!isAuthenticated && loginOpen) {
    return <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />;
  }

  return (
    <div className="space-y-6">
      {showCreateGoal ? (
        <GoalsCreate
          currentWeight={currentWeight}
          presetDuration={presetDuration}
          onClickRecord={onClickRecord}
          onChangeParam={onChangeParam}
          param={param}
          isPending={isPending}
          onClose={() => setShowCreateGoal(false)}
        />
      ) : (
        <div>
          {/* 목표 설정 생성 버튼*/}
          <AnimatedContainer>
            <Card
              className={`hover:shadow-lg transition-all duration-200 group border-2 border-primary/40 bg-gradient-to-br from-primary/20 to-primary/30 hover:from-primary/25 hover:to-primary/35 hover:border-primary/50 hover:scale-[1.02] ${
                isGoalCreationDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              onClick={handleOpenCreateGoal}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-200 shadow-sm group-hover:shadow group-hover:scale-110">
                    <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg transition-colors">
                      새로운 목표 설정
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      새로운 목표를 설정해보세요
                    </p>
                  </div>
                  <div className="bg-primary/20 p-2 rounded-full group-hover:bg-primary/30 transition-all duration-200">
                    <Plus className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
          {/* Active Goals */}
          {goalList.length > 0 && isAuthenticated && (
            <div className="space-y-4 mt-4">
              {/* <h3 className="text-lg font-medium">설정된 목표</h3> */}
              {goalList.map((goal) => {
                const progress = calculateProgress(goal);
                const today = new Date();
                const daysRemaining = handleGetDaysRemaining(
                  String(today),
                  goal.endDate
                );
                return (
                  <Card
                    key={goal.goalsId}
                    onClick={() => setDetailGoal(goal)}
                    className={`cursor-pointer transition-shadow hover:shadow-md ${
                      goal.isExpired
                        ? 'bg-muted/60 border-muted/50'
                        : 'border-border'
                    }`}
                  >
                    <CardHeader
                      className={`pb-4 ${goal.isExpired ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <CardTitle
                          className={`text-lg ${goal.isExpired ? 'text-muted-foreground' : ''}`}
                        >
                          {goal.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(goal.isExpired, goal)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              // 카드 클릭(상세 열기)으로 번지지 않게
                              e.stopPropagation();
                              handleDeleteGoalModal(goal.goalsId);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                            title="목표 삭제"
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs">
                          {formatDate(goal.startDate)} ~{' '}
                          {formatDate(goal.endDate)}
                        </span>
                        {!goal.isExpired ? (
                          <span className="ml-2 text-primary font-medium">
                            ({daysRemaining}일 남음)
                          </span>
                        ) : (
                          <span className="ml-2 text-muted-foreground font-medium">
                            (종료된 목표)
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div
                        className={`grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ${goal.isExpired ? 'opacity-60' : ''}`}
                      >
                        <div>
                          <p className="text-muted-foreground">시작 체중</p>
                          <p className="font-medium">{goal.startWeight}kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">목표 체중</p>
                          <p className="font-medium">{goal.targetWeight}kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {goal.isExpired ? '최종 체중' : '현재 체중'}
                          </p>
                          <p className="font-medium">{goal.currentWeight}kg</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">목표까지</p>
                          <p className="font-medium">
                            {currentWeight
                              ? `${Math.abs(goal.currentWeight - goal.targetWeight).toFixed(1)}kg`
                              : '-'}
                          </p>
                        </div>
                      </div>

                      {!goal.isExpired &&
                        goal.currentWeight &&
                        daysRemaining > 0 &&
                        (() => {
                          const dailyLossInfo = calculateDailyWeightLoss(goal);
                          if (!dailyLossInfo) return null;

                          const statusInfo = getDailyLossStatus(
                            dailyLossInfo.status,
                            dailyLossInfo.isGain
                          );
                          return (
                            <div
                              className={`p-3 bg-primary/5 rounded-lg border border-primary/20 ${goal.isExpired ? 'opacity-60' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Scale className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    일일 권장 {dailyLossInfo.isGain}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">
                                    {dailyLossInfo.dailyLoss.toFixed(2)}kg/일
                                  </p>
                                  <p className={`text-xs ${statusInfo.color}`}>
                                    {statusInfo.message}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {dailyLossInfo.isGain ? (
                                  <>
                                    목표 달성을 위해 매일 약{' '}
                                    {dailyLossInfo.dailyLoss.toFixed(2)}kg씩
                                    체중을 늘려야 합니다.
                                  </>
                                ) : (
                                  <>
                                    목표 달성을 위해 매일 약{' '}
                                    {dailyLossInfo.dailyLoss.toFixed(2)}kg씩
                                    체중을 줄여야 합니다.
                                  </>
                                )}
                                {dailyLossInfo.status === 'aggressive' && (
                                  <span className="block mt-1 text-orange-600 text-xs">
                                    ⚠️ 너무 빠른 속도입니다. 건강을 위해 목표
                                    기간을 늘리는 것을 고려해보세요.
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      {!goal.isExpired && currentWeight && (
                        <div
                          className={`space-y-2 ${goal.isExpired ? 'opacity-60' : ''}`}
                        >
                          <div className="flex justify-between text-sm">
                            <span>진행률</span>
                            <span
                              className={
                                progress >= 80
                                  ? 'text-green-600 font-medium'
                                  : progress >= 50
                                    ? 'text-primary font-medium'
                                    : ''
                              }
                            >
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          {progress >= 80 && (
                            <p className="text-xs text-green-600 font-medium">
                              🎉 목표 달성이 가까워졌습니다!
                            </p>
                          )}
                        </div>
                      )}
                      {progress === 100 && goal.isExpired && (
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                            <p className="text-xs text-green-800 dark:text-green-200">
                              🎉 축하합니다! 목표를 성공적으로 달성했습니다.
                            </p>
                          </div>
                        </div>
                      )}
                      {progress < 100 && goal.isExpired && (
                        <div className="space-y-3">
                          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200">
                            <p className="text-xs text-red-800 dark:text-red-200">
                              💪 목표 달성에 실패했지만, 새로운 목표로 다시
                              도전해보세요!
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {goalList.length === 0 ||
            (!isAuthenticated && (
              <Card className="mt-4">
                <CardContent className="pt-6 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    아직 설정된 목표가 없습니다.
                  </h3>
                  <p className="text-muted-foreground">
                    첫 번째 체중 목표를 설정하여 건강한 변화를 시작해보세요!
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
      {/* 목표 상세 (M-023) */}
      <GoalDetailDrawer
        goal={detailGoal}
        open={detailGoal != null}
        onClose={() => setDetailGoal(null)}
        onCreateGoal={handleOpenCreateGoal}
      />
    </div>
  );
};

export default GoalSetting;
