import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Tv, Eye, Users, Activity, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type { AdWatchSummary, AdWatchHistoryItem, PageResponse, TossAdPositionConfig } from '../../types/Admin.api.type.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/DateUtil.ts';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const LOCATION_LABELS: Record<string, string> = {
  EXCHANGE: '환전',
  ATTENDANCE_AD_BONUS: '출석 광고 보너스',
  ATTENDANCE_STREAK_SAVE: '출석 스트릭 세이브',
  WEIGHT_AD_BONUS: '체중 기록 광고 보너스',
  REVIEW_AD_BONUS: '리뷰 광고 보너스',
  AD_EVENT: '광고 이벤트',
};

type AdWatchSubTab = 'stats' | 'history' | 'tossAdConfig';

const SUB_TABS: { key: AdWatchSubTab; label: string; icon: React.ElementType }[] = [
  { key: 'stats', label: '시청 통계', icon: Tv },
  { key: 'history', label: '시청 내역', icon: Eye },
  { key: 'tossAdConfig', label: '토스광고 설정', icon: Settings },
];

const POSITION_LABELS: Record<string, string> = {
  EXCHANGE: '환전',
  ATTENDANCE_AD_BONUS: '출석 광고 보너스',
  ATTENDANCE_STREAK_SAVE: '출석 스트릭 세이브',
  WEIGHT_AD_BONUS: '체중 기록 광고 보너스',
  REVIEW_AD_BONUS: '리뷰 광고 보너스',
  AD_EVENT: '광고 이벤트',
};

const ALL_POSITIONS = Object.keys(POSITION_LABELS);

/* ─────────────────────────────── 서브탭: 시청 통계 ─────────────────────────────── */

