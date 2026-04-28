/**
 * 광고전략 — API 타입 정의 (R/F/B/I 4축 분해 + 위치별 분해).
 */

export type AdPositionCode = string;

export interface AdMetricDailyEntry {
  id: number;
  metricDate: string;

  tossRevenueR: number | null;
  tossRevenueF: number | null;
  tossRevenueBTotal: number | null;
  tossRevenueI: number | null;

  ecpmRReported: number | null;
  ecpmFReported: number | null;
  ecpmBTotalReported: number | null;
  ecpmIReported: number | null;

  ctrRReported: number | null;
  ctrFReported: number | null;
  ctrBTotalReported: number | null;
  ctrIReported: number | null;

  impressionRReported: number | null;
  impressionFReported: number | null;
  impressionBTotal: number | null;
  impressionI: number | null;

  newUsersReported: number | null;
  totalUsersReported: number | null;
  retentionD1New: number | null;
  retentionD1Total: number | null;

  actorAdminId: number | null;
  regDateTime: string;
  modDateTime: string;
}

export interface PositionEntry {
  id?: number;
  metricDate?: string;
  adPositionCode: AdPositionCode;
  impression: number | null;
  ctrReported: number | null;
  ecpmReported: number | null;
  revenue: number | null;
  /** 해당일 매핑된 광고 ID. 위치별 행은 AdPositionConfig 자동, OTHER는 직접 입력 */
  adIdSnapshot?: string | null;
}

export interface AdMetricDailyBundle {
  daily: AdMetricDailyEntry | null;
  banners: PositionEntry[];
  images: PositionEntry[];
}

export interface AdMetricFullRequest {
  metricDate: string;

  tossRevenueR?: number | null;
  tossRevenueF?: number | null;
  tossRevenueBTotal?: number | null;
  tossRevenueI?: number | null;

  ecpmRReported?: number | null;
  ecpmFReported?: number | null;
  ecpmBTotalReported?: number | null;
  ecpmIReported?: number | null;

  ctrRReported?: number | null;
  ctrFReported?: number | null;
  ctrBTotalReported?: number | null;
  ctrIReported?: number | null;

  impressionRReported?: number | null;
  impressionFReported?: number | null;
  impressionBTotal?: number | null;
  impressionI?: number | null;

  newUsersReported?: number | null;
  totalUsersReported?: number | null;
  retentionD1New?: number | null;
  retentionD1Total?: number | null;

  banners?: PositionEntry[];
  images?: PositionEntry[];

  reason?: string;
}

export interface AdMetricKpi {
  metricDate: string;
  netProfit: number | null;
  totalEcpm: number | null;
  activeUsersRaw: number;
  coreActions: { weightLog: number; attendance: number; exchange: number };
  newSignups: number;
  cumulativeGramBalance: {
    totalIssued: number;
    circulating: number;
    holders: number;
  };
  observedImpressionR: number;
  observedImpressionF: number;
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

/** AdPositionConfig 어드민 응답(/api/admin/dashboard/toss-ad/configs) */
export interface TossAdPositionConfig {
  position: AdPositionCode;
  isTossBannerAdEnabled: boolean;
  isTossAdEnabled: boolean;
  isTossImageAdEnabled: boolean;
  isTossInterstitialAdEnabled?: boolean;
  tossBannerAdGroupId?: string | null;
  tossAdGroupId?: string | null;
  tossImageAdGroupId?: string | null;
  tossInterstitialAdGroupId?: string | null;
}
