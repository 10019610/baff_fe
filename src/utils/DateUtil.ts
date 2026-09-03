const MINUTE_IN_SECONDS = 60;
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
const MONTH_IN_SECONDS = 30 * DAY_IN_SECONDS; // 근사치
const YEAR_IN_SECONDS = 12 * MONTH_IN_SECONDS;

/**
 * 주어진 ISO 날짜 문자열을 "time ago" 형식으로 변환합니다.
 * @param dateString - ISO 8601 형식의 날짜 문자열 (e.g., "2024-07-05T10:00:00.000Z")
 * @returns 상대적인 시간 문자열 (e.g., "5분 전", "3시간 전")
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const secondsAgo = Math.round((now.getTime() - past.getTime()) / 1000);

  if (secondsAgo < 0) {
    return '방금 전'; // 미래 시간은 방금 전으로 처리
  }
  if (secondsAgo < MINUTE_IN_SECONDS) {
    return `${secondsAgo}초 전`;
  }
  if (secondsAgo < HOUR_IN_SECONDS) {
    return `${Math.floor(secondsAgo / MINUTE_IN_SECONDS)}분 전`;
  }
  if (secondsAgo < DAY_IN_SECONDS) {
    return `${Math.floor(secondsAgo / HOUR_IN_SECONDS)}시간 전`;
  }
  if (secondsAgo < MONTH_IN_SECONDS) {
    return `${Math.floor(secondsAgo / DAY_IN_SECONDS)}일 전`;
  }
  if (secondsAgo < YEAR_IN_SECONDS) {
    return `${Math.floor(secondsAgo / MONTH_IN_SECONDS)}달 전`;
  }

  return `${Math.floor(secondsAgo / YEAR_IN_SECONDS)}년 전`;
};

/**
 * 설문 남은 시간 계산
 *
 * - 설문 종료시간을 기준으로 남은 시간 계산
 * - X일 X시간 남음 등으로 나타냄
 * - 일 / 시간 / 분 단위로 표시
 */
export const remainingQuestionTime = (endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const remainingSeconds = Math.max(0, Math.round((end.getTime() - now.getTime()) / 1000));

  const days = Math.floor(remainingSeconds / DAY_IN_SECONDS);
  const hours = Math.floor((remainingSeconds % DAY_IN_SECONDS) / HOUR_IN_SECONDS);
  const minutes = Math.floor((remainingSeconds % HOUR_IN_SECONDS) / MINUTE_IN_SECONDS);
  let result = '';
  if (days > 0) {
    result += `${days}일 `;
  }
  if (hours > 0 || days > 0) {
    result += `${hours}시간 `;
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    result += `${minutes}분 `;
  }

  // 최종 결과에 "남음" 추가
  result += '남음';
  return result.trim() || '';
};

/**
 * 날짜 문자열(LocalDateTime 형식)을 'yyyy-MM-dd' 형식의 문자열로 변환합니다.
 * @param dateString - 변환할 날짜 문자열 (e.g., "2024-08-23T10:30:00")
 * @returns 'yyyy-MM-dd' 형식의 문자열 또는 유효하지 않은 경우 빈 문자열
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ''; // 유효하지 않은 날짜 문자열에 대한 처리
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 날짜 문자열(LocalDateTime 형식)을 'yyyy-MM-dd HH:mm:ss' 형식의 문자열로 변환합니다.
 * @param dateString - 변환할 날짜 문자열 (e.g., "2024-08-23T10:30:00")
 * @returns 'yyyy-MM-dd HH:mm:ss' 형식의 문자열 또는 유효하지 않은 경우 빈 문자열
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return ''; // 유효하지 않은 날짜 문자열에 대한 처리
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const KST_TIME_ZONE = 'Asia/Seoul';

/**
 * 오늘 날짜(KST 기준) 'YYYY-MM-DD'.
 *
 * 🔴 `new Date().toISOString()`을 쓰면 안 된다. UTC 기준이라 KST 09:00 직전에는
 *    전날 날짜가 나온다. 매일 아침 9시에 체중을 기록하면 전날 기록을 덮어쓰는
 *    사고가 여기서 났다 (M-002).
 *
 * 기기 로컬시간이 아니라 KST 고정인 이유: 서버가 `DateTimeUtils.now()`에서
 * `ZoneId.of("Asia/Seoul")`로 못 박고 있다. 같은 축을 써야 어긋나지 않는다.
 */
export const todayKst = (): string => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};
