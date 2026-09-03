import { motion } from 'motion/react';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import AnimatedContainer from './AnimatedContainer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { AlertTriangle, Calendar, Plus, BarChart3 } from 'lucide-react';
import { validationRules } from '../../utils/validation';
import { todayKst } from '../../utils/DateUtil';
import ValidatedInput from './ValidatedInput';
import { useEffect, useState } from 'react';
import type {
  RecordWeightRequest,
  WeightEntry,
} from '../../types/WeightTracker.api.type';

interface WeightDataForDashboard {
  weightChangeAverage: number;
  weightRecordCount: number;
}

interface WeightCreateProps {
  onClickRecord: () => void;
  entries: WeightEntry[];
  param: RecordWeightRequest;
  isSubmitting: boolean;
  onClose: () => void;
  onChangeParam: (
    key: keyof RecordWeightRequest,
    value: string | number
  ) => void;
  weightDataForDashboard?: WeightDataForDashboard;
}

const WeightCreate = ({
  onClickRecord,
  entries,
  param,
  isSubmitting,
  onClose,
  onChangeParam,
  weightDataForDashboard,
}: WeightCreateProps) => {
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const [pendingEntry, setPendingEntry] = useState<{
    date: string;
    weight: number;
    existingWeight: number;
  } | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!param.weight || !param.recordDate) return;

    // Check if entry for this date already exists
    const existingEntry = entries.find(
      (entry) => entry.date === param.recordDate
    );

    if (existingEntry) {
      // 중복 날짜 발견 - 사용자에게 확인 요청
      setPendingEntry({
        date: param.recordDate,
        weight: param.weight,
        existingWeight: existingEntry.weight,
      });
      setShowDuplicateDialog(true);
    } else {
      // 새로운 날짜 - 바로 진행
      onClickRecord();
      // 1초 후에 닫기
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleDuplicateConfirm = async () => {
    if (pendingEntry) {
      onClickRecord();
      // 1초 후에 닫기
      setTimeout(() => {
        onClose();
        setPendingEntry(null);
        setShowDuplicateDialog(false);
      }, 1000);
    }
  };

  const handleDuplicateCancel = () => {
    setPendingEntry(null);
    setShowDuplicateDialog(false);
  };

  // 컴포넌트가 처음 마운트될 때만 오늘 날짜로 초기화
  useEffect(() => {
    const today = todayKst();
    onChangeParam('recordDate', today);
  }, []);

  return (
    <div className="space-y-6">
      {/* 중복 날짜 확인 다이얼로그 */}
      <AlertDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              이미 기록된 날짜입니다
            </AlertDialogTitle>
            <AlertDialogDescription>
              선택하신{' '}
              {pendingEntry &&
                new Date(pendingEntry.date).toLocaleDateString('ko-KR')}
              에 이미 체중 기록이 있습니다. 기존 기록을 새로운 값으로
              업데이트하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* 비교 정보를 별도 섹션으로 분리 */}
          {pendingEntry && (
            <div className="px-6 pb-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    기존 기록:
                  </span>
                  <span className="font-semibold">
                    {pendingEntry.existingWeight}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    새로운 기록:
                  </span>
                  <span className="font-semibold">{pendingEntry.weight}kg</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-sm font-medium">변화량:</span>
                  <span
                    className={`font-semibold ${
                      pendingEntry.weight > pendingEntry.existingWeight
                        ? 'text-red-600'
                        : pendingEntry.weight < pendingEntry.existingWeight
                          ? 'text-green-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {pendingEntry.weight > pendingEntry.existingWeight
                      ? '+'
                      : ''}
                    {(
                      pendingEntry.weight - pendingEntry.existingWeight
                    ).toFixed(1)}
                    kg
                  </span>
                </div>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDuplicateCancel}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDuplicateConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              업데이트
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Weight Input Form */}
      <AnimatedContainer>
        <Card>
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 py-4">
            <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
              <Calendar className="h-5 w-5" />
              체중 기록하기
            </CardTitle>
            <CardDescription>
              오늘의 체중을 입력하여 변화를 추적해보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Community Info - 어제 기록 통계 */}
            {weightDataForDashboard && (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-muted">
                <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    어제{' '}
                    <strong className="text-foreground">
                      {weightDataForDashboard.weightRecordCount}명
                    </strong>
                    의 회원이 기록했고, 평균{' '}
                    <strong
                      className={
                        weightDataForDashboard.weightChangeAverage >= 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }
                    >
                      {weightDataForDashboard.weightChangeAverage >= 0
                        ? '+'
                        : ''}
                      {weightDataForDashboard.weightChangeAverage.toFixed(1)}kg
                    </strong>
                    의 변화가 있었어요
                  </span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  id="date"
                  label="날짜"
                  type="date"
                  value={param.recordDate}
                  onChange={(value) =>
                    onChangeParam('recordDate', String(value))
                  }
                  validationRules={{ required: true }}
                  placeholder="날짜를 선택하세요"
                  disabled={isSubmitting}
                  validateOnChange={false}
                  customValidation={(value) => {
                    if (!value) return null;
                    const existingEntry = entries.find(
                      (entry) => entry.date === String(value)
                    );
                    return existingEntry
                      ? `이 날짜에 이미 ${existingEntry.weight}kg 기록이 있습니다`
                      : null;
                  }}
                  className="h-12"
                />

                <ValidatedInput
                  id="weight"
                  label="체중 (kg)"
                  type="number"
                  value={param.weight || ''}
                  onChange={(value) => {
                    onChangeParam('weight', value === '' ? 0 : value);
                  }}
                  decimalPlaces={1}
                  maxNumber={199.9}
                  validationRules={validationRules.weight}
                  placeholder="예: 65.5"
                  disabled={isSubmitting}
                  validateOnChange={false}
                  className="h-12"
                  maxLength={5} // 최대 5자리 (예: 199.9)
                />
              </div>

              {/* 기존 기록이 있는 경우 안내 */}
              {(() => {
                const existingEntry = entries.find(
                  (entry) => entry.date === param.recordDate
                );
                if (existingEntry && !isSubmitting) {
                  return (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">
                          이 날짜에 이미{' '}
                          <strong>{existingEntry.weight}kg</strong> 기록이
                          있습니다. 새로 기록하면 기존 값이 업데이트됩니다.
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    size="lg"
                    disabled={
                      isSubmitting || !param.weight || !param.recordDate
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="mr-2"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.div>
                        기록 중...
                      </>
                    ) : (
                      '체중 기록'
                    )}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                    className="px-8"
                  >
                    취소
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 mt-4">
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3">💡 체중 기록 팁</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 매일 같은 시간대에 측정하세요 (예: 기상 후)</li>
              <li>• 화장실을 다녀온 후 측정하는 것이 좋습니다</li>
              <li>• 가벼운 옷차림 상태에서 측정해주세요</li>
              <li>• 식사 전 공복 상태에서 측정하시길 권장합니다</li>
            </ul>
          </CardContent>
        </Card>
      </AnimatedContainer>
    </div>
  );
};

export default WeightCreate;
