import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Crown, Filter, Mail, MoreHorizontal, Search, UserCheck, Users, UserX } from 'lucide-react';
import { Input } from './ui/input.tsx';
import { Button } from './ui/button.tsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.tsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar.tsx';
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.tsx';
import type { GetUserListResponse } from '../types/User.api.type.ts';
import { formatDate } from '../utils/DateUtil.ts';
import { Badge } from './ui/badge.tsx';

interface AdminUserManagementProps {
  userList: GetUserListResponse[];
}

/**
 * 어드민 페이지 유저관리 탭 컴포넌트
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const AdminUserManagement = ({ userList }: AdminUserManagementProps) => {
  /**
   * Hooks
   */
  /**
   * Variables
   */
  /* 테이블 헤더 */
  const tableHeader = [
    {
      id: 1,
      name: '사용자',
    },
    {
      id: 2,
      name: '권한',
    },
    {
      id: 3,
      name: 'Provider',
    },
    {
      id: 4,
      name: 'Platform',
    },
    {
      id: 5,
      name: '상태',
    },
    {
      id: 6,
      name: '목표현황',
    },
    {
      id: 7,
      name: '가입일',
    },
  ];
  /* 유저 리스트 더미 데이터 */
  // const dummyUsers = [
  //   {
  //     id: 1,
  //     name: '김현진',
  //     role: 'ADMIN',
  //     status: '활성',
  //     regDateTime: '2025-08-24',
  //     totalGoals: 42,
  //     completeGoals: 12,
  //   },
  //   {
  //     id: 1,
  //     name: '양영조',
  //     role: 'ADMIN',
  //     status: '활성',
  //     regDateTime: '2025-08-25',
  //     totalGoals: 24,
  //     completeGoals: 9,
  //   },
  // ];
  /**
   * UI Handlers
   */
  /* 권한 배지 제어 handler */
  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return <Badge className="bg-purple-500 text-white"><Crown className="h-3 w-3 mr-1" />관리자</Badge>;
    } else if (role === 'USER') {
      return <Badge variant="secondary">일반 사용자</Badge>;
    }
  };
  /* 유저상태 배지 제어 handler */
  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-500 text-white"><UserCheck className="h-3 w-3 mr-1" />활성</Badge>;
    } else {
      return <Badge variant="secondary"><UserX className="h-3 w-3 mr-1" />비활성</Badge>;
    }
  };
  /* Provider Badge handler */
  const getProviderBadge = (provider: string) => {
    if (provider === 'google') {
      return (
        <Badge className="bg-[#0F9D58] text-[#FFFFFF]">GOOGLE</Badge>
      );
    } else if (provider === 'kakao') {
      return (
        <Badge className="bg-[#FEE102] text-[#3C1E1E ]">KAKAO</Badge>
      );
    } else if (provider === 'toss') {
      return (
        <Badge className="bg-[#0064FF] text-[#FFFFFF]">TOSS</Badge>
      );
    }
  };
  /* 관리자 수 */
  const getAdmins = () => {
    return userList.filter(user => user.role === 'ADMIN').length;
  };
  /* 이번주 신규 수 */
  const getNewUsersThisWeek = () => {
    const now = new Date();

    // 이번 주 월요일 구하기 (주의 시작일)
    const dayOfWeek = now.getDay(); // 일요일:0, 월요일:1, ...
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // 이번 주 일요일 구하기
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return userList.filter(user => {
      const regDate = new Date(user.regDateTime);
      return regDate >= monday && regDate <= sunday;
    }).length;
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
            <p className="text-2xl font-bold mt-2">{userList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">활성 사용자</span>
            </div>
            <p className="text-2xl font-bold mt-2">{userList.length}</p>
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
      </div>
      {/* 검색 및 필터*/}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="사용자 이름 또는 이메일로 검색..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          필터
        </Button>
      </div>
      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>총 {userList.length}명의 사용자</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {tableHeader.map((item) => (
                  <TableHead key={item.id}> {item.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.userProfileUrl} alt={user.nickname} />
                        <AvatarFallback className="bg-primary/10">{user.nickname}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.nickname}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getProviderBadge(user.provider)}</TableCell>
                  <TableCell>{user.platform}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">12</span>
                      <span className="text-muted-foreground">/33</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.regDateTime)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>사용자 관리</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail />
                          상세보기
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
