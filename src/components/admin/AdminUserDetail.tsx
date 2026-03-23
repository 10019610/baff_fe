import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.tsx';
import {
  ArrowLeft,
  Crown,
  FileText,
  Puzzle,
  Scale,
  Shield,
  Swords,
  Target,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
} from 'lucide-react';
import { adminApi } from '../../services/api/admin.api.ts';
import type { AdminUserDetail as AdminUserDetailType } from '../../types/Admin.api.type.ts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../../utils/DateUtil.ts';

interface AdminUserDetailProps {
  userId: number;
  onBack: () => void;
}

/**
 * 어드민 사용자 상세 드릴다운 컴포넌트
 *
 * @description
 * - 사용자 프로필/활동 통계/조각 잔액 표시
 * - 역할/상태 변경 기능
 * - 나만그래 UserDetail 패턴 참조
 *
 * @author hjkim
 * @constructor
 */
const AdminUserDetail = ({ userId, onBack }: AdminUserDetailProps) => {
  /**
   * Hooks
   */
  const queryClient = useQueryClient();

  /**
   * Queries
   */
  const { data: userDetail, isLoading } = useQuery<AdminUserDetailType>({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => adminApi.getUserDetail(userId).then((res) => res.data),
  });

  /**
   * Mutations
   */
  const roleMutation = useMutation({
    mutationFn: ({ targetUserId, role }: { targetUserId: number; role: string }) =>
      adminApi.updateUserRole(targetUserId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ targetUserId, status }: { targetUserId: number; status: string }) =>
      adminApi.updateUserStatus(targetUserId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  /**
   * Badge Handlers
   */
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

  /**
   * Render
   */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Button>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          사용자 정보를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 + 뒤로가기 */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          목록으로
        </Button>
      </div>

      {/* 프로필 카드 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 아바타 + 기본 정보 */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userDetail.profileImageUrl} alt={userDetail.nickname} />
                <AvatarFallback className="bg-primary/10 text-2xl">
                  {userDetail.nickname?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold">{userDetail.nickname}</h2>
                  {getRoleBadge(userDetail.role)}
                  {getStatusBadge(userDetail.status)}
                </div>
                <p className="text-sm text-muted-foreground">{userDetail.email}</p>
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <span>가입일: {formatDate(userDetail.regDateTime)}</span>
                  <span>|</span>
                  {getProviderBadge(userDetail.provider)}
                  {getPlatformBadge(userDetail.platform)}
                </div>
                {userDetail.height > 0 && (
                  <p className="text-xs text-muted-foreground">키: {userDetail.height}cm</p>
                )}
              </div>
            </div>

            {/* 역할/상태 변경 버튼 */}
            <div className="flex gap-2 md:ml-auto items-start">
              <Button
                variant="outline"
                size="sm"
                disabled={roleMutation.isPending}
                onClick={() =>
                  roleMutation.mutate({
                    targetUserId: userDetail.userId,
                    role: userDetail.role === 'ADMIN' ? 'USER' : 'ADMIN',
                  })
                }
              >
                <Shield className="h-4 w-4 mr-1" />
                {userDetail.role === 'ADMIN' ? '일반 사용자로 변경' : '관리자로 변경'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({
                    targetUserId: userDetail.userId,
                    status: userDetail.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                  })
                }
              >
                {userDetail.status === 'ACTIVE' ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    비활성화
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    활성화
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 활동 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">체중 기록</span>
            </div>
            <p className="text-2xl font-bold mt-2">{userDetail.totalWeightRecords}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">목표</span>
            </div>
            <p className="text-2xl font-bold mt-2">{userDetail.totalGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Swords className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">배틀</span>
            </div>
            <p className="text-2xl font-bold mt-2">{userDetail.totalBattles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">리뷰</span>
            </div>
            <p className="text-2xl font-bold mt-2">{userDetail.totalReviews}</p>
          </CardContent>
        </Card>
      </div>

      {/* 조각 잔액 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Puzzle className="h-4 w-4 text-yellow-600" />
            조각 잔액
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{userDetail.pieceBalance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">현재 보유 조각</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserDetail;
