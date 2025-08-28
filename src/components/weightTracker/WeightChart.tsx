import React, { useEffect, useRef } from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
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

interface WeightChartProps {
  entries: WeightEntry[];
  className?: string;
}

const WeightChart: React.FC<WeightChartProps> = ({
  entries,
  className = '',
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // 데이터 준비
  const sortedEntries = entries
    .filter((entry) => entry.weight && entry.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  const labels = sortedEntries.map((entry) =>
    new Date(entry.date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    })
  );

  const weightData = sortedEntries.map((entry) => entry.weight);

  // 최소/최대값 계산 (여백 추가)
  const minWeight = Math.min(...weightData);
  const maxWeight = Math.max(...weightData);
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
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgb(37, 99, 235)', // blue-600
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        fill: true,
        tension: 0.4, // 부드러운 곡선
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false, // 범례 숨김
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(59, 130, 246)',
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
        ticks: {
          color: 'rgb(107, 114, 128)', // gray-500
          font: {
            size: 12,
            weight: 500,
          },
          maxTicksLimit: 8, // 최대 표시할 틱 수
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
            return `${value}kg`;
          },
          stepSize: 1, // 0.5kg 단위로 표시
        },
      },
    },
    elements: {
      point: {
        hoverBorderWidth: 3,
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
    onHover: (_event: ChartEvent, elements: InteractionItem[]) => {
      const chart = chartRef.current;
      if (chart?.canvas) {
        chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
      }
    },
  };

  // 차트 업데이트 시 애니메이션 재실행
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      chart.update('active');
    }
  }, [entries]);

  if (sortedEntries.length === 0) {
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

  if (sortedEntries.length === 1) {
    return (
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative ${className}`}
    >
      <div className="h-80 w-full">
        <Line ref={chartRef} data={data} options={options} />
      </div>

      {/* 차트 하단 통계 정보 */}
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
            {(
              weightData.reduce((a, b) => a + b, 0) / weightData.length
            ).toFixed(1)}
            kg
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WeightChart;
