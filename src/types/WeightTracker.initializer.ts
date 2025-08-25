import type {
  RecordWeightRequest,
  GetWeightEntriesRequest,
} from './WeightTracker.api.type';

/**
 * 체중 기록 관련 초기값 정의
 */
export const weightTrackerInitializer = {
  /**
   * 체중 기록 저장 파라미터 초기값
   */
  INITIAL_RECORD_WEIGHT_PARAM: {
    recordDate: '',
    weight: 0,
  } as RecordWeightRequest,

  /**
   * 체중 기록 목록 조회 파라미터 초기값
   */
  INITIAL_GET_WEIGHT_ENTRIES_PARAM: {
    userId: '',
    limit: 50,
    offset: 0,
  } as GetWeightEntriesRequest,
};
