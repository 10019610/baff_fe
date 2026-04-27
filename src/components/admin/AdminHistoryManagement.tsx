import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table.tsx';
import {
  History,
  Scale,
  Coins,
  ArrowRightLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Activity,
} from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type {
  LoginHistoryItem,
  WeightHistoryItem,
  PageResponse,
  RewardHistoryItem,
  AttendanceHistoryItem,
  ActivityItem,
} from '../../types/Admin.api.type.ts';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate } from '../../utils/DateUtil.ts';

type HistorySubTab =
  | 'activity'
  | 'login'
  | 'weight'
  | 'reward'
  | 'exchange'
  | 'attendance';

const SUB_TABS: {
  key: HistorySubTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: 'activity', label: '활동기록', icon: Activity },
  { key: 'login', label: '로그인 내역', icon: LogIn },
  { key: 'weight', label: '체중 기록', icon: Scale },
  { key: 'reward', label: '리워드 적립', icon: Coins },
  { key: 'exchange', label: '환전 내역', icon: ArrowRightLeft },
  { key: 'attendance', label: '출석 내역', icon: Calendar },
];

const PAGE_SIZE = 20;

/* ─────────────────────────────── 서브탭: 로그인 내역 ─────────────────────────────── */

const LoginHistorySubTab = () => {
  const [page, setPage] = useState<number>(0);

  const { data, isLoading, isError } = useQuery<PageResponse<LoginHistoryItem>>(
    {
      queryKey: ['admin-login-histories', page],
      queryFn: () =>
        adminApi
          .getLoginHistories({ page, size: PAGE_SIZE })
          .then((res) => res.data),
    }
  );

  const list = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const tableHeader = [
    { id: 1, name: '사용자' },
    { id: 2, name: 'UserAgent' },
    { id: 3, name: '로그인 일시' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>로그인 내역</CardTitle>
        <CardDescription>총 {totalElements}건의 로그인 기록</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
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
                {list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{row.nickname}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        #{row.userId}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-xs text-muted-foreground">
                      {row.userAgent}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.loginDateTime)}
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeader.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      로그인 내역이 없습니다.
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
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
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

/* ─────────────────────────────── 서브탭: 체중 기록 ─────────────────────────────── */

const WeightHistorySubTab = () => {
  const [page, setPage] = useState<number>(0);

  const { data, isLoading, isError } = useQuery<
    PageResponse<WeightHistoryItem>
  >({
    queryKey: ['admin-weight-histories', page],
    queryFn: () =>
      adminApi
        .getWeightHistories({ page, size: PAGE_SIZE })
        .then((res) => res.data),
  });

  const list = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const tableHeader = [
    { id: 1, name: '사용자' },
    { id: 2, name: '체중 (kg)' },
    { id: 3, name: '기록일' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>체중 기록</CardTitle>
        <CardDescription>총 {totalElements}건의 체중 기록</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
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
                {list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{row.nickname}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        #{row.userId}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="secondary">{row.weight} kg</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.recordDate)}
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={tableHeader.length}
                      className="text-center py-8 text-muted-foreground"
                    >
                      체중 기록이 없습니다.
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
                    onClick={() =>
                      setPage((p) => Math.min(totalPages - 1, p + 1))
                    }
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

/* ─────────────────────────────── 서브탭: 활동기록 (통합 timeline) ─────────────────────────────── */

const ACTIVITY_TYPE_LABEL: Record<string, string> = {
  TOSS_POINT_GRANT: '토스포인트',
  REWARD: '리워드',
  SIGNUP: '회원가입',
  WEIGHT: '체중기록',
  GOAL: '목표',
  BATTLE: '대결',
};

const ActivitySubTab = () => {
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isError } = useQuery<PageResponse<ActivityItem>>({
    queryKey: ['admin-activities', page],
    queryFn: () =>
      adminApi.getActivities({ page, size: 50 }).then((res) => res.data),
  });
  const list = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>활동기록</CardTitle>
        <CardDescription>
          총 {totalElements}건 (회원가입/체중/리워드/환전/목표/대결 통합)
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">불러오기 실패</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>사용자</TableHead>
                  <TableHead>내용</TableHead>
                  <TableHead>일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((row, i) => (
                  <TableRow key={`${row.type}-${row.refId}-${i}`}>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="outline">
                        {ACTIVITY_TYPE_LABEL[row.type] ?? row.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{row.nickname}</span>
                      {row.userId != null && (
                        <span className="text-muted-foreground text-xs ml-1">
                          #{row.userId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate">
                      {row.summary}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.occurredAt ? formatDate(row.occurredAt) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      활동 기록이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
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

/* ─────────────────────────────── 서브탭: 리워드 적립 ─────────────────────────────── */

const RewardHistorySubTab = () => {
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isError } = useQuery<
    PageResponse<RewardHistoryItem>
  >({
    queryKey: ['admin-reward-histories', page],
    queryFn: () =>
      adminApi
        .getRewardHistories({ page, size: PAGE_SIZE })
        .then((res) => res.data),
  });
  const list = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>리워드 적립 내역</CardTitle>
        <CardDescription>총 {totalElements}건의 적립 기록</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">불러오기 실패</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>리워드 타입</TableHead>
                  <TableHead>금액</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{row.nickname}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        #{row.userId}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.rewardType}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.amount}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          row.status === 'SUCCESS' ? 'default' : 'outline'
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.regDateTime)}
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      적립 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
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

/* ─────────────────────────────── 서브탭: 환전 내역 ─────────────────────────────── */

const ExchangeHistorySubTab = () => {
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-exchanges', page],
    queryFn: () =>
      adminApi
        .getRewardExchanges({ page, size: PAGE_SIZE })
        .then((res) => res.data),
  });
  const list =
    (
      data as {
        content?: Array<{
          exchangeId: number;
          userId: number;
          nickname: string;
          pieceAmount: number;
          exchangeAmount: number;
          status: string;
          regDateTime: string;
        }>;
      }
    )?.content ?? [];
  const totalElements =
    (data as { totalElements?: number })?.totalElements ?? 0;
  const totalPages = (data as { totalPages?: number })?.totalPages ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>환전 내역</CardTitle>
        <CardDescription>총 {totalElements}건</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">불러오기 실패</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>차감 그램</TableHead>
                  <TableHead>지급 토스포인트</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((row) => (
                  <TableRow key={row.exchangeId}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{row.nickname}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        #{row.userId}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.pieceAmount}g
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.exchangeAmount}원
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge
                        variant={
                          row.status === 'SUCCESS' ? 'default' : 'outline'
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.regDateTime)}
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      환전 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
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

/* ─────────────────────────────── 서브탭: 출석 내역 ─────────────────────────────── */

const AttendanceHistorySubTab = () => {
  const [page, setPage] = useState<number>(0);
  const { data, isLoading, isError } = useQuery<
    PageResponse<AttendanceHistoryItem>
  >({
    queryKey: ['admin-attendance-histories', page],
    queryFn: () =>
      adminApi
        .getAttendanceHistories({ page, size: PAGE_SIZE })
        .then((res) => res.data),
  });
  const list = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>출석 내역</CardTitle>
        <CardDescription>총 {totalElements}건</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        ) : isError ? (
          <div className="text-center py-8 text-destructive">불러오기 실패</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>출석일</TableHead>
                  <TableHead>연속</TableHead>
                  <TableHead>등록일시</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-medium">{row.nickname}</span>
                      <span className="text-muted-foreground text-xs ml-1">
                        #{row.userId}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.attendanceDate}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {row.streakCount}일
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(row.regDateTime)}
                    </TableCell>
                  </TableRow>
                ))}
                {list.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      출석 내역이 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages} 페이지
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
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

/* ─────────────────────────────── 메인 컴포넌트 ─────────────────────────────── */

/**
 * 어드민 페이지 내역관리 탭 컴포넌트
 *
 * @description
 * - 나만그래 HistoryManagement 패턴 참조
 * - 5개 서브탭: 로그인/체중/리워드/환전/출석
 * - 리워드/환전/출석은 BE 비활성 → empty state
 * - 로그인/체중은 React Query 서버 사이드 페이징
 *
 * @author hjkim
 */
const AdminHistoryManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState<HistorySubTab>('activity');

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5" />
          내역 관리
        </h2>
      </div>

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
      {activeSubTab === 'activity' && <ActivitySubTab />}
      {activeSubTab === 'login' && <LoginHistorySubTab />}
      {activeSubTab === 'weight' && <WeightHistorySubTab />}
      {activeSubTab === 'reward' && <RewardHistorySubTab />}
      {activeSubTab === 'exchange' && <ExchangeHistorySubTab />}
      {activeSubTab === 'attendance' && <AttendanceHistorySubTab />}
    </div>
  );
};

export default AdminHistoryManagement;
