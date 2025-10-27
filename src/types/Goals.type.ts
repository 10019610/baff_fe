/**
 * 목표기간
 */
export interface PresetDurationType {
  value: string;
  label: string;
  hours: number;
}

/**
 * 목표 기본 타입
 */
export interface Goal {
  goalsId: string;
  title: string;
  startDate: string;
  endDate: string;
  startWeight: number;
  targetWeight: number;
  isExpired: boolean;
  currentWeight: number;
}

/**
 * 리뷰 작성용 목표 상세 정보
 */
export interface GoalDetailForReview {
  goalsId: number;
  durationDays: number;
  startWeight: number;
  targetWeight: number;
  currentWeight: number | null;
}
