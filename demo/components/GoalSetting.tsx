import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Target, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

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

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  change?: number;
}

export default function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [targetWeight, setTargetWeight] = useState('');
  const [goalType, setGoalType] = useState<'weekly' | 'monthly'>('weekly');
  const [goalTitle, setGoalTitle] = useState('');

  useEffect(() => {
    const savedGoals = localStorage.getItem('weightGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    const savedEntries = localStorage.getItem('weightEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('weightGoals', JSON.stringify(goals));
  }, [goals]);

  const getCurrentWeight = () => {
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b.date.localeCompare(a.date))[0].weight;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWeight || !goalTitle) return;

    const currentWeight = getCurrentWeight();
    if (!currentWeight) {
      alert('먼저 현재 체중을 기록해주세요.');
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (goalType === 'weekly') {
      endDate.setDate(startDate.getDate() + 7);
    } else {
      endDate.setMonth(startDate.getMonth() + 1);
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      type: goalType,
      targetWeight: parseFloat(targetWeight),
      startWeight: currentWeight,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      title: goalTitle
    };

    setGoals([...goals, newGoal]);
    setTargetWeight('');
    setGoalTitle('');
  };

  const calculateProgress = (goal: Goal) => {
    const currentWeight = getCurrentWeight();
    if (!currentWeight) return 0;

    const totalChange = goal.targetWeight - goal.startWeight;
    const currentChange = currentWeight - goal.startWeight;
    
    if (totalChange === 0) return 100;
    
    const progress = (currentChange / totalChange) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const updateGoalStatus = (goal: Goal) => {
    const currentWeight = getCurrentWeight();
    const today = new Date().toISOString().split('T')[0];
    
    if (today > goal.endDate) {
      if (currentWeight && Math.abs(currentWeight - goal.targetWeight) <= 0.5) {
        return 'completed';
      } else {
        return 'failed';
      }
    }
    return 'active';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="h-3 w-3 mr-1" />완료</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />실패</Badge>;
      default:
        return <Badge variant="secondary">진행중</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-6">
      {/* Goal Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            새로운 목표 설정
          </CardTitle>
          <CardDescription>
            주별 또는 월별 체중 목표를 설정하여 동기부여를 받아보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">목표 제목</Label>
              <Input
                id="goalTitle"
                placeholder="예: 여름 준비 다이어트"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">목표 기간</Label>
                <Select value={goalType} onValueChange={(value: 'weekly' | 'monthly') => setGoalType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">주별 (7일)</SelectItem>
                    <SelectItem value="monthly">월별 (30일)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetWeight">목표 체중 (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  placeholder="예: 65.0"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
              </div>
            </div>

            {getCurrentWeight() && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  현재 체중: <span className="font-medium">{getCurrentWeight()}kg</span>
                  {targetWeight && (
                    <>
                      {' → 목표 체중: '}<span className="font-medium">{targetWeight}kg</span>
                      {' ('}
                      <span className={parseFloat(targetWeight) < getCurrentWeight()! ? 'text-green-600' : 'text-blue-600'}>
                        {parseFloat(targetWeight) < getCurrentWeight()! ? '-' : '+'}
                        {Math.abs(parseFloat(targetWeight) - getCurrentWeight()!).toFixed(1)}kg
                      </span>
                      {')'}
                    </>
                  )}
                </p>
              </div>
            )}

            <Button type="submit" className="w-full">
              목표 설정하기
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Goals */}
      {goals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">설정된 목표</h3>
          {goals
            .map(goal => ({ ...goal, status: updateGoalStatus(goal) }))
            .sort((a, b) => {
              if (a.status === 'active' && b.status !== 'active') return -1;
              if (a.status !== 'active' && b.status === 'active') return 1;
              return b.startDate.localeCompare(a.startDate);
            })
            .map(goal => {
              const progress = calculateProgress(goal);
              const daysRemaining = getDaysRemaining(goal.endDate);
              const currentWeight = getCurrentWeight();
              
              return (
                <Card key={goal.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      {getStatusBadge(goal.status)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(goal.startDate)} ~ {formatDate(goal.endDate)}
                      {goal.status === 'active' && (
                        <span className="ml-2 text-primary font-medium">
                          ({daysRemaining}일 남음)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">시작 체중</p>
                        <p className="font-medium">{goal.startWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">목표 체중</p>
                        <p className="font-medium">{goal.targetWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">현재 체중</p>
                        <p className="font-medium">{currentWeight || '-'}kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">목표까지</p>
                        <p className="font-medium">
                          {currentWeight ? 
                            `${Math.abs(currentWeight - goal.targetWeight).toFixed(1)}kg` : 
                            '-'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {goal.status === 'active' && currentWeight && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>진행률</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}

      {goals.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">아직 설정된 목표가 없습니다</h3>
            <p className="text-muted-foreground">
              첫 번째 체중 목표를 설정하여 건강한 변화를 시작해보세요!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}