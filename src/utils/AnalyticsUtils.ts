import type {
  WeightEntry,
  Goal,
  WeightDataPoint,
  WeeklyPatternData,
  WeightDistribution,
  PredictionData,
  BattleStats,
  MonthlyProgress,
  BMICategory,
} from '../types/Analytics.type';

// BMI 계산 함수
export const calculateBMI = (weight: number, height: number = 170): number => {
  return weight / Math.pow(height / 100, 2);
};

// BMI 카테고리 계산
export const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) return { category: '저체중', color: 'text-blue-600' };
  if (bmi < 25) return { category: '정상', color: 'text-green-600' };
  if (bmi < 30) return { category: '과체중', color: 'text-yellow-600' };
  return { category: '비만', color: 'text-red-600' };
};

// 주간 패턴 데이터 생성
export const generateWeeklyPatternData = (
  weightData: WeightDataPoint[]
): WeeklyPatternData[] => {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weeklyPattern = weekdays.map((day, index) => {
    const dayData = weightData.filter((d) => d.dayOfWeek === index);
    const avgWeight =
      dayData.length > 0
        ? dayData.reduce((sum, d) => sum + d.weight, 0) / dayData.length
        : 0;
    const recordCount = dayData.length;

    return {
      day,
      avgWeight: parseFloat(avgWeight.toFixed(1)),
      recordCount,
      consistency: (recordCount / 4) * 100, // 4주 기준
    };
  });

  return weeklyPattern;
};

// 체중 분포 데이터 생성
export const generateWeightDistribution = (
  weightData: WeightDataPoint[]
): WeightDistribution[] => {
  if (!weightData || weightData.length === 0) return [];

  const weights = weightData.map((d) => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);

  // 동일한 체중만 있는 경우
  if (min === max) {
    return [
      {
        range: `${min.toFixed(1)}kg`,
        count: weights.length,
        percentage: 100,
      },
    ];
  }

  const range = max - min;
  const binSize = range / 6;

  const bins = [];
  for (let i = 0; i < 6; i++) {
    const binMin = min + i * binSize;
    const binMax = min + (i + 1) * binSize;

    // 마지막 구간은 최대값도 포함
    const count = weights.filter((w) =>
      i === 5 ? w >= binMin && w <= binMax : w >= binMin && w < binMax
    ).length;

    // 데이터가 있는 구간만 포함
    if (count > 0) {
      bins.push({
        range: `${binMin.toFixed(1)}-${binMax.toFixed(1)}kg`,
        count,
        percentage: (count / weights.length) * 100,
      });
    }
  }

  return bins;
};

// 예측 데이터 생성
export const generatePredictionData = (
  weightData: WeightDataPoint[],
  targetWeight: number
): PredictionData[] => {
  const recentData = weightData.slice(-7); // 최근 7일
  const avgChange =
    recentData.reduce((sum, d, i) => {
      if (i === 0) return 0;
      return sum + (d.weight - recentData[i - 1].weight);
    }, 0) /
    (recentData.length - 1);

  const predictions = [];
  let currentWeight = weightData[weightData.length - 1].weight;

  for (let i = 1; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    currentWeight += avgChange;

    predictions.push({
      date: date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      }),
      predictedWeight: parseFloat(currentWeight.toFixed(1)),
      target: targetWeight,
      confidence: Math.max(0.3, 1 - i * 0.05), // 신뢰도는 시간이 지날수록 감소
    });
  }

  return predictions;
};

export const generateBattleStats = (
  activeBattles: { status: string }[] = [],
  endedBattles: { winner: string }[] = []
): BattleStats[] => {
  // 진행중인 배틀 수
  const inProgressCount = activeBattles.filter(
    (battle) => battle.status === 'IN_PROGRESS'
  ).length;

  // 종료된 배틀에서 승리/패배 계산
  const wonBattles = endedBattles.filter(
    (battle) => battle.winner === 'me'
  ).length;

  const lostBattles = endedBattles.filter(
    (battle) => battle.winner === 'opponent'
  ).length;

  return [
    { name: '승리', value: wonBattles, color: '#98FB98' },
    { name: '패배', value: lostBattles, color: '#ff6b6b' },
    { name: '진행중', value: inProgressCount, color: '#4ecdc4' },
  ];
};

// 최고 연승 계산 함수
export const calculateMaxStreak = (
  endedBattles: { winner: string; endDate: string }[] = []
): number => {
  if (endedBattles.length === 0) return 0;

  // 종료일 기준으로 정렬 (오래된 것부터)
  const sortedBattles = [...endedBattles].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  let maxStreak = 0;
  let currentStreak = 0;

  for (const battle of sortedBattles) {
    if (battle.winner === 'me') {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0; // 패배하면 연승 초기화
    }
  }

  return maxStreak;
};

