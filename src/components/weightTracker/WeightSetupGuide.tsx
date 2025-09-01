import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Scale, Target, ArrowRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface WeightSetupGuideProps {
  onNavigate?: (menuId: string) => void;
  title?: string;
  description?: string;
  showAlert?: boolean;
}

const WeightSetupGuide = ({
  onNavigate,
  title = '목표 설정',
  description = '체중 목표를 설정하여 효과적인 건강 관리를 시작하세요',
  showAlert = true,
}: WeightSetupGuideProps) => {
  const handleNavigateToTracker = () => {
    toast('체중 기록 페이지로 이동합니다', {
      duration: 2000,
      icon: '📋',
    });
    onNavigate?.('tracker');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Warning Alert */}
      {showAlert && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            목표를 설정하기 전에 현재 체중을 먼저 기록해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Card */}
      <Card className="border-dashed border-2">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto p-6 bg-primary/10 rounded-full w-fit mb-4">
            <Scale className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-xl">체중 기록이 필요합니다</CardTitle>
          <CardDescription className="text-base">
            목표를 설정하려면 현재 체중을 먼저 기록해야 합니다.
            <br />첫 번째 체중 기록을 통해 정확한 목표 설정이 가능합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium mx-auto mb-2">
                1
              </div>
              <h4 className="font-medium mb-1">체중 기록</h4>
              <p className="text-sm text-muted-foreground">
                현재 체중을 정확히 입력하세요
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg opacity-60">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-medium mx-auto mb-2">
                2
              </div>
              <h4 className="font-medium mb-1 text-muted-foreground">
                목표 설정
              </h4>
              <p className="text-sm text-muted-foreground">
                달성하고 싶은 목표 체중 입력
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg opacity-60">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground font-medium mx-auto mb-2">
                3
              </div>
              <h4 className="font-medium mb-1 text-muted-foreground">
                진행 추적
              </h4>
              <p className="text-sm text-muted-foreground">
                목표 달성까지 진행률 확인
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="group"
              onClick={handleNavigateToTracker}
            >
              <Scale className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              첫 체중 기록하러 가기
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">정확한 목표 설정</p>
                <p className="text-muted-foreground">
                  현재 체중 기반으로 현실적인 목표 제안
                </p>
              </div>
              <div className="text-center">
                <Scale className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">진행률 추적</p>
                <p className="text-muted-foreground">
                  일일 기록으로 실시간 목표 달성률 확인
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">💡 체중 기록 팁</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• 매일 같은 시���대에 측정하세요 (예: 기상 후)</li>
            <li>• 화장실을 다녀온 후 측정하는 것이 좋습니다</li>
            <li>• 가벼운 옷차림 상태에서 측정해주세요</li>
            <li>• 식사 전 공복 상태에서 측정하시길 권장합니다</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightSetupGuide;
