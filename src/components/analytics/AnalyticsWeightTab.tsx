import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

import WeightDistributionChart from './WeightDistributionChart';
import WeightChangeChart from './WeightChangeChart';

import type {
  WeightDataPoint,
  WeightDistribution,
} from '../../types/Analytics.type.ts';

interface AnalyticsWeightTabProps {
  weightData: WeightDataPoint[];
  weightDistribution: WeightDistribution[];
  weightVolatility: number;
  currentStreak: number;
}

export default function AnalyticsWeightTab({
  weightData,
  weightDistribution,
  weightVolatility,
  currentStreak,
}: AnalyticsWeightTabProps) {
  const weights = weightData.map((d) => d.weight);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 체중 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>체중 분포</CardTitle>
            <CardDescription>기록된 체중의 빈도 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <WeightDistributionChart data={weightDistribution} />
          </CardContent>
        </Card>

        {/* 체중 변화 상세 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>일별 체중 변화</CardTitle>
                <CardDescription>일자별 체중 변화량 추이</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-muted-foreground">증가</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <span className="text-muted-foreground">감소</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WeightChangeChart data={weightData} />
          </CardContent>
        </Card>
      </div>

      {/* 체중 통계 요약 */}
      <Card>
        <CardHeader>
          <CardTitle>체중 통계 요약</CardTitle>
          <CardDescription>
            전체 기간 동안의 체중 관련 주요 통계
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-primary">
                {maxWeight.toFixed(1)}kg
              </div>
              <div className="text-sm text-muted-foreground">최고 체중</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-green-500">
                {minWeight.toFixed(1)}kg
              </div>
              <div className="text-sm text-muted-foreground">최저 체중</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-blue-500">
                {avgWeight.toFixed(1)}kg
              </div>
              <div className="text-sm text-muted-foreground">평균 체중</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-orange-500">
                {weightVolatility}kg
              </div>
              <div className="text-sm text-muted-foreground">변동성</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-purple-500">
                {weightData.length}일
              </div>
              <div className="text-sm text-muted-foreground">총 기록일</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-semibold text-pink-500">
                {currentStreak}일
              </div>
              <div className="text-sm text-muted-foreground">최대 연속</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
