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
import type { WeightDistribution } from '../../types/Analytics.type';

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeightDistributionChartProps {
  data: WeightDistribution[];
}

const WeightDistributionChart: React.FC<WeightDistributionChartProps> = ({
  data,
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
          <div className="text-sm">체중 기록이 쌓이면 분포가 표시됩니다</div>
        </div>
      </div>
    );
  }

  // 데이터 준비
  const labels = data.map((item) => item.range);
  const counts = data.map((item) => item.count);
  const percentages = data.map((item) => item.percentage);

  // 가장 많은 기록이 있는 구간 찾기
  const maxCount = Math.max(...counts);
  const maxIndex = counts.indexOf(maxCount);

  // 동적 색상 생성 (가장 많은 구간을 강조)
  const backgroundColors = counts.map((_, index) => {
    if (index === maxIndex) {
      return 'rgba(34, 197, 94, 0.8)'; // 가장 많은 구간은 진한 녹색
    }
    return 'rgba(34, 197, 94, 0.4)'; // 나머지는 연한 녹색
  });

  const borderColors = counts.map((_, index) => {
    if (index === maxIndex) {
      return 'rgb(34, 197, 94)';
    }
    return 'rgba(34, 197, 94, 0.6)';
  });

  const chartData: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: '기록 횟수',
        data: counts,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 8,
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
          title: (context: TooltipItem<'bar'>[]) => {
            const index = context[0].dataIndex;
            return `체중 범위: ${data[index].range}`;
          },
          label: (context: TooltipItem<'bar'>) => {
            const index = context.dataIndex;
            const count = counts[index];
            const percentage = percentages[index];
            return [
              `📊 기록 횟수: ${count}회`,
              `📈 비율: ${percentage.toFixed(1)}%`,
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
        },
      },
      y: {
        beginAtZero: true,
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
          stepSize: 1, // 1 단위로 표시 (정수만)
          callback: function (value: string | number) {
            return `${value}회`;
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

export default WeightDistributionChart;
