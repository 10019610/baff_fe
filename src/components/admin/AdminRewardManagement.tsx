import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Coins, TrendingUp, Settings, BarChart3, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type { AdminRewardSummary, AdminRewardConfig, AdminRewardExchange, PageResponse } from '../../types/Admin.api.type.ts';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate } from '../../utils/DateUtil.ts';

const PAGE_SIZE = 20;

/** 서브탭 정의 */
const SUB_TABS = [
  { value: 'overview', icon: TrendingUp, label: '현황' },
  { value: 'economy', icon: Coins, label: '조각 경제' },
  { value: 'config', icon: Settings, label: '설정' },
  { value: 'stats', icon: BarChart3, label: '통계' },
  { value: 'exchange', icon: ArrowRightLeft, label: '환전' },
] as const;

type SubTabValue = (typeof SUB_TABS)[number]['value'];

/** Empty State */
const EmptyState = ({ icon: Icon, message, description }: { icon: typeof Coins; message: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
    <Icon className="h-12 w-12 mb-4 opacity-50" />
    <p className="text-lg font-medium">{message}</p>
    <p className="text-sm mt-1">{description}</p>
  </div>
);

/** 금액 포맷팅 */
const formatAmount = (amount: number) => amount.toLocaleString('ko-KR');

// ─────────────────────────────────────────
// 서브탭 1: 현황
// ─────────────────────────────────────────
const RewardOverviewSubTab = () => {
  const { data: summary, isLoading, isError } = useQuery<AdminRewardSummary>({
    queryKey: ['adminRewardSummary'],
    queryFn: () => adminApi.getRewardSummary().then((res) => res.data),
    retry: 1,
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>;
  }

  if (isError || !summary) {
    return (
      <EmptyState
        icon={TrendingUp}
        message="아직 데이터가 없습니다"
        description="리워드 시스템이 활성화되면 여기에 표시됩니다"
      />
    );
  }

  const kpiCards = [
    { label: '총 발행 조각', value: `${formatAmount(summary.totalIssuedPieces)}개`, color: 'text-blue-600' },
    { label: '총 소각 조각', value: `${formatAmount(summary.totalBurnedPieces)}개`, color: 'text-red-600' },
    { label: '현재 유통량', value: `${formatAmount(summary.currentCirculating)}개`, color: 'text-green-600' },
    { label: '총 환전 금액', value: `${formatAmount(summary.totalExchangeAmount)}원`, color: 'text-purple-600' },
    { label: '오늘 발행', value: `${formatAmount(summary.todayIssuedPieces)}개`, color: 'text-blue-600' },
    { label: '오늘 소각', value: `${formatAmount(summary.todayBurnedPieces)}개`, color: 'text-red-600' },
    { label: '활성 리워드 유저', value: `${summary.activeRewardUsers}명`, color: 'text-green-600' },
    { label: '대기중 환전', value: `${summary.pendingExchanges}건`, color: 'text-yellow-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiCards.map((card) => (
        <Card key={card.label}>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────
// 서브탭 2: 조각 경제
// ─────────────────────────────────────────
const PieceEconomySubTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          조각 경제 대시보드
        </CardTitle>
        <CardDescription>발행/소각 추이 및 유통량 변화</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={Coins}
          message="조각 경제 차트 준비 중"
          description="리워드 시스템 활성화 후 발행/소각 추이가 차트로 표시됩니다"
        />
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────
// 서브탭 3: 설정
// ─────────────────────────────────────────
const RewardConfigSubTab = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery<PageResponse<AdminRewardConfig>>({
    queryKey: ['adminRewardConfigs', page],
    queryFn: () => adminApi.getRewardConfigs({ page, size: PAGE_SIZE }).then((res) => res.data),
    retry: 1,
  });

  const configList = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const tableHeader = [
    { id: 1, name: '리워드 타입' },
    { id: 2, name: '액션 타입' },
    { id: 3, name: '조각 수량' },
    { id: 4, name: '설명' },
    { id: 5, name: '상태' },
    { id: 6, name: '등록일' },
    { id: 7, name: '수정일' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          리워드 설정
        </CardTitle>
        <CardDescription>리워드 발급 규칙 설정 목록</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        ) : isError || configList.length === 0 ? (
          <EmptyState
            icon={Settings}
            message="설정된 리워드 규칙이 없습니다"
            description="리워드 시스템이 활성화되면 설정 목록이 표시됩니다"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeader.map((item) => (
                    <TableHead key={item.id}>{item.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {configList.map((config) => (
                  <TableRow key={config.configId}>
                    <TableCell className="whitespace-nowrap font-medium">{config.rewardType}</TableCell>
                    <TableCell className="whitespace-nowrap">{config.actionType}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatAmount(config.pieceAmount)}개</TableCell>
                    <TableCell>
                      <div className="min-w-[150px]">{config.description}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={config.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}>
                        {config.isActive ? '활성' : '비활성'}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(config.regDateTime)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(config.modDateTime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
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

// ─────────────────────────────────────────
// 서브탭 4: 통계
// ─────────────────────────────────────────
const RewardStatsSubTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          리워드 타입별 통계
        </CardTitle>
        <CardDescription>리워드 타입별 발급 현황 및 추이</CardDescription>
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={BarChart3}
          message="통계 차트 준비 중"
          description="리워드 시스템 활성화 후 타입별 통계가 차트로 표시됩니다"
        />
      </CardContent>
    </Card>
  );
};

// ─────────────────────────────────────────
// 서브탭 5: 환전
// ─────────────────────────────────────────
const ExchangeHistorySubTab = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery<PageResponse<AdminRewardExchange>>({
    queryKey: ['adminRewardExchanges', page],
    queryFn: () => adminApi.getRewardExchanges({ page, size: PAGE_SIZE }).then((res) => res.data),
    retry: 1,
  });

  const exchangeList = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const tableHeader = [
    { id: 1, name: '환전 ID' },
    { id: 2, name: '사용자' },
    { id: 3, name: '조각 수량' },
    { id: 4, name: '환전 금액' },
    { id: 5, name: '상태' },
    { id: 6, name: '신청일' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-500 text-white">대기중</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500 text-white">완료</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500 text-white">거절</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          환전 내역
        </CardTitle>
        <CardDescription>조각 환전 신청 내역</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        ) : isError || exchangeList.length === 0 ? (
          <EmptyState
            icon={ArrowRightLeft}
            message="환전 내역이 없습니다"
            description="환전 신청이 발생하면 여기에 표시됩니다"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeader.map((item) => (
                    <TableHead key={item.id}>{item.name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeList.map((exchange) => (
                  <TableRow key={exchange.exchangeId}>
                    <TableCell className="whitespace-nowrap font-medium">#{exchange.exchangeId}</TableCell>
                    <TableCell className="whitespace-nowrap">{exchange.nickname}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatAmount(exchange.pieceAmount)}개</TableCell>
                    <TableCell className="whitespace-nowrap">{formatAmount(exchange.exchangeAmount)}원</TableCell>
                    <TableCell className="whitespace-nowrap">{getStatusBadge(exchange.status)}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(exchange.regDateTime)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
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

// ─────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────

/**
 * 어드민 페이지 리워드/조각 경제 관리 탭 컴포넌트
 *
 * @description
 * - 나만그래 RewardManagement 서브탭 패턴 참조
 * - 5개 서브탭: 현황 / 조각 경제 / 설정 / 통계 / 환전
 * - BE 리워드 기능 비활성화 상태이므로 empty state 대응
 *
 * @author hjkim
 */
const AdminRewardManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState<SubTabValue>('overview');

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Coins className="w-5 h-5" />
          리워드 / 조각 경제 관리
        </h2>
      </div>

      {/* 서브탭 */}
      <div className="flex flex-wrap gap-2">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.value}
              variant={activeSubTab === tab.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSubTab(tab.value)}
              className="flex items-center gap-1"
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* 서브탭 컨텐츠 */}
      {activeSubTab === 'overview' && <RewardOverviewSubTab />}
      {activeSubTab === 'economy' && <PieceEconomySubTab />}
      {activeSubTab === 'config' && <RewardConfigSubTab />}
      {activeSubTab === 'stats' && <RewardStatsSubTab />}
      {activeSubTab === 'exchange' && <ExchangeHistorySubTab />}
    </div>
  );
};

export default AdminRewardManagement;
