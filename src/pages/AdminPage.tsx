import { Badge } from '../components/ui/badge.tsx';
import {
  Crown,
  LayoutDashboard,
  Users,
  MessageSquare,
  Swords,
  Star,
  Coins,
  History,
  Bell,
  Tv,
  Brain,
  Send,
} from 'lucide-react';
import { useState } from 'react';
import AdminOverview from '../components/admin/AdminOverview.tsx';
import AdminUserManagement from '../components/admin/AdminUserManagement.tsx';
import AdminUserDetail from '../components/admin/AdminUserDetail.tsx';
import AdminInquiryManagement from '../components/admin/AdminInquiryManagement.tsx';
import AdminBattleManagement from '../components/admin/AdminBattleManagement.tsx';
import AdminReviewManagement from '../components/admin/AdminReviewManagement.tsx';
import AdminRewardManagement from '../components/admin/AdminRewardManagement.tsx';
import AdminHistoryManagement from '../components/admin/AdminHistoryManagement.tsx';
import AdminNoticeManagement from '../components/admin/AdminNoticeManagement.tsx';
import AdminAdWatchManagement from '../components/admin/AdminAdWatchManagement.tsx';
import AdminAiManagement from '../components/admin/AdminAiManagement.tsx';
import AdminSmartPushManagement from '../components/admin/AdminSmartPushManagement.tsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs.tsx';

/**
 * 어드민 페이지
 *
 * @description 8탭 구조의 관리자 대시보드
 *
 * @author hjkim
 */

const TABS = [
  { value: 'overview', icon: LayoutDashboard, label: '대시보드' },
  { value: 'users', icon: Users, label: '사용자 관리' },
  { value: 'inquiry', icon: MessageSquare, label: '문의 관리' },
  { value: 'battle', icon: Swords, label: '배틀 관리' },
  { value: 'review', icon: Star, label: '리뷰 관리' },
  { value: 'reward', icon: Coins, label: '리워드' },
  { value: 'history', icon: History, label: '내역 관리' },
  { value: 'notice', icon: Bell, label: '공지사항' },
  { value: 'adWatch', icon: Tv, label: '광고 관리' },
  { value: 'ai', icon: Brain, label: 'AI 관리' },
  { value: 'smartPush', icon: Send, label: '스마트발송' },
] as const;

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSelectedUserId(null); }} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-auto gap-1">
          {TABS.map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex items-center gap-1.5 text-xs px-2 py-2"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="users" className="mt-6">
          {selectedUserId ? (
            <AdminUserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
          ) : (
            <AdminUserManagement onSelectUser={(id) => setSelectedUserId(id)} />
          )}
        </TabsContent>
        <TabsContent value="inquiry" className="mt-6">
          <AdminInquiryManagement />
        </TabsContent>
        <TabsContent value="battle" className="mt-6">
          <AdminBattleManagement />
        </TabsContent>
        <TabsContent value="review" className="mt-6">
          <AdminReviewManagement />
        </TabsContent>
        <TabsContent value="reward" className="mt-6">
          <AdminRewardManagement />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <AdminHistoryManagement />
        </TabsContent>
        <TabsContent value="notice" className="mt-6">
          <AdminNoticeManagement />
        </TabsContent>
        <TabsContent value="adWatch" className="mt-6">
          <AdminAdWatchManagement />
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
          <AdminAiManagement />
        </TabsContent>
        <TabsContent value="smartPush" className="mt-6">
          <AdminSmartPushManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
