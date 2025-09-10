import { api } from './Api';
import type { ActiveBattleData } from '../../types/ActiveBattle.type';

/**
 * 진행 중인 대결 목록 조회
 */
export const getActiveBattles = async (): Promise<ActiveBattleData> => {
  const response = await api.get<ActiveBattleData>('/battle/active');
  return response.data;
};
