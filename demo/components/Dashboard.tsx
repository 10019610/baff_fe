import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingDown, TrendingUp, Target, Calendar, Award } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  change?: number;
}

interface Goal {
  id: string;
  type: 'weekly' | 'monthly';
  targetWeight: number;
  startWeight: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed';
  title: string;
}

interface WeeklyProgress {
  week: string;
  startWeight: number;
  endWeight: number;
  change: number;
  target?: number;
}

export default function Dashboard() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('weightEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }

    const savedGoals = localStorage.getItem('weightGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const getWeeklyProgress = (): WeeklyProgress[] => {
    if (entries.length === 0) return [];

    const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date));
    const weeklyData: WeeklyProgress[] = [];
    
    const startDate = new Date(sortedEntries[0].date);
    const endDate = new Date(sortedEntries[sortedEntries.length - 1].date);
    
    const currentWeekStart = new Date(startDate);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay()); // Start of week (Sunday)
    
    while (currentWeekStart <= endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekEntries = sortedEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= currentWeekStart && entryDate <= weekEnd;
      });
      
      if (weekEntries.length > 0) {
        const startWeight = weekEntries[0].weight;
        const endWeight = weekEntries[weekEntries.length - 1].weight;
        const weekLabel = `${currentWeekStart.getMonth() + 1}/${currentWeekStart.getDate()}`;
        
        weeklyData.push({
          week: weekLabel,
          startWeight,
          endWeight,
          change: endWeight - startWeight
        });
      }
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeklyData;
  };

  const getCurrentStats = () => {
    if (entries.length === 0) return null;

    const sortedEntries = entries.sort((a, b) => a.date.localeCompare(b.date));
    const currentWeight = sortedEntries[sortedEntries.length - 1].weight;
    const startWeight = sortedEntries[0].weight;
    const totalChange = currentWeight - startWeight;
    
    // Calculate average weekly change
    const weeklyProgress = getWeeklyProgress();
    const avgWeeklyChange = weeklyProgress.length > 0 ? 
      weeklyProgress.reduce((sum, week) => sum + week.change, 0) / weeklyProgress.length : 0;

    return {
      currentWeight,
      startWeight,
      totalChange,
      avgWeeklyChange,
      totalDays: Math.floor((new Date(sortedEntries[sortedEntries.length - 1].date).getTime() - 
                            new Date(sortedEntries[0].date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    };
  };

  const getGoalAchievements = () => {
    const completed = goals.filter(goal => {
      const currentWeight = getCurrentStats()?.currentWeight;
      const today = new Date().toISOString().split('T')[0];
      
      if (today > goal.endDate && currentWeight) {
        return Math.abs(currentWeight - goal.targetWeight) <= 0.5;
      }
      return false;
    });

    const failed = goals.filter(goal => {
      const currentWeight = getCurrentStats()?.currentWeight;
      const today = new Date().toISOString().split('T')[0];
      
      if (today > goal.endDate && currentWeight) {
        return Math.abs(currentWeight - goal.targetWeight) > 0.5;
      }
      return false;
    });

    const active = goals.filter(goal => {
      const today = new Date().toISOString().split('T')[0];
      return today <= goal.endDate;
    });

    return { completed, failed, active };
  };

  const stats = getCurrentStats();
  const weeklyProgress = getWeeklyProgress();
  const goalAchievements = getGoalAchievements();

  const pieData = [
    { name: '완료', value: goalAchievements.completed.length, color: '#22c55e' },
    { name: '진행중', value: goalAchievements.active.length, color: '#3b82f6' },
    { name: '실패', value: goalAchievements.failed.length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">데이터가 부족합니다</h3>
          <p className="text-muted-foreground">
            체중을 기록하고 목표를 설정하면 상세한 분석을 확인할 수 있습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">현재 체중</p>
                <p className="text-2xl font-bold">{stats.currentWeight}kg</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 변화량</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {stats.totalChange > 0 ? '+' : ''}{stats.totalChange.toFixed(1)}kg
                  {stats.totalChange > 0 ? 
                    <TrendingUp className="h-5 w-5 text-red-500" /> : 
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">주평균 변화</p>
                <p className="text-2xl font-bold">
                  {stats.avgWeeklyChange > 0 ? '+' : ''}
                  {stats.avgWeeklyChange.toFixed(1)}kg
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">기록 일수</p>
                <p className="text-2xl font-bold">{stats.totalDays}일</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Chart */}
      {weeklyProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>주차별 체중 변화</CardTitle>
            <CardDescription>매주 체중 변화량을 확인해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis tickFormatter={(value) => `${value}kg`} />
                  <Tooltip 
                    labelFormatter={(value) => `주차: ${value}`}
                    formatter={(value: number) => [`${value.toFixed(1)}kg`, '변화량']}
                  />
                  <Bar 
                    dataKey="change" 
                    fill={(entry) => entry.change < 0 ? '#22c55e' : '#ef4444'}
                    radius={[4, 4, 0, 0]}
                  >
                    {weeklyProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.change < 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              목표 달성 현황
            </CardTitle>
            <CardDescription>설정한 목표들의 달성 상황을 확인해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{goalAchievements.completed.length}</p>
                    <p className="text-sm text-muted-foreground">완료</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{goalAchievements.active.length}</p>
                    <p className="text-sm text-muted-foreground">진행중</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{goalAchievements.failed.length}</p>
                    <p className="text-sm text-muted-foreground">실패</p>
                  </div>
                </div>

                {pieData.length > 0 && (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}개`, '목표']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">설정된 목표가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>최근 성과</CardTitle>
            <CardDescription>최근 완료한 목표들을 확인해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            {goalAchievements.completed.length > 0 ? (
              <div className="space-y-3">
                {goalAchievements.completed
                  .sort((a, b) => b.endDate.localeCompare(a.endDate))
                  .slice(0, 5)
                  .map(goal => (
                    <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(goal.endDate).toLocaleDateString('ko-KR')} 완료
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">달성</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">아직 완료한 목표가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Active Goals */}
      {goalAchievements.active.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>진행 중인 목표</CardTitle>
            <CardDescription>현재 도전하고 있는 목표들의 진행상황입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goalAchievements.active.map(goal => {
                const currentWeight = stats.currentWeight;
                const totalChange = goal.targetWeight - goal.startWeight;
                const currentChange = currentWeight - goal.startWeight;
                const progress = totalChange === 0 ? 100 : Math.min(Math.max((currentChange / totalChange) * 100, 0), 100);
                
                const today = new Date();
                const endDate = new Date(goal.endDate);
                const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant="secondary">{daysRemaining}일 남음</Badge>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>진행률: {progress.toFixed(0)}%</span>
                      <span>{goal.startWeight}kg → {goal.targetWeight}kg</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}