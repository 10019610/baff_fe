import { useState, useEffect } from 'react';
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
  requestId?: string;
}

// 초기 데이터
const getInitialBattles = (): Battle[] => [
  {
    id: 'battle-1',
    opponent: '김철수',
    opponentId: '1',
    myStartWeight: 70.0,
    opponentStartWeight: 75.5,
    targetWeightLoss: 3.0,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'active',
    myCurrentWeight: 68.5,
    opponentCurrentWeight: 74.2,
  },
  {
    id: 'battle-2',
    opponent: '강수진',
    opponentId: '10',
    myStartWeight: 70.0,
    opponentStartWeight: 61.8,
    targetWeightLoss: 2.0,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    status: 'active',
    myCurrentWeight: 69.2,
    opponentCurrentWeight: 60.9,
  },
];

const ActiveBattles = () => {
  const [battles, setBattles] = useState<Battle[]>([]);

  useEffect(() => {
    // TODO: API 연동 후 실제 배틀 데이터를 가져오도록 구현
    const initialBattles = getInitialBattles();
    setBattles(initialBattles);
  }, []);

  const getCurrentWeight = () => {
    // TODO: API 연동 후 실제 사용자 몸무게 데이터를 가져오도록 구현
    return 70.0; // 임시 기본값
  };

  const updateBattleProgress = (battle: Battle) => {
    const currentWeight = getCurrentWeight();

    const daysElapsed = Math.floor(
      (Date.now() - new Date(battle.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const totalDays = Math.floor(
      (new Date(battle.endDate).getTime() -
        new Date(battle.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const progressRatio = Math.min(daysElapsed / totalDays, 1);

    const opponentEfficiency = 0.8 + Math.random() * 0.4;
    const opponentCurrentWeight =
      battle.opponentStartWeight -
      battle.targetWeightLoss * progressRatio * opponentEfficiency;

    return {
      ...battle,
      myCurrentWeight: currentWeight,
      opponentCurrentWeight: Math.round(opponentCurrentWeight * 10) / 10,
    };
  };

  const calculateMyProgress = (battle: Battle) => {
    if (!battle.myCurrentWeight) return 0;
    const weightLoss = battle.myStartWeight - battle.myCurrentWeight;
    return Math.min((weightLoss / battle.targetWeightLoss) * 100, 100);
  };

  const calculateOpponentProgress = (battle: Battle) => {
    if (!battle.opponentCurrentWeight) return 0;
    const weightLoss =
      battle.opponentStartWeight - battle.opponentCurrentWeight;
    return Math.min((weightLoss / battle.targetWeightLoss) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const getDaysElapsed = (startDate: string) => {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const getBattleWinner = (battle: Battle) => {
    const myProgress = calculateMyProgress(battle);
    const opponentProgress = calculateOpponentProgress(battle);

    if (myProgress > opponentProgress) return 'me';
    if (opponentProgress > myProgress) return 'opponent';
    return 'tie';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const activeBattles = battles
    .map((battle) => updateBattleProgress(battle))
    .filter((battle) => battle.status === 'active');

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    activeBattles.filter(
                      (battle) => getBattleWinner(battle) === 'me'
                    ).length
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
                <p className="text-sm text-muted-foreground">평균 진행률</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    activeBattles.reduce(
                      (acc, battle) => acc + calculateMyProgress(battle),
                      0
                    ) / activeBattles.length
                  )}
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
          const myProgress = calculateMyProgress(battle);
          const opponentProgress = calculateOpponentProgress(battle);
          const daysRemaining = getDaysRemaining(battle.endDate);
          const daysElapsed = getDaysElapsed(battle.startDate);
          const winner = getBattleWinner(battle);
          const myWeightLoss = battle.myCurrentWeight
            ? battle.myStartWeight - battle.myCurrentWeight
            : 0;
          const opponentWeightLoss = battle.opponentCurrentWeight
            ? battle.opponentStartWeight - battle.opponentCurrentWeight
            : 0;

          return (
            <Card key={battle.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-primary" />
                    vs {battle.opponent}
                  </CardTitle>
                  <Badge
                    variant={
                      winner === 'me'
                        ? 'default'
                        : winner === 'opponent'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="px-3 py-1"
                  >
                    {winner === 'me'
                      ? '🏆 리드 중'
                      : winner === 'opponent'
                        ? '😤 뒤쳐짐'
                        : '🤝 접전'}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(battle.startDate)} ~{' '}
                    {formatDate(battle.endDate)}
                  </span>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {daysRemaining}일 남음
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    시작 후 {daysElapsed}일째
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Battle Progress */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* My Progress */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-500 text-white font-medium">
                          나
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">나</h4>
                          <span className="text-sm text-muted-foreground">
                            {battle.myCurrentWeight}kg
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>진행률</span>
                          <span>{myProgress.toFixed(0)}%</span>
                        </div>
                        <Progress value={myProgress} className="h-3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {myWeightLoss.toFixed(1)}kg
                        </p>
                        <p className="text-xs text-muted-foreground">감량</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-600">
                          {(battle.targetWeightLoss - myWeightLoss).toFixed(1)}
                          kg
                        </p>
                        <p className="text-xs text-muted-foreground">
                          목표까지
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Opponent Progress */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-orange-500 text-white font-medium">
                          {battle.opponent[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{battle.opponent}</h4>
                          <span className="text-sm text-muted-foreground">
                            {battle.opponentCurrentWeight}kg
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>진행률</span>
                          <span>{opponentProgress.toFixed(0)}%</span>
                        </div>
                        <Progress value={opponentProgress} className="h-3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div>
                        <p className="text-lg font-bold text-orange-600">
                          {opponentWeightLoss.toFixed(1)}kg
                        </p>
                        <p className="text-xs text-muted-foreground">감량</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-orange-600">
                          {(
                            battle.targetWeightLoss - opponentWeightLoss
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
                    <p className="text-sm text-muted-foreground">목표 감량</p>
                    <p className="text-lg font-medium">
                      {battle.targetWeightLoss}kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">차이</p>
                    <p
                      className={`text-lg font-medium ${Math.abs(myProgress - opponentProgress) < 5 ? 'text-orange-500' : myProgress > opponentProgress ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {Math.abs(myProgress - opponentProgress).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">전체 기간</p>
                    <p className="text-lg font-medium">
                      {Math.ceil(
                        (new Date(battle.endDate).getTime() -
                          new Date(battle.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                      일
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">남은 시간</p>
                    <p
                      className={`text-lg font-medium ${daysRemaining <= 3 ? 'text-red-500' : daysRemaining <= 7 ? 'text-orange-500' : 'text-green-500'}`}
                    >
                      {daysRemaining}일
                    </p>
                  </div>
                </div>

                {/* Motivational Message */}
                <div
                  className={`p-4 rounded-lg text-center ${
                    winner === 'me'
                      ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                      : winner === 'opponent'
                        ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                        : 'bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      winner === 'me'
                        ? 'text-green-700 dark:text-green-300'
                        : winner === 'opponent'
                          ? 'text-red-700 dark:text-red-300'
                          : 'text-orange-700 dark:text-orange-300'
                    }`}
                  >
                    {winner === 'me'
                      ? '🎉 훌륭합니다! 계속 이 페이스를 유지하세요!'
                      : winner === 'opponent'
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
