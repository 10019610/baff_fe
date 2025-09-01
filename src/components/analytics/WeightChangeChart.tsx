import React, { useRef } from 'react';
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

  // 데이터 준비 (변화량이 0이 아닌 것만)
  const filteredData = data.filter((item) => item.change !== 0);

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

  const labels = filteredData.map((item) => item.date);
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

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
            const change = context.parsed.y;
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
        ticks: {
          color: 'rgb(107, 114, 128)',
          font: {
            size: 12,
            weight: 500,
          },
          maxTicksLimit: 8,
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
  };

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
