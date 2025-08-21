import { AlertTriangle, ArrowRight, Scale } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card.tsx';
import { Button } from './ui/button.tsx';
import { Link } from 'react-router-dom';

/**
 * 체중 세팅이 안되어 있을 때 보여주는 컴포넌트
 *
 * @description
 * - 체중 기록 페이지로 이동 가능
 *
 * @author hjkim
 * @constructor
 */
const GoalSetupGuide = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">제목</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      {/* Warning Alert */}
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">목표를 설정하기 전에 현재 체중을 먼저
          기록해주세요.</AlertDescription>
      </Alert>
      {/* Main Card */}
      <Card className="border-dashed border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-6 bg-primary/10 rounded-full w-fit mb-4">
            <Scale className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-xl">체중 기록이 필요합니다.</CardTitle>
          <CardDescription className="text-base">
            목표를 설정하려면 현재 체중을 먼저 기록해야 합니다.<br />
            첫 번째 체중 기록을 통해 정확한 목표 설정이 가능합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* step */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium mx-auto mb-2">1
              </div>
              <h4 className="font-medium mb-1">체중 기록</h4>
              <p className="text-sm text-muted-foreground">현재 체중을 정확히 입력하세요</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg opacity-60">
              <div
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-muted-foreground font-medium mx-auto mb-2">2
              </div>
              <h4 className="font-medium mb-1 text-muted-foreground">목표 설정</h4>
              <p className="text-sm text-muted-foreground">달성하고 싶은 목표 체중 입력</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg opacity-60">
              <div
                className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-muted-foreground font-medium mx-auto mb-2">3
              </div>
              <h4 className="font-medium mb-1 text-muted-foreground">진행 추적</h4>
              <p className="text-sm text-muted-foreground">목표 달성까지 진행률 확인</p>
            </div>
          </div>
          {/* Action Button */}
          <div className="pt-4">
            <Link to="/">
              <Button size="lg" className="group">
                <Scale className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                첫 체중 기록하러 가기
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalSetupGuide;
