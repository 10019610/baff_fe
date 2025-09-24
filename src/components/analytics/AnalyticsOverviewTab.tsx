import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import WeightTrendChart from './WeightTrendChart';
import BMITrendChart from './BMITrendChart';
import type { Goal } from '../../types/Goals.type';
import type { WeightDataPoint } from '../../types/Analytics.type';

interface AnalyticsOverviewTabProps {
  weightData: WeightDataPoint[];
  activeGoal: Goal | null;
  goalProgress: number;
  weeklyConsistency: number;
  winRate: number;
  currentStreak: number;
}

export default function AnalyticsOverviewTab({
  weightData,
  activeGoal,
  goalProgress,
  weeklyConsistency,
  winRate,
  currentStreak,
}: AnalyticsOverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 체중 변화 추이 */}
        <Card>
          <CardHeader>
            <CardTitle>체중 변화 추이</CardTitle>
            <CardDescription>최근 30일간의 체중 변화와 목표선</CardDescription>
          </CardHeader>
          <CardContent>
            <WeightTrendChart
              data={weightData}
              targetWeight={activeGoal?.targetWeight}
            />
          </CardContent>
        </Card>

        {/* BMI 트렌드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>BMI 트렌드</CardTitle>
                <CardDescription>체질량지수 변화 추이</CardDescription>
              </div>
              <div className="flex flex-col text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">저체중 (18.5↓)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-muted-foreground">정상 (18.5~25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-muted-foreground">과체중 (25~30)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-muted-foreground">비만 (30↑)</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BMITrendChart data={weightData} />
          </CardContent>
        </Card>
      </div>

      {/* 주요 성취도 */}
      <Card>
        <CardHeader>
          <CardTitle>이번 달 성취도</CardTitle>
          <CardDescription>목표 달성을 위한 핵심 지표들</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${goalProgress}, 100`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {Math.round(goalProgress)}%
                  </span>
                </div>
              </div>
              <h3 className="font-medium">목표 달성률</h3>
              <p className="text-sm text-muted-foreground">이번 달 진행률</p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${weeklyConsistency}, 100`}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {Math.round(weeklyConsistency)}%
                  </span>
                </div>
              </div>
              <h3 className="font-medium">체중 기록률</h3>
              <p className="text-sm text-muted-foreground">최근 7일간</p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${winRate}, 100`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {Math.round(winRate)}%
                  </span>
                </div>
              </div>
              <h3 className="font-medium">대결 승률</h3>
              <p className="text-sm text-muted-foreground">전체 승률</p>
            </div>

            <div className="text-center">
              <div className="relative mx-auto w-20 h-20 mb-3">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-muted/20"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(currentStreak * 3, 100)}, 100`}
                    className="text-orange-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">{currentStreak}</span>
                </div>
              </div>
              <h3 className="font-medium">연속 기록</h3>
              <p className="text-sm text-muted-foreground">연속 일수</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
