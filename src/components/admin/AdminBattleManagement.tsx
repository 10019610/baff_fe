import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Swords, Clock, Play, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type { AdminBattleListItem, PageResponse } from '../../types/Admin.api.type.ts';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatDate } from '../../utils/DateUtil.ts';

const PAGE_SIZE = 20;

/**
 * 어드민 페이지 배틀관리 탭 컴포넌트
 *
 * @description
 * - React Query로 서버 사이드 페이징/필터링
 * - 상태별 필터 탭 (전체/대기중/진행중/종료)
 * - 배틀방 통계 카드 + 테이블
 *
 * @author hjkim
 */
const AdminBattleManagement = () => {
  /**
   * States
   */
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(0);

  /**
   * Query
   */
  const { data, isLoading, isError } = useQuery<PageResponse<AdminBattleListItem>>({
    queryKey: ['admin-battles', statusFilter, page],
    queryFn: () =>
      adminApi
        .getBattles({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          page,
          size: PAGE_SIZE,
        })
        .then((res) => res.data),
  });

  const battleList = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  /**
   * Variables
   */
  const statusTabs = [
    { value: 'ALL', label: '전체' },
    { value: 'WAITING', label: '대기중' },
    { value: 'IN_PROGRESS', label: '진행중' },
    { value: 'ENDED', label: '종료' },
  ];

  const tableHeader = [
    { id: 1, name: '방이름' },
    { id: 2, name: '호스트' },
    { id: 3, name: '참가자' },
    { id: 4, name: '상태' },
    { id: 5, name: '기간' },
    { id: 6, name: '내기금액' },
    { id: 7, name: '시작일' },
    { id: 8, name: '등록일' },
  ];

  /**
   * Handlers
   */
  /* 상태별 카운트 (현재 페이지 데이터 기준) */
  const getStatusCount = (status: string) => {
    return battleList.filter((battle) => battle.status === status).length;
  };

  /* 상태 배지 제어 handler */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING':
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="h-3 w-3 mr-1" />
            대기중
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-blue-500 text-white">
            <Play className="h-3 w-3 mr-1" />
            진행중
          </Badge>
        );
      case 'ENDED':
        return (
          <Badge variant="secondary">
            <CheckCircle className="h-3 w-3 mr-1" />
            종료
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  /* 상태 탭 변경 */
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Swords className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">총 배틀방</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalElements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">대기중</span>
            </div>
            <p className="text-2xl font-bold mt-2">{getStatusCount('WAITING')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">진행중</span>
            </div>
            <p className="text-2xl font-bold mt-2">{getStatusCount('IN_PROGRESS')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">종료</span>
            </div>
            <p className="text-2xl font-bold mt-2">{getStatusCount('ENDED')}</p>
          </CardContent>
        </Card>
      </div>

      {/* 상태 필터 탭 */}
      <div className="flex gap-2">
        {statusTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={statusFilter === tab.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange(tab.value)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* 배틀방 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>배틀방 목록</CardTitle>
          <CardDescription>총 {totalElements}개의 배틀방</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
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
                  {battleList.map((battle) => (
                    <TableRow key={battle.battleId}>
                      <TableCell>
                        <div className="min-w-[120px]">
                          <p className="font-medium">{battle.name}</p>
                          <p className="text-xs text-muted-foreground">{battle.entryCode}</p>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{battle.hostNickname}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {battle.participantCount} / {battle.maxParticipants}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(battle.status)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{battle.durationDays}일</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {(battle.betAmount ?? 0).toLocaleString()}원
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {battle.startDate ? formatDate(battle.startDate) : '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(battle.regDateTime)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {battleList.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={tableHeader.length}
                        className="text-center py-8 text-muted-foreground"
                      >
                        배틀방이 없습니다.
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
    </div>
  );
};

export default AdminBattleManagement;
