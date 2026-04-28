/**
 * P0 광고전략 — API 타입 정의
 *
 * spec v0.3 §4-3 정본.
 */

export interface AdMetricDailyEntry {
  id: number;
  metricDate: string; // YYYY-MM-DD

  // 토스 콘솔 reported — 수익
  tossRevenueR: number | null;
  tossRevenueF: number | null;
  tossRevenueBTotal: number | null;
  tossRevenueI: number | null;

  // 토스 콘솔 reported — eCPM
  ecpmRReported: number | null;
  ecpmFReported: number | null;
  ecpmBTotalReported: number | null;
  ecpmIReported: number | null;

  // 토스 콘솔 reported — 노출
  impressionRReported: number | null; // 검증용
  impressionFReported: number | null; // 검증용
  impressionBTotal: number | null; // truth (DB 미수집)
  impressionI: number | null; // truth (DB 미수집)

  // 토스 외 자동 미수집
  newInflowToss: number | null;
  avgSessionSec: number | null;
  benefitsTabInflow: number | null;

  // 메타
  actorAdminId: number | null;
  regDateTime: string;
  modDateTime: string;
}

export type AdMetricDailyRequest = Omit<
  AdMetricDailyEntry,
  'id' | 'actorAdminId' | 'regDateTime' | 'modDateTime'
>;

export interface AdMetricDailyPatchRequest extends AdMetricDailyRequest {
  reason: string; // D+7 이후 수정 사유
}

export interface AdMetricEntryRevisionLog {
  id: number;
  tableName: string;
  rowMetricDate: string;
  rowAdPositionCode: string | null;
  diff: { changed: Record<string, { before: unknown; after: unknown }> };
  schemaVersion: number;
  reason: string;
  actorAdminId: number;
  regDateTime: string;
}

/** 분석 탭 KPI 응답 (Step D BE 집계 service에서 내려줌) */
export interface AdMetricKpi {
  metricDate: string;

  // 카드 6장
  netProfit: number | null; // 순손익
  totalEcpm: number | null; // 종합 eCPM (R+F+B+I 합산)
  activeUsersRaw: number; // 활성유저(raw)
  coreActions: { weightLog: number; attendance: number; exchange: number };
  newSignups: number; // 실제 가입
  cumulativeGramBalance: {
    totalIssued: number;
    circulating: number;
    holders: number;
  };

  // truth 분기 (R/F는 DB observed)
  observedImpressionR: number;
  observedImpressionF: number;

  // 원본 입력값 (전 truth 구분 표시용)
  daily: AdMetricDailyEntry | null;
}

export interface AdMetricDailyTableRow {
  metricDate: string;
  daily: AdMetricDailyEntry | null;
  observedImpressionR: number;
  observedImpressionF: number;
  activeUsersRaw: number;
  weightLog: number;
  attendance: number;
  exchange: number;
  newSignups: number;
}
