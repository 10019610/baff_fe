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
import type { WeightDataPoint } from '../../types/Analytics.type';

type FilterPeriod = 'all' | '1month' | '3months' | '6months';

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

interface WeightTrendChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
  hideFilter?: boolean; // 필터 숨김 옵션 (배틀 모달 등에서 사용)
}

const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  data,
  targetWeight,
  hideFilter = false,
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

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  // 필터링된 데이터 준비
  const filteredData = useMemo(() => {
    // 필터가 숨겨져 있으면 전체 데이터 사용
    if (hideFilter) {
      return [...(data || [])];
    }

    if (!data || data.length === 0) {
      return [];
    }

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
        cutoffDate = new Date(0);
        break;
    }

    return [...data].filter((item) => {
      if (filterPeriod === 'all') return true;
      // fullDate는 원본 날짜 문자열 (YYYY-MM-DD 형식 또는 포맷된 문자열)
      // "대결 시작" 같은 문자열인 경우 필터링하지 않음
      if (item.fullDate === '대결 시작' || !item.fullDate.includes('-')) {
        return true;
      }
      const entryDateStr = item.fullDate.split('T')[0];
      const entryDate = new Date(entryDateStr);
      if (isNaN(entryDate.getTime())) return true; // 유효하지 않은 날짜는 포함
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= cutoffDate && entryDate <= today;
    });
  }, [data, filterPeriod, hideFilter]);

  // 첫 번째와 마지막 날짜의 년도 확인 (필터 숨김 시)
  const showYear = useMemo(() => {
    if (!hideFilter || filteredData.length === 0) {
      return false;
    }

    const firstItem = filteredData[0];
    let first: Date | null = null;
    if (
      firstItem.fullDate !== '대결 시작' &&
      firstItem.fullDate.includes('-')
    ) {
      first = new Date(firstItem.fullDate);
    } else if (filteredData.length > 1) {
      first = new Date(filteredData[1].fullDate);
    }

    const lastItem = filteredData[filteredData.length - 1];
    let last: Date | null = null;
    if (lastItem.fullDate !== '대결 시작' && lastItem.fullDate.includes('-')) {
      last = new Date(lastItem.fullDate);
    } else if (filteredData.length > 1) {
      last = new Date(filteredData[filteredData.length - 2].fullDate);
    }

    return first && last && first.getFullYear() !== last.getFullYear();
  }, [hideFilter, filteredData]);

  // 데이터 준비
  const labels = useMemo(() => {
    return filteredData.map((item) => {
      // "대결 시작" 같은 특수 문자열 처리
      if (item.fullDate === '대결 시작' || !item.fullDate.includes('-')) {
        return item.date || '시작';
      }

      // fullDate는 원본 날짜 문자열 (YYYY-MM-DD 형식)
      const date = new Date(item.fullDate);
      if (isNaN(date.getTime())) {
        return item.date || '';
      }

      const year = date.getFullYear() % 100; // 2자리 년도
      const month = date.getMonth() + 1;
      const day = date.getDate();

      // 필터가 숨겨져 있고 년도가 다르면 년도 포함
      if (hideFilter && showYear) {
        return `${year}/${month}/${day}`;
      }
      return `${month}/${day}`;
    });
  }, [filteredData, hideFilter, showYear]);

  const weightData = useMemo(
    () => filteredData.map((item) => item.weight),
    [filteredData]
  );
  const targetData = useMemo(
    () => (targetWeight ? filteredData.map(() => targetWeight) : []),
    [targetWeight, filteredData]
  );

  // 필터별 최대 틱 수 설정 함수
  const getMaxTicksLimit = (): number => {
    if (hideFilter) {
      const dataCount = filteredData.length;
      if (dataCount <= 5) return dataCount;
      if (dataCount <= 10) return 5;
      if (dataCount <= 20) return 6;
      if (dataCount <= 40) return 7;
      if (dataCount <= 60) return 8;
      if (dataCount <= 90) return 9;
      return 10;
    }
    switch (filterPeriod) {
      case '1month': {
        // 1개월 필터: 30개까지는 모두 표시
        const dataCount = filteredData.length;
        if (dataCount <= 30) return dataCount;
        return 30; // 30개 초과시에도 최대 30개까지만 표시
      }
      case '3months':
        return 6;
      case '6months':
        return 6;
      case 'all':
      default:
        return 8;
    }
  };

  // 최소/최대값 계산 (여백 추가)
  const minValue = useMemo(() => {
    const allValues = [...weightData];
    if (targetWeight) allValues.push(targetWeight);
    return allValues.length > 0 ? Math.min(...allValues) : 0;
  }, [weightData, targetWeight]);

  const maxValue = useMemo(() => {
    const allValues = [...weightData];
    if (targetWeight) allValues.push(targetWeight);
    return allValues.length > 0 ? Math.max(...allValues) : 0;
  }, [weightData, targetWeight]);

  const padding = useMemo(() => {
    const range = maxValue - minValue;
    return Math.max(range * 0.1, 1);
  }, [minValue, maxValue]);

  // 그라데이션 생성
  const createGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)'); // green-500 with opacity
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');
    return gradient;
  };

  const chartData: ChartData<'line'> = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: '체중',
          data: weightData,
          borderColor: 'rgb(34, 197, 94)', // green-500
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const chart = context.chart;
            const { ctx } = chart;
            return createGradient(ctx);
          },
          borderWidth: 3,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 0,
          pointRadius: 0, // 포인트 완전히 숨김
          pointHoverRadius: 0, // hover 시에도 포인트 표시 안 함
          pointHoverBackgroundColor: 'rgb(21, 128, 61)', // green-600
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 0,
          fill: true,
          tension: 0.4,
        },
        ...(targetWeight
          ? [
              {
                label: '목표 체중',
                data: targetData,
                borderColor: 'rgb(239, 68, 68)', // red-500
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 0,
                fill: false,
              },
            ]
          : []),
      ],
    }),
    [labels, weightData, targetData, targetWeight, isMobile]
  );

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 20,
        },
      },
      interaction: {
        intersect: false, // 포인트와 교차하지 않아도 작동
        mode: 'index' as const, // 같은 인덱스(x축 위치)의 모든 y값에서 작동
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(34, 197, 94, 0.3)', // green-500 with opacity
          borderWidth: 1,
          cornerRadius: 12,
          padding: 10,
          boxPadding: 4,
          usePointStyle: true,
          position: 'average',
          caretSize: 6,
          displayColors: false,
          yAlign: 'bottom',
          xAlign: 'center',
          enabled: true,
          intersect: false, // 포인트와 교차하지 않아도 작동
          titleFont: {
            size: 12,
            weight: 600,
          },
          bodyFont: {
            size: 11,
            weight: 500,
          },
          callbacks: {
            title: (context: TooltipItem<'line'>[]) => {
              const index = context[0].dataIndex;
              const item = filteredData[index];
              return `${item.fullDate}`;
            },
            label: (context: TooltipItem<'line'>) => {
              if (context.datasetIndex === 0) {
                const weight = context.parsed.y ?? 0;
                const index = context.dataIndex;
                const item = filteredData[index];

                let changeText = '';
                if (item.change !== 0) {
                  const changeColor = item.change > 0 ? '🔺' : '🔻';
                  changeText = `\n${changeColor} 변화: ${item.change > 0 ? '+' : ''}${item.change.toFixed(1)}kg`;
                }

                return `⚖️ 체중: ${weight.toFixed(1)}kg${changeText}`;
              } else {
                return `🎯 목표: ${(context.parsed.y ?? 0).toFixed(1)}kg`;
              }
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
            const ticks = axis.ticks;
            if (ticks.length > 0 && filteredData.length > 0) {
              const lastTick = ticks[ticks.length - 1];
              const lastDataIndex = filteredData.length - 1;
              const lastDataLabel = labels[lastDataIndex];

              if (
                lastTick &&
                (lastTick.value !== lastDataIndex ||
                  lastTick.label !== lastDataLabel)
              ) {
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
            color: isDarkMode ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
            font: {
              size: isMobile ? 10 : 12,
              weight: 500,
            },
            maxTicksLimit: getMaxTicksLimit(),
            maxRotation: hideFilter ? 0 : 45, // 필터 숨김 시 회전 없음
            minRotation: 0,
            callback: function (
              value: string | number,
              index: number,
              ticks: Tick[]
            ) {
              if (index === ticks.length - 1) {
                const lastIndex = filteredData.length - 1;
                if (lastIndex >= 0 && labels[lastIndex]) {
                  return labels[lastIndex];
                }
              }
              return labels[value as number] || '';
            },
          },
        },
        y: {
          min: minValue - padding,
          max: maxValue + padding,
          grid: {
            color: 'rgba(107, 114, 128, 0.1)',
          },
          border: {
            display: false,
          },
          ticks: {
            color: 'rgb(107, 114, 128)',
            font: {
              size: 12,
              weight: 500,
            },
            callback: function (value: string | number) {
              return `${Number(value).toFixed(1)}kg`;
            },
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
      filteredData,
      labels,
      minValue,
      maxValue,
      padding,
      hideFilter,
    ]
  );

  // 차트 업데이트 시 애니메이션 재실행
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && filteredData.length > 0) {
      chart.update('active');
    }
  }, [filteredData]);

  const filterButtons: { period: FilterPeriod; label: string }[] = [
    { period: 'all', label: '전체' },
    { period: '1month', label: '1개월' },
    { period: '3months', label: '3개월' },
    { period: '6months', label: '6개월' },
  ];

  // 필터링된 데이터가 없을 때
  if (filteredData.length === 0) {
    return (
      <div>
        {!hideFilter && (
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
        )}
        <div className="flex items-center justify-center h-80 text-muted-foreground">
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <div className="text-lg font-medium mb-2">
              {hideFilter
                ? '데이터가 없습니다'
                : '선택한 기간에 데이터가 없습니다'}
            </div>
            <div className="text-sm">
              {hideFilter
                ? '체중을 기록해주세요'
                : '다른 기간을 선택하거나 체중을 기록해주세요'}
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
      className="relative"
    >
      {/* 필터 버튼 (hideFilter가 false일 때만 표시) */}
      {!hideFilter && (
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
      )}

      <div className="h-80 w-full">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

export default WeightTrendChart;
