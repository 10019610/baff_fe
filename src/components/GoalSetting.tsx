import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Calendar, Target } from 'lucide-react';
import { Label } from './ui/label.tsx';
import { Input } from './ui/input.tsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select.tsx';
import { Button } from './ui/button.tsx';
import { Progress } from '@radix-ui/react-progress';

/**
 * 체중 목표 설정 관련 컴포넌트
 *
 * @description
 *
 * @author hjkim
 * @constructor
 */
const GoalSetting = () => {
  return (
    <div className="space-y-6">
      {/* 목표 설정 생성 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5"/>
            새로운 목표 설정
          </CardTitle>
          <CardDescription>주별 또는 월별 체중 목표를 설정하여 동기부여를 받아보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">목표 제목</Label>
              <Input id="goalTitle" placeholder="예: 여름 준비 다이어트" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">목표 기간</Label>
                <Select>
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
                <Label htmlFor="targetWeight">목표 체중(kg)</Label>
                <Input id="targetWeight" type="number" step="0.1" placeholder="예: 65" />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">현재 체중: <span className="font-medium">82kg</span></p>
            </div>
            <Button type="submit" className="w-full">목표 설정하기</Button>
          </form>
        </CardContent>
      </Card>
      {/* Active Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">설정된 목표</h3>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-center">
              <CardTitle className="text-lg">목표 제목</CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="ml-2 text-primary font-medium">2일 남음</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">시작 체중</p>
                <p className="font-medium">23kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">목표 체중</p>
                <p className="font-medium">23kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">현재 체중</p>
                <p className="font-medium">23kg</p>
              </div>
              <div>
                <p className="text-muted-foreground">목표까지</p>
                <p className="font-medium">23kg</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>진행률</span>
                <span>23%</span>
                <Progress className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">아직 설정된 목표가 없습니다.</h3>
          <p className="text-muted-foreground">첫 번째 체중 목표를 설정하여 건강한 변화를 시작해보세요!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalSetting;
