import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Search, Send, Zap } from 'lucide-react';

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

const mockUsers: User[] = [
  { id: '1', name: '김철수', currentWeight: 75.5, joinDate: '2024-01-15', battlesWon: 8, battlesTotal: 12 },
  { id: '2', name: '이영희', currentWeight: 58.2, joinDate: '2024-02-20', battlesWon: 15, battlesTotal: 18 },
  { id: '3', name: '박민수', currentWeight: 82.1, joinDate: '2024-01-30', battlesWon: 6, battlesTotal: 10 },
  { id: '4', name: '최지영', currentWeight: 63.7, joinDate: '2024-03-10', battlesWon: 4, battlesTotal: 7 },
  { id: '5', name: '정동현', currentWeight: 71.8, joinDate: '2024-02-05', battlesWon: 12, battlesTotal: 15 },
  { id: '6', name: '조미영', currentWeight: 55.3, joinDate: '2024-01-08', battlesWon: 9, battlesTotal: 11 },
  { id: '7', name: '윤성민', currentWeight: 78.9, joinDate: '2024-03-15', battlesWon: 3, battlesTotal: 5 },
  { id: '8', name: '송혜진', currentWeight: 52.1, joinDate: '2024-02-28', battlesWon: 7, battlesTotal: 9 },
  { id: '9', name: '한재우', currentWeight: 85.4, joinDate: '2024-01-22', battlesWon: 5, battlesTotal: 8 },
  { id: '10', name: '강수진', currentWeight: 61.8, joinDate: '2024-03-05', battlesWon: 11, battlesTotal: 14 },
  { id: '11', name: '임태준', currentWeight: 73.2, joinDate: '2024-02-12', battlesWon: 2, battlesTotal: 4 },
  { id: '12', name: '문소영', currentWeight: 56.7, joinDate: '2024-01-18', battlesWon: 13, battlesTotal: 16 },
  { id: '13', name: '배현우', currentWeight: 80.3, joinDate: '2024-03-20', battlesWon: 1, battlesTotal: 2 },
  { id: '14', name: '오지은', currentWeight: 59.4, joinDate: '2024-02-15', battlesWon: 6, battlesTotal: 8 },
  { id: '15', name: '신민호', currentWeight: 77.6, joinDate: '2024-01-25', battlesWon: 10, battlesTotal: 13 },
  { id: '16', name: '황유진', currentWeight: 53.8, joinDate: '2024-03-08', battlesWon: 4, battlesTotal: 6 },
  { id: '17', name: '서대영', currentWeight: 84.7, joinDate: '2024-02-18', battlesWon: 7, battlesTotal: 10 },
  { id: '18', name: '남지혜', currentWeight: 57.9, joinDate: '2024-01-12', battlesWon: 14, battlesTotal: 17 },
  { id: '19', name: '양준석', currentWeight: 76.1, joinDate: '2024-03-25', battlesWon: 0, battlesTotal: 1 },
  { id: '20', name: '전수빈', currentWeight: 60.5, joinDate: '2024-02-22', battlesWon: 8, battlesTotal: 11 },
  { id: '21', name: '곽성훈', currentWeight: 79.8, joinDate: '2024-01-28', battlesWon: 3, battlesTotal: 5 },
  { id: '22', name: '유예원', currentWeight: 54.2, joinDate: '2024-03-12', battlesWon: 9, battlesTotal: 12 },
  { id: '23', name: '노진우', currentWeight: 81.5, joinDate: '2024-02-08', battlesWon: 5, battlesTotal: 7 },
  { id: '24', name: '허민정', currentWeight: 58.8, joinDate: '2024-01-20', battlesWon: 11, battlesTotal: 15 },
  { id: '25', name: '고태윤', currentWeight: 72.4, joinDate: '2024-03-18', battlesWon: 2, battlesTotal: 3 },
];

const currentUserId = 'current-user';

