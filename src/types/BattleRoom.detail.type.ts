export type BattleStatus = 'WAITING' | 'IN_PROGRESS' | 'ENDED';

export type GoalType = 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTAIN';

export interface ParticipantInfo {
  userId: number;
  userNickname: string;
  startingWeight: number | null;
  currentWeight: number;
  progress: number;
  rank: number;
  goalType: GoalType | null;
  targetValue: number | null;
  ready: boolean;
}

export interface BattleRoomDetail {
  name: string;
  description: string;
  status: BattleStatus;
  maxParticipants: number;
  currentParticipants: number;
  durationDays: number;
  startDate: string | null;
  endDate: string | null;
  entryCode: string;
  hostId: number;
  participants: ParticipantInfo[];
}

export interface GetBattleRoomDetailsResponse {
  battleRoomDetail: BattleRoomDetail;
}
