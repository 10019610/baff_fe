import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Bell, CheckCircle, XCircle, Clock, MessageCircle, Inbox, Send as SendIcon } from 'lucide-react';
import { useAuth } from './AuthContext';

interface User {
  id: string;
  name: string;
  currentWeight?: number;
  joinDate: string;
  battlesWon: number;
  battlesTotal: number;
}

interface BattleRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserName: string;
  toUserName: string;
  targetWeightLoss: number;
  duration: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
}

interface Battle {
  id: string;
  opponent: string;
  opponentId: string;
  myStartWeight: number;
  opponentStartWeight: number;
  targetWeightLoss: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  myCurrentWeight?: number;
  opponentCurrentWeight?: number;
  requestId?: string;
}

const mockUsers: User[] = [
  { id: '1', name: '김철수', currentWeight: 75.5, joinDate: '2024-01-15', battlesWon: 8, battlesTotal: 12 },
  { id: '2', name: '이영희', currentWeight: 58.2, joinDate: '2024-02-20', battlesWon: 15, battlesTotal: 18 },
  { id: '5', name: '정동현', currentWeight: 71.8, joinDate: '2024-02-05', battlesWon: 12, battlesTotal: 15 },
  { id: '8', name: '송혜진', currentWeight: 52.1, joinDate: '2024-02-28', battlesWon: 7, battlesTotal: 9 },
  { id: '12', name: '문소영', currentWeight: 56.7, joinDate: '2024-01-18', battlesWon: 13, battlesTotal: 16 },
];

