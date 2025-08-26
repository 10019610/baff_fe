import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Calendar, Target } from 'lucide-react';
import { Label } from './ui/label.tsx';
import { Input } from './ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Button } from './ui/button.tsx';
import type { Goal, PresetDurationType } from '../types/Goals.type.ts';
import type { GetGoalListResponse, RecordGoalsRequest } from '../types/Goals.api.type.ts';
import { formatDate } from '../utils/DateUtil.ts';
import { Badge } from './ui/badge.tsx';
import { Progress } from './ui/progress.tsx';

interface GoalSettingProps {
  onClickRecord: () => void;
  presetDuration: PresetDurationType[];
  onChangeParam: (key: keyof RecordGoalsRequest, value: string | number) => void;
  param: RecordGoalsRequest;
  currentWeight: number;
  goalList: GetGoalListResponse[];
  handleGetDaysRemaining: (startDate: string, endDate: string) => number;
}

/**
 * 체중 목표 설정 관련 컴포넌트
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const GoalSetting = ({
                       onClickRecord,
                       presetDuration,
                       onChangeParam,
                       param,
                       currentWeight,
                       goalList,
                       handleGetDaysRemaining,
                     }: GoalSettingProps) => {
  /**
   * Variables
   */
  const hasWeightData = currentWeight !== null;
  /**
   * Handlers
   */
  /* 설정목표 카드 만료여부 배지 제어 handler */
  const getStatusBadge = (isExpired: boolean) => {
    if (isExpired) {
      return <Badge>완료</Badge>;
    } else {
      return <Badge>진행중</Badge>;
    }
  };
  /* 진행률 계산 handler */
  const calculateProgress = (goal: Goal) => {
    console.log('targetWeight', goal.targetWeight, 'startWeight', goal.startWeight, 'currentWeight', currentWeight);
    if (!currentWeight) return 0;
    const totalChange = goal.targetWeight - goal.startWeight;
    const currentChange = currentWeight - goal.startWeight;

    if (totalChange === 0) return 100;

    console.log('totalChange', totalChange, 'currentChange', currentChange);

    const progress = (currentChange / totalChange) * 100;
    console.log('progress', progress);
    return Math.min(Math.max(progress, 0), 100);
  };
  return (
    <div className="space-y-6">
      {/* 목표 설정 생성 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            새로운 목표 설정
          </CardTitle>
          <CardDescription>주별 또는 월별 체중 목표를 설정하여 동기부여를 받아보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">목표 제목</Label>
              <Input id="goalTitle" placeholder="예: 여름 준비 다이어트" value={param.title}
                     onChange={(e) => onChangeParam('title', e.target.value)} disabled={!hasWeightData}
                     className={!hasWeightData ? 'opacity-50 cursor-not-allowed' : ''} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">목표 기간</Label>
                <Select value={String(param.presetDuration)} onValueChange={(e) => onChangeParam('presetDuration', e)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetDuration.map((duration) => (
                      <SelectItem key={duration.label} value={String(duration.hours)}>{duration.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeight">목표 체중(kg)</Label>
                <Input id="targetWeight" type="number" step="0.1" placeholder="예: 65" value={param.targetWeight}
                       onChange={(e) => onChangeParam('targetWeight', e.target.value)} />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">현재 체중: <span
                className="font-medium">{param.startWeight}kg</span>
                {param.targetWeight && (
                  <>
                    {' -> 목표 체중: '}<span>{param.targetWeight}kg</span>
                    {' ('}
                    <span>kg</span>
                    {')'}
                  </>
                )}
              </p>
            </div>
            <Button type="submit" className="w-full" onClick={onClickRecord}>목표 설정하기</Button>
          </div>
        </CardContent>
      </Card>
      {/* Active Goals */}
      {goalList.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">설정된 목표</h3>
          {goalList.map((goal) => {
              const progress = calculateProgress(goal);
              const today = new Date();
              const daysRemaining = handleGetDaysRemaining(String(today), goal.endDate);
              return (
                <Card key={goal.goalsId}
                      className={goal.isExpired ? 'opacity-70 bg-muted/30 border-muted/50' : 'border-border'}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle
                        className={`text-lg ${goal.isExpired ? 'text-muted-foreground' : ''}`}>{goal.title}</CardTitle>
                      {getStatusBadge(goal.isExpired)}
                    </div>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(goal.startDate)} ~ {formatDate(goal.endDate)}
                      {!goal.isExpired ? (
                        <span className="ml-2 text-primary font-medium">({daysRemaining}일 남음)</span>
                      ) : (
                        <span className="ml-2 text-muted-foreground font-medium">(종료된 목표)</span>
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
                        <p className="font-medium">{currentWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">목표까지</p>
                        <p className="font-medium">
                          {currentWeight ? `${Math.abs(currentWeight - goal.targetWeight).toFixed(1)}kg` : '-'}
                        </p>
                      </div>
                    </div>
                    {!goal.isExpired && currentWeight && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>진행률</span>
                          <span
                            className={progress >= 80 ? 'text-green-600 font-medium' : progress >= 50 ? 'text-primary font-medium' : ''}>{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {progress >= 80 && (
                          <p className="text-xs text-green-600 font-medium">🎉 목표 달성이 가까워졌습니다!</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      )}
      {goalList.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">아직 설정된 목표가 없습니다.</h3>
            <p className="text-muted-foreground">첫 번째 체중 목표를 설정하여 건강한 변화를 시작해보세요!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GoalSetting;
