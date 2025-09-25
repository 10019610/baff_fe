import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  Scale,
  Heart,
  Target,
  Flame,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { Badge } from '../ui/badge';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import type { BMICategory } from '../../types/Analytics.type';
import type { WeightEntry } from '../../types/WeightTracker.api.type';

interface AnalyticsMetricsProps {
  currentWeight: number;
  weightChange: number;
  currentBMI: number;
  bmiCategory: BMICategory;
  goalProgress: number;
  goalWeight: number;
  currentStreak: number;
  weightData: WeightEntry[];
}

const AnalyticsMetrics = ({
  currentWeight,
  weightChange,
  currentBMI,
  bmiCategory,
  goalProgress,
  goalWeight,
  currentStreak,
  weightData,
}: AnalyticsMetricsProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 체중 데이터를 날짜별로 매핑
  const weightByDate = weightData.reduce(
    (acc: Record<string, number>, item: WeightEntry) => {
      acc[item.date] = item.weight;
      return acc;
    },
    {}
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">현재 체중</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{currentWeight}kg</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {weightChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            {Math.abs(weightChange).toFixed(1)}kg 어제 대비
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">BMI 지수</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{currentBMI.toFixed(1)}</div>
          <div className={`text-xs font-medium ${bmiCategory.color}`}>
            {bmiCategory.category}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">목표 달성률</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">
            {Math.round(goalProgress)}%
          </div>
          <Progress value={goalProgress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            목표까지 {Math.abs(currentWeight - goalWeight).toFixed(1)}kg
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">연속 기록</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold flex items-center gap-1">
            {currentStreak}
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-xs text-muted-foreground">일 연속 기록 중</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">이번 달 기록</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div>
            <div className="text-2xl font-semibold flex items-center gap-1">
              15
              <span className="text-base font-normal text-muted-foreground">
                회
              </span>
            </div>
            <p className="text-xs text-muted-foreground">9월 기록 횟수</p>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="mt-3 w-full cursor-pointer flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              달력으로 보기
            </button>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">변화 속도</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold flex items-center gap-1">
            {weightVelocity >= 0 ? (
              <ArrowUp className="h-4 w-4 text-red-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-green-500" />
            )}
            {Math.abs(weightVelocity)}kg
          </div>
          <p className="text-xs text-muted-foreground">주간 평균 변화량</p>
        </CardContent>
      </Card> */}
      {/* 달력 모달 */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-[400px] !p-0 sm:!p-4 overflow-visible"
          aria-describedby="calendar-content"
        >
          <DialogTitle className="sr-only">체중 기록 달력</DialogTitle>
          <div id="calendar-content" className="!p-0 !pb-2">
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ko}
            >
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                defaultValue={new Date()}
                views={['month', 'day']}
                openTo="day"
                slots={{
                  actionBar: () => null,
                  day: (props) => {
                    const dateStr = `${props.day.getFullYear()}-${String(props.day.getMonth() + 1).padStart(2, '0')}-${String(props.day.getDate()).padStart(2, '0')}`;
                    const weight = weightByDate[dateStr];

                    // 현재 날짜 이전의 가장 최근 체중 기록 찾기
                    const currentDate = new Date(props.day);
                    let prevWeight = null;
                    const searchDate = new Date(currentDate);
                    searchDate.setDate(searchDate.getDate() - 1); // 하루 전부터 시작

                    // 최대 30일 전까지 검색
                    for (let i = 0; i < 30; i++) {
                      const searchDateStr = `${searchDate.getFullYear()}-${String(searchDate.getMonth() + 1).padStart(2, '0')}-${String(searchDate.getDate()).padStart(2, '0')}`;
                      if (weightByDate[searchDateStr]) {
                        prevWeight = weightByDate[searchDateStr];
                        break;
                      }
                      searchDate.setDate(searchDate.getDate() - 1);
                    }

                    let badgeStyle = 'bg-muted text-muted-foreground';
                    if (weight && prevWeight) {
                      if (weight < prevWeight) {
                        badgeStyle =
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                      } else if (weight > prevWeight) {
                        badgeStyle =
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                      } else {
                        badgeStyle =
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
                      }
                    }

                    // 오늘 날짜인지 확인
                    const today = new Date();
                    const isToday =
                      props.day.getDate() === today.getDate() &&
                      props.day.getMonth() === today.getMonth() &&
                      props.day.getFullYear() === today.getFullYear();

                    return (
                      <button
                        onClick={props.onClick}
                        className={`relative flex flex-col items-center justify-center w-full h-full min-h-[50px] cursor-pointer transition-all hover:bg-muted/50 rounded-lg ${
                          isToday
                            ? 'bg-accent text-accent-foreground'
                            : props.disabled
                              ? 'opacity-30'
                              : ''
                        }`}
                      >
                        <div className="absolute top-1">
                          <span className="text-sm">{props.day.getDate()}</span>
                        </div>
                        {weight && (
                          <div className="absolute bottom-1">
                            <Badge
                              variant="secondary"
                              className={`text-[8px] px-1.5 py-0.5 font-medium border-none ${badgeStyle}`}
                            >
                              {weight}kg
                            </Badge>
                          </div>
                        )}
                      </button>
                    );
                  },
                }}
                slotProps={{
                  toolbar: { hidden: true },
                  day: {
                    className: 'w-full h-full',
                  },
                }}
                sx={{
                  width: '100%',
                  paddingTop: '10px',
                  height: 'auto',
                  '@media (max-width: 640px)': {
                    transform: 'scale(0.85)',
                  },
                  '@media (max-width: 350px)': {
                    transform: 'scale(0.9)',
                  },
                  '@media (max-width: 320px)': {
                    transform: 'scale(0.85)',
                  },
                  transformOrigin: 'center',
                  '& .MuiPickersCalendarHeader-root': {
                    padding: '12px 8px',
                    margin: 0,
                    '& .MuiPickersCalendarHeader-label': {
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--foreground)',
                    },
                    '& .MuiIconButton-root': {
                      padding: '8px',
                      borderRadius: '8px',
                    },
                  },
                  '& .MuiDayCalendar-header': {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    justifyItems: 'center',
                    marginBottom: '2px',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    color: 'var(--muted-foreground)',
                    fontSize: {
                      xs: '10px',
                      '@media (minWidth: 350px)': '11px',
                      sm: '12px',
                    },
                    fontWeight: 500,
                    textTransform: 'none',
                    width: {
                      xs: '25px',
                      '@media (minWidth: 350px)': '30px',
                      sm: '45px',
                    },
                    margin: 0,
                    padding: 0,
                  },
                  '& .MuiDayCalendar-monthContainer': {
                    overflow: 'hidden',
                  },
                  '& .MuiPickersSlideTransition-root': {
                    overflow: 'visible !important',
                    minHeight: 'unset !important',
                  },
                  '& .MuiPickersDay-root': {
                    color: 'var(--foreground)',
                    padding: 0,
                    margin: 0,
                    width: {
                      xs: '25px',
                      '@media (minWidth: 350px)': '30px',
                      sm: '45px',
                    },
                    height: {
                      xs: '25px',
                      '@media (minWidth: 350px)': '30px',
                      sm: '45px',
                    },
                  },
                  '& .MuiDayCalendar-weekContainer': {
                    margin: 0,
                    minHeight: {
                      xs: '30px',
                      '@media (minWidth: 350px)': '35px',
                      sm: '50px',
                      md: '0px',
                    },
                  },
                  '& .MuiPickersArrowSwitcher-root': {
                    display: 'flex',
                    '& .MuiIconButton-root': {
                      color: 'var(--muted-foreground)',
                      '&:hover': {
                        backgroundColor: 'var(--muted)',
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalyticsMetrics;
