import { api } from './Api';
import type { GoalDetailForReview } from '../../types/Goals.type';

/**
 * 리뷰 작성용 목표 상세 정보 조회
 * @param goalId 목표 ID
 * @returns 목표 상세 정보
 */
export const getGoalDetailForReview = async (
  goalId: number
): Promise<GoalDetailForReview> => {
  const response = await api.get(`/goals/getGoalDetailForReview/${goalId}`);
  return response.data;
};

export default {
  getGoalDetailForReview,
};

