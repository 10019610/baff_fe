import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PenSquare } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useIsMobile } from '../ui/use-mobile';
import { api } from '../../services/api/Api';
import { useAuth } from '../../context/AuthContext';
import { todayKst } from '../../utils/DateUtil';
import {
  sliceRecordsByGoal,
  resolveGoalWeight,
  calcGoalProgress,
  calcGoalTimeline,
  calcGoalPace,
  calcRequiredDailyChange,
  calcRecordCoverage,
} from '../../utils/goalProgress';
import type { GetGoalListResponse } from '../../types/Goals.api.type';
import type {
  GetWeightListResponse,
  WeightResponseDto,
} from '../../types/WeightTracker.api.type';

/**
 * 목표 상세 (M-023 1단계) — 토스 `changeup_fe_toss/src/components/goals/GoalDetailSheet.tsx` 를 옮겼다.
 * 문구 · 색 기준 · 계산은 토스와 같게 유지한다. 다른 점:
 * - 추이 그래프 대신 분석 페이지 링크 (그래프는 2단계에서 결정)
 * - 끝난 목표에 「후기 쓰기」 (목표 카드에 있던 리뷰 버튼을 옮김)
 * - 휴대폰은 아래 시트, PC 는 가운데 창 (`BattleParticipantDetail` 과 같은 방식)
 *
 * 🔴 진행중/종료 판정은 BE 가 내려주는 `goal.isExpired` 를 따른다 (토스와 같음).
 */

const COLOR_ACHIEVED = 'text-green-600';
const COLOR_PROGRESS = 'text-blue-600';
const COLOR_BEHIND = 'text-red-600';
const PERCENT = 100;

interface GoalDetailDrawerProps {
  goal: GetGoalListResponse | null;
  open: boolean;
  onClose: () => void;
  /** 끝난 목표에서 「새 목표 설정하기」 — 목표 만들기 폼을 연다 */
  onCreateGoal: () => void;
}

