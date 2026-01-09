import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useIsMobile } from '../ui/use-mobile';
import WeightTrendChart from '../analytics/WeightTrendChart';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, TableIcon } from 'lucide-react';
import { getBattleWeightHistory } from '../../services/api/activeBattle.api';
import { useQuery } from '@tanstack/react-query';
import type { getBattleWeightHistoryParams } from '../../types/ActiveBattle.type';

interface BattleParticipantDetailProps {
  startDate: string;
  endDate: string;
  userId: number;
  participantType: 'me' | 'opponent';
  opponentNickname: string;
  startWeight: number;
  currentWeight: number;
  targetWeightLoss: number;
  isOpen: boolean;
  onClose: () => void;
}

const BattleParticipantDetail = ({
  participantType,
  startDate,
  endDate,
  userId,
  opponentNickname,
  startWeight,
  currentWeight,
  targetWeightLoss,
  isOpen,
  onClose,
}: BattleParticipantDetailProps) => {
  const isMobile = useIsMobile();
  const isMe = participantType === 'me';
  const name = isMe ? '나' : opponentNickname || '상대방';
  const weightLoss = startWeight - currentWeight;

  const progress = Math.min((weightLoss / targetWeightLoss) * 100, 100);

  // Dialog가 열릴 때 포커스 관리
  useEffect(() => {
    if (isOpen) {
      // 포커스를 Dialog의 첫 번째 포커스 가능한 요소로 이동
      const focusDialog = () => {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          const focusableElement = dialog.querySelector(
            'button, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          if (focusableElement) {
            focusableElement.focus();
          }
        } else {
          // Dialog가 아직 렌더링되지 않았다면 다시 시도
          setTimeout(focusDialog, 100);
        }
      };

      setTimeout(focusDialog, 200);
    } else {
      // Dialog가 닫힐 때 포커스를 원래 버튼으로 돌려보내기
      const triggerButton = document.querySelector(
        'button[data-dialog-trigger]'
      ) as HTMLElement;
      if (triggerButton) {
        triggerButton.focus();
      }
    }
  }, [isOpen]);

  // 체중 기록 api 호출
  const param: getBattleWeightHistoryParams = {
    userId,
    startDate,
    endDate,
  };
  const { data: weightData } = useQuery({
    queryKey: ['weightData', param],
    queryFn: () =>
      getBattleWeightHistory({
        userId,
        startDate,
        endDate,
      }),
  });

  // WeightTrendChart용 데이터 변환
  const chartData = (() => {
    if (!weightData || weightData.length === 0) return [];

    // 시작 몸무게를 첫 번째 포인트로 추가
    const startPoint = {
      date: '시작',
      weight: startWeight,
      change: 0, // 시작점이므로 변화량은 0
      fullDate: '대결 시작',
      target: startWeight - targetWeightLoss,
      bmi: 0,
      dayOfWeek: 0,
    };

    // 실제 기록된 데이터들
    const recordedData = weightData.map((item, index) => {
      const prevWeight =
        index > 0 ? weightData[index - 1].recordWeight : startWeight;
      const change = item.recordWeight - prevWeight;
      const date = new Date(item.recordDate);
      return {
        date: date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
        }),
        weight: item.recordWeight,
        change: change,
        fullDate: date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        }),
        target: startWeight - targetWeightLoss,
        bmi: 0,
        dayOfWeek: date.getDay(),
      };
    });

    return [startPoint, ...recordedData];
  })();

  // 날짜별 체중 변화량 계산
  const weightTableData = (() => {
    if (!weightData || weightData.length === 0) return [];

    // 시작 몸무게를 첫 번째 항목으로 추가
    const startTableItem = {
      recordWeight: startWeight,
      recordDate: startDate,
      weight: startWeight,
      change: 0, // 시작점이므로 변화량은 0
      formattedDate: '시작',
    };

    // 실제 기록된 데이터들
    const recordedTableData = weightData.map((item, index) => {
      const prevWeight =
        index > 0 ? weightData[index - 1].recordWeight : startWeight;
      const change = item.recordWeight - prevWeight;
      return {
        ...item,
        weight: item.recordWeight,
        change: change,
        formattedDate: new Date(item.recordDate).toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        }),
      };
    });

    return [startTableItem, ...recordedTableData];
  })();

  const content = (
    <div className="space-y-6">
      {/* 접근성을 위한 숨겨진 설명 */}
      <div id="battle-detail-description" className="sr-only">
        {name}의 체중 변화 상세 정보를 확인할 수 있습니다.
      </div>
      {/* 참가자 정보 헤더 */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback
            className={`${isMe ? 'bg-blue-500' : 'bg-orange-500'} text-white text-xl font-medium`}
          >
            {isMe ? '나' : name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-bold">{name}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {startWeight}kg → {currentWeight}kg
            </span>
            <Badge
              variant={
                progress >= 80
                  ? 'default'
                  : progress >= 50
                    ? 'secondary'
                    : 'outline'
              }
            >
              {progress.toFixed(0)}% 달성
            </Badge>
          </div>
        </div>
      </div>

      {/* 체중 변화 그래프 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            체중 변화 추이
          </CardTitle>
          <CardDescription>
            대결 시작부터 현재까지의 일일 체중 변화
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeightTrendChart
            data={chartData}
            targetWeight={startWeight - targetWeightLoss}
            hideFilter={true}
          />
        </CardContent>
      </Card>

      {/* 통계 정보 카드 */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div
            className={`p-4 rounded-lg border ${
              isMe
                ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800'
            }`}
          >
            <div
              className={`text-xs font-medium mb-1 ${
                isMe
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-orange-600 dark:text-orange-400'
              }`}
            >
              최고 체중
            </div>
            <div
              className={`text-lg font-bold ${
                isMe
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}
            >
              {Math.max(...chartData.map((item) => item.weight)).toFixed(1)}kg
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              최저 체중
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {Math.min(...chartData.map((item) => item.weight)).toFixed(1)}kg
            </div>
          </div>

          <div className="p-4 rounded-lg border bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
              평균 체중
            </div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {(
                chartData.reduce((sum, item) => sum + item.weight, 0) /
                chartData.length
              ).toFixed(1)}
              kg
            </div>
          </div>
        </motion.div>
      )}

      {/* 날짜별 체중 데이터 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            날짜별 체중 기록
          </CardTitle>
          <CardDescription>일일 체중과 전날 대비 변화량</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead className="text-right">체중</TableHead>
                  <TableHead className="text-right">변화</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weightTableData
                  ?.slice()
                  .reverse()
                  .map((item, index) => (
                    <TableRow key={item.recordDate}>
                      <TableCell className="font-medium">
                        {item.formattedDate}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.recordWeight}kg
                      </TableCell>
                      <TableCell className="text-right">
                        {index === weightTableData.length - 1 ? (
                          <span className="text-muted-foreground">시작점</span>
                        ) : (
                          <span
                            className={`flex items-center justify-end gap-1 ${
                              item.change > 0
                                ? 'text-red-500'
                                : item.change < 0
                                  ? 'text-green-500'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {item.change > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : item.change < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {item.change > 0 ? '+' : ''}
                            {item.change.toFixed(1)}kg
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent
          className="max-h-[90vh]"
          aria-describedby="battle-detail-description"
        >
          <DrawerHeader>
            <DrawerTitle>상세 정보</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] flex flex-col"
        aria-describedby="battle-detail-description"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">상세 정보</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">{content}</div>
      </DialogContent>
    </Dialog>
  );
};

export default BattleParticipantDetail;
