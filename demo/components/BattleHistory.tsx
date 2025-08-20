import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Trophy, Target, Award, TrendingUp, TrendingDown } from 'lucide-react';

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
  result?: 'won' | 'lost' | 'draw';
  myFinalWeight?: number;
  opponentFinalWeight?: number;
}

// Mock completed battles for demonstration
const getMockCompletedBattles = (): Battle[] => [
  {
    id: 'completed-1',
    opponent: '이영희',
    opponentId: '2',
    myStartWeight: 72.0,
    opponentStartWeight: 58.2,
    targetWeightLoss: 3.0,
    startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    result: 'won',
    myFinalWeight: 69.2,
    opponentFinalWeight: 56.8
  },
  {
    id: 'completed-2',
    opponent: '박민수',
    opponentId: '3',
    myStartWeight: 69.2,
    opponentStartWeight: 82.1,
    targetWeightLoss: 2.5,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    result: 'lost',
    myFinalWeight: 67.8,
    opponentFinalWeight: 79.2
  },
  {
    id: 'completed-3',
    opponent: '최지영',
    opponentId: '4',
    myStartWeight: 71.5,
    opponentStartWeight: 63.7,
    targetWeightLoss: 2.0,
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 76 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'completed',
    result: 'draw',
    myFinalWeight: 69.6,
    opponentFinalWeight: 61.8
  }
];

export default function BattleHistory() {
  const [completedBattles, setCompletedBattles] = useState<Battle[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '1month' | '3months'>('all');

  useEffect(() => {
    // In a real app, this would fetch from the database
    // For now, we'll use mock data and check if there are any real completed battles
    const savedBattles = localStorage.getItem('weightBattles');
    const realCompletedBattles = savedBattles ? 
      JSON.parse(savedBattles).filter((battle: Battle) => battle.status === 'completed') : [];
    
    // Combine real battles with mock data for demonstration
    const allCompletedBattles = [...realCompletedBattles, ...getMockCompletedBattles()];
    setCompletedBattles(allCompletedBattles);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (battle: Battle) => {
    const myWeightLoss = battle.myStartWeight - (battle.myFinalWeight || battle.myStartWeight);
    const myProgress = (myWeightLoss / battle.targetWeightLoss) * 100;
    
    const opponentWeightLoss = battle.opponentStartWeight - (battle.opponentFinalWeight || battle.opponentStartWeight);
    const opponentProgress = (opponentWeightLoss / battle.targetWeightLoss) * 100;
    
    return { myProgress, opponentProgress, myWeightLoss, opponentWeightLoss };
  };

  const getResultBadge = (result?: 'won' | 'lost' | 'draw') => {
    switch (result) {
      case 'won':
        return <Badge className="bg-green-500 text-white gap-1"><Trophy className="h-3 w-3" />승리</Badge>;
      case 'lost':
        return <Badge variant="destructive" className="gap-1"><TrendingDown className="h-3 w-3" />패배</Badge>;
      case 'draw':
        return <Badge variant="secondary" className="gap-1"><Target className="h-3 w-3" />무승부</Badge>;
      default:
        return <Badge variant="outline">완료</Badge>;
    }
  };

  const getStats = () => {
    const total = completedBattles.length;
    const won = completedBattles.filter(b => b.result === 'won').length;
    const lost = completedBattles.filter(b => b.result === 'lost').length;
    const draw = completedBattles.filter(b => b.result === 'draw').length;
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    
    const totalWeightLost = completedBattles.reduce((sum, battle) => {
      const myWeightLoss = battle.myStartWeight - (battle.myFinalWeight || battle.myStartWeight);
      return sum + Math.max(0, myWeightLoss);
    }, 0);

    return { total, won, lost, draw, winRate, totalWeightLost };
  };

  const filteredBattles = completedBattles.filter(battle => {
    if (selectedPeriod === 'all') return true;
    
    const battleDate = new Date(battle.endDate);
    const now = new Date();
    const monthsAgo = selectedPeriod === '1month' ? 1 : 3;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate());
    
    return battleDate >= cutoffDate;
  });

  const stats = getStats();

  if (completedBattles.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <Calendar className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-xl font-medium mb-3">아직 완료된 대결이 없습니다</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            대결을 완료하면 여기에 기록과 통계가 표시됩니다. 첫 번째 대결을 시작해보세요!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            승패 기록, 체중 감량 성과 등을 확인할 수 있습니다
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">총 대결</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.won}</p>
              <p className="text-sm text-muted-foreground">승리</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
              <p className="text-sm text-muted-foreground">패배</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.winRate}%</p>
              <p className="text-sm text-muted-foreground">승률</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.totalWeightLost.toFixed(1)}kg</p>
              <p className="text-sm text-muted-foreground">총 감량</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Battle History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            대결 기록
          </CardTitle>
          <CardDescription>완료된 대결들의 상세 결과를 확인해보세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredBattles
            .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
            .map(battle => {
              const { myProgress, opponentProgress, myWeightLoss, opponentWeightLoss } = calculateProgress(battle);
              const duration = getDuration(battle.startDate, battle.endDate);
              
              return (
                <Card key={battle.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {battle.opponent[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">vs {battle.opponent}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(battle.startDate)} ~ {formatDate(battle.endDate)} ({duration}일)
                          </p>
                        </div>
                      </div>
                      {getResultBadge(battle.result)}
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* My Result */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">나</span>
                          <span className="text-sm text-muted-foreground">
                            {battle.myStartWeight}kg → {battle.myFinalWeight}kg
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>감량: {myWeightLoss.toFixed(1)}kg</span>
                            <span>달성률: {myProgress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(myProgress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Opponent Result */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{battle.opponent}</span>
                          <span className="text-sm text-muted-foreground">
                            {battle.opponentStartWeight}kg → {battle.opponentFinalWeight}kg
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>감량: {opponentWeightLoss.toFixed(1)}kg</span>
                            <span>달성률: {opponentProgress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(opponentProgress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Battle Info */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>목표: {battle.targetWeightLoss}kg 감량</span>
                        <span>기간: {duration}일</span>
                      </div>
                      {battle.result === 'won' && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Award className="h-4 w-4" />
                          승리 보너스
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}