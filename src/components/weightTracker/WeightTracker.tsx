import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedContainer from './AnimatedContainer';
import ValidatedInput from './ValidatedInput';
import { validationRules } from '../../utils/validation';

import type {
  RecordWeightRequest,
  WeightEntry,
} from '../../types/WeightTracker.api.type';

interface WeightTrackerProps {
  onClickRecord: () => void;
  onChangeParam: (
    key: keyof RecordWeightRequest,
    value: string | number
  ) => void;
  param: RecordWeightRequest;
  entries?: WeightEntry[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  currentWeight?: number;
  totalChange?: number;
  recordedDays?: number;
}

const WeightTracker = ({
  onClickRecord,
  onChangeParam,
  param,
  entries = [],
  isLoading = false,
  isSubmitting = false,
  currentWeight,
  totalChange,
  recordedDays,
}: WeightTrackerProps) => {
  // 중복 날짜 처리를 위한 상태
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<{
    date: string;
    weight: number;
    existingWeight: number;
  } | null>(null);
  // Update param.recordDate when date changes
  useEffect(() => {
    if (!param.recordDate) {
      // Set today as default
      const today = new Date().toISOString().split('T')[0];
      onChangeParam('recordDate', today);
    }
  }, []);

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
    }
  };

  const handleDuplicateConfirm = async () => {
    if (pendingEntry) {
      onClickRecord();
      setPendingEntry(null);
    }
    setShowDuplicateDialog(false);
  };

  const handleDuplicateCancel = () => {
    setPendingEntry(null);
    setShowDuplicateDialog(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeBadge = (change: number) => {
    if (change === 0) {
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-muted-foreground border-muted-foreground/30 bg-muted/20 font-medium text-xs px-2 py-1"
        >
          <Minus className="h-3 w-3" />
          0kg
        </Badge>
      );
    }

    const isIncrease = change > 0;
    const prefix = isIncrease ? '+' : '';
    const iconColor = isIncrease ? 'text-red-500' : 'text-emerald-600';
    const bgColor = isIncrease
      ? 'bg-red-50 dark:bg-red-950/20'
      : 'bg-emerald-50 dark:bg-emerald-950/20';
    const borderColor = isIncrease
      ? 'border-red-200 dark:border-red-800'
      : 'border-emerald-200 dark:border-emerald-800';
    const textColor = isIncrease
      ? 'text-red-700 dark:text-red-400'
      : 'text-emerald-700 dark:text-emerald-400';

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 font-semibold text-xs px-2.5 py-1.5 ${bgColor} ${borderColor} ${textColor} hover:scale-105 transition-transform duration-200`}
      >
        {isIncrease ? (
          <TrendingUp className={`h-3.5 w-3.5 ${iconColor}`} />
        ) : (
          <TrendingDown className={`h-3.5 w-3.5 ${iconColor}`} />
        )}
        {prefix}
        {Math.abs(change).toFixed(1)}kg
      </Badge>
    );
  };

  const chartData = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: formatDate(entry.date),
      weight: entry.weight,
    }));

  // 백엔드에서 제공하는 통계값 사용, 없으면 기존 계산 방식 사용
  const displayCurrentWeight =
    currentWeight ??
    (entries.length > 0
      ? entries.sort((a, b) => b.date.localeCompare(a.date))[0].weight
      : null);

  const displayTotalChange =
    totalChange ??
    (entries.length > 1
      ? entries.sort((a, b) => a.date.localeCompare(b.date))[entries.length - 1]
          .weight -
        entries.sort((a, b) => a.date.localeCompare(b.date))[0].weight
      : 0);

  const displayRecordedDays = recordedDays ?? entries.length;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              체중 기록하기
            </CardTitle>
            <CardDescription>
              오늘의 체중을 입력하여 변화를 추적해보세요
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                />

                <ValidatedInput
                  id="weight"
                  label="체중 (kg)"
                  type="number"
                  value={param.weight || ''}
                  onChange={(value) =>
                    onChangeParam('weight', Number(value) || 0)
                  }
                  validationRules={validationRules.weight}
                  placeholder="예: 65.5"
                  disabled={isSubmitting}
                  validateOnChange={true}
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

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !param.weight || !param.recordDate}
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
            </form>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Current Stats */}
      <AnimatePresence>
        {displayCurrentWeight && (
          <AnimatedContainer delay={0.1} direction="up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: '현재 체중',
                  value: `${displayCurrentWeight}kg`,
                  icon: null,
                },
                {
                  label: '총 변화량',
                  value: `${displayTotalChange.toFixed(1)}kg`,
                  icon: getChangeIcon(displayTotalChange),
                },
                {
                  label: '기록된 일수',
                  value: `${displayRecordedDays}일`,
                  icon: null,
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {stat.value}
                        {stat.icon}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedContainer>
        )}
      </AnimatePresence>

      {/* Weight Chart */}
      <AnimatePresence>
        {chartData.length > 1 && (
          <AnimatedContainer delay={0.2} direction="up">
            <Card>
              <CardHeader>
                <CardTitle>체중 변화 차트</CardTitle>
                <CardDescription>
                  시간에 따른 체중 변화를 확인해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        domain={['dataMin - 2', 'dataMax + 2']}
                        tickFormatter={(value) => `${value}kg`}
                      />
                      <Tooltip
                        labelFormatter={(value) => `날짜: ${value}`}
                        formatter={(value: number) => [`${value}kg`, '체중']}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}
      </AnimatePresence>

      {/* Recent Entries */}
      <AnimatePresence>
        {entries.length > 0 && (
          <AnimatedContainer delay={0.3} direction="up">
            <Card>
              <CardHeader>
                <CardTitle>최근 기록</CardTitle>
                <CardDescription>
                  최근 체중 기록들을 확인해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 7)
                    .map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{entry.weight}kg</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <div>
                          {entry.change !== undefined &&
                            getChangeBadge(entry.change)}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeightTracker;
