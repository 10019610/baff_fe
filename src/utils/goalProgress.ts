/**
 * 목표 진행률 · 기간 계산 유틸
 *
 * 🔴 토스 `changeup_fe_toss/src/utils/goalProgress.ts` 와 같게 유지한다 — 고칠 때 두 곳을 함께 고친다.
 * 다른 곳은 타입을 불러오는 경로뿐이다 (M-025 · 2026-11-17 토스 main `deaf4d5` 에서 옮김).
 */
import type { GetGoalListResponse } from '../types/Goals.api.type';
import type { WeightResponseDto } from '../types/WeightTracker.api.type';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 유지 목표(시작=목표)에서 "달성"으로 볼 오차 범위 */
const MAINTAIN_TOLERANCE_KG = 0.5;

/** 페이스 외삽을 신뢰할 최소 기록 수 */
const MIN_RECORDS_FOR_PACE = 2;

/** `2026-09-03T00:00:00` / `2026-09-03` 모두 `2026-09-03`으로 */
function toDateKey(iso: string): string {
  return iso.split('T')[0];
}

/** 날짜 키를 자정 기준 Date로. 문자열 비교만으로 끝나지 않는 일수 계산용 */
function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(fromKey: string, toKey: string): number {
  return Math.round((keyToDate(toKey).getTime() - keyToDate(fromKey).getTime()) / MS_PER_DAY);
}

/**
 * 목표 기간 안의 체중 기록만 오래된 순으로.
 *
 * 목표는 자기 구간의 기록으로만 평가해야 한다. 리스트 카드가 전역 최신 체중
 * (`currentWeight`)으로 진행률을 계산하던 탓에, 이미 끝난 목표의 달성률이
 * 오늘 체중을 따라 계속 바뀌는 문제가 있었다.
 */
export function sliceRecordsByGoal(
  records: WeightResponseDto[],
  goal: GetGoalListResponse,
): WeightResponseDto[] {
  const startKey = toDateKey(goal.startDate);
  const endKey = toDateKey(goal.endDate);

  return records
    .filter((r) => {
      const key = toDateKey(r.recordDate);
      return key >= startKey && key <= endKey;
    })
    .sort((a, b) => a.recordDate.localeCompare(b.recordDate));
}

export interface GoalWeightPoint {
  /** 평가 기준 체중 */
  weight: number;
  /** 그 체중의 기록일(`YYYY-MM-DD`). 구간 내 기록이 없으면 null */
  recordDate: string | null;
  /** 구간 내 기록이 없어 startWeight로 대체했는지 */
  isFallback: boolean;
}

/**
 * 목표를 평가할 기준 체중 = 목표 구간 안의 **마지막** 기록.
 *
 * 진행중이면 오늘까지의 마지막 기록, 종료됐으면 종료일까지의 마지막 기록이
 * 자연히 잡힌다(구간 밖 기록은 slice에서 이미 빠진다). 기록이 하나도 없으면
 * 시작 체중을 그대로 쓴다 — 진행률 0%로 읽히는 게 맞다.
 */
export function resolveGoalWeight(
  goal: GetGoalListResponse,
  slicedRecords: WeightResponseDto[],
): GoalWeightPoint {
  const last = slicedRecords[slicedRecords.length - 1];

  if (last == null) {
    return { weight: goal.startWeight, recordDate: null, isFallback: true };
  }

  return { weight: last.recordWeight, recordDate: toDateKey(last.recordDate), isFallback: false };
}

export interface GoalProgress {
  /** 실제 진행률. 되돌아갔으면 음수, 초과 달성이면 1 초과 */
  ratio: number;
  /** ProgressBar에 넣을 0~1 값 */
  barRatio: number;
  /** 달성 여부 */
  achieved: boolean;
  /** 시작 대비 변화량 (음수 = 감량) */
  changeFromStart: number;
  /** 목표까지 남은 변화량. 달성했으면 0 */
  remainingToTarget: number;
}

/**
 * 진행률.
 *
 * `ratio`는 clamp하지 않는다. 종전 카드는 0~1로 잘라서 **거꾸로 간 경우와
 * 아직 시작도 안 한 경우가 똑같이 0%**로 보였다. 막대만 0~1로 자르고,
 * 숫자는 있는 그대로 보여준다.
 */
export function calcGoalProgress(
  startWeight: number,
  targetWeight: number,
  currentWeight: number,
): GoalProgress {
  const totalChange = targetWeight - startWeight;
  const changeFromStart = currentWeight - startWeight;

  // 유지 목표: 시작과 목표가 같아 비율을 낼 수 없다. 허용 오차 안이면 달성.
  if (totalChange === 0) {
    const withinTolerance = Math.abs(changeFromStart) <= MAINTAIN_TOLERANCE_KG;
    return {
      ratio: withinTolerance ? 1 : 0,
      barRatio: withinTolerance ? 1 : 0,
      achieved: withinTolerance,
      changeFromStart,
      remainingToTarget: 0,
    };
  }

  const ratio = changeFromStart / totalChange;
  const achieved = ratio >= 1;

  return {
    ratio,
    barRatio: Math.min(Math.max(ratio, 0), 1),
    achieved,
    remainingToTarget: achieved ? 0 : targetWeight - currentWeight,
    changeFromStart,
  };
}

