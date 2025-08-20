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
    <div>
      {/* 목표 설정 생성 */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Target />
            새로운 목표 설정
          </CardTitle>
          <CardDescription>주별 또는 월별 체중 목표를 설정하여 동기부여를 받아보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div>
              <Label>목표 제목</Label>
              <Input />
            </div>
            <div>
              <div>
                <Label>목표 기간</Label>
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
              <div>
                <Label>목표 체중(kg)</Label>
                <Input />
              </div>
            </div>
            <div>
              <p>현재 체중: <span>82kg</span></p>
            </div>
            <Button>목표 설정하기</Button>
          </form>
        </CardContent>
      </Card>
      {/* Active Goals */}
      <div>
        <h3>설정된 목표</h3>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>목표 제목</CardTitle>
            </div>
            <CardDescription>
              <Calendar />
              <span>2일 남음</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div>
                <p>시작 체중</p>
                <p>23kg</p>
              </div>
            </div>
            <div>
              <div>
                <span>진행률</span>
                <span>23%</span>
                <Progress />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent>
          <Target />
          <h3>아직 설정된 목표가 없습니다.</h3>
          <p>첫 번째 체중 목표를 설정하여 건강한 변화를 시작해보세요!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalSetting;
