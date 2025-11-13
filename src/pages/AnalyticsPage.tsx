import {
  ArrowRight,
  Calendar,
  Plus,
  RefreshCw,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { goalsInitializer } from '../types/Goal.initializer';
import { api } from '../services/api/Api';
import WeightSetupGuide from '../components/weightTracker/WeightSetupGuide';
import type {
  GetWeightListResponse,
  WeightResponseDto,
  WeightEntry,
} from '../types/WeightTracker.api.type';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader';
import { useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Alert } from '../components/ui/alert';
import { AlertDescription } from '../components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import WeightChart from '../components/weightTracker/WeightChart';
import { Badge } from '../components/ui/badge';
import type { Goal } from '../types/Goals.type';
import type { GetCurrentWeightInfoResponse } from '../types/Goals.api.type';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import AnalyticsOverviewTab from '../components/analytics/AnalyticsOverviewTab';
import AnalyticsMetrics from '../components/analytics/AnalyticsMetrics';
import {
  calculateBMI,
  calculateMaxStreak,
  calculateStreak,
  calculateVolatility,
  convertWeightEntries,
  generateBattleStats,
  generateWeightDistribution,
  getBMICategory,
} from '../utils/AnalyticsUtils';
import AnalyticsWeightTab from '../components/analytics/AnalyticsWeightTab';
import AnalyticsBattleTab from '../components/analytics/AnalyticsBattleTab';
import {
  getActiveBattles,
  getEndedBattles,
} from '../services/api/activeBattle.api';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // state
  // const [timeRange, setTimeRange] = useState('30d');

  // 네비게이션 핸들러
  const handleNavigate = (menuId: string) => {
    if (menuId === 'tracker') {
      navigate('/weightTracker');
    }
    if (menuId === 'goals') {
      navigate('/goals');
    }
  };

  // 설정된 목표 리스트 조회 api
  const { data: goalList, isLoading: isGoalListLoading } = useQuery({
    queryKey: ['goal'],
    initialData: goalsInitializer.INITIAL_GET_GOAL_LIST,
    queryFn: () => {
      return api.get('/goals/getGoalsList').then((res) => {
        return res.data;
      });
    },
  });

  // 체중 기록 목록 조회 api
  const { data: weightData, isLoading: isWeightDataLoading } = useQuery({
    queryKey: ['weightEntries', user?.id],
    queryFn: async (): Promise<{
      entries: WeightEntry[];
      currentWeight: number;
      totalChange: number;
      recordedDays: number;
    }> => {
      if (!user?.id)
        return {
          entries: [],
          currentWeight: 0,
          totalChange: 0,
          recordedDays: 0,
        };

      try {
        const response = await api.get('/weight/getWeightList');
        const data: GetWeightListResponse = response.data;

        // 날짜순으로 정렬 (오래된 것부터)
        const sortedRecords = [...data.dailyWeightRecords].sort((a, b) =>
          a.recordDate.localeCompare(b.recordDate)
        );

        // 전일 대비 변화량 계산
        const convertedEntries: WeightEntry[] = sortedRecords.map(
          (record: WeightResponseDto, index: number) => {
            // 전일 대비 변화량 계산 (첫 번째 기록은 변화량 0)
            const previousRecord = index > 0 ? sortedRecords[index - 1] : null;
            const change = previousRecord
              ? record.recordWeight - previousRecord.recordWeight
              : 0;

            return {
              id: `${record.recordDate}_${index}`,
              userId: user.id,
              date: record.recordDate.split('T')[0],
              weight: record.recordWeight,
              change: Number(change.toFixed(1)),
              createdAt: record.recordDate,
              updatedAt: record.recordDate,
            };
          }
        );

        const result = {
          entries: convertedEntries,
          currentWeight: data.currentWeight, // 85.9
          totalChange: Number(data.totalWeightChange.toFixed(1)), // -3.1 (반올림)
          recordedDays: data.recordedDays, // 3
        };
        return result;
      } catch (error) {
        console.warn('getWeightList API not available:', error);
        return {
          entries: [],
          currentWeight: 0,
          totalChange: 0,
          recordedDays: 0,
        };
      }
    },
    enabled: !!user?.id,
  });

  // 진행중인 배틀 조회 api
  const { data: activeBattlesData, isLoading: isActiveBattlesLoading } =
    useQuery({
      queryKey: ['activeBattles', user?.id],
      queryFn: getActiveBattles,
      enabled: !!user?.id,
    });

  // 종료된 배틀 조회 api
  const { data: endedBattlesData, isLoading: isEndedBattlesLoading } = useQuery(
    {
      queryKey: ['endedBattles', user?.id],
      queryFn: getEndedBattles,
      enabled: !!user?.id,
    }
  );

  const battleStats = useMemo(
    () =>
      generateBattleStats(
        activeBattlesData?.activeBattles || [],
        endedBattlesData?.activeBattles || []
      ),
    [activeBattlesData, endedBattlesData]
  );

  const totalBattles = useMemo(() => {
    const activeCount = activeBattlesData?.activeBattles?.length || 0;
    const endedCount = endedBattlesData?.activeBattles?.length || 0;
    return activeCount + endedCount;
  }, [activeBattlesData, endedBattlesData]);
  const winRate = useMemo(() => {
    if (
      !endedBattlesData?.activeBattles ||
      endedBattlesData.activeBattles.length === 0
    ) {
      return 0;
    }

    const wonBattles = endedBattlesData.activeBattles.filter(
      (battle) => battle.winner === 'me'
    ).length;

    const lostBattles = endedBattlesData.activeBattles.filter(
      (battle) => battle.winner === 'opponent'
    ).length;

    const totalEndedBattles = wonBattles + lostBattles;

    return totalEndedBattles > 0
      ? Math.round((wonBattles / totalEndedBattles) * 100)
      : 0;
  }, [endedBattlesData]);

  const maxStreak = useMemo(
    () => calculateMaxStreak(endedBattlesData?.activeBattles || []),
    [endedBattlesData]
  );

  // 주간 일관성 계산 (최근 7일간 기록한 일수 / 7일)
  const weeklyConsistency = useMemo(() => {
    if (!weightData?.entries || weightData.entries.length === 0) return 0;

    // 가장 최근 기록 날짜를 기준으로 7일 계산
    const sortedEntries = [...weightData.entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestDate = new Date(sortedEntries[0].date);
    const sevenDaysAgo = new Date(
      latestDate.getTime() - 6 * 24 * 60 * 60 * 1000
    ); // 오늘 포함 7일

    // 해당 기간의 기록 수 계산
    const recentEntries = sortedEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= sevenDaysAgo && entryDate <= latestDate;
    });

    const uniqueDays = new Set(recentEntries.map((entry) => entry.date)).size;
    return Math.round((uniqueDays / 7) * 100);
  }, [weightData]);
  /* 현재 체중기록 확인 api */

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
  const weightDistribution = useMemo(
    () =>
      generateWeightDistribution(
        convertWeightEntries(weightData?.entries || [], user?.height) || []
      ),
    [weightData]
  );
  //  const weightVelocity = calculateWeightVelocity(convertWeightEntries(weightData?.entries || [], user?.height) || []);
  const weightVolatility = calculateVolatility(
    convertWeightEntries(weightData?.entries || [], user?.height) || []
  );
  /* 진행률 계산 handler */
  const calculateProgress = (goal: Goal) => {
    // weightData.currentWeight를 사용 (더 신뢰할 수 있는 데이터)
    const currentWeight =
      weightData?.currentWeight || getCurrentWeightInfo?.currentWeight;

    if (!currentWeight || !goal) return 0;

    const totalChange = goal.targetWeight - goal.startWeight;
    const currentChange = currentWeight - goal.startWeight;

    if (totalChange === 0) return 100;

    const progress = (currentChange / totalChange) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // 어제 대비 변화량 계산
  const calculateYesterdayChange = () => {
    if (!weightData?.entries || weightData.entries.length < 2) return null;

    const sortedEntries = [...weightData.entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const latestEntry = sortedEntries[sortedEntries.length - 1];
    const previousEntry = sortedEntries[sortedEntries.length - 2];

    return latestEntry.weight - previousEntry.weight;
  };

  const yesterdayChange = calculateYesterdayChange();

  const goalProgress = calculateProgress(goalList[goalList.length - 1]);
  const currentBMI = calculateBMI(
    weightData?.currentWeight || getCurrentWeightInfo?.currentWeight || 0,
    user?.height || 170
  );
  const bmiCategory = getBMICategory(currentBMI);

  // 로딩 상태
  if (
    isGoalListLoading ||
    isWeightDataLoading ||
    isActiveBattlesLoading ||
    isEndedBattlesLoading
  ) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">분석 리포트</h1>
            <p className="text-muted-foreground">
              데이터를 로딩하고 있습니다...
            </p>
          </div>
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // 첫 번째 단계: 체중 기록이 없는 경우
  if (!weightData?.entries || weightData.entries.length === 0) {
    return (
      <WeightSetupGuide
        onNavigate={handleNavigate}
        title="분석 리포트"
        description="체중 데이터를 분석하여 건강 관리 인사이트를 제공합니다"
        showAlert={true}
      />
    );
  }

  // 두 번째 단계: 체중은 있지만 목표가 없는 경우
  if (
    weightData &&
    weightData?.entries &&
    weightData.entries.length > 0 &&
    goalList.length === 0
  ) {
    return (
      <div className="space-y-6">
        <AnalyticsHeader
        // timeRange={timeRange}
        // onTimeRangeChange={setTimeRange}
        />

        {/* 목표 설정 필요 알림 */}
        <Alert className="border-primary/20 bg-primary/5">
          <Target className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary-foreground">
            <div className="flex items-center justify-between">
              <span className="text-xs">
                체중 기록 <strong>{weightData.entries.length}개</strong>가
                완료되었습니다!
                <div className="mt-1">
                  이제 <strong>목표를 설정</strong>하여 더 정확한 분석을
                  받아보세요.
                </div>
              </span>
              <Button
                size="sm"
                onClick={() => handleNavigate('goals')}
                className="ml-4 h-10"
              >
                <Plus className="h-4 w-4 mr-1" />
                목표 설정하기
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>체중 변화 추이</CardTitle>
            {/* <CardDescription>
              현재까지 기록된 체중 변화 (목표 설정 후 더 정확한 분석 제공)
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="">
              <CardContent className="p-6">
                <WeightChart entries={weightData.entries} dashboard={false} />
              </CardContent>
            </div>
          </CardContent>
        </Card>
        {/* 현재 상태 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">현재 체중</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {weightData.currentWeight}kg
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {yesterdayChange !== null ? (
                  <>
                    {yesterdayChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    {yesterdayChange >= 0 ? '+' : ''}
                    {yesterdayChange.toFixed(1)}kg 전일 대비
                  </>
                ) : (
                  <>
                    {weightData.totalChange >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    {Math.abs(weightData.totalChange).toFixed(1)}kg 시작 대비
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 변화량</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {weightData.totalChange >= 0 ? '+' : ''}
                {weightData.totalChange.toFixed(1)}kg
              </div>
              <p className="text-xs text-muted-foreground">시작 대비 변화량</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">기록 일수</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">
                {calculateStreak(
                  convertWeightEntries(weightData.entries, user?.height)
                )}
                일
              </div>
              <p className="text-xs text-muted-foreground">총 기록된 일수</p>
            </CardContent>
          </Card>
        </div>
        {/* 목표 설정 권장 카드 */}
        <Card className="border-dashed border-2 border-primary/30">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4">
              <Target className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>목표를 설정하여 분석을 완성하세요</CardTitle>
            <CardDescription>
              목표 설정 후 다음 기능들을 이용할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">목표 달성률 추적</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  실시간으로 목표 달성 진행률을 확인할 수 있습니다
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">개인화된 인사이트</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  목표 기반의 맞춤형 건강 관리 조언을 받을 수 있습니다
                </p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <Button
                size="lg"
                onClick={() => handleNavigate('goals')}
                className="group cursor-pointer"
              >
                <Target className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                목표 설정하러 가기
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 세 번째 단계: 완전한 분석 페이지
  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      {/* timeRange={timeRange} onTimeRangeChange={setTimeRange} 헤더에 기간을 넣을 경우 추가 */}
      {goalList.length > 0 && (
        <Alert className="border-primary/20 bg-primary/5">
          <Target className="h-4 w-4 text-primary" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                현재 목표: <strong>{goalList[0].title}</strong>
                <div>(목표 체중: {goalList[0].targetWeight}kg)</div>
              </span>
              <Badge variant="default" className="ml-20">
                {calculateProgress(goalList[0]).toFixed(0)}% 달성
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {/* 핵심 지표 카드들 (건강 점수 제거) */}
      <AnalyticsMetrics
        currentWeight={
          weightData?.currentWeight || getCurrentWeightInfo?.currentWeight || 0
        }
        weightChange={yesterdayChange || 0}
        currentBMI={currentBMI}
        bmiCategory={bmiCategory}
        goalProgress={goalProgress}
        goalWeight={goalList[goalList.length - 1].targetWeight}
        currentStreak={calculateStreak(
          convertWeightEntries(weightData.entries, user?.height)
        )}
        weightData={weightData.entries}
      />
      {/* 차트 섹션  */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-blue-50">
          <TabsTrigger value="overview">종합</TabsTrigger>
          <TabsTrigger value="weight">체중 분석</TabsTrigger>
          <TabsTrigger value="battles">대결 성과</TabsTrigger>
          {/* <TabsTrigger value="health">건강 지표</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsOverviewTab
            weightData={convertWeightEntries(weightData.entries, user?.height)}
            activeGoal={goalList[goalList.length - 1]}
            goalProgress={Number(
              calculateProgress(goalList[goalList.length - 1]).toFixed(0)
            )}
            winRate={winRate}
            currentStreak={calculateStreak(
              convertWeightEntries(weightData.entries, user?.height)
            )}
            weeklyConsistency={weeklyConsistency}
          />
        </TabsContent>

        <TabsContent value="weight">
          <AnalyticsWeightTab
            weightData={convertWeightEntries(weightData.entries, user?.height)}
            weightDistribution={weightDistribution}
            weightVolatility={weightVolatility}
            currentStreak={calculateStreak(
              convertWeightEntries(weightData.entries, user?.height)
            )}
          />
        </TabsContent>

        <TabsContent value="battles">
          <AnalyticsBattleTab
            battleStats={battleStats}
            winRate={winRate}
            totalBattles={totalBattles}
            maxStreak={maxStreak}
          />
        </TabsContent>

        {/* <TabsContent value="health">
          <div className="text-center py-8">
            <p className="text-muted-foreground">건강 지표 탭 구현 예정</p>
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  );

  // return <div>AnalyticsPage - 체중 데이터가 있습니다!</div>;
};

export default AnalyticsPage;