export const generateMonthlyProgress = (): MonthlyProgress[] => {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));

    return {
      month: date.toLocaleDateString('ko-KR', { month: 'short' }),
      goalAchievement: Math.floor(Math.random() * 100),
      consistency: Math.floor(Math.random() * 100),
      avgWeight: parseFloat((70 + Math.random() * 10).toFixed(1)),
      recordDays: Math.floor(Math.random() * 30) + 1,
    };
  });
};

// 실제 체중 데이터를 WeightDataPoint로 변환
export const convertWeightEntries = (
  entries: WeightEntry[],
  userHeight?: number
): WeightDataPoint[] => {
  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry, index) => {
      const date = new Date(entry.date);
      return {
        date: date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: entry.date,
        weight: entry.weight,
        target: entries[0].weight - 5, // 임시 목표
        bmi: calculateBMI(entry.weight, userHeight || 170),
        change:
          index > 0
            ? parseFloat((entry.weight - entries[index - 1].weight).toFixed(1))
            : 0,
        dayOfWeek: date.getDay(),
      };
    });
};

// 연속 기록일 계산 (오늘 또는 어제부터 시작하는 연속 기록)
export const calculateStreak = (weightData: WeightDataPoint[]): number => {
  if (!weightData || weightData.length === 0) return 0;

  // 날짜 기준으로 내림차순 정렬 (최신 -> 오래된 순)
  const sortedData = [...weightData].sort(
    (a, b) => new Date(b.fullDate).getTime() - new Date(a.fullDate).getTime()
  );

  // 가장 최근 기록 날짜 (시간 정보 제거)
  const latestRecordDate = new Date(sortedData[0].fullDate);
  latestRecordDate.setHours(0, 0, 0, 0);

  // 오늘과 어제 날짜 (시간 정보 제거)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let streak = 0;
  let startDate: Date;

  // 최근 기록이 오늘인지 어제인지 확인
  if (latestRecordDate.getTime() === today.getTime()) {
    // 오늘 기록이 있음 - 오늘부터 시작
    startDate = today;
  } else if (latestRecordDate.getTime() === yesterday.getTime()) {
    // 어제 기록이 있음 - 어제부터 시작
    startDate = yesterday;
  } else {
    // 어제, 오늘 모두 기록이 없음 - 연속 기록 없음
    return 0;
  }

  // 연속 기록 계산
  for (let i = 0; i < sortedData.length; i++) {
    const recordDate = new Date(sortedData[i].fullDate);
    recordDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(startDate);
    expectedDate.setDate(startDate.getDate() - i);

    if (recordDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// 체중 변화 속도 계산 (주간 평균)
export const calculateWeightVelocity = (
  weightData: WeightDataPoint[]
): number => {
  const recentWeek = weightData.slice(-7);
  if (recentWeek.length < 2) return 0;

  const totalChange =
    recentWeek[recentWeek.length - 1].weight - recentWeek[0].weight;
  return parseFloat((totalChange / 7).toFixed(2)); // 일일 평균 변화량
};

// 체중 변동성 계산 (표준편차)
export const calculateVolatility = (weightData: WeightDataPoint[]): number => {
  if (weightData.length < 2) return 0;

  const weights = weightData.map((d) => d.weight);
  const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const variance =
    weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  return parseFloat(Math.sqrt(variance).toFixed(2));
};

// 목표 진행률 계산
export const calculateGoalProgress = (
  activeGoal: Goal | null,
  currentWeight: number,
  hasWeightData: boolean
): number => {
  if (!activeGoal || !hasWeightData) return 0;

  const totalChange = activeGoal.targetWeight - activeGoal.startWeight;
  const currentChange = currentWeight - activeGoal.startWeight;

  if (totalChange === 0) return 100;

  const progress = (currentChange / totalChange) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

// 예상 목표 달성일 계산
export const getEstimatedGoalDate = (
  activeGoal: Goal | null,
  currentWeight: number,
  weightVelocity: number
): Date | null => {
  if (!activeGoal || weightVelocity === 0) return null;

  const remainingWeight = Math.abs(currentWeight - activeGoal.targetWeight);
  const daysToGoal = Math.ceil(remainingWeight / Math.abs(weightVelocity));

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysToGoal);

  return targetDate;
};

// 건강 점수 계산
export const calculateHealthScore = (
  goalProgress: number,
  weeklyConsistency: number,
  winRate: number,
  currentStreak: number,
  weightVolatility: number
): number => {
  return Math.round(
    goalProgress * 0.3 +
      weeklyConsistency * 0.25 +
      winRate * 0.15 +
      currentStreak * 2 + // 연속 기록일 보너스
      Math.max(0, 10 - weightVolatility * 5) // 안정성 보너스
  );
};
