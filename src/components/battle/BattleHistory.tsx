import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
  Calendar,
  Trophy,
  Target,
  Award,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { getEndedBattles } from '../../services/api/activeBattle.api';
import type { BattleSummaryData } from '../../types/ActiveBattle.type';

interface Battle {
  id: string;
  opponent: string;
  opponentId: string;
  myStartWeight: number;
  opponentStartWeight: number;
  targetWeightLoss: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  myCurrentWeight?: number;
  opponentCurrentWeight?: number;
  result?: 'me' | 'opponent' | 'tie';
  myFinalWeight?: number;
  opponentFinalWeight?: number;
}

// BattleSummaryData를 Battle 인터페이스로 변환하는 헬퍼 함수
const convertToBattle = (battle: BattleSummaryData): Battle => ({
  id: battle.entryCode,
  opponent: battle.opponentNickname,
  opponentId: battle.opponentUserId.toString(),
  myStartWeight: battle.myStartWeight,
  opponentStartWeight: battle.opponentStartWeight,
  targetWeightLoss: battle.myTargetWeightLoss,
  startDate: battle.startDate,
  endDate: battle.endDate,
  status: 'completed' as const,
  myCurrentWeight: battle.myCurrentWeight,
  opponentCurrentWeight: battle.opponentCurrentWeight,
  result:
    battle.winner === 'me'
      ? ('me' as const)
      : battle.winner === 'opponent'
        ? ('opponent' as const)
        : ('tie' as const),
  myFinalWeight: battle.myCurrentWeight,
  opponentFinalWeight: battle.opponentCurrentWeight,
});

// Mock completed battles for demonstration (API 데이터가 없을 때 사용)
const getMockCompletedBattles = (): Battle[] => [
  {
    id: 'completed-1',
    opponent: '이영희',
    opponentId: '2',
    myStartWeight: 72.0,
    opponentStartWeight: 58.2,
    targetWeightLoss: 3.0,
    startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'completed',
    result: 'me',
    myFinalWeight: 69.2,
    opponentFinalWeight: 56.8,
  },
  {
    id: 'completed-2',
    opponent: '박민수',
    opponentId: '3',
    myStartWeight: 69.2,
    opponentStartWeight: 82.1,
    targetWeightLoss: 2.5,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'completed',
    result: 'opponent',
    myFinalWeight: 67.8,
    opponentFinalWeight: 79.2,
  },
  {
    id: 'completed-3',
    opponent: '최지영',
    opponentId: '4',
    myStartWeight: 71.5,
    opponentStartWeight: 63.7,
    targetWeightLoss: 2.0,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() - 76 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'completed',
    result: 'tie',
    myFinalWeight: 69.6,
    opponentFinalWeight: 61.8,
  },
];

interface BattleHistoryProps {
  selectedRoomEntryCode?: string;
}

