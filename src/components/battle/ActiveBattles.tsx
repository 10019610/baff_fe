import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Trophy, Calendar, Target, Zap, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getActiveBattles } from '../../services/api/activeBattle.api';
import { useEffect, useRef } from 'react';

interface ActiveBattlesProps {
  selectedEntryCode?: string | null;
  onBattleSelected?: () => void;
}

const ActiveBattles = ({
  selectedEntryCode,
  onBattleSelected,
}: ActiveBattlesProps) => {
  const battleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const {
    data: activeBattlesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['activeBattles'],
    queryFn: getActiveBattles,
    refetchOnWindowFocus: false,
  });

  // 선택된 대결로 스크롤하는 효과
  useEffect(() => {
    if (selectedEntryCode && activeBattlesData?.activeBattles) {
      const targetBattle = activeBattlesData.activeBattles.find(
        (battle) => battle.entryCode === selectedEntryCode
      );

      if (targetBattle) {
        const battleElement = battleRefs.current[selectedEntryCode];
        if (battleElement) {
          // 약간의 지연을 두고 스크롤 (DOM 렌더링 완료 후)
          setTimeout(() => {
            battleElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            // 스크롤 완료 후 선택 상태 초기화
            if (onBattleSelected) {
              setTimeout(() => onBattleSelected(), 1000);
            }
          }, 100);
        }
      }
    }
  }, [selectedEntryCode, activeBattlesData, onBattleSelected]);

  // 백엔드에서 모든 계산이 완료되어 오므로 별도 계산 함수 불필요

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-medium mb-3">
            대결 정보를 불러오는 중...
          </h3>
          <p className="text-muted-foreground">잠시만 기다려주세요</p>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-destructive" />
          <h3 className="text-xl font-medium mb-3">
            대결 정보를 불러올 수 없습니다
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeBattles = activeBattlesData?.activeBattles || [];

  if (activeBattles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-3">
            진행 중인 대결이 없습니다
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            새로운 상대를 찾아 대결을 시작하거나, 받은 대결 신청을 확인해보세요!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              상대 찾기에서 새로운 도전자를 만나보세요
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">활성 대결</p>
                <p className="text-2xl font-bold">{activeBattles.length}</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">승리 중</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    activeBattles.filter((battle) => battle.winner === 'me')
                      .length
                  }
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">평균 달성률</p>
                <p className="text-2xl font-bold">
                  {activeBattles.length > 0
                    ? Math.round(
                        activeBattles.reduce(
                          (acc, battle) => acc + battle.myProgress,
                          0
                        ) / activeBattles.length
                      )
                    : 0}
                  %
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Battles */}
      <div className="space-y-6">
        {activeBattles.map((battle) => {
          const isSelected = selectedEntryCode === battle.entryCode;
          return (
            <Card
              key={battle.entryCode}
              ref={(el) => {
                battleRefs.current[battle.entryCode] = el;
              }}
              className={`overflow-hidden transition-all duration-300 ${
                isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
              }`}
            >
              <CardHeader className="">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold">
                        {battle.roomName}
                      </span>
                      <span className="text-sm text-muted-foreground font-normal">
                        vs {battle.opponentNickname}
                      </span>
                    </div>
                  </CardTitle>
                  <Badge
                    variant={
                      battle.winner === 'me'
                        ? 'default'
                        : battle.winner === 'opponent'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="px-3 py-1"
                  >
                    {battle.winner === 'me'
                      ? '🏆 리드 중'
                      : battle.winner === 'opponent'
                        ? '😤 뒤쳐짐'
                        : '🤝 접전'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center justify-between gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(battle.startDate)} ~{' '}
                    {formatDate(battle.endDate)}
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {battle.daysRemaining}일 남음
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    시작 후 {battle.totalDays - battle.daysRemaining}일째
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Battle Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* My Progress */}
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                        나의 진행상황
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-500 text-white font-medium">
                          나
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">나</h4>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-xs text-muted-foreground">
                                현재
                              </span>
                              <span className="text-sm font-semibold text-blue-600">
                                {battle.myCurrentWeight}kg
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              시작: {battle.myStartWeight}kg
                            </div>
                            <div className="text-xs text-muted-foreground">
                              목표:{' '}
                              {(
                                battle.myStartWeight - battle.myTargetWeightLoss
                              ).toFixed(1)}
                              kg
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>진행률</span>
                          <span>
                            {Number(battle.myProgress.toFixed(0)) < 0
                              ? 0
                              : Number(battle.myProgress.toFixed(0))}
                            %
                          </span>
                        </div>
                        <Progress value={battle.myProgress} className="h-3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {battle.myWeightLoss > 0 ? '-' : '+'}
                          {Math.abs(battle.myWeightLoss).toFixed(1)}kg
                        </p>
                        <p className="text-xs text-muted-foreground">변화량</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {(
                            battle.myTargetWeightLoss - battle.myWeightLoss
                          ).toFixed(1)}
                          kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          목표까지
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opponent Progress */}
                  <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <h3 className="font-semibold text-orange-700 dark:text-orange-300">
                        상대방 진행상황
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-orange-500 text-white font-medium">
                          {battle.opponentNickname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate max-w-[120px] sm:max-w-none">
                            {battle.opponentNickname}
                          </h4>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-xs text-muted-foreground">
                                현재
                              </span>
                              <span className="text-sm font-semibold text-orange-600">
                                {battle.opponentCurrentWeight}kg
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              시작: {battle.opponentStartWeight}kg
                            </div>
                            <div className="text-xs text-muted-foreground">
                              목표:{' '}
                              {(
                                battle.opponentStartWeight -
                                battle.opponentTargetWeightLoss
                              ).toFixed(1)}
                              kg
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>진행률</span>
                          <span>
                            {Number(battle.opponentProgress.toFixed(0)) < 0
                              ? 0
                              : Number(battle.opponentProgress.toFixed(0))}
                            %
                          </span>
                        </div>
                        <Progress
                          value={battle.opponentProgress}
                          className="h-3"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div>
                        <p className="text-lg font-bold text-orange-600">
                          {battle.opponentWeightLoss > 0 ? '-' : '+'}
                          {Math.abs(battle.opponentWeightLoss).toFixed(1)}kg
                        </p>
                        <p className="text-xs text-muted-foreground">변화량</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-orange-600">
                          {(
                            battle.opponentTargetWeightLoss -
                            battle.opponentWeightLoss
                          ).toFixed(1)}
                          kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          목표까지
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Battle Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">나의 목표</p>
                    <p className="text-lg font-medium">
                      {battle.myTargetWeightLoss}kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">진행률 차이</p>
                    <p
                      className={`text-lg font-medium ${Math.abs(battle.myProgress - battle.opponentProgress) < 5 ? 'text-orange-500' : battle.myProgress > battle.opponentProgress ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {Math.abs(
                        Math.max(0, battle.myProgress) -
                          Math.max(0, battle.opponentProgress)
                      ).toFixed(0)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">전체 기간</p>
                    <p className="text-lg font-medium">{battle.totalDays}일</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">남은 시간</p>
                    <p
                      className={`text-lg font-medium ${battle.daysRemaining <= 3 ? 'text-red-500' : battle.daysRemaining <= 7 ? 'text-orange-500' : 'text-green-500'}`}
                    >
                      {battle.daysRemaining}일
                    </p>
                  </div>
                </div>

                {/* Motivational Message */}
                <div
                  className={`p-4 rounded-lg text-center ${
                    battle.winner === 'me'
                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                      : battle.winner === 'opponent'
                        ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                        : 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      battle.winner === 'me'
                        ? 'text-green-700 dark:text-green-300'
                        : battle.winner === 'opponent'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {battle.winner === 'me'
                      ? '🎉 훌륭합니다! 계속 이 페이스를 유지하세요!'
                      : battle.winner === 'opponent'
                        ? '💪 분발하세요! 아직 따라잡을 수 있어요!'
                        : '🔥 박빙의 승부! 조금만 더 노력하면 승리할 수 있어요!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
export default ActiveBattles;
