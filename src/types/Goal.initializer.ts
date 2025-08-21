import type { RecordGoalsRequest } from './Goals.api.type.ts';

/**
 * 목표 설정 관련 초기화 모음
 */
export const goalsInitializer = {
  /**
   * 목표 저장 요청 파라미터 초기화
   */
  INITIAL_RECORD_WEIGHT_PARAM: {
    userId: '',
    title: '',
    startWeight: 0,
    targetWeight: 0,
    presetDuration: 0,
  } as RecordGoalsRequest,
};
