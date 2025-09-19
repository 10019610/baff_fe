import React, { useRef } from 'react';
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
  type ScriptableContext,
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

interface WeightTrendChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
}

const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  data,
  targetWeight,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  if (!data || data.length === 0) {
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

  // 데이터 준비
  const labels = data.map((item) => item.date);
  const weightData = data.map((item) => item.weight);
  const targetData = targetWeight ? data.map(() => targetWeight) : [];

  // 최소/최대값 계산 (여백 추가)
  const allValues = [...weightData];
  if (targetWeight) allValues.push(targetWeight);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const padding = Math.max(range * 0.1, 1);

  // 그라데이션 생성
  const createGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)'); // green-500 with opacity
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');
    return gradient;
  };

  const chartData: ChartData<'line'> = {
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
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgb(21, 128, 61)', // green-600
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
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
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgb(34, 197, 94)',
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
            const item = data[index];
            return `${item.fullDate}`;
          },
          label: (context: TooltipItem<'line'>) => {
            if (context.datasetIndex === 0) {
              const weight = context.parsed.y;
              const index = context.dataIndex;
              const item = data[index];

              let changeText = '';
              if (item.change !== 0) {
                const changeColor = item.change > 0 ? '🔺' : '🔻';
                changeText = `\n${changeColor} 변화: ${item.change > 0 ? '+' : ''}${item.change.toFixed(1)}kg`;
              }

              return `⚖️ 체중: ${weight.toFixed(1)}kg${changeText}`;
            } else {
              return `🎯 목표: ${context.parsed.y.toFixed(1)}kg`;
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
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
            weight: 500,
          },
          maxTicksLimit: 6,
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
            const num = typeof value === 'number' ? value : parseFloat(value);
            return `${num.toFixed(1)}kg`;
          },
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
  };

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

export default WeightTrendChart;