const GoalDetailDrawer = ({
  goal,
  open,
  onClose,
  onCreateGoal,
}: GoalDetailDrawerProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 상세가 열릴 때만 전체 체중 기록을 불러온다 (목표 화면 자체는 현재 체중만 쓴다)
  const {
    data: allRecords = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['goalDetailWeightRecords', user?.id],
    queryFn: async (): Promise<WeightResponseDto[]> => {
      const response = await api.get('/weight/getWeightList');
      const data: GetWeightListResponse = response.data;
      return data.dailyWeightRecords;
    },
    enabled: open && !!user?.id,
  });

  const metrics = useMemo(() => {
    if (goal == null) return null;

    const sliced = sliceRecordsByGoal(allRecords, goal);
    const point = resolveGoalWeight(goal, sliced);
    const progress = calcGoalProgress(
      goal.startWeight,
      goal.targetWeight,
      point.weight
    );
    const timeline = calcGoalTimeline(goal, todayKst());
    const pace = calcGoalPace(goal, sliced);
    const coverage = calcRecordCoverage(sliced, timeline);
    const requiredDaily = progress.achieved
      ? null
      : calcRequiredDailyChange(
          goal.targetWeight,
          point.weight,
          timeline.remainingDays
        );

    return { point, progress, timeline, pace, coverage, requiredDaily };
  }, [goal, allRecords]);

  if (goal == null || metrics == null) return null;

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          기록을 불러오고 있어요
        </p>
      );
    }
    if (isError) {
      return (
        <p className="py-10 text-center text-sm text-muted-foreground">
          기록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
        </p>
      );
    }

    const { point, progress, timeline, pace, coverage, requiredDaily } =
      metrics;
    const expired = goal.isExpired;
    const percentText = `${(progress.ratio * PERCENT).toFixed(0)}%`;
    const accentColor = progress.achieved
      ? COLOR_ACHIEVED
      : progress.ratio < 0
        ? COLOR_BEHIND
        : COLOR_PROGRESS;

    return (
      <div className="flex flex-col gap-5">
        {/* 요약 머리 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={expired ? 'secondary' : 'default'}>
              {expired
                ? '종료'
                : progress.achieved
                  ? '달성'
                  : `D-${timeline.remainingDays}`}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatPeriod(goal.startDate, goal.endDate)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm text-muted-foreground">현재</span>
            <span className="text-2xl font-bold">
              {point.isFallback ? '기록 없어요' : `${point.weight}kg`}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            시작 {goal.startWeight}kg → 목표 {goal.targetWeight}kg
          </p>
          <Progress value={progress.barRatio * PERCENT} className="mt-3" />
          <div className="mt-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">
              {point.recordDate == null
                ? '기록 없음'
                : `${formatDay(point.recordDate)} 기록 기준`}
            </span>
            <span className={`font-bold ${accentColor}`}>{percentText}</span>
          </div>
        </div>

        {/* 그래프 자리 — 1단계는 분석 페이지 링크 */}
        <button
          type="button"
          onClick={() => goTo('/analytics')}
          className="rounded-xl bg-muted px-4 py-3 text-left text-sm text-primary underline-offset-2 hover:underline"
        >
          체중 추이는 분석에서 볼 수 있어요 →
        </button>

        {/* 숫자 4칸 */}
        <div className="grid grid-cols-2 gap-3">
          <MetricCell
            label={progress.achieved ? '목표 대비' : '목표까지'}
            value={
              progress.achieved
                ? '달성 완료'
                : `${Math.abs(progress.remainingToTarget).toFixed(1)}kg`
            }
          />
          <MetricCell
            label={expired ? '진행 기간' : '남은 기간'}
            value={
              expired
                ? `${timeline.totalDays}일 완주`
                : `D-${timeline.remainingDays}`
            }
          />
          <MetricCell
            label="지금까지 하루 평균"
            value={
              pace.dailyChange == null
                ? '기록 부족'
                : formatKgPerDay(pace.dailyChange)
            }
          />
          {expired ? (
            <MetricCell
              label="진행률"
              value={percentText}
              color={accentColor}
            />
          ) : (
            <MetricCell
              label="앞으로 하루 평균"
              value={
                progress.achieved
                  ? '달성 완료'
                  : requiredDaily == null
                    ? '오늘이 마지막'
                    : formatKgPerDay(requiredDaily)
              }
              color={
                progress.achieved ||
                requiredDaily == null ||
                pace.dailyChange == null
                  ? undefined
                  : isKeepingUp(pace.dailyChange, requiredDaily)
                    ? COLOR_ACHIEVED
                    : COLOR_BEHIND
              }
            />
          )}
        </div>

        {/* 속도 한 줄 (진행 중) · 결산 한 줄 (종료) */}
        <InfoBanner
          text={
            expired
              ? buildSummaryMessage(
                  progress.achieved,
                  progress.changeFromStart,
                  point.isFallback
                )
              : buildPaceMessage(pace, progress.achieved, requiredDaily)
          }
        />

        {/* 기록 성실도 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">기록 성실도</span>
          <span className="font-semibold">
            {coverage.expectedDays}일 중 {coverage.recordedDays}일 (
            {(coverage.ratio * PERCENT).toFixed(0)}%)
          </span>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-2">
          {expired ? (
            <>
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => goTo(`/review/${goal.goalsId}`)}
              >
                <PenSquare className="h-4 w-4" />
                후기 쓰기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  onClose();
                  onCreateGoal();
                }}
              >
                새 목표 설정하기
              </Button>
            </>
          ) : (
            <Button
              size="lg"
              className="w-full"
              onClick={() => goTo('/weightTracker')}
            >
              체중 기록하기
            </Button>
          )}
        </div>
      </div>
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent className="max-h-[90vh]" aria-describedby={undefined}>
          <DrawerHeader>
            <DrawerTitle>{goal.title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 overflow-y-auto">{renderBody()}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md max-h-[90vh] flex flex-col"
        aria-describedby={undefined}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{goal.title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">{renderBody()}</div>
      </DialogContent>
    </Dialog>
  );
};

function MetricCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-muted px-3.5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 font-bold ${color ?? ''}`}>{value}</p>
    </div>
  );
}

function InfoBanner({ text }: { text: string }) {
  return <div className="rounded-xl bg-muted px-4 py-3.5 text-sm">{text}</div>;
}

/* ── 아래 함수들은 토스 GoalDetailSheet.tsx 와 같게 유지한다 ── */

/** 하루당 변화량. 부호를 살려야 감량/증량 방향이 보인다 */
function formatKgPerDay(value: number): string {
  const rounded = Number(value.toFixed(2));
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(2)}kg`;
}

/** 실제 페이스가 필요 페이스만큼(같은 방향으로) 나오고 있는지 */
function isKeepingUp(actual: number, required: number): boolean {
  if (required === 0) return true;
  return (
    Math.sign(actual) === Math.sign(required) &&
    Math.abs(actual) >= Math.abs(required)
  );
}

function formatDay(iso: string): string {
  const [, m, d] = iso.split('T')[0].split('-');
  return `${Number(m)}/${Number(d)}`;
}

function formatPeriod(startDate: string, endDate: string): string {
  return `${formatDay(startDate)} ~ ${formatDay(endDate)}`;
}

function buildPaceMessage(
  pace: ReturnType<typeof calcGoalPace>,
  achieved: boolean,
  requiredDaily: number | null
): string {
  if (achieved) return '목표에 닿았어요. 남은 기간엔 이 체중을 지켜보세요.';
  if (pace.projectedDateKey == null || pace.daysAheadOfSchedule == null) {
    // 예상 달성일을 못 내는 상황이라도 "앞으로 얼마씩"은 알려줄 수 있다
    if (requiredDaily != null && requiredDaily !== 0) {
      const direction = requiredDaily < 0 ? '줄이면' : '늘리면';
      return `남은 기간 동안 하루 평균 ${Math.abs(requiredDaily).toFixed(2)}kg씩 ${direction} 목표에 닿아요.`;
    }
    return '아직 방향을 잡는 중이에요. 며칠 더 기록하면 예상 달성일을 알려드릴게요.';
  }

  const [, m, d] = pace.projectedDateKey.split('-');
  const dateText = `${Number(m)}월 ${Number(d)}일`;

  if (pace.daysAheadOfSchedule > 0) {
    return `이 속도면 ${dateText} 달성, 목표보다 ${pace.daysAheadOfSchedule}일 빨라요.`;
  }
  if (pace.daysAheadOfSchedule === 0) {
    return `이 속도면 ${dateText} 달성, 딱 맞춰 도착해요.`;
  }
  return `이 속도면 ${dateText} 달성, 목표보다 ${Math.abs(pace.daysAheadOfSchedule)}일 늦어요.`;
}

function buildSummaryMessage(
  achieved: boolean,
  changeFromStart: number,
  noRecord: boolean
): string {
  if (noRecord) return '이 기간에 기록한 체중이 없어 결과를 확인할 수 없어요.';
  if (achieved)
    return `목표를 달성했어요. 시작보다 ${Math.abs(changeFromStart).toFixed(1)}kg 달라졌어요.`;
  if (changeFromStart === 0) return '시작 체중 그대로 끝났어요.';

  const direction = changeFromStart < 0 ? '줄었어요' : '늘었어요';
  return `목표에는 닿지 못했지만 ${Math.abs(changeFromStart).toFixed(1)}kg ${direction}.`;
}

export default GoalDetailDrawer;
