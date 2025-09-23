import { Award, Trophy, Zap, Users } from 'lucide-react';
import type { BattleStats } from '../../types/Analytics.type';
import type { ChartDataInput } from '../../types/Chart.type';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../ui/card';
import { ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AnalyticsBattleTabProps {
  battleStats: BattleStats[];
  winRate: number;
  totalBattles: number;
  maxStreak: number;
}

const AnalyticsBattleTab = ({
  battleStats,
  winRate,
  totalBattles,
  maxStreak,
}: AnalyticsBattleTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>대결 성과</CardTitle>
            <CardDescription>전체 대결 결과</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={battleStats as ChartDataInput[]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {battleStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {battleStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-sm">
                    {stat.name} : {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>대결 통계</CardTitle>
            <CardDescription>상세한 대결 성과 분석</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span>총 대결 수</span>
              </div>
              <span className="font-semibold">{totalBattles}회</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span>승률</span>
              </div>
              <span className="font-semibold">{Math.round(winRate)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span>현재 진행중</span>
              </div>
              <span className="font-semibold">{battleStats[2].value}개</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-500" />
                <span>최고 연승</span>
              </div>
              <span className="font-semibold">{maxStreak}연승</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsBattleTab;
