import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  Scale,
  Target,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
  Award,
} from 'lucide-react';
import type { GetGoalListResponse } from '../../types/Goals.api.type';
import type { WeightEntry } from '../../types/WeightTracker.api.type';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface WeightStats {
  currentWeight: number;
  totalChange: number;
  recordedDays: number;
}

interface DashboardProps {
  onNavigate?: (menuId: string) => void;
  entries: WeightEntry[];
  goals: GetGoalListResponse[];
  goalList: GetGoalListResponse[];
  refetchGoalList: () => void;
  weightStats: WeightStats;
}

const Dashboard = ({
  entries,
  goals,
  goalList: _goalList, // eslint-disable-line @typescript-eslint/no-unused-vars
  refetchGoalList: _refetchGoalList, // eslint-disable-line @typescript-eslint/no-unused-vars
  weightStats,
}: DashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const getCurrentStats = () => {
    if (entries.length === 0 || weightStats.currentWeight === 0) return null;

    const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date));
    const currentWeight = weightStats.currentWeight; // 85.9

    // 최근 변화량은 마지막 기록의 change 값을 사용
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    const recentChange = lastEntry?.change || 0;

    const totalChange = weightStats.totalChange; // -3.1

    return {
      currentWeight,
      recentChange,
      totalChange,
      totalDays: weightStats.recordedDays, // 3
    };
  };

  const getActiveGoal = () => {
    const today = new Date().toISOString().split('T')[0];
    return (
      goals.find((goal) => today <= goal.endDate && goal.isExpired === false) ||
      null
    );
  };

  const stats = getCurrentStats();
  const activeGoal = getActiveGoal();
  const hasData = stats !== null;
  const hasGoals = goals.length > 0;

  // 첫 방문 또는 데이터 없는 경우
  if (!hasData) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8 px-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Scale className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-semibold">
            ChangeUp에 오신 것을 환영합니다!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            체중 관리를 더 쉽고 재미있게. 목표를 설정하고, 친구들과 함께
            도전하세요.
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate('/weightTracker')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    체중 기록하기
                  </CardTitle>
                  <CardDescription>첫 번째 체중을 기록해보세요</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  매일 체중을 기록하여 변화를 추적하세요
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate('/goals')}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    목표 설정하기
                  </CardTitle>
                  <CardDescription>체중 목표를 설정해보세요</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  주간 또는 월간 목표로 동기부여를 받으세요
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <Card className="mx-4">
          <CardHeader className="text-center">
            <CardTitle>ChangeUp으로 할 수 있는 것들</CardTitle>
            <CardDescription>체중 관리의 모든 기능을 한곳에서</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg w-fit mx-auto">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium">상세한 분석</h4>
                <p className="text-sm text-muted-foreground">
                  체중 변화를 차트와 그래프로 시각화
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg w-fit mx-auto">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <h4 className="font-medium">친구와 대결</h4>
                <p className="text-sm text-muted-foreground">
                  최대 4명과 함께 체중 관리 챌린지
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg w-fit mx-auto">
                  <Target className="h-6 w-6 text-cyan-600" />
                </div>
                <h4 className="font-medium">목표 달성</h4>
                <p className="text-sm text-muted-foreground">
                  개인 맞춤 목표 설정과 달성률 추적
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 데이터가 있는 경우의 대시보드
  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto px-3 sm:px-4">
      {/* Welcome Back */}
      <div className="space-y-4">
        {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-semibold">
              안녕하세요 {user?.nickname}님!👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              오늘도 건강한 하루 되세요
            </p>
          </div>

          {/* 데스크톱용 버튼들 */}
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/weightTracker')}
            >
              <Plus className="h-4 w-4 mr-1" />
              체중 기록
            </Button>
            <Button size="sm" onClick={() => navigate('/analytics')}>
              <BarChart3 className="h-4 w-4 mr-1" />
              분석 보기
            </Button>
          </div>
        </div>

        {/* 모바일용 버튼들 - 전체 너비 */}
        <div className="flex sm:hidden gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate('/weightTracker')}
          >
            <Plus className="h-4 w-4 mr-1" />
            체중 기록
          </Button>
          <Button className="flex-1" onClick={() => navigate('/analytics')}>
            <BarChart3 className="h-4 w-4 mr-1" />
            분석 보기
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  현재 체중
                </p>
                <p className="text-lg sm:text-xl font-semibold">
                  {stats.currentWeight}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {stats.recentChange >= 0 ? (
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              )}
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  최근 변화
                </p>
                <p className="text-lg sm:text-xl font-semibold">
                  {stats.recentChange >= 0 ? '+' : ''}
                  {stats.recentChange.toFixed(1)}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  총 변화
                </p>
                <p className="text-lg sm:text-xl font-semibold">
                  {stats.totalChange >= 0 ? '+' : ''}
                  {stats.totalChange.toFixed(1)}kg
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  기록 일수
                </p>
                <p className="text-lg sm:text-xl font-semibold">
                  {stats.totalDays}일
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goal or Goal Suggestion */}
      {activeGoal ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>진행 중인 목표</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/goals')}
              >
                자세히 보기
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{activeGoal.title}</h3>
                <Badge variant="secondary">
                  {Math.ceil(
                    (new Date(activeGoal.endDate).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                  일 남음
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>진행률</span>
                  <span>
                    {activeGoal.startWeight}kg → {activeGoal.targetWeight}kg
                  </span>
                </div>

                {(() => {
                  const totalChange =
                    activeGoal.targetWeight - activeGoal.startWeight;
                  const currentChange =
                    stats.currentWeight - activeGoal.startWeight;
                  const progress =
                    totalChange === 0
                      ? 100
                      : Math.min(
                          Math.max((currentChange / totalChange) * 100, 0),
                          100
                        );

                  return (
                    <>
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {progress.toFixed(0)}% 달성 (목표까지{' '}
                        {Math.abs(
                          stats.currentWeight - activeGoal.targetWeight
                        ).toFixed(1)}
                        kg)
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Target className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="font-medium">목표를 설정해보세요</h3>
                <p className="text-sm text-muted-foreground">
                  체중 목표를 설정하면 더 체계적인 관리가 가능합니다
                </p>
              </div>
              <Button onClick={() => navigate('goals')} className="mt-4">
                <Target className="h-4 w-4 mr-2" />
                목표 설정하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate('/weightTracker')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">
                  체중 기록
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  오늘의 체중을 기록하세요
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate('analytics')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">
                  분석 보기
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  상세한 분석과 인사이트
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => navigate('battle')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="text-sm sm:text-base font-medium group-hover:text-primary transition-colors">
                  대결 모드
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  친구들과 함께 도전하세요
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Summary */}
      {hasGoals && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-500" />
                <CardTitle>목표 현황</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('goals')}
              >
                전체 보기
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">
                  {goals.filter((g) => g.isExpired === true).length}
                </p>
                <p className="text-sm text-muted-foreground">종료</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600">
                  {goals.filter((g) => g.isExpired === false).length}
                </p>
                <p className="text-sm text-muted-foreground">진행중</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-orange-600">
                  {goals.length}
                </p>
                <p className="text-sm text-muted-foreground">총 목표</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
