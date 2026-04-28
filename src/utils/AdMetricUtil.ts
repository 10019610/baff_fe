/**
 * P0 광고전략 — 표본 태그 / KPI 산식 유틸.
 *
 * spec v0.3 §5-4-1 전역 표본 태그.
 * 런칭 D-일 = 2026-04-27 15:15 KST 고정 상수.
 */

/** 런칭 시각 (KST) */
export const LAUNCH_AT_KST = '2026-04-27T15:15:00+09:00';

/** 그램 단가 (1g = 1원, A-5 미정 — 결정 후 변경) */
export const GRAM_UNIT_PRICE_KRW = 1;

/**
 * 데이터 일자 기준 전역 표본 태그 산출.
 *
 * spec §5-4-1 룰:
 *  - 데이터 일자 = 2026-04-27 → '6h 부분'
 *  - 데이터 일자 = 2026-04-28 → '1일'
 *  - 2026-04-29 ~ 2026-04-30 → 'N일' (D+N 풀일 - 1)
 *  - 2026-05-04 → '7일'
 *  - 2026-05-11 이후 → '14일+'
 */
export function getSampleTag(metricDate: string): string {
  const launch = new Date(LAUNCH_AT_KST);
  const launchDateOnly = new Date(
    launch.getFullYear(),
    launch.getMonth(),
    launch.getDate()
  );
  const target = new Date(metricDate + 'T00:00:00+09:00');
  const targetDateOnly = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );

  const diffDays = Math.floor(
    (targetDateOnly.getTime() - launchDateOnly.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return '런칭 이전';
  if (diffDays === 0) return '6h 부분';
  if (diffDays >= 14) return '14일+';
  return `${diffDays}일`;
}

/** D+7 이후 수정 여부 — metric_date 기준 */
export function isAfterDPlus7(metricDate: string): boolean {
  const target = new Date(metricDate + 'T00:00:00+09:00');
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays >= 7;
}

/**
 * D-N 일자 배열 — 분석 탭 일별 표(D-7) 등.
 * 최신순(오늘 → 과거).
 */
export function getRecentDates(
  days: number,
  baseDate: Date = new Date()
): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

/** 어제 일자 (분석/입력 탭 기본 선택값) */
export function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