export interface GoalTimeline {
  /** 목표 전체 일수 (시작일~종료일 양끝 포함) */
  totalDays: number;
  /** 시작일부터 오늘(종료됐으면 종료일)까지 경과 일수 */
  elapsedDays: number;
  /** 남은 일수. 종료됐으면 0 */
  remainingDays: number;
  /** 기간이 끝났는지 */
  isFinished: boolean;
}

export function calcGoalTimeline(goal: GetGoalListResponse, todayKey: string): GoalTimeline {
  const startKey = toDateKey(goal.startDate);
  const endKey = toDateKey(goal.endDate);

  const totalDays = diffDays(startKey, endKey) + 1;
  const isFinished = todayKey > endKey;
  const cappedToday = isFinished ? endKey : todayKey;

  // 시작 전이면 경과 0
  const elapsedDays = Math.max(diffDays(startKey, cappedToday) + 1, 0);

  return {
    totalDays,
    elapsedDays: Math.min(elapsedDays, totalDays),
    remainingDays: isFinished ? 0 : Math.max(diffDays(todayKey, endKey), 0),
    isFinished,
  };
}

export interface GoalPace {
  /** 하루 평균 변화량(kg). 기록이 부족하면 null */
  dailyChange: number | null;
  /** 이 속도로 목표에 닿는 날(`YYYY-MM-DD`). 방향이 반대거나 정체면 null */
  projectedDateKey: string | null;
  /** 예상 달성일이 목표 종료일보다 며칠 빠른지(양수) / 늦는지(음수) */
  daysAheadOfSchedule: number | null;
}

/**
 * 지금 속도로 언제 목표에 닿는지.
 *
 * 첫 기록과 마지막 기록만 쓴다(단순 평균 속도). 100명 규모에서 회귀까지 갈
 * 이유가 없고, 중간 등락이 큰 체중 데이터에서는 오히려 과적합한다.
 */
export function calcGoalPace(
  goal: GetGoalListResponse,
  slicedRecords: WeightResponseDto[],
): GoalPace {
  const empty: GoalPace = { dailyChange: null, projectedDateKey: null, daysAheadOfSchedule: null };

  if (slicedRecords.length < MIN_RECORDS_FOR_PACE) return empty;

  const first = slicedRecords[0];
  const last = slicedRecords[slicedRecords.length - 1];
  const firstKey = toDateKey(first.recordDate);
  const lastKey = toDateKey(last.recordDate);

  const spanDays = diffDays(firstKey, lastKey);
  if (spanDays <= 0) return empty;

  const dailyChange = (last.recordWeight - first.recordWeight) / spanDays;

  const remaining = goal.targetWeight - last.recordWeight;
  // 이미 도달했거나, 변화가 없거나, 목표와 반대 방향으로 가는 중이면 예측하지 않는다
  if (dailyChange === 0 || remaining === 0 || Math.sign(remaining) !== Math.sign(dailyChange)) {
    return { dailyChange, projectedDateKey: null, daysAheadOfSchedule: null };
  }

  const daysNeeded = Math.ceil(remaining / dailyChange);
  const projected = keyToDate(lastKey);
  projected.setDate(projected.getDate() + daysNeeded);
  const projectedDateKey = formatDateKey(projected);

  return {
    dailyChange,
    projectedDateKey,
    daysAheadOfSchedule: diffDays(projectedDateKey, toDateKey(goal.endDate)),
  };
}

/**
 * 남은 기간 동안 하루에 얼마나 바꿔야 목표에 닿는지.
 *
 * `calcGoalPace.dailyChange`가 "지금까지 실제로 움직인 속도"라면 이건 "앞으로
 * 내야 하는 속도"다. 둘을 나란히 보여줘야 지금 페이스가 빠른지 느린지 안다.
 *
 * 기간이 끝났거나 오늘이 마지막 날이면 남은 기간이 없어 null.
 */
export function calcRequiredDailyChange(
  targetWeight: number,
  currentWeight: number,
  remainingDays: number,
): number | null {
  if (remainingDays <= 0) return null;
  return (targetWeight - currentWeight) / remainingDays;
}

export interface GoalRecordCoverage {
  /** 목표 구간에서 기록이 있는 날 수 */
  recordedDays: number;
  /** 기록했어야 할 날 수 (경과 일수) */
  expectedDays: number;
  /** 0~1 */
  ratio: number;
}

export function calcRecordCoverage(
  slicedRecords: WeightResponseDto[],
  timeline: GoalTimeline,
): GoalRecordCoverage {
  const uniqueDays = new Set(slicedRecords.map((r) => toDateKey(r.recordDate))).size;
  const expectedDays = Math.max(timeline.elapsedDays, 1);

  return {
    recordedDays: uniqueDays,
    expectedDays,
    ratio: Math.min(uniqueDays / expectedDays, 1),
  };
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
