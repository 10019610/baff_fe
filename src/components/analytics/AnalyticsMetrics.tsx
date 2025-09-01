import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  Scale,
  Heart,
  Target,
  Flame,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { BMICategory } from '../../types/Analytics.type';

interface AnalyticsMetricsProps {
  currentWeight: number;
  weightChange: number;
  currentBMI: number;
  bmiCategory: BMICategory;
  goalProgress: number;
  goalWeight: number;
  currentStreak: number;
}

const AnalyticsMetrics = ({
  currentWeight,
  weightChange,
  currentBMI,
  bmiCategory,
  goalProgress,
  goalWeight,
  currentStreak,
}: AnalyticsMetricsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">현재 체중</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{currentWeight}kg</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {weightChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            {Math.abs(weightChange).toFixed(1)}kg 어제 대비
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BMI 지수</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{currentBMI.toFixed(1)}</div>
          <div className={`text-xs font-medium ${bmiCategory.color}`}>
            {bmiCategory.category}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">목표 달성률</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {Math.round(goalProgress)}%
          </div>
          <Progress value={goalProgress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            목표까지 {Math.abs(currentWeight - goalWeight).toFixed(1)}kg
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">연속 기록</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold flex items-center gap-1">
            {currentStreak}
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-xs text-muted-foreground">일 연속 기록 중</p>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">변화 속도</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold flex items-center gap-1">
            {weightVelocity >= 0 ? (
              <ArrowUp className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-green-500" />
            )}
            {Math.abs(weightVelocity)}kg
          </div>
          <p className="text-xs text-muted-foreground">주간 평균 변화량</p>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default AnalyticsMetrics;
