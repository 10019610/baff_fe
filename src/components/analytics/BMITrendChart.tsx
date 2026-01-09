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
import type { WeightDataPoint } from '../../types/Analytics.type';

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

interface BMITrendChartProps {
  data: WeightDataPoint[];
}

const BMITrendChart: React.FC<BMITrendChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);
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

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
          <div className="text-sm">체중을 기록하면 BMI 그래프가 표시됩니다</div>
        </div>
      </div>
    );
  }

  // 데이터 준비
  // 첫 번째와 마지막 날짜의 년도 확인
  const firstDate = data.length > 0 ? new Date(data[0].fullDate) : null;
  const lastDate =
    data.length > 0 ? new Date(data[data.length - 1].fullDate) : null;
  const showYear =
    firstDate && lastDate && firstDate.getFullYear() !== lastDate.getFullYear();

  const labels = data.map((item) => {
    // fullDate는 원본 날짜 문자열 (YYYY-MM-DD 형식)
    const date = new Date(item.fullDate);
    const year = date.getFullYear() % 100; // 2자리 년도 (예: 2025 -> 25)
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 년도가 다르면 년도 포함, 같으면 월/일만
    if (showYear) {
      return `${year}/${month}/${day}`;
    }
    return `${month}/${day}`;
  });
  const bmiData = data.map((item) => item.bmi);

  // 데이터 개수에 따라 동적으로 maxTicksLimit 계산 (45도 회전 방지를 위해 더 적게 표시)
  const getMaxTicksLimit = (): number => {
    const dataCount = data.length;
    if (dataCount <= 30) return dataCount; // 30개 이하면 모두 표시
    if (dataCount <= 40) return 7; // 40개 이하면 7개
    if (dataCount <= 60) return 8; // 60개 이하면 8개
    if (dataCount <= 90) return 9; // 90개 이하면 9개
    return 10; // 그 이상이면 10개
  };

  // BMI 범위별 색상 결정
  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'rgba(59, 130, 246, 0.8)'; // blue - 저체중
    if (bmi < 25) return 'rgba(34, 197, 94, 0.8)'; // green - 정상
    if (bmi < 30) return 'rgba(251, 191, 36, 0.8)'; // yellow - 과체중
    return 'rgba(239, 68, 68, 0.8)'; // red - 비만
  };

  // 최근 BMI를 기준으로 색상 결정
  const latestBMI = bmiData[bmiData.length - 1];
  const primaryColor = getBMIColor(latestBMI);

  // 그라데이션 생성
  const createGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    if (latestBMI < 18.5) {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
      gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
    } else if (latestBMI < 25) {
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
      gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');
    } else if (latestBMI < 30) {
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
      gradient.addColorStop(0.5, 'rgba(251, 191, 36, 0.1)');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0.02)');
    } else {
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
    }
    return gradient;
  };

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'BMI',
        data: bmiData,
        borderColor: primaryColor,
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const chart = context.chart;
          const { ctx } = chart;
          return createGradient(ctx);
        },
        borderWidth: 3,
        pointBackgroundColor: primaryColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 0, // 포인트 보더 숨김
        pointRadius: 0, // 포인트 완전히 숨김
        pointHoverRadius: 0, // hover 시에도 포인트 표시 안 함
        pointHoverBackgroundColor: primaryColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 0, // hover 시 보더도 숨김
        fill: true,
        tension: 0.4,
      },
    ],
  };

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
          borderColor: primaryColor.replace('0.8', '0.3'), // 투명도 조정
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
              const item = data[index];
              return `${item.fullDate}`;
            },
            label: (context: TooltipItem<'line'>) => {
              const bmi = context.parsed.y;
              const index = context.dataIndex;
              const item = data[index];

              let category = '';
              if (bmi < 18.5) category = '저체중';
              else if (bmi < 25) category = '정상';
              else if (bmi < 30) category = '과체중';
              else category = '비만';

              return `📊 BMI: ${bmi.toFixed(1)} (${category})\n⚖️ 체중: ${item.weight.toFixed(1)}kg`;
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
            if (ticks.length > 0 && data.length > 0) {
              const lastTick = ticks[ticks.length - 1];
              const lastDataIndex = data.length - 1;
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
            maxRotation: 0,
            minRotation: 0,
            callback: function (
              value: string | number,
              index: number,
              ticks: Tick[]
            ) {
              if (index === ticks.length - 1) {
                const lastIndex = data.length - 1;
                if (lastIndex >= 0 && labels[lastIndex]) {
                  return labels[lastIndex];
                }
              }
              return labels[value as number] || '';
            },
          },
        },
        y: {
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
            stepSize: 0.5, // 0.5 단위로 표시
            callback: function (value: string | number) {
              return typeof value === 'number' ? value.toFixed(1) : value;
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
    [isMobile, isDarkMode, data, labels, bmiData]
  );

  // 차트 업데이트 시 애니메이션 재실행
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && data.length > 0) {
      chart.update('active');
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="h-80 w-full"
    >
      <Line ref={chartRef} data={chartData} options={options} />
    </motion.div>
  );
};

export default BMITrendChart;
