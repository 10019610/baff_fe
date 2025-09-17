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

interface BMITrendChartProps {
  data: WeightDataPoint[];
}

const BMITrendChart: React.FC<BMITrendChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

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
  const labels = data.map((item) => item.date);
  const bmiData = data.map((item) => item.bmi);

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
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: primaryColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        fill: true,
        tension: 0.4,
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
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: primaryColor,
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative h-80 w-full"
    >
      <Line ref={chartRef} data={chartData} options={options} />

      {/* BMI 범위 가이드 */}
      <div className="absolute -top-20 right-0 bg-background/80 backdrop-blur-sm border rounded-lg p-3 text-xs">
        <div className="font-medium mb-2 text-foreground">BMI 범위</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">18.5 미만: 저체중</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">18.5-25: 정상</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-muted-foreground">25-30: 과체중</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-muted-foreground">30 이상: 비만</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BMITrendChart;
