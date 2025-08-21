/**
 * 목표 설정 관련 API 용도 타입 모음
 */

/**
 * 목표 설정 저장 요청 타입
 */
export interface RecordGoalsRequest {
  userId: string;
  title: string;
  startWeight: number;
  targetWeight: number;
  presetDuration: number;
}

/**
 * 저장된 목표 리스트 조회 반환 타입
 */
export interface GetGoalListResponse {
  goalsId: string;
  title: string;
  startDate: string;
  endDate: string;
  startWeight: number;
  targetWeight: number;
  // status: 'active' | 'completed';
}
