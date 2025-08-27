import { Badge } from '../components/ui/badge.tsx';
import { Crown, Users } from 'lucide-react';
import { useState } from 'react';
import AdminUserManagement from '../components/AdminUserManagement.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.tsx';

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
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">관리자 대시보드</h1>
          <p className="text-muted-foreground">ChangeUp 사용자 관리 및 시스템 모니터링</p>
        </div>
        <Badge className="bg-purple-500">
          <Crown className="h-4 w-4 mr-1" />
          관리자모드
        </Badge>
      </div>
      {/* 탭 메뉴 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value='users' className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            회원관리
          </TabsTrigger>
          <TabsTrigger value='test' className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            테스트1
          </TabsTrigger>
          <TabsTrigger value='test2' className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            테스트2
          </TabsTrigger>
        </TabsList>
        <TabsContent value='users' className="mt-6">
          <AdminUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
