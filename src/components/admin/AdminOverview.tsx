import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Users, UserPlus, Swords, Star, Activity, Clock } from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type {
  AdminStats,
  UserGrowth,
  WeightTrend,
  PlatformDistribution,
  RecentActivity,
} from '../../types/Admin.api.type.ts';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const periods = [
  { value: 'DAILY', label: '일별' },
  { value: 'WEEKLY', label: '주별' },
  { value: 'MONTHLY', label: '월별' },
] as const;

type Period = (typeof periods)[number]['value'];

const PIE_COLORS = ['#3b82f6', '#FEE102', '#0064FF', '#ef4444', '#8b5cf6', '#3DDC84', '#8E8E93'];

const ACTIVITY_ICON_MAP: Record<string, typeof Activity> = {
  SIGNUP: UserPlus,
  BATTLE: Swords,
  REVIEW: Star,
  WEIGHT: Activity,
};

/**
 * 어드민 대시보드 개요(Overview) 탭 컴포넌트
 *
 * @description
 * - KPI 카드 4개 (총 사용자 / 이번 주 신규 / 활성 배틀 / 총 리뷰)
 * - 사용자 증가 BarChart + 체중 기록 추이 LineChart (기간 선택)
 * - 플랫폼 분포 PieChart + 최근 활동 피드
 *
 * @author hjkim
 */
const AdminOverview = () => {
  const [userGrowthPeriod, setUserGrowthPeriod] = useState<Period>('DAILY');
  const [weightTrendPeriod, setWeightTrendPeriod] = useState<Period>('DAILY');

  // ── 데이터 페칭 ──
  const {
    data: stats,
    isLoading: loadingStats,
    isError: errorStats,
  } = useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((res) => res.data),
  });

  const {
    data: userGrowth,
    isLoading: loadingUserGrowth,
    isError: errorUserGrowth,
  } = useQuery<UserGrowth[]>({
    queryKey: ['admin', 'userGrowth', userGrowthPeriod],
    queryFn: () => adminApi.getUserGrowth(userGrowthPeriod).then((res) => res.data),
  });

  const {
    data: weightTrend,
    isLoading: loadingWeightTrend,
    isError: errorWeightTrend,
  } = useQuery<WeightTrend[]>({
    queryKey: ['admin', 'weightTrend', weightTrendPeriod],
    queryFn: () => adminApi.getWeightTrend(weightTrendPeriod).then((res) => res.data),
  });

  const {
    data: platformDist,
    isLoading: loadingPlatform,
    isError: errorPlatform,
  } = useQuery<PlatformDistribution[]>({
    queryKey: ['admin', 'platformDistribution'],
    queryFn: () => adminApi.getPlatformDistribution().then((res) => res.data),
  });

  const {
    data: recentActivities,
    isLoading: loadingActivities,
    isError: errorActivities,
  } = useQuery<RecentActivity[]>({
    queryKey: ['admin', 'recentActivities'],
    queryFn: () => adminApi.getRecentActivities().then((res) => res.data),
  });

  // ── KPI 카드 설정 ──
  const kpiCards = [
    {
      title: '총 사용자',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: '이번 주 신규',
      value: stats?.newUsersThisWeek ?? 0,
      icon: UserPlus,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: '활성 배틀',
      value: stats?.activeBattles ?? 0,
      icon: Swords,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: '총 리뷰',
      value: stats?.totalReviews ?? 0,
      icon: Star,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  // ── 로딩 / 에러 ──
  if (loadingStats) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">로딩 중...</div>
    );
  }

  if (errorStats) {
    return (
      <div className="flex items-center justify-center py-16 text-red-500">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── KPI 카드 4개 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bg}`}>
                    <Icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── 사용자 증가 차트 + 플랫폼 분포 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 사용자 증가 BarChart (2/3) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">사용자 증가 추이</CardTitle>
              <PeriodSelector value={userGrowthPeriod} onChange={setUserGrowthPeriod} />
            </div>
          </CardHeader>
          <CardContent>
            {loadingUserGrowth ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                로딩 중...
              </div>
            ) : errorUserGrowth ? (
              <div className="flex items-center justify-center h-[300px] text-red-500">
                데이터를 불러올 수 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="label"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="신규 사용자" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 플랫폼 분포 PieChart (1/3) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">플랫폼 분포</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPlatform ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                로딩 중...
              </div>
            ) : errorPlatform ? (
              <div className="flex items-center justify-center h-[300px] text-red-500">
                데이터를 불러올 수 없습니다
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={platformDist?.map((d) => ({ ...d }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="platform"
                      paddingAngle={2}
                    >
                      {platformDist?.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {platformDist?.map((item, index) => (
                    <Badge key={item.platform} variant="outline" className="gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      {item.platform} ({item.count})
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── 체중 기록 추이 + 최근 활동 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 체중 기록 추이 LineChart (2/3) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">체중 기록 추이</CardTitle>
              <PeriodSelector value={weightTrendPeriod} onChange={setWeightTrendPeriod} />
            </div>
          </CardHeader>
          <CardContent>
            {loadingWeightTrend ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                로딩 중...
              </div>
            ) : errorWeightTrend ? (
              <div className="flex items-center justify-center h-[300px] text-red-500">
                데이터를 불러올 수 없습니다
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="label"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    tickLine={false}
                  />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10b981' }}
                    activeDot={{ r: 5 }}
                    name="체중 기록 수"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 최근 활동 (1/3) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                로딩 중...
              </div>
            ) : errorActivities ? (
              <div className="flex items-center justify-center h-[300px] text-red-500">
                데이터를 불러올 수 없습니다
              </div>
            ) : (
              <div className="space-y-3 max-h-[340px] overflow-y-auto">
                {recentActivities?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    최근 활동이 없습니다
                  </p>
                )}
                {recentActivities?.map((activity, index) => {
                  const Icon = ACTIVITY_ICON_MAP[activity.type] ?? Activity;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-full bg-gray-100">
                        <Icon className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-snug">{activity.message}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;

// ── 내부 컴포넌트 ──

/** 기간 선택 버튼 그룹 */
const PeriodSelector = ({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) => (
  <div className="flex gap-1">
    {periods.map((p) => (
      <Button
        key={p.value}
        variant={value === p.value ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange(p.value)}
      >
        {p.label}
      </Button>
    ))}
  </div>
);

/** 상대 시간 포맷 (예: "3분 전", "2시간 전", "어제") */
function formatRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return '-';
  const now = new Date();
  const target = new Date(timestamp);
  const diffMs = now.getTime() - target.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;

  return target.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}