export default function BattleHistory({
  selectedRoomEntryCode,
}: BattleHistoryProps) {
  const [completedBattles, setCompletedBattles] = useState<Battle[]>([]);

  // TanStack Query를 사용하여 종료된 대결 데이터 가져오기
  const {
    data: endedBattlesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['endedBattles'],
    queryFn: getEndedBattles,
  });

  useEffect(() => {
    if (endedBattlesData?.activeBattles) {
      // API 데이터를 Battle 형식으로 변환
      const apiBattles = endedBattlesData.activeBattles.map(convertToBattle);
      setCompletedBattles(apiBattles);
    } else {
      // API 데이터가 없으면 목데이터 사용
      const savedBattles = localStorage.getItem('weightBattles');
      const realCompletedBattles = savedBattles
        ? JSON.parse(savedBattles).filter(
            (battle: Battle) => battle.status === 'completed'
          )
        : [];

      const allCompletedBattles = [
        ...realCompletedBattles,
        ...getMockCompletedBattles(),
      ];
      setCompletedBattles(allCompletedBattles);
    }
  }, [endedBattlesData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (battle: Battle) => {
    const myWeightLoss =
      battle.myStartWeight - (battle.myFinalWeight || battle.myStartWeight);
    const myProgress = (myWeightLoss / battle.targetWeightLoss) * 100;

    const opponentWeightLoss =
      battle.opponentStartWeight -
      (battle.opponentFinalWeight || battle.opponentStartWeight);
    const opponentProgress =
      (opponentWeightLoss / battle.targetWeightLoss) * 100;

    return { myProgress, opponentProgress, myWeightLoss, opponentWeightLoss };
  };

  const getResultBadge = (result?: 'me' | 'opponent' | 'tie') => {
    switch (result) {
      case 'me':
        return (
          <Badge className="bg-green-500 text-white gap-1">
            <Trophy className="h-3 w-3" />
            승리
          </Badge>
        );
      case 'opponent':
        return (
          <Badge variant="destructive" className="gap-1">
            <TrendingDown className="h-3 w-3" />
            패배
          </Badge>
        );
      case 'tie':
        return (
          <Badge variant="secondary" className="gap-1">
            <Target className="h-3 w-3" />
            무승부
          </Badge>
        );
      default:
        return <Badge variant="outline">완료</Badge>;
    }
  };

  const getStats = () => {
    const total = completedBattles.length;
    const won = completedBattles.filter((b) => b.result === 'me').length;
    const lost = completedBattles.filter((b) => b.result === 'opponent').length;
    const draw = completedBattles.filter((b) => b.result === 'tie').length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

    const totalWeightLost = completedBattles.reduce((sum, battle) => {
      const myWeightLoss =
        battle.myStartWeight - (battle.myFinalWeight || battle.myStartWeight);
      return sum + Math.max(0, myWeightLoss);
    }, 0);

    return { total, won, lost, draw, winRate, totalWeightLost };
  };

  // 특정 방이 선택된 경우 해당 방의 기록만 필터링
  const filteredBattles = selectedRoomEntryCode
    ? completedBattles.filter((battle) => battle.id === selectedRoomEntryCode)
    : completedBattles;

  const stats = getStats();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-medium mb-3">
            대결 기록을 불러오는 중...
          </h3>
          <p className="text-muted-foreground">잠시만 기다려주세요</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-3">
            대결 기록을 불러올 수 없습니다
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (completedBattles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-3">
            아직 완료된 대결이 없습니다
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            대결을 완료하면 여기에 기록과 통계가 표시됩니다. 첫 번째 대결을
            시작해보세요!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            승패 기록, 체중 감량 성과 등을 확인할 수 있습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  if (selectedRoomEntryCode && filteredBattles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-3">
            선택한 방의 기록이 없습니다
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            해당 방에서 완료된 대결 기록이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="space-y-4">
        {/* 모바일: 상위 통계 (2x2 그리드) */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <p className="text-xl font-bold text-primary">
                    {stats.total}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">총 대결</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-green-600" />
                  <p className="text-xl font-bold text-green-600">
                    {stats.won}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">승리</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-xl font-bold text-red-600">{stats.lost}</p>
                </div>
                <p className="text-xs text-muted-foreground">패배</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <p className="text-xl font-bold text-blue-600">
                    {stats.winRate}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">승률</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 모바일: 총 감량 하이라이트 카드 */}
        <Card className="md:hidden">
          <CardContent className="pt-6 pb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.totalWeightLost.toFixed(1)}kg
                  </p>
                  <p className="text-sm text-muted-foreground">총 변화량</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                대결을 통해 달성한 체중 관리 성과입니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 데스크톱: 기존 5열 그리드 */}
        <div className="hidden md:grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-muted-foreground">총 대결</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.won}</p>
                <p className="text-sm text-muted-foreground">승리</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
                <p className="text-sm text-muted-foreground">패배</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.winRate}%
                </p>
                <p className="text-sm text-muted-foreground">승률</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalWeightLost.toFixed(1)}kg
                </p>
                <p className="text-sm text-muted-foreground">총 감량</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Battle History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            대결 기록
          </CardTitle>
          <CardDescription>
            완료된 대결들의 상세 결과를 확인해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredBattles
            .sort(
              (a, b) =>
                new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
            )
            .map((battle) => {
              const {
                myProgress,
                opponentProgress,
                myWeightLoss,
                opponentWeightLoss,
              } = calculateProgress(battle);
              const duration = getDuration(battle.startDate, battle.endDate);

              return (
                <div key={battle.id}>
                  {/* 데스크톱: 기존 상세 레이아웃 */}
                  <Card className="hidden md:block p-6 hover:bg-muted/50 transition-colors">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {battle.opponent[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              vs {battle.opponent}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(battle.startDate)} ~{' '}
                              {formatDate(battle.endDate)} ({duration}일)
                            </p>
                          </div>
                        </div>
                        {getResultBadge(battle.result)}
                      </div>

                      {/* Results */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* My Result */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">나</span>
                            <span className="text-sm text-muted-foreground">
                              {battle.myStartWeight}kg → {battle.myFinalWeight}
                              kg
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>감량: {myWeightLoss.toFixed(1)}kg</span>
                              <span>달성률: {myProgress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(myProgress, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Opponent Result */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {battle.opponent}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {battle.opponentStartWeight}kg →{' '}
                              {battle.opponentFinalWeight}kg
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                감량: {opponentWeightLoss.toFixed(1)}kg
                              </span>
                              <span>
                                달성률: {opponentProgress.toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(opponentProgress, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Battle Info */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>목표: {battle.targetWeightLoss}kg 감량</span>
                          <span>기간: {duration}일</span>
                        </div>
                        {battle.result === 'me' && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <Award className="h-4 w-4" />
                            승리 보너스
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* 모바일: 간소화된 레이아웃 */}
                  <Card className="md:hidden p-4 hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      {/* 상단: 대결 상대와 결과 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                              {battle.opponent[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm">
                              vs {battle.opponent}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(battle.endDate)} • {duration}일간
                            </p>
                          </div>
                        </div>
                        {getResultBadge(battle.result)}
                      </div>

                      {/* 핵심 결과 요약 */}
                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">내 감량</span>
                          <span className="font-medium text-blue-600">
                            {myWeightLoss.toFixed(1)}kg ({myProgress.toFixed(0)}
                            %)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            상대 감량
                          </span>
                          <span className="font-medium text-orange-600">
                            {opponentWeightLoss.toFixed(1)}kg (
                            {opponentProgress.toFixed(0)}%)
                          </span>
                        </div>

                        {/* 진행률 비교 바 */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>목표 달성률 비교</span>
                            <span>목표: {battle.targetWeightLoss}kg</span>
                          </div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            {/* 내 진행률 */}
                            <div
                              className="absolute top-0 left-0 h-1.5 bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(myProgress, 100)}%`,
                              }}
                            />
                            {/* 상대 진행률 */}
                            <div
                              className="absolute bottom-0 left-0 h-1.5 bg-orange-500 rounded-full"
                              style={{
                                width: `${Math.min(opponentProgress, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-600">• 나</span>
                            <span className="text-orange-600">
                              • {battle.opponent}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 체중 변화 상세 (접을 수 있는 영역) */}
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                          <span>체중 변화 상세</span>
                          <svg
                            className="h-4 w-4 transition-transform group-open:rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </summary>
                        <div className="mt-2 pt-2 border-t space-y-2">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground mb-1">나</p>
                              <p className="font-medium">
                                {battle.myStartWeight}kg →{' '}
                                {battle.myFinalWeight}kg
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground mb-1">
                                {/* {battle.opponent} */}
                                상대
                              </p>
                              <p className="font-medium">
                                {battle.opponentStartWeight}kg →{' '}
                                {battle.opponentFinalWeight}kg
                              </p>
                            </div>
                          </div>
                          {battle.result === 'me' && (
                            <div className="flex items-center gap-1 text-sm text-green-600 pt-1">
                              <Award className="h-4 w-4" />
                              승리 보너스 획득(*구현예정)
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  </Card>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