export default function BattleSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [challengeData, setChallengeData] = useState({
    targetWeightLoss: '',
    duration: '30',
    message: ''
  });
  const [pendingSentRequests, setPendingSentRequests] = useState<BattleRequest[]>([]);

  // Load existing requests
  useEffect(() => {
    const savedRequests = localStorage.getItem('battleRequests');
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      setPendingSentRequests(requests.filter((req: BattleRequest) => 
        req.fromUserId === currentUserId && req.status === 'pending'
      ));
    }
  }, []);

  // Auto search on input change
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const getCurrentWeight = () => {
    const savedEntries = localStorage.getItem('weightEntries');
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      if (entries.length > 0) {
        return entries.sort((a: any, b: any) => b.date.localeCompare(a.date))[0].weight;
      }
    }
    return 70.0; // 기본값
  };

  const handleSendChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !challengeData.targetWeightLoss) return;

    const currentWeight = getCurrentWeight();
    
    const newRequest: BattleRequest = {
      id: `req-${Date.now()}`,
      fromUserId: currentUserId,
      toUserId: selectedUser.id,
      fromUserName: '나',
      toUserName: selectedUser.name,
      targetWeightLoss: parseFloat(challengeData.targetWeightLoss),
      duration: parseInt(challengeData.duration),
      message: challengeData.message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save to localStorage
    const savedRequests = localStorage.getItem('battleRequests');
    const existingRequests = savedRequests ? JSON.parse(savedRequests) : [];
    const updatedRequests = [...existingRequests, newRequest];
    localStorage.setItem('battleRequests', JSON.stringify(updatedRequests));

    // Update state
    setPendingSentRequests([...pendingSentRequests, newRequest]);
    
    // Reset form
    setSelectedUser(null);
    setChallengeData({ targetWeightLoss: '', duration: '30', message: '' });
    setSearchQuery('');
    setSearchResults([]);
    
    alert(`${selectedUser.name}님에게 대결 신청을 보냈습니다!`);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            상대방 검색하기
          </CardTitle>
          <CardDescription>
            함께 도전할 상대를 찾아 대결을 신청해보세요 ({mockUsers.length}명의 사용자)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="이름으로 검색... (예: 김, 이, 박)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Popular Users */}
          {!searchQuery && (
            <div className="space-y-3">
              <h4 className="font-medium">🔥 인기 도전자</h4>
              <div className="grid gap-3">
                {mockUsers
                  .filter(user => user.battlesTotal >= 10)
                  .sort((a, b) => (b.battlesWon / b.battlesTotal) - (a.battlesWon / a.battlesTotal))
                  .slice(0, 3)
                  .map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>체중: {user.currentWeight}kg</span>
                            <span>승률: {Math.round((user.battlesWon / user.battlesTotal) * 100)}%</span>
                            <span>경험: {user.battlesTotal}회</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedUser(user)}
                        disabled={pendingSentRequests.some(req => req.toUserId === user.id)}
                      >
                        {pendingSentRequests.some(req => req.toUserId === user.id) ? '신청중' : '도전하기'}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">검색 결과 ({searchResults.length}명)</h4>
              <div className="grid gap-3">
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>체중: {user.currentWeight}kg</span>
                          <span>승률: {user.battlesTotal > 0 ? Math.round((user.battlesWon / user.battlesTotal) * 100) : 0}%</span>
                          <span>가입: {new Date(user.joinDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setSelectedUser(user)}
                      disabled={pendingSentRequests.some(req => req.toUserId === user.id)}
                    >
                      {pendingSentRequests.some(req => req.toUserId === user.id) ? '신청중' : '도전하기'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">
                다른 이름으로 검색해보세요
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Challenge Form */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {selectedUser.name}님에게 대결 신청
            </CardTitle>
            <CardDescription>
              승률 {selectedUser.battlesTotal > 0 ? Math.round((selectedUser.battlesWon / selectedUser.battlesTotal) * 100) : 0}%의 강력한 상대입니다!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendChallenge} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetWeightLoss">목표 감량 (kg)</Label>
                  <Input
                    id="targetWeightLoss"
                    type="number"
                    step="0.1"
                    placeholder="예: 3.0"
                    value={challengeData.targetWeightLoss}
                    onChange={(e) => setChallengeData({...challengeData, targetWeightLoss: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">대결 기간 (일)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={challengeData.duration}
                    onChange={(e) => setChallengeData({...challengeData, duration: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">메시지 (선택사항)</Label>
                <Input
                  id="message"
                  placeholder="함께 목표를 달성해봐요!"
                  value={challengeData.message}
                  onChange={(e) => setChallengeData({...challengeData, message: e.target.value})}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  현재 체중: <span className="font-medium">{getCurrentWeight()}kg</span>
                  {challengeData.targetWeightLoss && (
                    <>
                      {' → 목표 체중: '}
                      <span className="font-medium text-green-600">
                        {(getCurrentWeight() - parseFloat(challengeData.targetWeightLoss)).toFixed(1)}kg
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  대결 신청 보내기
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedUser(null)}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}