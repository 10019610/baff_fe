import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
} from 'lucide-react';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.tsx';
import { Badge } from '../ui/badge.tsx';
import { formatDate } from '../../utils/DateUtil.ts';
import { adminApi } from '../../services/api/admin.api.ts';
import type { AdminUserListItem, PageResponse } from '../../types/Admin.api.type.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AdminUserManagementProps {
  onSelectUser?: (userId: number) => void;
}

/**
 * 어드민 페이지 유저관리 탭 컴포넌트
 *
 * @description
 * - React Query를 통한 서버 사이드 페이징/필터링
 * - 사용자 역할/상태 변경 (useMutation)
 * - 행 클릭 시 사용자 상세 드릴다운
 *
 * @author hjkim
 * @constructor
 */
const AdminUserManagement = ({ onSelectUser }: AdminUserManagementProps) => {
  /**
   * Hooks
   */
  const queryClient = useQueryClient();

  /**
   * States
   */
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const pageSize = 20;

  /**
   * Queries
   */
  const { data, isLoading } = useQuery<PageResponse<AdminUserListItem>>({
    queryKey: ['admin-users', statusFilter, searchTerm, page, pageSize],
    queryFn: () =>
      adminApi
        .getUsers({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: searchTerm || undefined,
          page,
          size: pageSize,
        })
        .then((res) => res.data),
  });

  const userList = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  /**
   * Mutations
   */
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  /**
   * Variables
   */
  const tableHeader = [
    { id: 1, name: '사용자' },
    { id: 2, name: '권한' },
    { id: 3, name: 'Provider' },
    { id: 4, name: 'Platform' },
    { id: 5, name: '상태' },
    { id: 6, name: '키' },
    { id: 7, name: '가입일' },
    { id: 8, name: '' },
  ];

  const statusTabs = [
    { value: 'ALL', label: '전체' },
    { value: 'ACTIVE', label: '활성' },
    { value: 'INACTIVE', label: '비활성' },
  ];

  /**
   * UI Handlers
   */
  /* 권한 배지 제어 handler */
  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return (
        <Badge className="bg-purple-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          관리자
        </Badge>
      );
    }
    return <Badge variant="secondary">일반 사용자</Badge>;
  };

  /* 유저상태 배지 제어 handler */
  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return (
        <Badge className="bg-green-500 text-white">
          <UserCheck className="h-3 w-3 mr-1" />
          활성
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <UserX className="h-3 w-3 mr-1" />
        비활성
      </Badge>
    );
  };

  /* Provider Badge handler */
  const getProviderBadge = (provider: string) => {
    if (provider === 'google') {
      return <Badge className="bg-[#0F9D58] text-[#FFFFFF] font-bold">GOOGLE</Badge>;
    } else if (provider === 'kakao') {
      return <Badge className="bg-[#FEE102] text-[#3C1E1E] font-bold">KAKAO</Badge>;
    } else if (provider === 'toss') {
      return <Badge className="bg-[#0064FF] text-[#FFFFFF] font-bold">TOSS</Badge>;
    }
    return <Badge variant="outline">{provider}</Badge>;
  };

  /* Provider Counts (현재 페이지 기준) */
  const getProviderCounts = (provider: string) => {
    return userList.filter((user) => user.provider === provider).length;
  };

  /* Platform Badge handler */
  const getPlatformBadge = (platform: string) => {
    if (platform === 'WEB') {
      return <Badge className="bg-[#287BDE] text-[#FFFFFF] font-bold">WEB</Badge>;
    } else if (platform === 'ANDROID') {
      return <Badge className="bg-[#3DDC84] text-[#FFFFFF] font-bold">ANDROID</Badge>;
    } else if (platform === 'IOS') {
      return <Badge className="bg-[#8E8E93] text-[#FFFFFF] font-bold">IOS</Badge>;
    } else if (platform === 'TOSS') {
      return <Badge className="bg-[#0064FF] text-[#FFFFFF] font-bold">TOSS</Badge>;
    }
    return <Badge variant="outline">{platform}</Badge>;
  };

  /* Platform Counts (현재 페이지 기준) */
  const getPlatformCounts = (platform: string) => {
    return userList.filter((user) => user.platform === platform).length;
  };

  /* 관리자 수 (현재 페이지 기준) */
  const getAdmins = () => {
    return userList.filter((user) => user.role === 'ADMIN').length;
  };

  /* 이번주 신규 수 (현재 페이지 기준) */
  const getNewUsersThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return userList.filter((user) => {
      const regDate = new Date(user.regDateTime);
      return regDate >= monday && regDate <= sunday;
    }).length;
  };

  /* 검색 실행 */
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setPage(0);
  };

  /* 검색 입력 엔터키 처리 */
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">총 사용자</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totalElements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">활성 사용자</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {userList.filter((u) => u.status === 'ACTIVE').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">관리자</span>
            </div>
            <p className="text-2xl font-bold mt-2">{getAdmins()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">이번 주 신규</span>
            </div>
            <p className="text-2xl font-bold mt-2">{getNewUsersThisWeek()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>{getProviderBadge('google')}</span>
                <span className="font-bold">{getProviderCounts('google')}</span>
              </div>
              <div className="flex justify-between">
                <span>{getProviderBadge('kakao')}</span>
                <span className="font-bold">{getProviderCounts('kakao')}</span>
              </div>
              <div className="flex justify-between">
                <span>{getProviderBadge('toss')}</span>
                <span className="font-bold">{getProviderCounts('toss')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>{getPlatformBadge('WEB')}</span>
                <span className="font-bold">{getPlatformCounts('WEB')}</span>
              </div>
              <div className="flex justify-between">
                <span>{getPlatformBadge('ANDROID')}</span>
                <span className="font-bold">{getPlatformCounts('ANDROID')}</span>
              </div>
              <div className="flex justify-between">
                <span>{getPlatformBadge('IOS')}</span>
                <span className="font-bold">{getPlatformCounts('IOS')}</span>
              </div>
              <div className="flex justify-between">
                <span>{getPlatformBadge('TOSS')}</span>
                <span className="font-bold">{getPlatformCounts('TOSS')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 서브탭 (전체/활성/비활성) + 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="사용자 이름 또는 이메일로 검색..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          검색
        </Button>
      </div>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>총 {totalElements}명의 사용자</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : userList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">검색 결과가 없습니다.</div>
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
                  {userList.map((user) => (
                    <TableRow
                      key={user.userId}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectUser?.(user.userId)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profileImageUrl} alt={user.nickname} />
                            <AvatarFallback className="bg-primary/10">
                              {user.nickname?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.nickname}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getProviderBadge(user.provider)}</TableCell>
                      <TableCell>{getPlatformBadge(user.platform)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.height ? `${user.height}cm` : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(user.regDateTime)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>사용자 관리</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectUser?.(user.userId);
                              }}
                            >
                              <Search className="h-4 w-4 mr-2" />
                              상세보기
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                roleMutation.mutate({
                                  userId: user.userId,
                                  role: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                                });
                              }}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.role === 'ADMIN' ? '일반 사용자로 변경' : '관리자로 변경'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                statusMutation.mutate({
                                  userId: user.userId,
                                  status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                                });
                              }}
                            >
                              {user.status === 'ACTIVE' ? (
                                <>
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  비활성화
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  활성화
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <span className="text-xs text-muted-foreground">
                  총 {totalElements}건 | {page + 1} / {totalPages || 1} 페이지
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page + 1} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (totalPages || 1) - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
