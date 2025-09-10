// 진행 중인 대결 관련 타입 정의 (백엔드 응답 구조와 일치)

export interface BattleSummaryData {
  entryCode: string;
  opponentNickname: string;
  opponentUserId: number;
  myStartWeight: number;
  opponentStartWeight: number;
  myCurrentWeight: number;
  opponentCurrentWeight: number;
  myTargetWeightLoss: number;
  opponentTargetWeightLoss: number;
  startDate: string; // LocalDate는 string으로 변환됨
  endDate: string;
  status: string;
  myWeightLoss: number;
  opponentWeightLoss: number;
  myProgress: number;
  opponentProgress: number;
  totalDays: number;
  daysRemaining: number;
  winner: string; // 'me' | 'opponent' | 'tie'
}

export interface ActiveBattleData {
  activeBattles: BattleSummaryData[];
}
