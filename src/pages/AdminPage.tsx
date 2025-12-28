import { Badge } from '../components/ui/badge.tsx';
import { Crown, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';
import AdminUserManagement from '../components/AdminUserManagement.tsx';
import AdminInquiryManagement from '../components/AdminInquiryManagement.tsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs.tsx';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api/Api.ts';
import { userInitializer } from '../types/User.initializer.ts';
import type { GetUserListResponse } from '../types/User.api.type.ts';
import type { GetAdminInquiryListResponse } from '../types/Inquiry.api.type.ts';
// import Test1 from '../components/common/Test1.tsx';

/**
 * 어드민 페이지
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const AdminPage = () => {
  /**
   * States
   */
  /* 탭 제어 state */
  const [activeTab, setActiveTab] = useState<string>('users');

  /**
   * APIs
   */
  /* 가입 유저 리스트 조회 api */
  const { data: userList } = useQuery<GetUserListResponse[]>({
    queryKey: ['userList'],
    initialData: userInitializer.INITIAL_GET_USER_LIST,
    queryFn: () => {
      return api.get('/user/getUserList').then((res) => {
        console.log(res);
        return res.data;
      });
    },
  });

  /* 문의 리스트 조회 api */
  const { data: inquiryList } = useQuery<GetAdminInquiryListResponse[]>({
    queryKey: ['adminInquiryList'],
    initialData: [],
    queryFn: () => {
      return api.get('/inquiry/admin/getInquiryList').then((res) => {
        return res.data;
      });
    },
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            ChangeUp 사용자 관리 및 시스템 모니터링
          </p>
        </div>
        <Badge className="bg-purple-500">
          <Crown className="h-4 w-4 mr-1" />
          관리자모드
        </Badge>
      </div>
      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            회원관리
          </TabsTrigger>
          {/* <TabsTrigger value="test" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            테스트1
          </TabsTrigger> */}
          <TabsTrigger value="inquiry" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            문의관리
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-6">
          <AdminUserManagement userList={userList} />
        </TabsContent>
        {/* <TabsContent value="test" className="mt-6">
          <Test1 />
        </TabsContent> */}
        <TabsContent value="inquiry" className="mt-6">
          <AdminInquiryManagement inquiryList={inquiryList} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
