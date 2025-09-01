import { Button } from '../ui/button';

interface AnalyticsHeaderProps {
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

const AnalyticsHeader = ({
  timeRange,
  onTimeRangeChange,
}: AnalyticsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">분석 리포트</h1>
        <p className="text-muted-foreground">
          나의 건강 관리 현황을 종합 분석해보세요
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant={timeRange === '7d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTimeRangeChange('7d')}
        >
          7일
        </Button>
        <Button
          variant={timeRange === '30d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTimeRangeChange('30d')}
        >
          30일
        </Button>
        <Button
          variant={timeRange === '90d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTimeRangeChange('90d')}
        >
          90일
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
