// Battle Room API 관련 타입 정의

export interface CreateBattleRoomRequest {
  name: string;
  password: string;
  description: string;
  maxParticipants: number;
  durationDays: number;
}

export interface CreateBattleRoomResponse {
  id: string;
  name: string;
  description: string;
  password: string;
  createdBy: string;
  createdByName: string;
  participants: Array<{
    userId: string;
    userName: string;
    joinedAt: string;
    isReady: boolean;
  }>;
  maxParticipants: number;
  createdAt: string;
  isActive: boolean;
  settings: {
    duration: number; // days
    goalType: 'weight_loss' | 'weight_gain' | 'maintain';
    startDate: string;
    endDate: string;
  };
}

export interface BattleRoomParticipant {
  userId: string;
  userName: string;
  joinedAt: string;
  isReady: boolean;
}

export interface BattleRoomSettings {
  duration: number;
  goalType: 'weight_loss' | 'weight_gain' | 'maintain';
  startDate: string;
  endDate: string;
}

export interface BattleRoom {
  id: string;
  name: string;
  description: string;
  password: string;
  createdBy: string;
  createdByName: string;
  participants: BattleRoomParticipant[];
  maxParticipants: number;
  createdAt: string;
  isActive: boolean;
  settings: BattleRoomSettings;
}

// 백엔드 getBattleRoomList 응답 타입
export interface BackendBattleRoomDto {
  name: string;
  password: string;
  description: string;
  hostId: string;
  hostNickName: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'ENDED'; // BattleStatus enum
  maxParticipant: number;
  currentParticipant: number;
  durationDays: number;
  startDate: string; // LocalDate -> string
  endDate: string; // LocalDate -> string
  entryCode: string;
}

export interface GetBattleRoomListResponse {
  battleRooms: BackendBattleRoomDto[];
}

// Room List 조회를 위한 쿼리 타입
export interface BattleRoomListQueryResult {
  battleRooms: BackendBattleRoomDto[];
}

export interface UpdateUserGoalRequest {
  goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTAIN';
  targetValue: number;
  startingWeight: number;
}

export interface BattleParticipant {
  userNickName: string;
  userId: number;
  startingWeight: number;
  currentWeight: number;
  progress: number;
  rank: number;
  goalType: 'WEIGHT_LOSS' | 'WEIGHT_GAIN' | 'MAINTAIN';
  targetValue: number;
  ready: boolean;
}
