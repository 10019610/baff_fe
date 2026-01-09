import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
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

import WeightChart from './WeightChart';
import { TrendingDown, TrendingUp, Minus, Plus, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedContainer from './AnimatedContainer';

import type {
  RecordWeightRequest,
  WeightEntry,
} from '../../types/WeightTracker.api.type';
import WeightCreate from './WeightCreate';
import LoginModal from '../auth/LoginModal';
import { useAuth } from '../../context/AuthContext';

interface WeightDataForDashboard {
  weightChangeAverage: number;
  weightRecordCount: number;
}

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
  weightDataForDashboard?: WeightDataForDashboard;
}

export interface WeightTrackerRef {
  scrollToRecentEntries: () => void;
}

const WeightTracker = forwardRef<WeightTrackerRef, WeightTrackerProps>(
  (
    {
      onClickRecord,
      onChangeParam,
      param,
      entries = [],
      isLoading = false,
      isSubmitting = false,
      currentWeight,
      totalChange,
      recordedDays,
      weightDataForDashboard,
    },
    ref
  ) => {
    const { isAuthenticated } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);
    const [showWeightCreate, setShowWeightCreate] = useState(false);

    // 페이징 상태
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage] = useState(7);

    // 최근 기록 섹션으로 스크롤하기 위한 ref
    const recentEntriesRef = useRef<HTMLDivElement>(null);

    // 최신순으로 정렬된 기록
    const sortedEntries = [...entries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    // 페이징된 기록 계산 (정렬된 배열 기준)
    const totalPages = Math.ceil(sortedEntries.length / entriesPerPage);
    const displayedEntries = sortedEntries.slice(
      0,
      currentPage * entriesPerPage
    );
    const hasMoreEntries = currentPage < totalPages;

    // 더 보기 버튼 클릭 핸들러
    const handleLoadMore = () => {
      setCurrentPage((prev) => prev + 1);
      // 새로 로드된 항목으로 스크롤
      setTimeout(() => {
        if (recentEntriesRef.current) {
          recentEntriesRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          });
        }
      }, 100);
    };

    // 부모 컴포넌트에서 호출할 수 있는 스크롤 함수 노출
    useImperativeHandle(ref, () => ({
      scrollToRecentEntries: () => {
        if (recentEntriesRef.current) {
          setTimeout(() => {
            recentEntriesRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 300); // 데이터 업데이트 후 스크롤
        }
      },
    }));

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

    // 백엔드에서 제공하는 통계값 사용, 없으면 기존 계산 방식 사용
    const displayCurrentWeight =
      currentWeight ??
      (entries.length > 0
        ? [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].weight
        : null);

    const displayTotalChange =
      totalChange ??
      (entries.length > 1
        ? (() => {
            const sorted = [...entries].sort((a, b) =>
              a.date.localeCompare(b.date)
            );
            return sorted[sorted.length - 1].weight - sorted[0].weight;
          })()
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
      <div>
        {!isAuthenticated && (
          <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
        )}
        {/* 체중 기록하기 폼 */}
        {showWeightCreate ? (
          <WeightCreate
            onClickRecord={onClickRecord}
            entries={entries}
            param={param}
            isSubmitting={isSubmitting}
            onClose={() => setShowWeightCreate(false)}
            onChangeParam={onChangeParam}
            weightDataForDashboard={weightDataForDashboard}
          />
        ) : (
          <div className="space-y-6">
            {/* 체중 기록하기 버튼 */}
            <AnimatedContainer>
              <Card
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-primary/40 bg-gradient-to-br from-primary/20 to-primary/30 hover:from-primary/25 hover:to-primary/35 hover:border-primary/50 hover:scale-[1.02]"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowWeightCreate(true);
                  } else {
                    setLoginOpen(true);
                  }
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/30 rounded-full group-hover:bg-primary/40 transition-all duration-200 shadow-sm group-hover:shadow group-hover:scale-110">
                      <Scale className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg transition-colors">
                        체중 기록하기
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        오늘의 체중을 입력해보세요
                      </p>
                    </div>
                    <div className="bg-primary/20 p-2 rounded-full group-hover:bg-primary/30 transition-all duration-200">
                      <Plus className="h-5 w-5 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedContainer>

            {entries.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Scale className="h-12 w-12 mx-auto mb-4 text-primary/60" />
                  <h3 className="text-lg font-medium mb-2">
                    아직 기록된 체중이 없습니다
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    규칙적인 체중 기록으로 건강한 변화를 시작해보세요!
                  </p>
                  <div className="space-y-4 max-w-md mx-auto bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground">
                    <h4 className="font-medium text-foreground">
                      💡 체중 기록 팁
                    </h4>
                    <ul className="space-y-2 text-left list-disc list-inside">
                      <li>매일 같은 시간대에 측정하세요 (예: 기상 후)</li>
                      <li>화장실을 다녀온 후 측정하는 것이 좋습니다</li>
                      <li>가벼운 옷차림 상태에서 측정해주세요</li>
                      <li>식사 전 공복 상태에서 측정하시길 권장합니다</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Stats */}
            <AnimatePresence>
              {displayCurrentWeight && (
                <AnimatedContainer delay={0.1} direction="up">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        label: '현재 체중',
                        value: `${displayCurrentWeight}kg`,
                        icon: '⚖️',
                        gradient:
                          'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
                        border: 'border-blue-200 dark:border-blue-800',
                        textColor: 'text-blue-700 dark:text-blue-300',
                        bgIcon: 'bg-blue-100 dark:bg-blue-900/30',
                      },
                      {
                        label: '총 변화량',
                        value: `${displayTotalChange >= 0 ? '+' : ''}${displayTotalChange.toFixed(1)}kg`,
                        icon: displayTotalChange >= 0 ? '📈' : '📉',
                        gradient:
                          displayTotalChange >= 0
                            ? 'from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20'
                            : 'from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20',
                        border:
                          displayTotalChange >= 0
                            ? 'border-emerald-200 dark:border-emerald-800'
                            : 'border-red-200 dark:border-red-800',
                        textColor:
                          displayTotalChange >= 0
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-red-700 dark:text-red-300',
                        bgIcon:
                          displayTotalChange >= 0
                            ? 'bg-emerald-100 dark:bg-emerald-900/30'
                            : 'bg-red-100 dark:bg-red-900/30',
                      },
                      {
                        label: '기록된 일수',
                        value: `${displayRecordedDays}일`,
                        icon: '📅',
                        gradient:
                          'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20',
                        border: 'border-purple-200 dark:border-purple-800',
                        textColor: 'text-purple-700 dark:text-purple-300',
                        bgIcon: 'bg-purple-100 dark:bg-purple-900/30',
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`overflow-hidden border-2 ${stat.border} hover:shadow-lg transition-all duration-300`}
                        >
                          <CardContent
                            className={`pt-6 bg-gradient-to-br ${stat.gradient}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className={`p-2 rounded-lg ${stat.bgIcon}`}>
                                <span className="text-lg">{stat.icon}</span>
                              </div>
                              <div
                                className={`text-2xl font-bold ${stat.textColor}`}
                              >
                                {stat.value}
                              </div>
                            </div>
                            <p
                              className={`text-sm font-medium ${stat.textColor} opacity-80`}
                            >
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
              {entries.length > 0 && (
                <AnimatedContainer delay={0.2} direction="up">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 py-4">
                      <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          📈
                        </div>
                        체중 변화 차트
                      </CardTitle>
                      <CardDescription className="text-blue-700 dark:text-blue-300">
                        시간에 따른 체중 변화와 상세 통계를 확인해보세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <WeightChart entries={entries} />
                    </CardContent>
                  </Card>
                </AnimatedContainer>
              )}
            </AnimatePresence>

            {/* Recent Entries */}
            <AnimatePresence>
              {displayedEntries.length > 0 && (
                <AnimatedContainer delay={0.3} direction="up">
                  <Card className="overflow-hidden" ref={recentEntriesRef}>
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 py-4">
                      <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          📋
                        </div>
                        최근 기록
                      </CardTitle>
                      <CardDescription className="text-indigo-700 dark:text-indigo-300">
                        최근 체중 기록들과 변화량을 확인해보세요
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {displayedEntries.map((entry, index) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            className="p-4 border-2 border-transparent rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200"
                          >
                            {/* 모바일과 데스크톱 모두 가로 레이아웃 유지, 간격만 조정 */}
                            <div className="flex items-center justify-between gap-3">
                              {/* 왼쪽: 날짜와 체중 정보 */}
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border flex-shrink-0">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {new Date(entry.date).getDate()}
                                  </span>
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(entry.date).toLocaleDateString(
                                      'ko-KR',
                                      { month: 'short' }
                                    )}
                                  </span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {entry.weight}kg
                                  </span>
                                  {/* 모바일에서는 간단한 날짜 표시 */}
                                  <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                                    {new Date(entry.date).toLocaleDateString(
                                      'ko-KR',
                                      {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric',
                                      }
                                    )}
                                  </span>
                                  {/* 모바일용 더 짧은 날짜 */}
                                  <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                                    {new Date(entry.date).toLocaleDateString(
                                      'ko-KR',
                                      {
                                        month: 'short',
                                        day: 'numeric',
                                      }
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* 오른쪽: 배지들 */}
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                                {entry.change !== undefined &&
                                  getChangeBadge(entry.change)}
                                {index === 0 && (
                                  <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full border border-yellow-200 dark:border-yellow-700">
                                    최신
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* 더 보기 버튼 */}
                      {hasMoreEntries && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handleLoadMore}
                              variant="outline"
                              className="w-full h-12 bg-gradient-to-r cursor-pointer from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-200 dark:border-indigo-800 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Plus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                  <span className="font-medium text-indigo-700 dark:text-indigo-300">
                                    더 보기
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-indigo-300 dark:border-indigo-700">
                                  <span className="text-sm text-indigo-600 dark:text-indigo-400">
                                    {sortedEntries.length -
                                      displayedEntries.length}
                                    개
                                  </span>
                                  <TrendingDown className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        </div>
                      )}

                      {/* 모든 기록을 표시한 경우 안내 */}
                      {!hasMoreEntries && sortedEntries.length > 7 && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            총 {sortedEntries.length}개의 모든 기록을 표시하고
                            있습니다
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedContainer>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }
);

WeightTracker.displayName = 'WeightTracker';

export default WeightTracker;