// 초기 데이터 생성 함수
const getInitialBattleRequests = (userId: string): BattleRequest[] => [
  {
    id: 'req-1',
    fromUserId: '2',
    toUserId: userId,
    fromUserName: '이영희',
    toUserName: '나',
    targetWeightLoss: 2.5,
    duration: 21,
    message: '함께 목표를 달성해봐요! 🏃‍♀️',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-2',
    fromUserId: '5',
    toUserId: userId,
    fromUserName: '정동현',
    toUserName: '나',
    targetWeightLoss: 3.0,
    duration: 30,
    message: '한 달 동안 치킨 금지! 같이 도전해요 💪',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function BattleRequests() {
  const { user } = useAuth();
  const [battleRequests, setBattleRequests] = useState<BattleRequest[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);

  useEffect(() => {
    if (!user) return;

    const userDataKey = `battleRequests_${user.id}`;
    const userBattlesKey = `weightBattles_${user.id}`;

    const savedRequests = localStorage.getItem(userDataKey);
    if (savedRequests) {
      setBattleRequests(JSON.parse(savedRequests));
    } else {
      const initialRequests = getInitialBattleRequests(user.id);
      setBattleRequests(initialRequests);
      localStorage.setItem(userDataKey, JSON.stringify(initialRequests));
    }

    const savedBattles = localStorage.getItem(userBattlesKey);
    if (savedBattles) {
      setBattles(JSON.parse(savedBattles));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const userDataKey = `battleRequests_${user.id}`;
    localStorage.setItem(userDataKey, JSON.stringify(battleRequests));
    
    // Trigger custom event to update badges
    const event = new CustomEvent('requestsUpdated');
    window.dispatchEvent(event);
  }, [battleRequests, user]);

  useEffect(() => {
    if (!user) return;
    
    const userBattlesKey = `weightBattles_${user.id}`;
    localStorage.setItem(userBattlesKey, JSON.stringify(battles));
  }, [battles, user]);

  const getCurrentWeight = () => {
    if (!user) return 70.0;
    
    const userWeightKey = `weightEntries_${user.id}`;
    const savedEntries = localStorage.getItem(userWeightKey) || localStorage.getItem('weightEntries');
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      if (entries.length > 0) {
        return entries.sort((a: any, b: any) => b.date.localeCompare(a.date))[0].weight;
      }
    }
    return 70.0;
  };

  const handleAcceptRequest = (request: BattleRequest) => {
    if (!user) return;
    
    const currentWeight = getCurrentWeight();

    // Update request status
    const updatedRequests = battleRequests.map(req =>
      req.id === request.id ? { ...req, status: 'accepted' as const } : req
    );
    setBattleRequests(updatedRequests);

    // Create new battle
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + request.duration);

    const opponent = mockUsers.find(u => u.id === request.fromUserId);
    const opponentWeight = opponent?.currentWeight || currentWeight + (Math.random() - 0.5) * 10;

    const newBattle: Battle = {
      id: `battle-${Date.now()}`,
      opponent: request.fromUserName,
      opponentId: request.fromUserId,
      myStartWeight: currentWeight,
      opponentStartWeight: opponentWeight,
      targetWeightLoss: request.targetWeightLoss,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      myCurrentWeight: currentWeight,
      opponentCurrentWeight: opponentWeight,
      requestId: request.id
    };

    setBattles([...battles, newBattle]);
    alert(`${request.fromUserName}님의 대결 신청을 수락했습니다!`);
  };

  const handleRejectRequest = (request: BattleRequest) => {
    const updatedRequests = battleRequests.map(req =>
      req.id === request.id ? { ...req, status: 'rejected' as const } : req
    );
    setBattleRequests(updatedRequests);
    alert(`${request.fromUserName}님의 대결 신청을 거절했습니다.`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />대기중</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />수락됨</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />거절됨</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${Math.floor(diffInHours / 24)}일 전`;
  };

  if (!user) return null;

  const pendingReceivedRequests = battleRequests.filter(req => 
    req.toUserId === user.id && req.status === 'pending'
  );

  const pendingSentRequests = battleRequests.filter(req => 
    req.fromUserId === user.id && req.status === 'pending'
  );

  const recentRequests = battleRequests
    .filter(req => req.status !== 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Received Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            받은 대결 신청
            {pendingReceivedRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingReceivedRequests.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>새로운 대결 신청을 확인하고 응답하세요</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReceivedRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingReceivedRequests.map(request => {
                const requester = mockUsers.find(u => u.id === request.fromUserId);
                return (
                  <div key={request.id} className="p-6 border rounded-lg space-y-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                            {request.fromUserName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{request.fromUserName}님의 대결 신청</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{getTimeAgo(request.createdAt)}</span>
                            {requester && (
                              <span>승률 {Math.round((requester.battlesWon / requester.battlesTotal) * 100)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">목표 감량</span>
                        <span className="font-medium text-lg">{request.targetWeightLoss}kg</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">대결 기간</span>
                        <span className="font-medium text-lg">{request.duration}일</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground">종료 예정</span>
                        <span className="font-medium">
                          {new Date(new Date().getTime() + request.duration * 24 * 60 * 60 * 1000)
                            .toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {request.message && (
                      <div className="p-4 bg-background/80 rounded-lg border">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">"{request.message}"</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button 
                        onClick={() => handleAcceptRequest(request)}
                        className="flex-1"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        수락하기
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleRejectRequest(request)}
                        className="flex-1"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        거절하기
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">새로운 대결 신청이 없습니다</h3>
              <p className="text-muted-foreground">
                다른 사용자들이 대결을 신청하면 여기에 표시됩니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SendIcon className="h-5 w-5" />
            보낸 대결 신청
          </CardTitle>
          <CardDescription>상대방의 응답을 기다리는 신청들입니다</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingSentRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingSentRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{request.toUserName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.toUserName}님에게</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{request.targetWeightLoss}kg 감량</span>
                        <span>{request.duration}일</span>
                        <span>{getTimeAgo(request.createdAt)}</span>
                        {request.message && <MessageCircle className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <SendIcon className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">
                보낸 대결 신청이 없습니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              최근 활동
            </CardTitle>
            <CardDescription>최근 처리된 대결 신청들입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRequests.map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {request.fromUserId === user.id ? request.toUserName[0] : request.fromUserName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {request.fromUserId === user.id 
                          ? `${request.toUserName}님에게 신청` 
                          : `${request.fromUserName}님의 신청`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}