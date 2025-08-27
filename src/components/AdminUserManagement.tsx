import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Filter, Mail, MoreHorizontal, Search, UserCheck, Users } from 'lucide-react';
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

/**
 * 어드민 페이지 유저관리 탭 컴포넌트
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const AdminUserManagement = () => {
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
      name: '상태',
    },
    {
      id: 4,
      name: '목표현황',
    },
    {
      id: 5,
      name: '가입일',
    },
  ];
  /* 유저 리스트 더미 데이터 */
  const dummyUsers = [
    {
      id: 1,
      name: '김현진',
      role: 'ADMIN',
      status: '활성',
      regDateTime: '2025-08-24',
      totalGoals: 42,
      completeGoals: 12,
    },
    {
      id: 1,
      name: '양영조',
      role: 'ADMIN',
      status: '활성',
      regDateTime: '2025-08-25',
      totalGoals: 24,
      completeGoals: 9,
    },
  ];
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
            <p className="text-2xl font-bold mt-2">212</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">활성 사용자</span>
            </div>
            <p className="text-2xl font-bold mt-2">192</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">관리자</span>
            </div>
            <p className="text-2xl font-bold mt-2">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">이번 주 신규</span>
            </div>
            <p className="text-2xl font-bold mt-2">24</p>
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
          <CardDescription>총 122명의 사용자</CardDescription>
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
              {dummyUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage />
                        <AvatarFallback className="bg-primary/10">김현진</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">김현진</p>
                        <p className="text-sm text-muted-foreground">eful1234@gmail.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{user.completeGoals}</span>
                      <span className="text-muted-foreground">/{user.totalGoals}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.regDateTime}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button>
                          <MoreHorizontal />
                        </Button>
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
