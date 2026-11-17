import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Target } from 'lucide-react';
import { CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import ValidatedInput from './weightTracker/ValidatedInput';
import { validationRules } from '../utils/validation';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';
import LoadingSpinnerForButton from './LoadingSpinnerForButton';
import type { RecordGoalsRequest } from '../types/Goals.api.type';
import type { PresetDurationType } from '../types/Goals.type';
import { useMemo, useState } from 'react';
import {
  todayKst,
  addDaysToDateKey,
  diffDaysBetweenDateKeys,
} from '../utils/DateUtil';

/** 목표와 현재 체중 차이가 이보다 작으면 유지 목표로 본다 (토스 M-009 와 같은 값) */
const MAINTAIN_TOLERANCE_KG = 0.05;
/** 목표 체중 입력 상한 (토스와 같은 값) */
const MAX_TARGET_WEIGHT_KG = 300;

/** 'YYYY-MM-DD' → 'M월 D일' */
const formatDateKeyLabel = (key: string) => {
  const [, month, day] = key.split('-').map(Number);
  return `${month}월 ${day}일`;
};

interface GoalsCreateProps {
  currentWeight: number;
  onChangeParam: (
    key: keyof RecordGoalsRequest,
    value: string | number
  ) => void;
  param: RecordGoalsRequest;
  isPending: boolean;
  presetDuration: PresetDurationType[];
  onClickRecord: () => void;
  onClose: () => void;
}
const GoalsCreate = ({
  currentWeight,
  onChangeParam,
  param,
  isPending,
  presetDuration,
  onClickRecord,
  onClose,
}: GoalsCreateProps) => {
  /**
   * Variables
   */
  const hasWeightData = currentWeight !== null;
  const MotionButton = motion(Button);

  /* 직접 설정 모드 */
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [customEndDate, setCustomEndDate] = useState('');

  /* 오늘 · 내일 날짜 (KST) — BE 도 KST 오늘에 일수를 더해 종료일을 만든다 (M-007) */
  const today = todayKst();
  const minDate = addDaysToDateKey(today, 1);

  /* 기간 선택 handler */
  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomDuration(true);
      onChangeParam('presetDuration', 0);
    } else {
      setIsCustomDuration(false);
      setCustomEndDate('');
      onChangeParam('presetDuration', Number(value));
    }
  };

  /* 직접 날짜 선택 handler */
  const handleCustomDateChange = (dateStr: string) => {
    setCustomEndDate(dateStr);
    const diffDays = dateStr ? diffDaysBetweenDateKeys(today, dateStr) : 0;
    // 오늘 이전 날짜면 0 으로 둬서 저장 버튼이 꺼지게 한다
    onChangeParam('presetDuration', diffDays > 0 ? diffDays : 0);
  };

  /* 요약 — 토스 목표 만들기(M-009)와 같은 세 줄 (M-024) */
  const durationDays = param.presetDuration > 0 ? param.presetDuration : null;
  const endDateLabel =
    durationDays != null
      ? formatDateKeyLabel(addDaysToDateKey(today, durationDays))
      : null;

  /** 현재 체중과 목표 체중의 차이. 체중 기록이 없거나 입력이 불완전하면 null */
  const plan = useMemo(() => {
    const target = param.targetWeight;
    if (!target || target <= 0 || target > MAX_TARGET_WEIGHT_KG || currentWeight <= 0) {
      return null;
    }
    const delta = currentWeight - target;
    const amount = Math.abs(delta);
    if (amount < MAINTAIN_TOLERANCE_KG) return { type: 'maintain' as const };
    return {
      type: delta > 0 ? ('lose' as const) : ('gain' as const),
      target,
      amount,
      perDay: durationDays != null ? amount / durationDays : null,
    };
  }, [param.targetWeight, currentWeight, durationDays]);

  /* 폼 유효성 검사 */
  const isFormValid = () => {
    if (isCustomDuration && !customEndDate) return false;
    return param.title.trim() !== '' && param.targetWeight > 0 && param.presetDuration > 0;
  };
  return (
    <div>
      {' '}
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">목표 제목</Label>
              <Input
                id="goalTitle"
                placeholder="예: 여름 준비 다이어트"
                value={param.title}
                onChange={(e) => onChangeParam('title', e.target.value)}
                disabled={!hasWeightData}
                className={
                  !hasWeightData ? 'opacity-50 cursor-not-allowed h-12' : 'h-12'
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">목표 기간</Label>
                <Select
                  value={isCustomDuration ? 'custom' : String(param.presetDuration)}
                  onValueChange={handleDurationChange}
                >
                  <SelectTrigger className="w-full" size="xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetDuration.map((duration) => (
                      <SelectItem
                        key={duration.label}
                        value={String(duration.days)}
                      >
                        {duration.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">직접 설정</SelectItem>
                  </SelectContent>
                </Select>
                {isCustomDuration && (
                  <Input
                    type="date"
                    value={customEndDate}
                    min={minDate}
                    onChange={(e) => handleCustomDateChange(e.target.value)}
                    className="h-12 mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <ValidatedInput
                  id="targetWeight"
                  label="목표 체중"
                  type="number"
                  value={param.targetWeight || ''}
                  onChange={(value) => {
                    onChangeParam('targetWeight', value === '' ? 0 : value);
                  }}
                  decimalPlaces={1}
                  maxNumber={199.9}
                  validationRules={validationRules.weight}
                  placeholder="예: 65.5"
                  disabled={isPending}
                  validateOnChange={false}
                  className="h-12"
                  maxLength={5} // 최대 5자리 (예: 199.9)
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg h-full space-y-1 text-sm">
              {durationDays != null && (
                <p className="font-semibold">
                  오늘부터 {durationDays}일간 · {endDateLabel}까지
                </p>
              )}
              {plan == null && (
                <p className="text-muted-foreground">
                  현재 체중 {currentWeight}kg
                </p>
              )}
              {plan?.type === 'maintain' && (
                <p>지금 체중 {currentWeight}kg를 그대로 지키는 목표예요</p>
              )}
              {plan && plan.type !== 'maintain' && (
                <>
                  <p>
                    {currentWeight}kg → {plan.target.toFixed(1)}kg ·{' '}
                    {plan.amount.toFixed(1)}kg{' '}
                    {plan.type === 'lose' ? '감량' : '증량'}
                  </p>
                  {plan.perDay != null && (
                    <p>
                      하루 평균 {plan.perDay.toFixed(2)}kg씩{' '}
                      {plan.type === 'lose' ? '줄이면' : '늘리면'} 돼요
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-4">
              <MotionButton
                type="submit"
                className="flex-1 text-[#000080] font-bold cursor-pointer"
                size="xl"
                onClick={() => {
                  onClickRecord();
                  onClose();
                }}
                disabled={isPending || !isFormValid()}
                whileHover={{ scale: isFormValid() ? 1.02 : 1 }}
                whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
              >
                {isPending ? (
                  <>
                    <LoadingSpinnerForButton />
                    설정 중
                  </>
                ) : (
                  '목표 설정하기'
                )}
              </MotionButton>
              <MotionButton
                className="cursor-pointer"
                variant="outline"
                size="xl"
                onClick={onClose}
              >
                취소
              </MotionButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsCreate;
