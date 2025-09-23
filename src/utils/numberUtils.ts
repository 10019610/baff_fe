interface FormatNumberOptions {
  decimalPlaces?: number;
  maxNumber?: number;
  allowNegative?: boolean;
}

/**
 * 숫자 입력값을 포맷팅하고 유효성을 검사하는 함수
 * @param value - 입력값 (문자열 또는 숫자)
 * @param options - 포맷팅 옵션
 * @returns - 포맷팅된 숫자 또는 빈 문자열 (유효하지 않은 입력의 경우)
 */
export const formatNumberInput = (
  value: string | number,
  options: FormatNumberOptions = {}
): string | number => {
  const { decimalPlaces, maxNumber, allowNegative = false } = options;

  // 빈 값 처리
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  // 숫자로 변환
  const numValue = Number(value);

  // 유효하지 않은 숫자 처리
  if (isNaN(numValue)) {
    return '';
  }

  // 음수 처리
  if (!allowNegative && numValue < 0) {
    return '';
  }

  // 최대값 처리
  if (maxNumber !== undefined && numValue > maxNumber) {
    return '';
  }

  // 소수점 자릿수 처리
  if (decimalPlaces !== undefined) {
    return Number(numValue.toFixed(decimalPlaces));
  }

  return numValue;
};
