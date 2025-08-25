/**
 * 체중 기록 관련 API 용도 타입 모음
 */

/**
 * 체중 기록 저장 요청 타입
 */
export interface RecordWeightRequest {
  recordDate: string;
  weight: number;
}

/**
 * 개별 체중 기록 응답 DTO (백엔드와 일치)
 */
export interface WeightResponseDto {
  recordDate: string; // LocalDateTime -> string (ISO format)
  recordWeight: number; // Double -> number
  weightChange: number; // Double -> number (전일 대비 변화량)
}

/**
 * 체중 기록 목록 조회 응답 타입 (백엔드와 일치)
 */
export interface GetWeightListResponse {
  currentWeight: number; // 가장 최신 체중
  totalWeightChange: number; // 총 변화량 (초기 대비)
  recordedDays: number; // 기록된 일수
  dailyWeightRecords: WeightResponseDto[]; // 날짜별 체중 기록 리스트
}

/**
 * 체중 기록 목록 조회 요청 타입
 */
export interface GetWeightEntriesRequest {
  userId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * 기존 호환성을 위한 WeightEntry 타입 (UI에서 사용)
 */
export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weight: number;
  change?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 체중 기록 수정 요청 타입
 */
export interface UpdateWeightRequest {
  entryId: string;
  userId: string;
  weight: number;
}

/**
 * 체중 기록 삭제 요청 타입
 */
export interface DeleteWeightRequest {
  entryId: string;
  userId: string;
}
