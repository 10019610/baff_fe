import { api } from './Api';
import type { BattleRoomDetail } from '../../types/BattleRoom.detail.type';
import type { BattleParticipant } from '../../types/BattleRoom.api.type';

/**
 * 대결방 상세 정보 조회
 * entryCode 방 입장 코드
 *  대결방 상세 정보
 */
export const getBattleRoomDetails = async (
  entryCode: string
): Promise<BattleRoomDetail> => {
  const response = await api.get(`/battle/${entryCode}/details`);
  return response.data;
};

/**
 * 대결방 참가
 * @param entryCode 방 입장 코드
 * @param password 방 비밀번호
 * @returns 참가 성공 여부
 */
export const joinBattleRoom = async (
  entryCode: string,
  password: string
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.post(`/battle/${entryCode}/join`, {
    password,
  });
  return response.data;
};

export default {
  getBattleRoomDetails,
  joinBattleRoom,
};

export const getParticipantsList = async (
  entryCode: string
): Promise<BattleParticipant[]> => {
  const response = await api.get(`/battle/${entryCode}/getParticipantsList`);
  return response.data;
};