const StatsSubTab = () => {
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
  } = useQuery<AdWatchSummary>({
    queryKey: ['admin-ad-watch-summary'],
    queryFn: () => adminApi.getAdWatchSummary().then((res) => res.data),
  });

  const summaryCards = [
    { label: '총 시청 수', value: summary?.totalWatchCount ?? 0, icon: Tv, color: 'text-blue-600' },
    { label: '오늘 시청 수', value: summary?.todayWatchCount ?? 0, icon: Eye, color: 'text-green-600' },
    { label: '시청한 유저 수', value: summary?.uniqueUsers ?? 0, icon: Users, color: 'text-purple-600' },
    { label: '오늘 시청 유저', value: summary?.todayUniqueUsers ?? 0, icon: Activity, color: 'text-yellow-600' },
  ];

  const locationTableHeader = [
    { id: 1, name: '시청 위치' },
    { id: 2, name: '횟수' },
  ];

  const getLocationLabel = (location: string) => LOCATION_LABELS[location] ?? location;

  if (isSummaryLoading) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>;
  }

  if (isSummaryError) {
    return (
      <div className="text-center py-8 text-destructive">
        요약 데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-sm font-medium">{card.label}</span>
                </div>
                <p className="text-2xl font-bold mt-2">{card.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 위치별 통계 */}
      {summary?.locationStats && summary.locationStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>위치별 시청 통계</CardTitle>
            <CardDescription>광고 시청 위치별 횟수</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {locationTableHeader.map((item) => (
                    <TableHead key={item.id}>{item.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.locationStats.map((stat) => (
                  <TableRow key={stat.location}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {getLocationLabel(stat.location)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {stat.count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
};

/* ─────────────────────────────── 서브탭: 시청 내역 ─────────────────────────────── */

const HistorySubTab = () => {
  const [page, setPage] = useState<number>(0);

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = useQuery<PageResponse<AdWatchHistoryItem>>({
    queryKey: ['admin-ad-watch-history', page],
    queryFn: () =>
      adminApi
        .getAdWatchHistory({ page, size: PAGE_SIZE })
        .then((res) => res.data),
  });

  const historyList = historyData?.content ?? [];
  const totalElements = historyData?.totalElements ?? 0;
  const totalPages = historyData?.totalPages ?? 0;

  const historyTableHeader = [
    { id: 1, name: '사용자' },
    { id: 2, name: '시청 위치' },
    { id: 3, name: '토스 응답' },
    { id: 4, name: '시청일시' },
  ];

  const getLocationLabel = (location: string) => LOCATION_LABELS[location] ?? location;

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'COMPLETED':
        return <Badge className="bg-green-500 text-white">완료</Badge>;
      case 'SKIPPED':
        return <Badge className="bg-yellow-500 text-white">스킵</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500 text-white">실패</Badge>;
      default:
        return <Badge variant="secondary">{response}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>시청 내역</CardTitle>
        <CardDescription>총 {totalElements}건의 광고 시청 내역</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isHistoryLoading ? (
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        ) : isHistoryError ? (
          <div className="text-center py-8 text-destructive">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {historyTableHeader.map((item) => (
                    <TableHead key={item.id}>{item.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {item.nickname} #{item.userId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getLocationLabel(item.watchLocation)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getResponseBadge(item.tossAdResponse)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(item.regDateTime)}
                    </TableCell>
                  </TableRow>
                ))}
                {historyList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={historyTableHeader.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      시청 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

/* ─────────────────────────────── 서브탭: 토스광고 설정 ─────────────────────────────── */

interface PositionFormState {
  tossAdRatio: number;
  tossAdGroupId: string;
  isTossAdEnabled: boolean;
  tossImageAdGroupId: string;
  tossImageAdRatio: number;
  isTossImageAdEnabled: boolean;
}

const TossAdConfigSubTab = () => {
  const queryClient = useQueryClient();

  const { data: configs, isLoading, isError } = useQuery<TossAdPositionConfig[]>({
    queryKey: ['admin-toss-ad-configs'],
    queryFn: () => adminApi.getTossAdConfigs().then((res) => res.data),
  });

  const [formStates, setFormStates] = useState<Record<string, PositionFormState>>({});

  useEffect(() => {
    if (!configs) return;

    const configMap: Record<string, TossAdPositionConfig> = {};
    for (const c of configs) {
      configMap[c.position] = c;
    }

    const newFormStates: Record<string, PositionFormState> = {};
    for (const position of ALL_POSITIONS) {
      const existing = configMap[position];
      newFormStates[position] = {
        tossAdRatio: existing?.tossAdRatio ?? 30,
        tossAdGroupId: existing?.tossAdGroupId ?? '',
        isTossAdEnabled: existing?.isTossAdEnabled ?? false,
        tossImageAdGroupId: existing?.tossImageAdGroupId ?? '',
        tossImageAdRatio: existing?.tossImageAdRatio ?? 0,
        isTossImageAdEnabled: existing?.isTossImageAdEnabled ?? false,
      };
    }
    setFormStates(newFormStates);
  }, [configs]);

  const updateMutation = useMutation({
    mutationFn: ({ position, data }: { position: string; data: Parameters<typeof adminApi.updateTossAdConfig>[1] }) =>
      adminApi.updateTossAdConfig(position, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-toss-ad-configs'] });
      toast.success('설정이 저장되었습니다.');
    },
    onError: () => {
      toast.error('설정 저장에 실패했습니다.');
    },
  });

  const handleFieldChange = (position: string, field: keyof PositionFormState, value: string | number | boolean) => {
    setFormStates((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        [field]: value,
      },
    }));
  };

  const handleSave = (position: string) => {
    const state = formStates[position];
    if (!state) return;

    updateMutation.mutate({
      position,
      data: {
        tossAdRatio: state.tossAdRatio,
        tossAdGroupId: state.tossAdGroupId || null,
        isTossAdEnabled: state.isTossAdEnabled,
        tossImageAdGroupId: state.tossImageAdGroupId || null,
        tossImageAdRatio: state.tossImageAdRatio,
        isTossImageAdEnabled: state.isTossImageAdEnabled,
      },
    });
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-destructive">
        토스광고 설정을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ALL_POSITIONS.map((position) => {
        const state = formStates[position];
        if (!state) return null;

        return (
          <Card key={position}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{POSITION_LABELS[position]}</CardTitle>
                <Badge className={state.isTossAdEnabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                  {state.isTossAdEnabled ? '활성' : '비활성'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 활성/비활성 토글 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">토스광고 활성화</label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.isTossAdEnabled}
                  onClick={() => handleFieldChange(position, 'isTossAdEnabled', !state.isTossAdEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.isTossAdEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.isTossAdEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 토스광고 비율 */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">토스광고 비율 (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={state.tossAdRatio}
                  onChange={(e) => handleFieldChange(position, 'tossAdRatio', Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 토스광고 그룹 ID */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">토스광고 그룹 ID</label>
                <input
                  type="text"
                  value={state.tossAdGroupId}
                  onChange={(e) => handleFieldChange(position, 'tossAdGroupId', e.target.value)}
                  placeholder="그룹 ID를 입력하세요"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 이미지 배너 구분선 */}
              <div className="border-t pt-3 mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-3">이미지 배너 광고</p>

                {/* 이미지 배너 활성/비활성 */}
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">이미지 배너 활성화</label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.isTossImageAdEnabled}
                    onClick={() => handleFieldChange(position, 'isTossImageAdEnabled', !state.isTossImageAdEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      state.isTossImageAdEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        state.isTossImageAdEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* 이미지 배너 비율 */}
                <div className="space-y-1 mb-3">
                  <label className="text-sm font-medium text-gray-700">이미지 배너 비율 (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={state.tossImageAdRatio}
                    onChange={(e) => handleFieldChange(position, 'tossImageAdRatio', Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* 이미지 배너 그룹 ID */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">이미지 배너 그룹 ID</label>
                  <input
                    type="text"
                    value={state.tossImageAdGroupId}
                    onChange={(e) => handleFieldChange(position, 'tossImageAdGroupId', e.target.value)}
                    placeholder="이미지 배너 그룹 ID"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 저장 버튼 */}
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleSave(position)}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? '저장 중...' : '저장'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────── 메인 컴포넌트 ─────────────────────────────── */

/**
 * 어드민 페이지 광고 시청 관리 탭 컴포넌트
 *
 * @description
 * - React Query로 서버 사이드 페이징
 * - 3개 서브탭: 시청 통계 / 시청 내역 / 토스광고 설정
 *
 * @author hjkim
 */
const AdminAdWatchManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState<AdWatchSubTab>('stats');

  return (
    <div className="space-y-6">
      {/* 서브탭 */}
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeSubTab === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSubTab(key)}
            className="flex items-center gap-1"
          >
            <Icon className="w-3 h-3" />
            {label}
          </Button>
        ))}
      </div>

      {/* 서브탭 컨텐츠 */}
      {activeSubTab === 'stats' && <StatsSubTab />}
      {activeSubTab === 'history' && <HistorySubTab />}
      {activeSubTab === 'tossAdConfig' && <TossAdConfigSubTab />}
    </div>
  );
};

export default AdminAdWatchManagement;
