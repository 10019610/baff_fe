import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
  type InteractionItem,
  type ChartEvent,
  type ScriptableContext,
  type Tick,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import type { WeightEntry } from '../../types/WeightTracker.api.type';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type FilterPeriod = 'all' | '1month' | '3months' | '6months';

interface WeightChartProps {
  entries: WeightEntry[];
  className?: string;
  dashboard?: boolean;
}

const WeightChart: React.FC<WeightChartProps> = ({
  entries,
  className = '',
  dashboard = true,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 다크 모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(
        document.documentElement.classList.contains('dark') ||
          window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    };
    checkDarkMode();

    // MutationObserver로 dark 클래스 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 미디어 쿼리 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // 필터링된 데이터 준비
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let cutoffDate: Date;
    switch (filterPeriod) {
      case '1month':
        cutoffDate = new Date(today);
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '3months':
        cutoffDate = new Date(today);
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case '6months':
        cutoffDate = new Date(today);
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case 'all':
      default:
        cutoffDate = new Date(0); // 모든 데이터 포함
        break;
    }

    return [...entries]
      .filter((entry) => {
        if (!entry.weight || !entry.date) return false;
        if (filterPeriod === 'all') return true;

        // 날짜 문자열을 Date 객체로 변환 (시간 부분 제거)
        const entryDateStr = entry.date.split('T')[0]; // "YYYY-MM-DD" 형식으로 변환
        const entryDate = new Date(entryDateStr);
        entryDate.setHours(0, 0, 0, 0); // 시간 부분 제거

        return entryDate >= cutoffDate && entryDate <= today;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, filterPeriod]);

  // 데이터 준비
  const sortedEntries = filteredEntries;

  const labels = sortedEntries.map((entry) => {
    const date = new Date(entry.date);
    const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
    const day = date.getDate();
    return `${month}/${day}`;
  });

  const weightData = sortedEntries.map((entry) => entry.weight);

  // 필터별 최대 틱 수 설정 (모바일 고려)
  const getMaxTicksLimit = (): number => {
    switch (filterPeriod) {
      case '1month':
        return 7; // 1개월: 주 단위로 표시 (약 4-5주)
      case '3months':
        return 6; // 3개월: 2주 단위로 표시
      case '6months':
        return 6; // 6개월: 월 단위로 표시
      case 'all':
      default:
        return 8; // 전체: 기본값 유지
    }
  };

  // 최소/최대값 계산 (여백 추가)
  const minWeight = weightData.length > 0 ? Math.min(...weightData) : 0;
  const maxWeight = weightData.length > 0 ? Math.max(...weightData) : 0;
  const weightRange = maxWeight - minWeight;
  const padding = Math.max(weightRange * 0.1, 1); // 최소 1kg 여백

  // 그라데이션 생성
  const createGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)'); // blue-500 with opacity
    gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
    return gradient;
  };

  const data: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: '체중',
        data: weightData,
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx } = chart;
          return createGradient(ctx);
        },
        borderWidth: 3,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 0, // 포인트 보더 숨김
        pointRadius: 0, // 포인트 완전히 숨김
        pointHoverRadius: 0, // hover 시에도 포인트 표시 안 함
        pointHoverBackgroundColor: 'rgb(37, 99, 235)', // blue-600
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 0, // hover 시 보더도 숨김
        fill: true,
        tension: 0.4, // 부드러운 곡선
      },
    ],
  };

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 20, // 오른쪽 여백 추가
        },
      },
      interaction: {
        intersect: false, // 포인트와 교차하지 않아도 작동
        mode: 'index' as const, // 같은 인덱스(x축 위치)의 모든 y값에서 작동
      },
      plugins: {
        legend: {
          display: false, // 범례 숨김
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(59, 130, 246, 0.3)', // blue-500 with opacity
          borderWidth: 1,
          cornerRadius: 12,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
          titleFont: {
            size: 12,
            weight: 600,
          },
          bodyFont: {
            size: 11,
            weight: 500,
          },
          // 툴팁이 차트 영역을 벗어나지 않도록 설정
          position: 'average',
          caretSize: 6,
          displayColors: false, // 범례 색상 표시 제거
          yAlign: 'bottom',
          xAlign: 'center',
          enabled: true,
          intersect: false, // 포인트와 교차하지 않아도 작동
          callbacks: {
            title: (context: TooltipItem<'line'>[]) => {
              const index = context[0].dataIndex;
              const entry = sortedEntries[index];
              return new Date(entry.date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              });
            },
            label: (context: TooltipItem<'line'>) => {
              const weight = context.parsed.y;
              const index = context.dataIndex;
              const entry = sortedEntries[index];

              let changeText = '';
              if (entry.change !== undefined && entry.change !== 0) {
                const changeColor = entry.change > 0 ? '🔺' : '🔻';
                changeText = `\n${changeColor} 전일 대비: ${entry.change > 0 ? '+' : ''}${entry.change.toFixed(1)}kg`;
              }

              return `⚖️ 체중: ${weight.toFixed(1)}kg${changeText}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          afterBuildTicks: (axis) => {
            // 마지막 틱이 마지막 데이터 포인트를 포함하는지 확인
            const ticks = axis.ticks;
            if (ticks.length > 0 && sortedEntries.length > 0) {
              const lastTick = ticks[ticks.length - 1];
              const lastDataIndex = sortedEntries.length - 1;
              const lastDataLabel = labels[lastDataIndex];

              // 마지막 틱이 마지막 데이터와 다르면 교체
              if (
                lastTick &&
                (lastTick.value !== lastDataIndex ||
                  lastTick.label !== lastDataLabel)
              ) {
                // 마지막 틱을 마지막 데이터로 교체
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ticks[ticks.length - 1] as any) = {
                  ...lastTick,
                  value: lastDataIndex,
                  label: lastDataLabel,
                };
              }
            }
          },
          ticks: {
            color: isDarkMode
              ? 'rgb(156, 163, 175)' // gray-400 - 다크 모드에서 중간 밝기
              : 'rgb(107, 114, 128)', // gray-500 - 라이트 모드에서 연한 색상
            font: {
              size: isMobile ? 10 : 12, // 모바일에서 작은 폰트
              weight: 500, // 적당한 두께
            },
            maxTicksLimit: getMaxTicksLimit(), // 필터별 틱 수
            maxRotation: 45, // 날짜가 길 경우 회전
            minRotation: 0,

            callback: function (
              value: string | number,
              index: number,
              ticks: Tick[]
            ) {
              // 마지막 틱은 항상 마지막 데이터의 날짜 표시
              if (index === ticks.length - 1) {
                const lastIndex = sortedEntries.length - 1;
                if (lastIndex >= 0 && labels[lastIndex]) {
                  return labels[lastIndex];
                }
              }
              // 나머지는 기본 동작
              return labels[value as number] || '';
            },
          },
        },
        y: {
          min: minWeight - padding,
          max: maxWeight + padding,
          grid: {
            color: 'rgba(107, 114, 128, 0.1)', // gray-500 with opacity
          },
          border: {
            display: false,
          },
          ticks: {
            color: 'rgb(107, 114, 128)', // gray-500
            font: {
              size: 12,
              weight: 500,
            },
            callback: function (value: string | number) {
              return `${Number(value).toFixed(1)}kg`;
            },
            stepSize: 1, // 0.5kg 단위로 표시
          },
        },
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuart',
      },
      onHover: (_event: ChartEvent, elements: InteractionItem[]) => {
        const chart = chartRef.current;
        if (chart?.canvas) {
          chart.canvas.style.cursor =
            elements.length > 0 ? 'pointer' : 'default';
        }
      },
    }),
    [
      isMobile,
      isDarkMode,
      filterPeriod,
      sortedEntries,
      minWeight,
      maxWeight,
      padding,
    ]
  );

  // 차트 업데이트 시 애니메이션 재실행
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && sortedEntries.length > 0) {
      chart.update('active');
    }
  }, [sortedEntries]);

  const filterButtons: { period: FilterPeriod; label: string }[] = [
    { period: 'all', label: '전체' },
    { period: '1month', label: '1개월' },
    { period: '3months', label: '3개월' },
    { period: '6months', label: '6개월' },
  ];

  // 전체 데이터가 없을 때
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
          <div className="text-sm">체중을 기록하면 그래프가 표시됩니다</div>
        </div>
      </div>
    );
  }

  // 필터링된 데이터가 없을 때
  if (sortedEntries.length === 0) {
    return (
      <div>
        {/* 필터 버튼 */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
          {filterButtons.map(({ period, label }) => (
            <Button
              key={period}
              variant={filterPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPeriod(period)}
              className={`transition-all duration-200 ${
                filterPeriod === period
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                  : 'hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 dark:hover:border-primary/50'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <div className="text-lg font-medium mb-2">
              선택한 기간에 데이터가 없습니다
            </div>
            <div className="text-sm">
              다른 기간을 선택하거나 체중을 기록해주세요
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 1개일 때
  if (sortedEntries.length === 1) {
    return (
      <div>
        {/* 필터 버튼 */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
          {filterButtons.map(({ period, label }) => (
            <Button
              key={period}
              variant={filterPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPeriod(period)}
              className={`transition-all duration-200 ${
                filterPeriod === period
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                  : 'hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 dark:hover:border-primary/50'
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <div className="text-lg font-medium mb-2">
              더 많은 데이터가 필요합니다
            </div>
            <div className="text-sm">
              현재 기록: {sortedEntries[0].weight}kg
              <br />
              변화를 보려면 최소 2개의 기록이 필요합니다
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative ${className}`}
    >
      {/* 필터 버튼 */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
        {filterButtons.map(({ period, label }) => (
          <Button
            key={period}
            variant={filterPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterPeriod(period)}
            className={`transition-all duration-200 ${
              filterPeriod === period
                ? '!bg-primary hover:!bg-primary/90 !text-primary-foreground shadow-md'
                : 'hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 dark:hover:border-primary/50'
            }`}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="h-80 w-full">
        <Line ref={chartRef} data={data} options={options} />
      </div>

      {/* 차트 하단 통계 정보 */}
      {dashboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
              최고 체중
            </div>
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {maxWeight.toFixed(1)}kg
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              최저 체중
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {minWeight.toFixed(1)}kg
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
              변화 폭
            </div>
            <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {weightRange.toFixed(1)}kg
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
              평균 체중
            </div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {weightData.length > 0
                ? (
                    weightData.reduce((a, b) => a + b, 0) / weightData.length
                  ).toFixed(1)
                : '0.0'}
              kg
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WeightChart;
