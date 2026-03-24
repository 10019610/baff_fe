import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
  type InteractionItem,
  type ChartEvent,
  type Tick,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import type { WeightDataPoint } from '../../types/Analytics.type';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeightChangeChartProps {
  data: WeightDataPoint[];
}

const WeightChangeChart: React.FC<WeightChangeChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);
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

  // 데이터 준비 (변화량이 0이 아닌 것만)
  const filteredData = data.filter((item) => item.change !== 0);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
          <div className="text-sm">체중 변화 데이터가 표시됩니다</div>
        </div>
      </div>
    );
  }

  const labels = filteredData.map((item) => {
    // fullDate는 원본 날짜 문자열 (YYYY-MM-DD 형식)
    const date = new Date(item.fullDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  });
  const changes = filteredData.map((item) => item.change);

  // 색상 설정 (증가: 빨강, 감소: 녹색)
  const backgroundColors = changes.map(
    (change) =>
      change > 0
        ? 'rgba(239, 68, 68, 0.7)' // red for weight gain
        : 'rgba(34, 197, 94, 0.7)' // green for weight loss
  );

  const borderColors = changes.map((change) =>
    change > 0 ? 'rgb(239, 68, 68)' : 'rgb(34, 197, 94)'
  );

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: '체중 변화',
        data: changes,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          right: 20,
        },
      },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(107, 114, 128)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 16,
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyFont: {
          size: 13,
          weight: 500,
        },
        callbacks: {
          title: (context: TooltipItem<'bar'>[]) => {
            const index = context[0].dataIndex;
            const item = filteredData[index];
            return `${item.fullDate}`;
          },
          label: (context: TooltipItem<'bar'>) => {
            const change = context.parsed.y ?? 0;
            const index = context.dataIndex;
            const item = filteredData[index];

            const changeIcon = change > 0 ? '🔺' : '🔻';
            const changeText = change > 0 ? '증가' : '감소';

            return [
              `${changeIcon} ${changeText}: ${change > 0 ? '+' : ''}${change.toFixed(1)}kg`,
              `⚖️ 현재 체중: ${item.weight.toFixed(1)}kg`,
            ];
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
          color: isDarkMode
            ? 'rgb(156, 163, 175)'
            : 'rgb(107, 114, 128)',
          font: {
            size: isMobile ? 10 : 12,
            weight: 500,
          },
          maxTicksLimit: 8,
          maxRotation: 45,
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
            const num = typeof value === 'number' ? value : parseFloat(value);
            return `${num > 0 ? '+' : ''}${num.toFixed(1)}kg`;
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
    [isMobile, isDarkMode, filteredData, labels]
  );

  // 차트 업데이트 시 애니메이션 재실행
  useEffect(() => {
    const chart = chartRef.current;
    if (chart && filteredData.length > 0) {
      chart.update('active');
    }
  }, [filteredData]);

  if (filteredData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📈</div>
          <div className="text-lg font-medium mb-2">변화 데이터 부족</div>
          <div className="text-sm">더 많은 기록이 필요합니다</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="h-80 w-full"
    >
      <Bar ref={chartRef} data={chartData} options={options} />
    </motion.div>
  );
};

export default WeightChangeChart;
