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

  /* 폼 유효성 검사 */
  const isFormValid = () => {
    return param.title.trim() !== '' && param.targetWeight > 0;
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
                  value={String(param.presetDuration)}
                  onValueChange={(e) => onChangeParam('presetDuration', e)}
                >
                  <SelectTrigger className="w-full" size="xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetDuration.map((duration) => (
                      <SelectItem
                        key={duration.label}
                        value={String(duration.hours)}
                      >
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <ValidatedInput
                  id="targetWeight"
                  label="목표 체중"
                  type="number"
                  value={param.targetWeight || ''}
                  onChange={(value) => {
                    const numValue = Number(value);
                    if (numValue >= 200) return;
                    onChangeParam('targetWeight', numValue || 0);
                  }}
                  validationRules={validationRules.weight}
                  placeholder="예: 65.5"
                  disabled={isPending}
                  validateOnChange={false}
                  className="h-12"
                  maxLength={5} // 최대 5자리 (예: 199.9)
                />
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg h-12">
              <p className="text-sm text-muted-foreground">
                현재 체중:{' '}
                <span className="font-medium">{param.startWeight}kg</span>
                {param.targetWeight > 0 && (
                  <>
                    {' -> 목표 체중: '}
                    <span className="font-medium">{param.targetWeight}kg</span>
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
                className="flex-1 text-[#000080] font-bold"
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
              <MotionButton variant="outline" size="xl" onClick={onClose}>
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
