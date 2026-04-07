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
import { useState } from 'react';

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

  /* 내일 날짜 (직접 설정 최소값) */
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
    const end = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 0) {
      onChangeParam('presetDuration', diffDays);
    }
  };

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
            <div className="p-3 bg-muted rounded-lg h-full">
              <p className="text-xs text-muted-foreground">
                현재 체중:{' '}
                <span className="font-sm">{param.startWeight}kg</span>
                {param.targetWeight > 0 && (
                  <>
                    {' -> 목표 체중: '}
                    <span className="font-sm">{param.targetWeight}kg</span>
                    {' ('}
                    <span
                      className={
                        param.targetWeight < currentWeight
                          ? 'text-green-600'
                          : 'text-blue-600'
                      }
                    >
                      {param.targetWeight < currentWeight ? '-' : '+'}
                      {Math.abs(param.targetWeight - currentWeight).toFixed(1)}
                      kg
                    </span>
                    {')'}
                  </>
                )}
              </p>
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
