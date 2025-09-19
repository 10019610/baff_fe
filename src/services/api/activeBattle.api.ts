import { api } from './Api';
import type {
  ActiveBattleData,
  EndedBattleData,
  getBattleWeightHistoryData,
  getBattleWeightHistoryParams,
} from '../../types/ActiveBattle.type';

/**
 * 진행 중인 대결 목록 조회
 */
export const getActiveBattles = async (): Promise<ActiveBattleData> => {
  const response = await api.get<ActiveBattleData>('/battle/active');
  return response.data;
};

/**
 * 종료된 대결 목록 조회
 */
export const getEndedBattles = async (): Promise<EndedBattleData> => {
  const response = await api.get<EndedBattleData>('/battle/getEndedBattles');
  return response.data;
};

/**
 * 진행 중인 대결의 참가자 체중 기록
 */

export const getBattleWeightHistory = async (
  weightHistoryParams: getBattleWeightHistoryParams
): Promise<getBattleWeightHistoryData[]> => {
  const response = await api.get<getBattleWeightHistoryData[]>(
    '/weight/getBattleWeightHistory',
    {
      params: weightHistoryParams,
    }
  );
  return response.data;
};
