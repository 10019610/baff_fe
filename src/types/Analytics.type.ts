export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  change?: number;
}

export interface Goal {
  id: string;
  type: 'weekly' | 'monthly';
  targetWeight: number;
  startWeight: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'failed';
  title: string;
}

export interface WeightDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  target: number;
  bmi: number;
  change: number;
  dayOfWeek: number;
}

export interface WeeklyPatternData {
  day: string;
  avgWeight: number;
  recordCount: number;
  consistency: number;
}

export interface WeightDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface PredictionData {
  date: string;
  predictedWeight: number;
  target: number;
  confidence: number;
}

export interface BattleStats {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyProgress {
  month: string;
  goalAchievement: number;
  consistency: number;
  avgWeight: number;
  recordDays: number;
}

export interface BMICategory {
  category: string;
  color: string;
}

export type DataStatus =
  | 'loading'
  | 'no-weight'
  | 'no-goals'
  | 'complete'
  | 'error';
